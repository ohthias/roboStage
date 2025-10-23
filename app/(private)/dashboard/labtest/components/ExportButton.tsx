"use client";
import React, { useState } from "react";

interface ExportResultsPDFProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  testTitle: string;
}

export default function ExportResultsPDF({
  chartRef,
  testTitle,
}: ExportResultsPDFProps) {
  const handlePrint = () => {
    if (!chartRef.current) return;

    const printContents = chartRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${testTitle || "Relatório"}</title>
          <style>
            @media print {
              body { padding: 10mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align:center;">${testTitle || "Relatório de Teste"}</h1>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex justify-center mt-6">
      <button className="btn btn-primary btn-outline" onClick={handlePrint}>
        🖨️ Imprimir / Salvar como PDF
      </button>
    </div>
  );
}