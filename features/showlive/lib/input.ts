import { ValidationError } from "@/features/stagebook/lib/validation";
import type { CreateShowLiveEventInput, ShowLiveFormat } from "./types";

export const SHOWLIVE_FORMATS: { id: ShowLiveFormat; label: string; description: string }[] = [
  { id: "fll", label: "FLL Challenge", description: "Missões oficiais da temporada, com a súmula da FIRST." },
  { id: "fll_fe", label: "FLL Future Edition", description: "Formato com cartões de penalidade e missões agrupadas." },
  { id: "obr", label: "OBR Resgate", description: "3 arenas, soma das 2 maiores notas e desempate por tempo." },
  { id: "custom", label: "Personalizado", description: "Seu próprio desafio: missões, tempo, avaliação ou medida." },
];

/**
 * Valida no RoboStage o que dá para validar sem o ShowLive (mensagens
 * imediatas). As regras completas continuam no ShowLive.
 */
export function buildCreatePayload(raw: unknown): CreateShowLiveEventInput {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const name = String(b.name ?? "").replace(/\s+/g, " ").trim();
  if (name.length < 3) throw new ValidationError("Dê um nome com pelo menos 3 letras.");
  if (name.length > 80) throw new ValidationError("O nome pode ter até 80 caracteres.");

  const format = SHOWLIVE_FORMATS.some((f) => f.id === b.format) ? (b.format as ShowLiveFormat) : null;
  if (!format) throw new ValidationError("Escolha a liga do evento.");

  const payload: CreateShowLiveEventInput = { name, format };

  if (format === "fll") {
    if (typeof b.season !== "string" || !b.season) throw new ValidationError("Escolha a temporada da FLL.");
    payload.season = b.season;
  }
  if (format !== "obr") {
    const rounds = Math.round(Number(b.roundCount));
    if (!Number.isFinite(rounds) || rounds < 1 || rounds > 8) throw new ValidationError("Use de 1 a 8 rodadas.");
    payload.roundCount = rounds;
  }
  if (format === "custom") {
    const src = (b.source && typeof b.source === "object" ? b.source : null) as Record<string, unknown> | null;
    if (src?.kind === "preset" && typeof src.id === "string") payload.source = { kind: "preset", id: src.id };
    else if (src?.kind === "template" && typeof src.id === "string") payload.source = { kind: "template", id: src.id };
    else if (src?.kind === "blank" && typeof src.type === "string") payload.source = { kind: "blank", type: src.type };
    else throw new ValidationError("Escolha um modelo de desafio ou comece em branco.");
  }
  return payload;
}
