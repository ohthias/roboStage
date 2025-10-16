"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/utils/supabase/client";

export const handleExportResultsPDF = async (testId: string, addToast: (msg: string, type?: string) => void) => {
  // Busca resultados do teste
  const { data: resultsData, error } = await supabase
    .from("results")
    .select(`*, test_parameters(*)`)
    .eq("test_id", testId);

  if (error) {
    addToast("Erro ao buscar resultados do teste.", "error");
    console.error(error);
    return;
  }

  if (!resultsData || resultsData.length === 0) {
    addToast("Não há resultados para exportar.", "info");
    return;
  }

  // Cria HTML para PDF
  const container = document.getElementById("pdf-export-container");
  if (!container) return;

  container.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; width: 800px;">
      <h1 style="text-align:center;">Resultados do Teste</h1>
      <h2>Test ID: ${testId}</h2>
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; padding: 8px;">Parâmetro</th>
            <th style="border: 1px solid #000; padding: 8px;">Métrica</th>
            <th style="border: 1px solid #000; padding: 8px;">Valor</th>
            <th style="border: 1px solid #000; padding: 8px;">Descrição</th>
            <th style="border: 1px solid #000; padding: 8px;">Criado em</th>
          </tr>
        </thead>
        <tbody>
          ${resultsData
            .map(
              (r) => `
            <tr>
              <td style="border: 1px solid #000; padding: 6px;">${r.test_parameters?.name || "-"}</td>
              <td style="border: 1px solid #000; padding: 6px;">${r.metric || "-"}</td>
              <td style="border: 1px solid #000; padding: 6px;">${JSON.stringify(r.value)}</td>
              <td style="border: 1px solid #000; padding: 6px;">${r.description || "-"}</td>
              <td style="border: 1px solid #000; padding: 6px;">${new Date(r.created_at).toLocaleString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  // Gera canvas
  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  // Gera PDF
  const pdf = new jsPDF("p", "pt", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`resultados_teste_${testId}.pdf`);

  addToast("PDF gerado com sucesso!", "success");
};
