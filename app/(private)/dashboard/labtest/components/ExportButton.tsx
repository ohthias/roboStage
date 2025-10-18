"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function ExportResultsPDF({
  chartRef,
  testId,
}: {
  chartRef: React.RefObject<HTMLDivElement>;
  testId: string;
}) {
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!chartRef.current) return;

    setExporting(true);
    const element = chartRef.current;

    // --- Substitui cores "oklab" por preto temporariamente ---
    const originalColors: Map<HTMLElement, string> = new Map();
    element.querySelectorAll("*").forEach((el) => {
      const style = getComputedStyle(el as HTMLElement);
      if (style.color.includes("oklab")) {
        originalColors.set(el as HTMLElement, style.color);
        (el as HTMLElement).style.color = "#000000";
      }
      if (style.backgroundColor.includes("oklab")) {
        originalColors.set(el as HTMLElement, style.backgroundColor);
        (el as HTMLElement).style.backgroundColor = "#ffffff";
      }
    });

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF("p", "pt", "a4");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.text(`Resultados do Teste: ${testId}`, 20, 30);
      doc.addImage(imgData, "PNG", 20, 50, pdfWidth, pdfHeight);
      doc.save(`resultados_${testId}.pdf`);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
    } finally {
      // --- Restaura as cores originais ---
      originalColors.forEach((value, el) => {
        (el as HTMLElement).style.color = value;
        (el as HTMLElement).style.backgroundColor = value;
      });

      setExporting(false);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <button
        className="btn btn-primary btn-sm"
        onClick={handleExportPDF}
        disabled={exporting}
      >
        {exporting ? "Exportando..." : "Exportar PDF"}
      </button>
    </div>
  );
}