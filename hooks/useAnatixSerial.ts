"use client";

// ---------------------------------------------------------------------------
// Conexão USB com um robô Anatix pela Web Serial API.
//
// Fluxo de verificação da conexão:
//  1. abre a porta (escolhida pelo usuário ou já autorizada antes);
//  2. envia `ANX PING` a cada 500 ms (o robô só transmite enquanto ouve PING);
//  3. espera o frame H (hello). Placas como o Uno reiniciam ao abrir a porta,
//     então seguimos mandando PING; após 2,5 s sem H pedimos `ANX HELLO`;
//  4. sem nenhum frame Anatix válido em 6 s → não há robô Anatix nessa porta;
//  5. conectado: se ficar 2,5 s sem frames, status "silent" (robô travou,
//     reiniciou ou ANX_UPDATE() parou de ser chamado).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AnatixFrame } from "@/types/anatix.types";
import {
  ANATIX_COMMANDS,
  ANATIX_HANDSHAKE_TIMEOUT_MS,
  ANATIX_PING_MS,
  parseAnatixLine,
} from "@/utils/labtest/anatix/protocol";

export type AnatixStatus =
  | "unsupported"
  | "idle"
  | "opening"
  | "handshake"
  | "connected"
  | "silent"
  | "error";

export interface AnatixSerialHandlers {
  onFrame?: (frame: AnatixFrame) => void;
  onConsole?: (text: string) => void;
  onInvalid?: (raw: string) => void;
  /** Conexão confirmada. `hello` é null se o robô mandou dados sem frame H. */
  onConnected?: (hello: Extract<AnatixFrame, { k: "H" }> | null) => void;
  /** Porta fechada (pelo usuário, por erro ou cabo removido). */
  onClosed?: (reason: string | null) => void;
}

const SILENT_AFTER_MS = 2500;
const noopSubscribe = () => () => {};
const HELLO_RETRY_MS = 2500;
const MAX_LINE = 4096;

function describePort(port: SerialPort) {
  const info = port.getInfo();
  if (info.usbVendorId === undefined) return "Porta serial";
  const hex = (n?: number) => (n ?? 0).toString(16).padStart(4, "0").toUpperCase();
  return `USB ${hex(info.usbVendorId)}:${hex(info.usbProductId)}`;
}

function friendlyError(err: unknown): string {
  const e = err as { name?: string; message?: string };
  if (e?.name === "InvalidStateError") return "A porta já está aberta em outra aba.";
  if (e?.name === "NetworkError" || /open/i.test(e?.message ?? "")) {
    return "Não foi possível abrir a porta. Feche o Monitor Serial da Arduino IDE (ou outro programa) e tente de novo.";
  }
  if (e?.name === "SecurityError") return "O navegador bloqueou o acesso à porta serial.";
  return e?.message || "Erro desconhecido na porta serial.";
}

export function useAnatixSerial(baudRate: number, handlers: AnatixSerialHandlers) {
  const [status, setStatus] = useState<AnatixStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [portLabel, setPortLabel] = useState<string | null>(null);
  const [knownPorts, setKnownPorts] = useState<number>(0);

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const timersRef = useRef<number[]>([]);
  const statusRef = useRef<AnatixStatus>("idle");
  const lastFrameAtRef = useRef(0);
  const sawHelloRef = useRef(false);
  const sawValidRef = useRef(false);
  const closingRef = useRef(false);

  const setBoth = useCallback((s: AnatixStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // Suporte e portas já autorizadas (permitem reconectar sem o seletor).
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(navigator.serial),
    () => true, // no servidor assume suporte (evita flash do aviso)
  );

  useEffect(() => {
    const serial = typeof navigator !== "undefined" ? navigator.serial : undefined;
    if (!serial) return;
    const refresh = () => serial.getPorts().then((p) => setKnownPorts(p.length)).catch(() => {});
    refresh();
    serial.addEventListener("connect", refresh);
    serial.addEventListener("disconnect", refresh);
    return () => {
      serial.removeEventListener("connect", refresh);
      serial.removeEventListener("disconnect", refresh);
    };
  }, [setBoth]);

  const send = useCallback(async (command: string) => {
    const writer = writerRef.current;
    if (!writer) return false;
    try {
      await writer.write(new TextEncoder().encode(`${command}\n`));
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearInterval(id);
    timersRef.current = [];
  };

  const close = useCallback(
    async (reason: string | null, finalStatus: AnatixStatus = "idle") => {
      if (closingRef.current) return;
      closingRef.current = true;
      clearTimers();

      if (writerRef.current) {
        await send(ANATIX_COMMANDS.stop);
        try {
          writerRef.current.releaseLock();
        } catch {}
        writerRef.current = null;
      }
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
        } catch {}
        try {
          readerRef.current.releaseLock();
        } catch {}
        readerRef.current = null;
      }
      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch {}
        portRef.current = null;
      }

      const wasLive = sawHelloRef.current || sawValidRef.current;
      sawHelloRef.current = false;
      sawValidRef.current = false;
      setError(finalStatus === "error" ? reason : null);
      setBoth(finalStatus);
      closingRef.current = false;
      if (wasLive) handlersRef.current.onClosed?.(reason);
    },
    [send, setBoth],
  );

  const markConnected = useCallback(
    (hello: Extract<AnatixFrame, { k: "H" }> | null) => {
      if (statusRef.current === "handshake") {
        setBoth("connected");
        handlersRef.current.onConnected?.(hello);
      }
    },
    [setBoth],
  );

  const handleLine = useCallback(
    (line: string) => {
      const parsed = parseAnatixLine(line);
      if (!parsed) return;
      if (parsed.kind === "console") return handlersRef.current.onConsole?.(parsed.text);
      if (parsed.kind === "invalid") return handlersRef.current.onInvalid?.(parsed.raw);

      lastFrameAtRef.current = Date.now();
      sawValidRef.current = true;
      if (statusRef.current === "silent") setBoth("connected");

      const frame = parsed.frame;
      if (frame.k === "H") {
        const first = !sawHelloRef.current;
        sawHelloRef.current = true;
        if (first) markConnected(frame);
      }
      handlersRef.current.onFrame?.(frame);
    },
    [markConnected, setBoth],
  );

  const readLoop = useCallback(
    async (port: SerialPort) => {
      const decoder = new TextDecoder();
      let buffer = "";
      while (port.readable && portRef.current === port) {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let nl = buffer.indexOf("\n");
            while (nl >= 0) {
              handleLine(buffer.slice(0, nl));
              buffer = buffer.slice(nl + 1);
              nl = buffer.indexOf("\n");
            }
            if (buffer.length > MAX_LINE) buffer = "";
          }
        } catch {
          // Erro de framing/paridade: o loop externo tenta de novo.
        } finally {
          try {
            reader.releaseLock();
          } catch {}
        }
        if (closingRef.current) return;
      }
      if (!closingRef.current && portRef.current === port) {
        await close("A conexão com a porta foi perdida.", "error");
      }
    },
    [close, handleLine],
  );

  const connect = useCallback(
    async (opts?: { reuseKnown?: boolean }) => {
      const serial = typeof navigator !== "undefined" ? navigator.serial : undefined;
      if (!serial || portRef.current) return;

      setError(null);
      let port: SerialPort;
      try {
        const known = opts?.reuseKnown ? await serial.getPorts() : [];
        port = known[0] ?? (await serial.requestPort());
      } catch (err) {
        // Usuário fechou o seletor sem escolher: não é erro.
        if ((err as { name?: string })?.name === "NotFoundError") return;
        setError(friendlyError(err));
        setBoth("error");
        return;
      }

      setBoth("opening");
      try {
        await port.open({ baudRate, bufferSize: 16384 });
      } catch (err) {
        setError(friendlyError(err));
        setBoth("error");
        return;
      }

      portRef.current = port;
      setPortLabel(describePort(port));
      writerRef.current = port.writable?.getWriter() ?? null;
      sawHelloRef.current = false;
      sawValidRef.current = false;
      lastFrameAtRef.current = 0;
      setBoth("handshake");
      void readLoop(port);

      const openedAt = Date.now();
      let lastHelloAsk = openedAt;
      void send(ANATIX_COMMANDS.ping);

      timersRef.current.push(
        window.setInterval(() => {
          void send(ANATIX_COMMANDS.ping);
          const now = Date.now();
          const s = statusRef.current;

          if (s === "handshake") {
            if (now - lastHelloAsk >= HELLO_RETRY_MS) {
              lastHelloAsk = now;
              void send(ANATIX_COMMANDS.hello);
            }
            if (now - openedAt >= ANATIX_HANDSHAKE_TIMEOUT_MS) {
              if (sawValidRef.current) {
                // Dados válidos chegando, só o H se perdeu: aceita a conexão.
                markConnected(null);
              } else {
                void close(
                  `Porta aberta, mas nenhum robô Anatix respondeu em ${ANATIX_HANDSHAKE_TIMEOUT_MS / 1000} s. Confira se o sketch chama ANX_BEGIN/ANX_UPDATE e se o baud rate é ${baudRate}.`,
                  "error",
                );
              }
            }
          } else if (s === "connected" && now - lastFrameAtRef.current > SILENT_AFTER_MS) {
            setBoth("silent");
          }
        }, ANATIX_PING_MS),
      );
    },
    [baudRate, close, markConnected, readLoop, send, setBoth],
  );

  // Cabo removido.
  useEffect(() => {
    const serial = typeof navigator !== "undefined" ? navigator.serial : undefined;
    if (!serial) return;
    const onDisconnect = (event: Event) => {
      const target = (event as Event & { port?: SerialPort }).port ?? event.target;
      if (portRef.current && target === portRef.current) {
        void close("Cabo USB desconectado.", "error");
      }
    };
    serial.addEventListener("disconnect", onDisconnect);
    return () => serial.removeEventListener("disconnect", onDisconnect);
  }, [close]);

  // Fecha a porta ao sair da página.
  useEffect(() => {
    return () => {
      void close(null);
    };
  }, [close]);

  return {
    status: supported ? status : ("unsupported" as AnatixStatus),
    error,
    portLabel,
    knownPorts,
    connect,
    disconnect: () => close(null),
    send,
  };
}
