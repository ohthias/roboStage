"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { InlineAlert, Panel, ToolButton } from "@/components/stage";
import type { Mission, MissionTimerResult } from "@/features/leagues/fll/partiu-mesa/lib/types";
import { buildExportFileName, downloadTextFile, generateMissionTimerMarkdown } from "@/features/leagues/fll/partiu-mesa/lib/markdown";

interface ExportResultsProps {
  result: MissionTimerResult;
  missionsById: Map<string, Mission>;
}

export default function ExportResults({ result, missionsById }: ExportResultsProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const markdown = generateMissionTimerMarkdown(result, missionsById);

  function handleDownloadMarkdown() {
    const fileName = buildExportFileName(result.seasonName, result.finishedAt, "md");
    downloadTextFile(fileName, markdown);
  }

  async function handleDownloadPdf() {
    setPdfError(null);
    setIsExportingPdf(true);
    try {
      const { downloadPdf } = await import("@/features/leagues/fll/partiu-mesa/lib/pdf");
      const fileName = buildExportFileName(result.seasonName, result.finishedAt, "pdf");
      downloadPdf(markdown, fileName, `RoboStage Mission Timer — ${result.seasonName}`);
    } catch {
      setPdfError("Não foi possível gerar o PDF. Verifique se a dependência 'jspdf' está instalada.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <Panel title="Exportar resultado">
      <p className="text-xs text-base-content/60">Leve o treino para o caderno da equipe.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ToolButton size="md" icon={<FileText />} onClick={handleDownloadMarkdown}>
          Baixar .md
        </ToolButton>
        <ToolButton size="md" variant="primary" icon={<Download />} onClick={handleDownloadPdf} disabled={isExportingPdf}>
          {isExportingPdf ? "Gerando PDF..." : "Exportar PDF"}
        </ToolButton>
      </div>
      {pdfError && (
        <InlineAlert type="error" className="mt-3">
          {pdfError}
        </InlineAlert>
      )}
    </Panel>
  );
}
