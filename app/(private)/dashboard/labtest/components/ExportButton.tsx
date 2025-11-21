"use client";

import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface ExportResultsPDFProps {
  chartRefs: React.RefObject<HTMLDivElement | null>[];
  chartTitles?: string[];
  testTitle: string;
}

export default function ExportResultsPDF({
  chartRefs,
  chartTitles,
  testTitle,
}: ExportResultsPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [teamName, setTeamName] = useState("Meu Time");
  const [teamNumber, setTeamNumber] = useState("0000");
  const [isClient, setIsClient] = useState(false);

  // Só acessar localStorage no cliente
  useEffect(() => {
    setIsClient(true);
    const storedTeam = localStorage.getItem("fll_team_info");
    if (storedTeam) {
      const parsed = JSON.parse(storedTeam);
      setTeamName(parsed.name || "Meu Time");
      setTeamNumber(parsed.number || "0000");
    }
  }, []);

  const handleExportPdf = async () => {
    if (!teamName || !teamNumber) {
      alert("Informe o nome do time e o número antes de exportar!");
      return;
    }

    setIsExporting(true);

    try {
      localStorage.setItem(
        "fll_team_info",
        JSON.stringify({ name: teamName, number: teamNumber })
      );

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Cabeçalho da primeira página
      pdf.setFontSize(24);
      pdf.setTextColor("#1D4ED8");
      pdf.text(testTitle, pageWidth / 2, 25, { align: "center" });
      pdf.setFontSize(16);
      pdf.setTextColor("#374151");
      pdf.text(teamName, pageWidth / 2, 35, { align: "center" });
      pdf.text(`#${teamNumber} • ${new Date().toLocaleDateString()}`, pageWidth / 2, 42, { align: "center" });

      pdf.addPage();

      for (let i = 0; i < chartRefs.length; i++) {
        const ref = chartRefs[i];
        if (!ref.current) continue;

        const chartTitle = chartTitles?.[i] || `Gráfico ${i + 1}`;

        const exportContainer = document.createElement("div");
        exportContainer.style.position = "absolute";
        exportContainer.style.top = "-9999px";
        exportContainer.style.left = "-9999px";
        exportContainer.style.width = "800px";
        exportContainer.style.height = "600px";
        exportContainer.style.backgroundColor = "#ffffff";
        exportContainer.style.padding = "20px";
        exportContainer.style.borderRadius = "8px";
        exportContainer.style.display = "flex";
        exportContainer.style.flexDirection = "column";
        exportContainer.style.alignItems = "center";
        exportContainer.style.justifyContent = "flex-start";
        exportContainer.style.boxShadow = "0 0 20px rgba(0,0,0,0.1)";
        exportContainer.className = "font-sans text-gray-900";

        const titleEl = document.createElement("h2");
        titleEl.textContent = chartTitle;
        titleEl.style.textAlign = "center";
        titleEl.style.marginBottom = "16px";
        titleEl.style.fontSize = "24px";
        titleEl.style.color = "#1D4ED8";
        exportContainer.appendChild(titleEl);

        const chartClone = ref.current.cloneNode(true) as HTMLElement;
        chartClone.style.width = "100%";
        chartClone.style.height = "100%";
        chartClone.style.maxWidth = "100%";
        chartClone.style.maxHeight = "100%";

        const scrollables = chartClone.querySelectorAll(".overflow-y-auto");
        scrollables.forEach((el) => {
          (el as HTMLElement).classList.remove("overflow-y-auto");
          (el as HTMLElement).style.overflow = "visible";
          (el as HTMLElement).style.height = "100%";
        });

        exportContainer.appendChild(chartClone);
        document.body.appendChild(exportContainer);

        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = await html2canvas(exportContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        document.body.removeChild(exportContainer);

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let remainingHeight = imgHeight;
        let position = 10;

        while (remainingHeight > 0) {
          pdf.addImage(
            imgData,
            "PNG",
            10,
            position,
            imgWidth,
            Math.min(remainingHeight, pageHeight - 20)
          );
          remainingHeight -= pageHeight - 20;
          if (remainingHeight > 0) pdf.addPage();
          position = 10;
        }

        if (i < chartRefs.length - 1) pdf.addPage();
      }

      pdf.save(
        `labtest-${teamName.replace(/\s+/g, "-").toLowerCase()}-${new Date()
          .toISOString()
          .split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Erro ao exportar PDF", error);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isClient) return null; // evita SSR

  return (
    <div className="flex flex-col gap-2 items-center mt-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome do Time"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="input input-bordered input-sm"
        />
        <input
          type="text"
          placeholder="#0000"
          value={teamNumber}
          onChange={(e) => setTeamNumber(e.target.value)}
          className="input input-bordered input-sm w-20"
        />
      </div>
      <button
        className={`btn btn-primary btn-outline mt-2 ${isExporting ? "loading" : ""}`}
        onClick={handleExportPdf}
        disabled={isExporting}
      >
        🖨️ {isExporting ? "Exportando..." : "Imprimir / Salvar como PDF"}
      </button>
    </div>
  );
}
