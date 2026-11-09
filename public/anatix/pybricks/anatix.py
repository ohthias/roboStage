"""
Anatix para Pybricks — telemetria em tempo real para o RoboStage
=================================================================

Versão em MicroPython (Pybricks) da biblioteca Anatix para Arduino.
Usa o MESMO protocolo de texto (v1): uma mensagem por linha,

    $ANX,<tipo>,<ms>,<campos...>*<CK>

O transporte é a saída padrão do Pybricks (print/stdout) e a entrada
padrão (stdin). Por isso funciona igual por:

  * Bluetooth  (serviço Pybricks — SPIKE, Robot Inventor, Technic, City...)
  * Cabo USB   (SPIKE Prime/Essential e Robot Inventor com firmware
                Pybricks que tenha USB habilitado)

Princípios (iguais aos da versão Arduino):

  * Nada é transmitido até o computador pedir ("ANX PING").
  * Sem PING por ANATIX_TIMEOUT_MS, a telemetria se desliga sozinha.
  * Nunca trava o robô: há um limite de banda (bytes/s). Se ele for
    ultrapassado, o frame é descartado e contado ("descartes").
  * anx.begin(..., enabled=False) troca tudo por funções vazias.

Uso rápido:

    from pybricks.hubs import PrimeHub
    from anatix import anx

    hub = PrimeHub()
    anx.begin("MeuRobo", hub)

    while True:
        anx.update()                        # 1x por volta do loop
        anx.value("distancia_mm", d)        # métrica (gráfico)
        anx.value("bateria_v", v, every=1000)
        anx.event("linha_perdida")
        anx.event("obstaculo", d)
        anx.state("modo", "resgate")        # só envia quando muda
        with anx.scope("pid"):              # mede o tempo do bloco
            calcula_pid()
        anx.log("calibracao concluida")

Programas sem loop (missões FLL com robot.straight(), robot.turn()...):
rode anx.keep_alive() em paralelo com multitask() — veja
examples/missoes_fll.py.
"""

from pybricks.tools import StopWatch, wait

try:
    from pybricks.tools import read_input_byte  # Pybricks >= 3.3
except ImportError:
    read_input_byte = None

try:
    from usys import stdout, stdin
except ImportError:  # CPython (testes no PC)
    from sys import stdout, stdin

try:
    from utime import ticks_us, ticks_diff
except ImportError:
    ticks_us = None
    ticks_diff = None

try:
    import gc

    _mem_free = gc.mem_free
except (ImportError, AttributeError):
    _mem_free = None


ANATIX_PROTOCOL_VERSION = 1

# ---- Configuração ---------------------------------------------------------
ANATIX_TIMEOUT_MS = 2000  # sem PING por esse tempo => para de transmitir
ANATIX_REPORT_MS = 250  # período dos relatórios agregados (L e T)
ANATIX_RX_BUFFER = 32  # tamanho máx. de um comando vindo do PC
ANATIX_MAX_CHANNELS = 32  # métricas com every + estados + seções
ANATIX_BANDWIDTH = 4000  # bytes/s máximos de telemetria (ajustável)
ANATIX_BATTERY_MS = 1000  # período da métrica automática de bateria (0 = off)

_INF = float("inf")
_HEX = "0123456789ABCDEF"


def _board_name():
    try:
        from pybricks import version

        return str(version[0])
    except Exception:
        return "pybricks"


def _clean(text):
    """Nomes não podem ter vírgulas nem quebras de linha."""
    s = str(text)
    if "," in s or "\n" in s or "\r" in s or "*" in s:
        s = s.replace(",", "_").replace("\n", " ").replace("\r", " ").replace("*", "_")
    return s


class _Scope:
    """Context manager reutilizável: `with anx.scope("pid"): ...`"""

    def __init__(self, anx, name):
        self._anx = anx
        self._name = name

    def __enter__(self):
        self._anx.section_begin(self._name)
        return self

    def __exit__(self, exc_type, exc, tb):
        self._anx.section_end(self._name)
        return False


class _NullScope:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


_NULL_SCOPE = _NullScope()


def _nop(*args, **kwargs):
    return None


class Anatix:
    def __init__(self):
        self._clock = StopWatch()
        self._started = False
        self._off = False
        self._hub = None
        self._robot_name = "robo"
        self._require_handshake = True
        self._connected = False
        self._last_ping = 0
        self._last_report = 0
        self._report_ms = ANATIX_REPORT_MS
        self._last_battery = 0
        self._battery_ms = ANATIX_BATTERY_MS

        # Limite de banda (balde de fichas)
        self._bw = ANATIX_BANDWIDTH
        self._tokens = ANATIX_BANDWIDTH / 4
        self._last_refill = 0

        # Estatísticas do loop
        self._last_loop_us = None
        self._loop_sum_us = 0
        self._loop_max_us = 0
        self._loop_count = 0
        self._drops = 0

        # Canais
        self._every = {}  # nome -> último envio (ms)
        self._states = {}  # máquina -> último estado enviado
        self._sections = {}  # nome -> [inicio_us, soma_us, max_us, contagem]
        self._scopes = {}  # nome -> _Scope (reaproveitado)
        self._channels_full = False

        # Recepção
        self._rx = bytearray()
        self._rx_overflow = False
        self._line_handler = None
        self._poll = None

    # ------------------------------------------------------------------
    # Relógios
    # ------------------------------------------------------------------
    def _ms(self):
        return self._clock.time()

    def _us(self):
        if ticks_us is not None:
            return ticks_us()
        return self._clock.time() * 1000

    def _us_diff(self, end, start):
        if ticks_diff is not None:
            return ticks_diff(end, start)
        return end - start

    # ------------------------------------------------------------------
    # Ciclo de vida
    # ------------------------------------------------------------------
    def begin(self, robot_name="robo", hub=None, require_handshake=True, enabled=True):
        """Inicia o Anatix.

        robot_name        nome mostrado no computador
        hub               objeto do hub (PrimeHub(), TechnicHub()...). Opcional:
                          habilita a métrica automática "hub_bateria_v".
        require_handshake False = transmite sempre (útil no terminal do
                          Pybricks Code, sem o aplicativo).
        enabled           False = desliga tudo (versão de competição).
        """
        if not enabled:
            self._disable()
            return
        self._robot_name = _clean(robot_name or "robo")
        self._hub = hub
        self._require_handshake = require_handshake
        self._started = True
        self._connected = False
        self._setup_input()
        if not require_handshake:
            self._connect()

    def _disable(self):
        self._off = True
        for name in (
            "update",
            "value",
            "event",
            "state",
            "section_begin",
            "section_end",
            "log",
        ):
            setattr(self, name, _nop)
        self.scope = lambda name: _NULL_SCOPE
        self.connected = lambda: False

    def _setup_input(self):
        if read_input_byte is not None:
            return
        try:
            import uselect

            self._poll = uselect.poll()
            self._poll.register(stdin)
        except Exception:
            self._poll = None

    def _read_byte(self):
        if read_input_byte is not None:
            return read_input_byte()
        if self._poll is not None and self._poll.poll(0):
            c = stdin.read(1)
            if c:
                return ord(c) if isinstance(c, str) else c[0]
        return None

    def _connect(self):
        now = self._ms()
        self._connected = True
        self._last_ping = now
        self._last_report = now
        self._last_battery = 0
        self._last_refill = now
        self._tokens = self._bw / 4
        self._loop_sum_us = self._loop_max_us = self._loop_count = 0
        self._drops = 0
        # Força reenvio dos estados e zera seções / limites de frequência.
        for k in self._states:
            self._states[k] = None
        for s in self._sections.values():
            s[1] = s[2] = s[3] = 0
        for k in self._every:
            self._every[k] = None
        self._send_hello()

    def connected(self):
        """True enquanto o computador estiver ouvindo."""
        return self._connected

    def update(self):
        """Chamar 1x por volta do loop: lê comandos do PC, mede o loop e
        envia os relatórios periódicos."""
        if not self._started:
            return

        # 1) Comandos vindos do computador (limitado para não travar)
        for _ in range(64):
            b = self._read_byte()
            if b is None:
                break
            if b == 13:
                continue
            if b == 10:
                if self._rx and not self._rx_overflow:
                    self._handle_line(bytes(self._rx).decode())
                self._rx = bytearray()
                self._rx_overflow = False
            elif len(self._rx) < ANATIX_RX_BUFFER - 1:
                self._rx.append(b)
            else:
                self._rx_overflow = True  # linha longa demais: descarta

        # 2) Tempo de loop
        now_us = self._us()
        if self._last_loop_us is not None:
            d = self._us_diff(now_us, self._last_loop_us)
            self._loop_sum_us += d
            if d > self._loop_max_us:
                self._loop_max_us = d
            self._loop_count += 1
        self._last_loop_us = now_us

        if not self._connected:
            return
        now = self._ms()

        # 3) Aplicativo fechado / conexão perdida
        if self._require_handshake and now - self._last_ping > ANATIX_TIMEOUT_MS:
            self._connected = False
            return

        # 4) Relatórios agregados
        if now - self._last_report >= self._report_ms:
            self._send_reports(now)

        # 5) Bateria automática
        if self._hub is not None and self._battery_ms:
            if not self._last_battery or now - self._last_battery >= self._battery_ms:
                self._last_battery = now or 1
                try:
                    mv = self._hub.battery.voltage()
                    self._send_value("hub_bateria_v", mv / 1000)
                except Exception:
                    self._battery_ms = 0

    async def keep_alive(self, period_ms=20):
        """Coroutine para usar com multitask(): mantém o Anatix vivo em
        programas sem loop (ex.: missões com robot.straight()).
        Os frames L passam a medir a frequência desta tarefa."""
        while True:
            self.update()
            await wait(period_ms)

    def _handle_line(self, line):
        if not line.startswith("ANX "):
            if self._line_handler:
                self._line_handler(line)
            return
        cmd = line[4:].strip()
        if cmd == "PING":
            self._last_ping = self._ms()
            if not self._connected:
                self._connect()
        elif cmd == "HELLO":
            if self._connected:
                self._send_hello()
        elif cmd == "STOP":
            self._connected = False
        elif cmd.startswith("RATE "):
            ms = _to_int(cmd[5:])
            if ms is not None and 20 <= ms <= 10000:
                self._report_ms = ms
        elif cmd == "RESET":
            self._loop_sum_us = self._loop_max_us = self._loop_count = 0
            self._drops = 0
            for s in self._sections.values():
                s[1] = s[2] = s[3] = 0
        elif cmd.startswith("BW "):  # extensão Pybricks
            bw = _to_int(cmd[3:])
            if bw is not None and 200 <= bw <= 100000:
                self.set_bandwidth(bw)

    def set_line_handler(self, handler):
        """Recebe as linhas do stdin que não são comandos do Anatix."""
        self._line_handler = handler

    def set_report_period(self, ms):
        self._report_ms = ms if ms > 0 else 1

    def set_bandwidth(self, bytes_per_s):
        """Banda máxima da telemetria. Bluetooth: ~4000; USB: ~16000."""
        self._bw = max(200, int(bytes_per_s))
        self._tokens = min(self._tokens, self._bw / 4)

    def set_battery_period(self, ms):
        """Período da métrica automática "hub_bateria_v" (0 desliga)."""
        self._battery_ms = int(ms)

    # ------------------------------------------------------------------
    # Montagem de frames
    # ------------------------------------------------------------------
    def _emit(self, kind, fields, force=False):
        """Monta e envia um frame. fields já vem começando com ','.
        force=False: descarta se a banda estiver esgotada."""
        if not self._connected:
            return False
        now = self._ms()
        body = "ANX," + kind + "," + str(now) + fields
        ck = 0
        for b in body.encode():
            ck ^= b
        line = "$" + body + "*" + _HEX[ck >> 4] + _HEX[ck & 15] + "\n"

        # Balde de fichas: repõe conforme o tempo passa.
        elapsed = now - self._last_refill
        if elapsed > 0:
            self._last_refill = now
            cap = self._bw / 4
            self._tokens = min(cap, self._tokens + elapsed * self._bw / 1000)
        n = len(line)
        if not force and self._tokens < n:
            if self._drops < 0xFFFF:
                self._drops += 1
            return False
        self._tokens -= n
        stdout.write(line)
        return True

    def _send_hello(self):
        self._emit(
            "H",
            ","
            + str(ANATIX_PROTOCOL_VERSION)
            + ","
            + self._robot_name
            + ","
            + _board_name()
            + ","
            + str(self._report_ms),
            True,
        )

    def _send_reports(self, now):
        elapsed = now - self._last_report
        self._last_report = now
        if elapsed <= 0:
            elapsed = 1

        count = self._loop_count
        hz = count * 1000 // elapsed
        avg = self._loop_sum_us // count if count else 0
        ram = _mem_free() if _mem_free is not None else -1
        if self._emit(
            "L",
            ",%d,%d,%d,%d,%d" % (hz, avg, self._loop_max_us, ram, self._drops),
        ):
            self._drops = 0
        self._loop_sum_us = self._loop_max_us = self._loop_count = 0

        for name, s in self._sections.items():
            if s[3] == 0:
                continue
            self._emit("T", ",%s,%d,%d,%d" % (name, s[3], s[1] // s[3], s[2]))
            s[1] = s[2] = s[3] = 0

    def _channel_ok(self):
        total = len(self._every) + len(self._states) + len(self._sections)
        if total < ANATIX_MAX_CHANNELS:
            return True
        if not self._channels_full and self._connected:
            self._channels_full = True
            self.log("anatix: canais esgotados, aumente ANATIX_MAX_CHANNELS")
        return False

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------
    def value(self, name, v, every=0):
        """Métrica numérica. every > 0 limita a 1 envio a cada `every` ms."""
        if not self._connected:
            return
        if every:
            if name in self._every:
                last = self._every[name]
                if last and self._ms() - last < every:
                    return
                self._every[name] = self._ms() or 1
            elif self._channel_ok():
                self._every[name] = self._ms() or 1
            # sem canal livre: envia sem limite (como na versão Arduino)
        self._send_value(name, v)

    def _send_value(self, name, v):
        if isinstance(v, float):
            if v != v:
                txt = "nan"
            elif v == _INF:
                txt = "inf"
            elif v == -_INF:
                txt = "-inf"
            else:
                txt = "%.3f" % v
        else:
            txt = str(int(v))
        self._emit("V", "," + name + "," + txt)

    def event(self, name, data=0):
        """Evento pontual, com um número inteiro opcional."""
        if not self._connected:
            return
        self._emit("E", "," + name + "," + str(int(data)))

    def state(self, machine, st):
        """Estado de uma máquina de estados. Só envia quando muda."""
        if not self._connected:
            return
        known = machine in self._states
        if known and self._states[machine] == st:
            return
        if self._emit("S", "," + machine + "," + _clean(st), True):
            if known or self._channel_ok():
                self._states[machine] = st

    def section_begin(self, name):
        if not self._connected:
            return
        s = self._sections.get(name)
        if s is None:
            if not self._channel_ok():
                return
            s = [0, 0, 0, 0]
            self._sections[name] = s
        s[0] = self._us() or 1

    def section_end(self, name):
        if not self._connected:
            return
        now = self._us()
        s = self._sections.get(name)
        if s is None or not s[0]:
            return
        d = self._us_diff(now, s[0])
        s[0] = 0
        s[1] += d
        if d > s[2]:
            s[2] = d
        if s[3] < 0xFFFF:
            s[3] += 1

    def scope(self, name):
        """`with anx.scope("pid"): ...` cronometra o bloco."""
        sc = self._scopes.get(name)
        if sc is None:
            sc = _Scope(self, name)
            self._scopes[name] = sc
        return sc

    def log(self, msg):
        """Mensagem de texto livre (pode ter vírgulas)."""
        s = str(msg)
        if "\n" in s or "\r" in s:
            s = s.replace("\n", " ").replace("\r", " ")
        self._emit("M", "," + s, True)


def _to_int(text):
    try:
        return int(text.strip())
    except (ValueError, AttributeError):
        return None


# Objeto global, como o `Anatix` da versão Arduino.
anx = Anatix()
