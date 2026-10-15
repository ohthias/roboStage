"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FlaskConical } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./style.css"

import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";
import { getModeDefinition } from "@/utils/labtest/modes";
import { entryTotal, maxPossibleTotal } from "@/utils/labtest/stats";
import { getLabTestViewData } from "../../actions";
import { FllRunsCharts } from "@/components/labtest/FllRunsCharts";
import { LabTestModeCharts } from "@/components/labtest/LabTestModeCharts";

function formatValue(field: FieldDefinition, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "boolean") return value ? "Sim" : "Não";
  return field.unit ? `${value} ${field.unit}` : String(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SummaryChart({ fields, entries }: { fields: FieldDefinition[]; entries: TestEntry[] }) {
  const numericFields = fields.filter((field) => field.type === "number");
  if (numericFields.length === 0 || entries.length === 0) return null;

  const data = entries.map((entry, index) => {
    const point: Record<string, string | number> = { name: `#${index + 1}` };
    numericFields.forEach((field) => {
      const value = getFieldValue(entry.values, field.fieldKey);
      point[field.fieldKey] = typeof value === "number" ? value : 0;
    });
    return point;
  });

  return (
    <section className="report-section">
      <h2>Gráficos de desempenho</h2>
      <div className="report-chart">
        <ResponsiveContainer width="100%" height={280}>
          {numericFields.length === 1 ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey={numericFields[0].fieldKey} name={numericFields[0].label} stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {numericFields.map((field, index) => (
                <Bar key={field.fieldKey} dataKey={field.fieldKey} name={field.label} fill={index % 2 ? "#f59e0b" : "#2563eb"} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ExecutionTable({ fields, entries }: { fields: FieldDefinition[]; entries: TestEntry[] }) {
  const maxTotal = maxPossibleTotal(fields);
  return (
    <section className="report-section">
      <h2>Todas as execuções</h2>
      {entries.length === 0 ? (
        <p className="muted">Nenhuma execução registrada.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Data</th>
                {fields.map((field) => <th key={field.fieldKey}>{field.label}</th>)}
                <th>Total</th>
                <th>Comentários</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const total = entryTotal(entry, fields);
                return (
                  <tr key={entry.id}>
                    <td>{entry.executionNumber}</td>
                    <td>{formatDate(entry.createdAt)}</td>
                    {fields.map((field) => (
                      <td key={field.fieldKey}>{formatValue(field, getFieldValue(entry.values, field.fieldKey))}</td>
                    ))}
                    <td>{maxTotal > 0 ? `${total} / ${maxTotal}` : total || "—"}</td>
                    <td className="notes">{entry.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function LabTestExportPage() {
  const params = useParams();
  const testId = String(params.id ?? "");
  const reportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getLabTestViewData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;
    getLabTestViewData(testId)
      .then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Não foi possível carregar o relatório."))
      .finally(() => setLoading(false));
  }, [testId]);

  const exportPdf = async () => {
    if (!reportRef.current || !data) return;
    setExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      const canvas = await html2canvas(reportRef.current, {
        scale: Math.min(2, window.devicePixelRatio || 1),
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: reportRef.current.scrollWidth,
      });
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let offset = 0;
      while (offset < imageHeight) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(canvas, "PNG", 0, -offset, pageWidth, imageHeight, undefined, "FAST");
        offset += pageHeight;
      }
      pdf.save(`robostage-${data.test.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="report-state">Carregando relatório...</div>;
  if (error || !data) return <div className="report-state">{error ?? "Relatório não encontrado."}</div>;

  const modeDef = getModeDefinition(data.test.mode);
  return (
    <main className="export-page">
      <div className="export-toolbar" data-export-ignore="true">
        <Link href={`/dashboard/labtest/${testId}`} className="btn btn-sm gap-2 rounded-lg"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        <button type="button" onClick={exportPdf} disabled={exporting} className="btn btn-primary btn-sm gap-2 rounded-lg">
          {exporting ? <span className="loading loading-spinner loading-xs" /> : <Download className="h-4 w-4" />}
          {exporting ? "Gerando PDF..." : "Baixar PDF"}
        </button>
      </div>
      <div ref={reportRef} className="export-report">
        <header className="report-header">
          <div className="report-brand"><FlaskConical /> RoboStage · Relatório de teste</div>
          <h1>{data.test.name}</h1>
          <p>{data.test.description || "Relatório completo de execuções"}</p>
          <div className="report-meta"><span>Modo: {modeDef.label}</span><span>Temporada: {data.test.season || "—"}</span><span>Criado em: {formatDate(data.test.createdAt)}</span></div>
        </header>
        <section className="report-section report-summary">
          <div><strong>{data.entries.length}</strong><span>execuções</span></div>
          <div><strong>{data.entries.length ? Math.max(...data.entries.map((entry: TestEntry) => entryTotal(entry, data.fields))) : 0}</strong><span>melhor total</span></div>
          <div><strong>{data.fields.length}</strong><span>parâmetros</span></div>
        </section>
        {data.test.mode === "runs" && data.test.season ? <FllRunsCharts season={data.test.season} entries={data.entries} accent={modeDef.accent} /> : data.test.mode !== "runs" ? <LabTestModeCharts mode={data.test.mode} config={data.test.config} fields={data.fields} entries={data.entries} accent={modeDef.accent} /> : <SummaryChart fields={data.fields} entries={data.entries} />}
        <ExecutionTable fields={data.fields} entries={data.entries} />
      </div>
    </main>
  );
}
