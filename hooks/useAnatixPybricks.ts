"use client";

// ---------------------------------------------------------------------------
// Conexão com um robô Anatix em um hub LEGO com Pybricks, por Bluetooth
// (Web Bluetooth) ou cabo USB (WebUSB). Mesmo contrato do useAnatixSerial.
//
// Fluxo:
//  1. conecta no hub (o usuário escolhe no seletor do navegador);
//  2. o hub avisa, pelo evento de status, se há um programa rodando;
//  3. com o programa rodando, envia `ANX PING` a cada 500 ms pelo stdin;
//  4. o anatix.py responde com o frame H → "connected" (uma sessão por
//     execução do programa: parar o programa encerra a sessão);
//  5. conectado: 2,5 s sem frames → "silent".
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AnatixFrame } from "@/types/anatix.types";
import type { AnatixSerialHandlers, AnatixStatus } from "@/hooks/useAnatixSerial";
import {
  ANATIX_COMMANDS,
  ANATIX_HANDSHAKE_TIMEOUT_MS,
  ANATIX_PING_MS,
  parseAnatixLine,
} from "@/utils/labtest/anatix/protocol";
import {
  PB_CMD,
  PB_EVT,
  PYBRICKS_BANDWIDTH,
  createPybricksTransport,
  parsePybricksStatus,
  pybricksErrorMessage,
  startProgramCommand,
  stdinCommands,
  type PybricksTransport,
  type PybricksTransportKind,
} from "@/utils/labtest/anatix/pybricks";

const SILENT_AFTER_MS = 2500;
const MAX_LINE = 4096;
const noopSubscribe = () => () => {};

export function useAnatixPybricks(handlers: AnatixSerialHandlers) {
  const [status, setStatus] = useState<AnatixStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hub, setHub] = useState<{ name: string; firmware: string | null; kind: PybricksTransportKind } | null>(null);
  const [programRunning, setProgramRunning] = useState(false);

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const transportRef = useRef<PybricksTransport | null>(null);
  const statusRef = useRef<AnatixStatus>("idle");
  const runningRef = useRef(false);
  const selectedSlotRef = useRef(0);
  const runStartedAtRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const sawValidRef = useRef(false);
  const liveRef = useRef(false);
  const stdoutRef = useRef("");
  const timerRef = useRef<number | null>(null);

  const setBoth = useCallback((s: AnatixStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const bluetooth = useSyncExternalStore(noopSubscribe, () => Boolean(navigator.bluetooth), () => true);
  const usb = useSyncExternalStore(noopSubscribe, () => Boolean(navigator.usb), () => true);

  const send = useCallback(async (command: string) => {
    const t = transportRef.current;
    if (!t) return false;
    try {
      for (const msg of stdinCommands(`${command}\n`, t.maxWriteSize)) await t.command(msg);
      return true;
    } catch {
      return false;
    }
  }, []);

  /** Fim de uma execução do programa (ou da conexão): encerra a sessão. */
  const endRun = useCallback((reason: string | null) => {
    sawValidRef.current = false;
    stdoutRef.current = "";
    if (!liveRef.current) return;
    liveRef.current = false;
    handlersRef.current.onClosed?.(reason);
  }, []);

  const markConnected = useCallback(
    (hello: Extract<AnatixFrame, { k: "H" }> | null) => {
      if (liveRef.current) return;
      liveRef.current = true;
      setBoth("connected");
      handlersRef.current.onConnected?.(hello);
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
        const kind = transportRef.current?.kind ?? "ble";
        void send(ANATIX_COMMANDS.bandwidth(PYBRICKS_BANDWIDTH[kind]));
        markConnected(frame);
      }
      handlersRef.current.onFrame?.(frame);
    },
    [markConnected, send, setBoth],
  );

  const handleEvent = useCallback(
    (event: Uint8Array) => {
      if (event[0] === PB_EVT.status) {
        const st = parsePybricksStatus(event);
        if (!st) return;
        selectedSlotRef.current = st.selectedSlot;
        if (st.running === runningRef.current) return;
        runningRef.current = st.running;
        setProgramRunning(st.running);
        if (st.running) {
          runStartedAtRef.current = Date.now();
          stdoutRef.current = "";
          void send(ANATIX_COMMANDS.ping);
        } else {
          endRun("Programa parado no hub.");
          if (transportRef.current) setBoth("handshake");
        }
      } else if (event[0] === PB_EVT.stdout) {
        let buffer = stdoutRef.current + new TextDecoder().decode(event.subarray(1));
        let nl = buffer.indexOf("\n");
        while (nl >= 0) {
          handleLine(buffer.slice(0, nl));
          buffer = buffer.slice(nl + 1);
          nl = buffer.indexOf("\n");
        }
        stdoutRef.current = buffer.length > MAX_LINE ? "" : buffer;
      }
    },
    [endRun, handleLine, send, setBoth],
  );

  const stopTimer = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const resetHub = useCallback(() => {
    stopTimer();
    transportRef.current = null;
    runningRef.current = false;
    setProgramRunning(false);
    setHub(null);
  }, []);

  const connect = useCallback(
    async (kind: PybricksTransportKind) => {
      if (transportRef.current || statusRef.current === "opening") return;
      setError(null);
      const t = createPybricksTransport(kind);
      t.onEvent = (event) => {
        if (transportRef.current === t) handleEvent(event);
      };
      t.onClose = (reason) => {
        if (transportRef.current !== t) return;
        resetHub();
        endRun(reason);
        setError(reason);
        setBoth(reason ? "error" : "idle");
      };

      setBoth("opening");
      try {
        await t.connect();
      } catch (err) {
        await t.disconnect().catch(() => undefined);
        if ((err as { name?: string })?.name === "NotFoundError") {
          setBoth("idle"); // o usuário fechou o seletor
          return;
        }
        setError(pybricksErrorMessage(err, kind));
        setBoth("error");
        return;
      }

      transportRef.current = t;
      setHub({ name: t.hubName, firmware: t.firmware, kind });
      lastFrameAtRef.current = 0;
      setBoth("handshake");

      timerRef.current = window.setInterval(() => {
        if (!runningRef.current) return;
        void send(ANATIX_COMMANDS.ping);
        const now = Date.now();
        const s = statusRef.current;
        if (s === "handshake") {
          // Frames válidos chegando, mas o H se perdeu: aceita a conexão.
          if (sawValidRef.current && now - runStartedAtRef.current >= ANATIX_HANDSHAKE_TIMEOUT_MS) {
            markConnected(null);
          }
        } else if (s === "connected" && now - lastFrameAtRef.current > SILENT_AFTER_MS) {
          setBoth("silent");
        }
      }, ANATIX_PING_MS);
    },
    [endRun, handleEvent, markConnected, resetHub, send, setBoth],
  );

  const disconnect = useCallback(async () => {
    const t = transportRef.current;
    if (!t) return;
    if (runningRef.current) await send(ANATIX_COMMANDS.stop);
    resetHub();
    await t.disconnect().catch(() => undefined);
    endRun(null);
    setError(null);
    setBoth("idle");
  }, [endRun, resetHub, send, setBoth]);

  const startProgram = useCallback(async () => {
    const t = transportRef.current;
    if (!t) return false;
    try {
      await t.command(startProgramCommand(t.slots, selectedSlotRef.current));
      return true;
    } catch (err) {
      setError(
        `Não foi possível iniciar o programa: ${err instanceof Error ? err.message : "erro"}. Envie o programa pelo Pybricks Code antes.`,
      );
      return false;
    }
  }, []);

  const stopProgram = useCallback(async () => {
    const t = transportRef.current;
    if (!t) return false;
    try {
      await t.command(Uint8Array.of(PB_CMD.stop));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Desconecta ao sair da página.
  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  return {
    status: bluetooth || usb ? status : ("unsupported" as AnatixStatus),
    error,
    hub,
    supports: { bluetooth, usb },
    programRunning,
    connect,
    disconnect,
    send,
    startProgram,
    stopProgram,
  };
}
