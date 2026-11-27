// ---------------------------------------------------------------------------
// Conexão com hubs LEGO rodando Pybricks (SPIKE, Robot Inventor, Technic...).
//
// No hub, a biblioteca anatix.py escreve os frames do Anatix no stdout e lê os
// comandos (ANX PING...) do stdin. Quem leva esses bytes é o protocolo
// Pybricks, igual nos dois meios:
//
//   Bluetooth  serviço c5f50001-…, característica c5f50002-… (write + notify)
//   Cabo USB   interface bulk do hub; OUT 0x01 = assinar, 0x02 = comando;
//              IN 0x01 = resposta (status 32 bits), 0x02 = evento
//
// Comandos: 00 parar programa · 01 [slot] iniciar · 06 <bytes> escrever stdin
// Eventos:  00 status (flags u32 LE, programa, slot) · 01 <bytes> stdout
//
// Referência: github.com/pybricks/pybricks-micropython (lib/pbio/include/pbio/protocol.h)
// e o pacote pybricksdev.
// ---------------------------------------------------------------------------

export const PYBRICKS_SERVICE_UUID = "c5f50001-8280-46da-89f4-6d8051e4aeef";
export const PYBRICKS_COMMAND_EVENT_UUID = "c5f50002-8280-46da-89f4-6d8051e4aeef";
export const PYBRICKS_CAPABILITIES_UUID = "c5f50003-8280-46da-89f4-6d8051e4aeef";
const DEVICE_INFO_SERVICE = 0x180a;
const FIRMWARE_REVISION = 0x2a26;
const DEVICE_NAME = 0x2a00;

export const PB_CMD = { stop: 0x00, start: 0x01, writeStdin: 0x06 } as const;
export const PB_EVT = { status: 0x00, stdout: 0x01 } as const;
export const PB_STATUS_PROGRAM_RUNNING = 1 << 6;

export const LEGO_USB_VENDOR_ID = 0x0694;
/** SPIKE Prime, SPIKE Essential e MINDSTORMS Robot Inventor com firmware Pybricks. */
export const PYBRICKS_USB_PRODUCT_IDS = [0x0009, 0x000d, 0x0010] as const;

/** Banda da telemetria enviada ao hub (`ANX BW`), por meio de conexão. */
export const PYBRICKS_BANDWIDTH = { ble: 4000, usb: 16000 } as const;

export type PybricksTransportKind = "ble" | "usb";

export interface PybricksStatus {
  flags: number;
  running: boolean;
  selectedSlot: number;
}

/** Interpreta o evento de status do hub (`00 <flags u32 LE> <programa> <slot>`). */
export function parsePybricksStatus(event: Uint8Array): PybricksStatus | null {
  if (event.length < 5 || event[0] !== PB_EVT.status) return null;
  const flags = (event[1] | (event[2] << 8) | (event[3] << 16) | (event[4] << 24)) >>> 0;
  return {
    flags,
    running: (flags & PB_STATUS_PROGRAM_RUNNING) !== 0,
    selectedSlot: event.length >= 7 ? event[6] : 0,
  };
}

/** Quebra um texto em comandos "escrever no stdin" que cabem em uma escrita. */
export function stdinCommands(text: string, maxWriteSize: number): Uint8Array[] {
  const data = new TextEncoder().encode(text);
  const chunk = Math.max(1, maxWriteSize - 1); // 1 byte para o código do comando
  const out: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += chunk) {
    const part = data.subarray(i, i + chunk);
    const msg = new Uint8Array(part.length + 1);
    msg[0] = PB_CMD.writeStdin;
    msg.set(part, 1);
    out.push(msg);
  }
  return out;
}

/** Comando para iniciar o programa salvo (com o slot, se o hub tiver slots). */
export function startProgramCommand(slots: number, selectedSlot: number): Uint8Array {
  return slots > 0 ? Uint8Array.of(PB_CMD.start, selectedSlot) : Uint8Array.of(PB_CMD.start);
}

/** Lê a característica de capacidades: tamanho máx. de escrita e nº de slots. */
export function parsePybricksCapabilities(view: DataView): { maxWriteSize: number; slots: number } {
  return {
    maxWriteSize: view.byteLength >= 2 ? view.getUint16(0, true) : 20,
    slots: view.byteLength >= 11 ? view.getUint8(10) : 0,
  };
}

const toBytes = (view: DataView) => new Uint8Array(view.buffer, view.byteOffset, view.byteLength);

export interface PybricksTransport {
  readonly kind: PybricksTransportKind;
  hubName: string;
  firmware: string | null;
  maxWriteSize: number;
  slots: number;
  /** Eventos do protocolo Pybricks (status, stdout). */
  onEvent: (event: Uint8Array) => void;
  /** Conexão perdida (hub desligado, fora de alcance ou cabo removido). */
  onClose: (reason: string | null) => void;
  connect(): Promise<void>;
  command(bytes: Uint8Array): Promise<void>;
  disconnect(): Promise<void>;
}

abstract class BaseTransport {
  hubName = "Hub Pybricks";
  firmware: string | null = null;
  maxWriteSize = 20;
  slots = 0;
  onEvent: (event: Uint8Array) => void = () => {};
  onClose: (reason: string | null) => void = () => {};
  private queue: Promise<unknown> = Promise.resolve();

  /** Escritas em série: o GATT não aceita duas operações ao mesmo tempo. */
  command(bytes: Uint8Array): Promise<void> {
    const run = this.queue.then(() => this.write(bytes));
    this.queue = run.catch(() => undefined);
    return run;
  }

  protected abstract write(bytes: Uint8Array): Promise<void>;
}

export class PybricksBleTransport extends BaseTransport implements PybricksTransport {
  readonly kind = "ble" as const;
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private closed = false;

  async connect() {
    const bluetooth = navigator.bluetooth;
    if (!bluetooth) throw new Error("Este navegador não tem Web Bluetooth.");
    const device = await bluetooth.requestDevice({
      filters: [{ services: [PYBRICKS_SERVICE_UUID] }],
      optionalServices: [DEVICE_INFO_SERVICE],
    });
    this.device = device;
    device.addEventListener("gattserverdisconnected", () => this.handleClosed("O hub desconectou do Bluetooth."));
    if (!device.gatt) throw new Error("O hub não oferece GATT.");
    const server = await device.gatt.connect();
    this.hubName = device.name || this.hubName;

    try {
      const info = await server.getPrimaryService(DEVICE_INFO_SERVICE);
      const fw = await (await info.getCharacteristic(FIRMWARE_REVISION)).readValue();
      this.firmware = new TextDecoder().decode(toBytes(fw));
    } catch {}

    const service = await server.getPrimaryService(PYBRICKS_SERVICE_UUID);
    try {
      const caps = await (await service.getCharacteristic(PYBRICKS_CAPABILITIES_UUID)).readValue();
      Object.assign(this, parsePybricksCapabilities(caps));
    } catch {
      // Firmware antigo (protocolo < 1.2): usa o MTU mínimo.
    }

    const characteristic = await service.getCharacteristic(PYBRICKS_COMMAND_EVENT_UUID);
    characteristic.addEventListener("characteristicvaluechanged", (event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) this.onEvent(toBytes(value));
    });
    await characteristic.startNotifications();
    this.characteristic = characteristic;
  }

  protected async write(bytes: Uint8Array) {
    if (!this.characteristic) throw new Error("Hub desconectado.");
    await this.characteristic.writeValueWithResponse(bytes);
  }

  private handleClosed(reason: string | null) {
    if (this.closed) return;
    this.closed = true;
    this.characteristic = null;
    this.onClose(reason);
  }

  async disconnect() {
    this.closed = true;
    this.characteristic = null;
    if (this.device?.gatt?.connected) this.device.gatt.disconnect();
  }
}

export class PybricksUsbTransport extends BaseTransport implements PybricksTransport {
  readonly kind = "usb" as const;
  private device: USBDevice | null = null;
  private interfaceNumber = 0;
  private endpointIn: USBEndpoint | null = null;
  private endpointOut: USBEndpoint | null = null;
  private pendingReply: ((reply: Uint8Array) => void) | null = null;
  private alive = false;
  private onUsbDisconnect = (event: Event) => {
    if ((event as USBConnectionEvent).device === this.device) this.handleClosed("Cabo USB desconectado.");
  };

  async connect() {
    const usb = navigator.usb;
    if (!usb) throw new Error("Este navegador não tem WebUSB.");
    const device = await usb.requestDevice({
      filters: PYBRICKS_USB_PRODUCT_IDS.map((productId) => ({ vendorId: LEGO_USB_VENDOR_ID, productId })),
    });
    this.device = device;
    await device.open();
    if (!device.configuration) await device.selectConfiguration(1);

    // A interface Pybricks é a que tem endpoints bulk de entrada e saída.
    const intf = device.configuration?.interfaces.find((i) => {
      const eps = i.alternate.endpoints;
      return eps.some((e) => e.direction === "in" && e.type === "bulk") && eps.some((e) => e.direction === "out" && e.type === "bulk");
    });
    if (!intf) {
      await device.close().catch(() => undefined);
      throw new Error("Interface Pybricks não encontrada. O firmware do hub tem USB habilitado?");
    }
    await device.claimInterface(intf.interfaceNumber);
    this.interfaceNumber = intf.interfaceNumber;
    this.endpointIn = intf.alternate.endpoints.find((e) => e.direction === "in") ?? null;
    this.endpointOut = intf.alternate.endpoints.find((e) => e.direction === "out") ?? null;
    this.maxWriteSize = (this.endpointOut?.packetSize ?? 64) - 1; // 1 byte do tipo de mensagem USB

    const decoder = new TextDecoder();
    const read = async (request: number, value: number) => {
      const r = await device.controlTransferIn(
        { requestType: "class", recipient: "interface", request, value, index: this.interfaceNumber },
        20,
      );
      return r.data;
    };
    try {
      const name = await read(1, DEVICE_NAME);
      this.hubName = (name && decoder.decode(toBytes(name))) || device.productName || this.hubName;
    } catch {
      this.hubName = device.productName || this.hubName;
    }
    try {
      const fw = await read(1, FIRMWARE_REVISION);
      if (fw) this.firmware = decoder.decode(toBytes(fw));
    } catch {}
    try {
      const caps = await read(2, 0x0003);
      if (caps) this.slots = parsePybricksCapabilities(caps).slots;
    } catch {}

    this.alive = true;
    navigator.usb?.addEventListener("disconnect", this.onUsbDisconnect);
    void this.readLoop();
    await this.send(Uint8Array.of(0x01, 0x01)); // assinar os eventos
  }

  private async readLoop() {
    while (this.alive && this.device && this.endpointIn) {
      let result: USBInTransferResult;
      try {
        result = await this.device.transferIn(this.endpointIn.endpointNumber, this.endpointIn.packetSize);
      } catch {
        this.handleClosed("A conexão USB com o hub foi perdida.");
        return;
      }
      if (!result.data || result.data.byteLength === 0) continue;
      const msg = toBytes(result.data);
      if (msg[0] === 0x01 && this.pendingReply) {
        const resolve = this.pendingReply;
        this.pendingReply = null;
        resolve(msg.subarray(1));
      } else if (msg[0] === 0x02) {
        this.onEvent(msg.subarray(1));
      }
    }
  }

  private async send(bytes: Uint8Array) {
    if (!this.device || !this.endpointOut) throw new Error("Hub desconectado.");
    const reply = new Promise<Uint8Array>((resolve, reject) => {
      this.pendingReply = resolve;
      window.setTimeout(() => reject(new Error("O hub não respondeu pelo USB.")), 2000);
    });
    await this.device.transferOut(this.endpointOut.endpointNumber, bytes);
    const r = await reply;
    const status = r.length >= 4 ? (r[0] | (r[1] << 8) | (r[2] << 16) | (r[3] << 24)) >>> 0 : 0;
    if (status !== 0) throw new Error(`O hub recusou o comando (erro ${status}).`);
  }

  protected write(bytes: Uint8Array) {
    const msg = new Uint8Array(bytes.length + 1);
    msg[0] = 0x02;
    msg.set(bytes, 1);
    return this.send(msg);
  }

  private handleClosed(reason: string | null) {
    if (!this.alive) return;
    this.alive = false;
    navigator.usb?.removeEventListener("disconnect", this.onUsbDisconnect);
    this.onClose(reason);
  }

  async disconnect() {
    const device = this.device;
    if (!device) return;
    if (this.alive) {
      try {
        await this.send(Uint8Array.of(0x01, 0x00));
      } catch {}
    }
    this.alive = false;
    navigator.usb?.removeEventListener("disconnect", this.onUsbDisconnect);
    try {
      await device.releaseInterface(this.interfaceNumber);
    } catch {}
    try {
      await device.close();
    } catch {}
    this.device = null;
  }
}

export function createPybricksTransport(kind: PybricksTransportKind): PybricksTransport {
  return kind === "ble" ? new PybricksBleTransport() : new PybricksUsbTransport();
}

/** Mensagem amigável para erros de conexão (nome do erro do navegador). */
export function pybricksErrorMessage(err: unknown, kind: PybricksTransportKind): string {
  const e = err as { name?: string; message?: string };
  if (e?.name === "SecurityError") return "O navegador bloqueou o acesso. Abra o RoboStage em uma aba normal (https).";
  if (e?.name === "NetworkError") {
    return kind === "ble"
      ? "Não foi possível conectar. Feche o Pybricks Code (o hub aceita um aplicativo por vez) e confira se o hub está ligado."
      : "Não foi possível abrir o hub no USB. Feche o Pybricks Code ou outra aba que esteja usando o hub.";
  }
  return e?.message || "Erro desconhecido na conexão com o hub.";
}
