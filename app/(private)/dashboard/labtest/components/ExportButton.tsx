"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

export default function ExportResultsPDF({
  chartRef,
  testId,
  testTitle = "Relatório de Resultados",
  logoSrc = "/logo.png",
}: {
  chartRef: React.RefObject<HTMLDivElement>;
  testId: string;
  testTitle?: string;
  logoSrc?: string;
}) {
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    setExporting(true);

    try {
      // Captura a área completa
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 70; // margem superior, deixando espaço pro cabeçalho

      let pageCount = 0;
      const totalPages = Math.ceil(imgHeight / (pageHeight - 100));

      // Função para adicionar cabeçalho e rodapé em cada página
      const addHeaderFooter = (pageNum: number) => {
        // Cabeçalho
        const logoWidth = 40;
        const logoHeight = 40;
        pdf.addImage(logoSrc, "PNG", 20, 20, logoWidth, logoHeight);
        pdf.setFontSize(14);
        pdf.text(testTitle, 70, 40);
        pdf.setFontSize(10);
        pdf.text(`ID do teste: ${testId}`, 70, 55);

        // Rodapé
        pdf.setFontSize(9);
        pdf.text(
          `Página ${pageNum} de ${totalPages}`,
          pageWidth - 80,
          pageHeight - 20
        );
      };

      // Primeira página
      addHeaderFooter(++pageCount);
      pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 100;

      // Páginas subsequentes
      while (heightLeft > 0) {
        pdf.addPage();
        addHeaderFooter(++pageCount);
        pdf.addImage(
          imgData,
          "PNG",
          20,
          position - heightLeft,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight - 100;
      }

      pdf.save(`resultados_${testId}.pdf`);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex justify-end mt-4">
      <button
        className="btn btn-primary btn-outline"
        onClick={handleExportPDF}
        disabled={exporting}
      >
        {exporting ? "Exportando..." : "Exportar PDF"}
      </button>
    </div>
  );
}