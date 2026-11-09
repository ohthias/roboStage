import { describe, expect, it } from "vitest";
import {
  PB_CMD,
  parsePybricksCapabilities,
  parsePybricksStatus,
  startProgramCommand,
  stdinCommands,
} from "@/utils/labtest/anatix/pybricks";
import {
  ANATIX_COMMANDS,
  normalizeAnatixConfig,
  parseAnatixLine,
} from "@/utils/labtest/anatix/protocol";
import { featureLevel } from "@/utils/stagebook/league-features";

describe("protocolo Pybricks (Bluetooth/USB)", () => {
  it("lê o evento de status: flags, programa rodando e slot", () => {
    const running = parsePybricksStatus(Uint8Array.of(0x00, 0x40, 0x02, 0x00, 0x00, 0x00, 0x03));
    expect(running).toEqual({ flags: 0x240, running: true, selectedSlot: 3 });

    const stopped = parsePybricksStatus(Uint8Array.of(0x00, 0x08, 0x02, 0x00, 0x00));
    expect(stopped).toMatchObject({ running: false, selectedSlot: 0 });

    expect(parsePybricksStatus(Uint8Array.of(0x01, 0x41))).toBeNull(); // evento de stdout
  });

  it("quebra o stdin em comandos WRITE_STDIN que cabem no tamanho máximo", () => {
    const msgs = stdinCommands("ANX PING\n", 5);
    expect(msgs.every((m) => m[0] === PB_CMD.writeStdin && m.length <= 5)).toBe(true);
    const text = new TextDecoder().decode(
      Uint8Array.from(msgs.flatMap((m) => Array.from(m.subarray(1)))),
    );
    expect(text).toBe("ANX PING\n");
  });

  it("inicia o programa com o slot só quando o hub tem slots", () => {
    expect(Array.from(startProgramCommand(0, 2))).toEqual([PB_CMD.start]);
    expect(Array.from(startProgramCommand(5, 2))).toEqual([PB_CMD.start, 2]);
  });

  it("lê a característica de capacidades (v1.2 e v1.5)", () => {
    const v15 = new DataView(Uint8Array.of(0x9e, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0x05).buffer);
    expect(parsePybricksCapabilities(v15)).toEqual({ maxWriteSize: 158, slots: 5 });
    const v12 = new DataView(Uint8Array.of(0x14, 0x00, 0, 0, 0, 0, 0, 0, 0, 0).buffer);
    expect(parsePybricksCapabilities(v12)).toEqual({ maxWriteSize: 20, slots: 0 });
  });
});

describe("Anatix no Pybricks", () => {
  it("entende os frames gerados pelo anatix.py (\\r\\n, placa do hub)", () => {
    const hello = parseAnatixLine("$ANX,H,8,1,Seguidor-OBR,primehub,250*7B\r");
    expect(hello).toEqual({
      kind: "frame",
      frame: { k: "H", t: 8, version: 1, robot: "Seguidor-OBR", board: "primehub", periodMs: 250 },
    });
    const battery = parseAnatixLine("$ANX,V,8,hub_bateria_v,8.100*7F");
    expect(battery).toMatchObject({ kind: "frame", frame: { k: "V", name: "hub_bateria_v", value: 8.1 } });
  });

  it("tem o comando de banda do anatix.py, com limites", () => {
    expect(ANATIX_COMMANDS.bandwidth(4000)).toBe("ANX BW 4000");
    expect(ANATIX_COMMANDS.bandwidth(1)).toBe("ANX BW 200");
    expect(ANATIX_COMMANDS.bandwidth(1e9)).toBe("ANX BW 100000");
  });

  it("guarda a conexão do laboratório e usa serial para laboratórios antigos", () => {
    expect(normalizeAnatixConfig({}).transport).toBe("serial");
    expect(normalizeAnatixConfig({ transport: "pybricks" }).transport).toBe("pybricks");
    expect(normalizeAnatixConfig({ transport: "wifi" }).transport).toBe("serial");
  });

  it("está liberado na FLL Challenge", () => {
    expect(featureLevel({ code: "FLL", name: "FIRST LEGO League Challenge" }, "anatix")).toBe("full");
    expect(featureLevel({ code: "OBR", name: "OBR Resgate" }, "anatix")).toBe("full");
  });
});
