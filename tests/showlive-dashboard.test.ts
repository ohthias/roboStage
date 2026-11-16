/**
 * Aba /dashboard/showlive: validação local e conversa com a API do ShowLive.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildCreatePayload } from "@/utils/showlive/input";
import { ShowLiveError, showliveFetch } from "@/utils/showlive/client";
import { ValidationError } from "@/utils/stagebook/validation";

describe("buildCreatePayload", () => {
  it("monta um evento FLL com temporada e rodadas", () => {
    expect(buildCreatePayload({ name: "  Regional   Nordeste ", format: "fll", season: "bioglow", roundCount: "3" })).toEqual({
      name: "Regional Nordeste",
      format: "fll",
      season: "bioglow",
      roundCount: 3,
    });
  });

  it("OBR não leva rodadas nem temporada (vêm das arenas)", () => {
    expect(buildCreatePayload({ name: "OBR Estadual", format: "obr", season: "x", roundCount: 9 })).toEqual({
      name: "OBR Estadual",
      format: "obr",
    });
  });

  it("personalizado exige a origem do desafio", () => {
    expect(() => buildCreatePayload({ name: "Treino", format: "custom", roundCount: 2 })).toThrow(ValidationError);
    expect(
      buildCreatePayload({ name: "Treino", format: "custom", roundCount: 2, source: { kind: "preset", id: "seguidor-de-linha" } }),
    ).toMatchObject({ source: { kind: "preset", id: "seguidor-de-linha" } });
  });

  it("recusa nome curto, liga desconhecida e rodadas fora do limite", () => {
    expect(() => buildCreatePayload({ name: "ab", format: "fll", season: "bioglow", roundCount: 3 })).toThrow("pelo menos 3");
    expect(() => buildCreatePayload({ name: "Evento", format: "vex" })).toThrow("liga");
    expect(() => buildCreatePayload({ name: "Evento", format: "fll_fe", roundCount: 0 })).toThrow("1 a 8");
    expect(() => buildCreatePayload({ name: "Evento", format: "fll", roundCount: 3 })).toThrow("temporada");
  });
});

describe("showliveFetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("repassa o token do Clerk e devolve o JSON", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "e1", hubUrl: "https://s/hub/e1" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const data = await showliveFetch<{ id: string }>("/api/v1/events", { method: "POST", body: { name: "X" } }, async () => "tok");
    expect(data.id).toBe("e1");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/events$/);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(init.body).toBe(JSON.stringify({ name: "X" }));
  });

  it("sem sessão nem chama a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(showliveFetch("/api/v1/events", {}, async () => null)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("traz a mensagem de erro do ShowLive", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Muitos eventos criados na última hora." }), { status: 429 })));
    await expect(showliveFetch("/api/v1/events", {}, async () => "tok")).rejects.toThrow("Muitos eventos");
  });

  it("ShowLive fora do ar vira erro amigável", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    const err = (await showliveFetch("/api/v1/events", {}, async () => "tok").catch((e: unknown) => e)) as ShowLiveError;
    expect(err).toBeInstanceOf(ShowLiveError);
    expect(err.status).toBe(503);
  });
});
