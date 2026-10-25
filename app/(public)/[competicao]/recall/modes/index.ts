import type { FlashQAMode } from "@/types/FlashQATypes";
import { FLL_MODE } from "./FLL";
import { OBR_MODE } from "./OBR";

export const RECALL_MODES = {
  fll: FLL_MODE,
  obr: OBR_MODE,
} satisfies Record<string, FlashQAMode>;

export type RecallCompetition = keyof typeof RECALL_MODES;

export function isRecallCompetition(value: string): value is RecallCompetition {
  return value in RECALL_MODES;
}
