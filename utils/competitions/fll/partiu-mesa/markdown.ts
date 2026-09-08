/**
 * lib/mission-timer/markdown.ts
 *
 * Fonte única de verdade do relatório: transforma um `MissionTimerResult`
 * em um documento Markdown estruturado. A exportação em PDF (`pdf.ts`)
 * consome exatamente esta string — nenhuma estatística é recalculada
 * separadamente para o PDF.
 */

import type { Mission, MissionTimerResult } from "./types";
import { formatDurationMs } from "./calculations";

const RESULT_LABEL: Record<"success" | "failure" | "skipped", string> = {
  success: "Sucesso",
  failure: "Falha",
  skipped: "Não executada",
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function sanitizeFileNamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildExportFileName(seasonName: string, finishedAt: number, ext: "md" | "pdf"): string {
  const date = new Date(finishedAt);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  return `robostage-partiu-mesa-${sanitizeFileNamePart(seasonName)}-${dateStr}.${ext}`;
}

/**
 * Gera o relatório Markdown completo da sessão.
 * Esta função é a fonte única dos dados apresentados ao usuário
 * (tela de resultado, .md e .pdf devem sempre bater com o que sai daqui).
 */
export function generateMissionTimerMarkdown(
  result: MissionTimerResult,
  missionsById: Map<string, Mission>
): string {
  const lines: string[] = [];

  lines.push("# RoboStage — Partiu Mesa!");
  lines.push("");
  lines.push("## Sessão");
  lines.push("");
  lines.push(`- Temporada: ${result.seasonName}`);
  lines.push(`- Data: ${formatDate(result.finishedAt)}`);
  lines.push(`- Duração configurada: ${formatDurationMs(result.configuredDurationMs)}`);
  lines.push(`- Duração efetiva: ${formatDurationMs(result.effectiveDurationMs)}`);
  lines.push("");

  lines.push("## Missões");
  lines.push("");
  result.sequence.forEach((missionId, i) => {
    const mission = missionsById.get(missionId);
    lines.push(`${i + 1}. ${missionId} — ${mission?.name ?? "Missão"}`);
  });
  lines.push("");

  lines.push("## Resultado");
  lines.push("");
  lines.push(`- Missões executadas: ${result.executed}`);
  lines.push(`- Sucessos: ${result.successes}`);
  lines.push(`- Falhas: ${result.failures}`);
  lines.push(`- Não executadas: ${result.skipped}`);
  lines.push(`- Taxa de sucesso: ${result.successRate}%`);
  lines.push(
    result.score !== undefined
      ? `- Pontuação obtida: ${result.score} pts`
      : `- Pontuação obtida: não disponível (sem pontuação no JSON de missões)`
  );
  lines.push("");

  lines.push("## Lançamentos");
  lines.push("");
  lines.push("| # | Missão | Resultado | Duração |");
  lines.push("|---|---|---|---|");
  result.attempts.forEach((attempt, i) => {
    const durationLabel =
      attempt.durationMs !== undefined ? `${Math.round(attempt.durationMs / 1000)}s` : "—";
    lines.push(
      `| ${i + 1} | ${attempt.missionId} | ${RESULT_LABEL[attempt.result]} | ${durationLabel} |`
    );
  });
  lines.push("");

  lines.push("## Análise");
  lines.push("");
  lines.push(result.summaryText);
  lines.push("");

  lines.push("## Sequência");
  lines.push("");
  const seqSymbols = result.attempts
    .map((a) => {
      const symbol = a.result === "success" ? "✓" : a.result === "failure" ? "✕" : "○";
      return `${a.missionId} ${symbol}`;
    })
    .join(" → ");
  lines.push(seqSymbols || "—");
  lines.push("");

  return lines.join("\n");
}

/** Dispara o download de um arquivo de texto no navegador (usado para .md). */
export function downloadTextFile(fileName: string, content: string, mimeType = "text/markdown"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
