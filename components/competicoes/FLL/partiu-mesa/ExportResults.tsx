"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import type { Mission, MissionTimerResult } from "@/utils/competitions/fll/partiu-mesa/types";
import { buildExportFileName, downloadTextFile, generateMissionTimerMarkdown } from "@/utils/competitions/fll/partiu-mesa/markdown";

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
      const { downloadPdf } = await import("@/utils/competitions/fll/partiu-mesa/pdf");
      const fileName = buildExportFileName(result.seasonName, result.finishedAt, "pdf");
      downloadPdf(markdown, fileName, `RoboStage Mission Timer — ${result.seasonName}`);
    } catch {
      setPdfError("Não foi possível gerar o PDF. Verifique se a dependência 'jspdf' está instalada.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">Exportar resultado</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="btn btn-outline gap-2" onClick={handleDownloadMarkdown}>
          <FileText className="w-4 h-4" />
          Baixar .md
        </button>
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
        >
          <Download className="w-4 h-4" />
          {isExportingPdf ? "Gerando PDF..." : "Exportar PDF"}
        </button>
      </div>
      {pdfError && (
        <div className="alert alert-error mt-3">
          <span className="text-sm">{pdfError}</span>
        </div>
      )}
    </div>
  );
}
