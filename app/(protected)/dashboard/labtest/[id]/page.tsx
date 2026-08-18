"use client";

// ---------------------------------------------------------------------------
// Visualização do teste — um único motor para os 4 modos.
// Antes existiam RunsView / CalibrabotView / IndividualView, cada um com seus
// próprios cálculos e gráficos. Agora a página lê `fields` + `entries`
// (genéricos, vindos de useTest) e monta estatísticas/gráficos a partir disso
// — funciona automaticamente para o modo Personalizado, sem código extra.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  Activity,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ListOrdered,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useTest } from "@/hooks/useLabTests";
import { getModeDefinition, ACCENT_STYLES } from "@/utils/labtest/modes";
import {
  computeFieldStats,
  entryTotal,
  maxPossibleTotal,
} from "@/utils/labtest/stats";
import { getFieldValue } from "@/types/labtest.types";
import {
  StatCard,
  SectionHeader,
  CustomTooltip,
  fmtDate,
} from "@/components/labtest/shared";
import type { FieldDefinition, TestEntry } from "@/types/labtest.types";

// ---------------------------------------------------------------------------
// Bloco de estatísticas gerais — funciona para qualquer modo
// ---------------------------------------------------------------------------

function OverviewStats({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: "primary" | "secondary" | "accent" | "info";
}) {
  const numericFields = fields.filter((f) => f.type === "number");
  const booleanFields = fields.filter((f) => f.type === "boolean");

  const totals = entries.map((e) => entryTotal(e, fields));
  const maxTotal = maxPossibleTotal(fields);
  const best = totals.length ? Math.max(...totals) : 0;
  const avg = totals.length
    ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
    : 0;

  const overallCompletion = booleanFields.length
    ? Math.round(
        (booleanFields.reduce(
          (sum, f) => sum + computeFieldStats(f, entries).completionRate!,
          0,
        ) /
          booleanFields.length) *
          1,
      )
    : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Lançamentos"
        value={entries.length}
        icon={ListOrdered}
        accent={accent}
      />
      {numericFields.length > 0 && (
        <>
          <StatCard
            label="Melhor total"
            value={`${best} pts`}
            sub={maxTotal ? `máx ${maxTotal} pts` : undefined}
            icon={Award}
            accent={accent}
          />
          <StatCard
            label="Média"
            value={`${avg} pts`}
            sub="por lançamento"
            icon={BarChart2}
            accent={accent}
          />
        </>
      )}
      {overallCompletion !== null && (
        <StatCard
          label="Taxa de conclusão"
          value={`${overallCompletion}%`}
          sub="campos sim/não"
          icon={Activity}
          accent={accent}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gráfico: evolução do total (para modos com campos numéricos, ex. runs)
// ---------------------------------------------------------------------------

function TotalEvolutionChart({
  fields,
  entries,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const maxTotal = maxPossibleTotal(fields);
  const data = entries.map((e, i) => ({
    name: `#${i + 1}`,
    total: entryTotal(e, fields),
  }));

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 lg:col-span-2">
      <SectionHeader label="Evolução da pontuação" />
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--bc)/0.07)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(var(--bc)/0.2)" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="oklch(var(--bc)/0.2)"
            domain={[0, (maxTotal || 10) + 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          {maxTotal > 0 && (
            <ReferenceLine
              y={maxTotal}
              stroke="oklch(var(--bc)/0.15)"
              strokeDasharray="4 4"
              label={{ value: "máx", fontSize: 10, fill: "oklch(var(--bc)/0.3)" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="total"
            stroke="oklch(var(--p))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "oklch(var(--p))" }}
            activeDot={{ r: 6 }}
            name="Pontuação"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gráfico: comparação por campo selecionado (generaliza o antigo CalibrabotView)
// Funciona tanto para CalibraBot quanto para o modo Personalizado.
// ---------------------------------------------------------------------------

function FieldComparisonChart({
  fields,
  entries,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const numericFields = fields.filter((f) => f.type === "number");
  const [activeKey, setActiveKey] = useState(numericFields[0]?.fieldKey ?? "");
  const activeField = numericFields.find((f) => f.fieldKey === activeKey);

  if (!activeField) return null;

  const data = entries.map((e, i) => ({
    name: `#${i + 1}`,
    value: getFieldValue(e.values, activeField.fieldKey) ?? 0,
  }));

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-base-content/60">
          Comparativo por parâmetro
        </h3>
        <div className="flex flex-wrap gap-1">
          {numericFields.map((f) => (
            <button
              key={f.fieldKey}
              type="button"
              onClick={() => setActiveKey(f.fieldKey)}
              className={`btn btn-xs rounded-lg ${
                activeKey === f.fieldKey
                  ? "btn-secondary"
                  : "btn-ghost text-base-content/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(var(--bc)/0.07)"
            vertical={false}
          />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(var(--bc)/0.2)" />
          <YAxis tick={{ fontSize: 11 }} stroke="oklch(var(--bc)/0.2)" />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            fill="oklch(var(--s))"
            name={activeField.label}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Histórico de lançamentos — genérico, formata cada campo pelo seu tipo
// ---------------------------------------------------------------------------

function formatFieldValue(field: FieldDefinition, raw: unknown) {
  if (raw === null || raw === undefined || raw === "") return "—";
  if (field.type === "boolean") return raw ? "Sim" : "Não";
  if (field.type === "number" || field.type === "duration") {
    return field.unit ? `${raw} ${field.unit}` : String(raw);
  }
  return String(raw);
}

function EntryHistory({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: "primary" | "secondary" | "accent" | "info";
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const style = ACCENT_STYLES[accent];
  const maxTotal = maxPossibleTotal(fields);
  const hasNumericFields = fields.some((f) => f.type === "number");

  return (
    <div>
      <SectionHeader label="Histórico de lançamentos" />
      <div className="flex flex-col gap-2">
        {[...entries].reverse().map((entry, ri) => {
          const total = entryTotal(entry, fields);
          const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
          const isOpen = expanded === entry.id;
          const num = entries.length - ri;

          return (
            <div
              key={entry.id}
              className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-base-200/40"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${style.bgSoft} ${style.text}`}
                >
                  {num}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Lançamento #{num}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/40">
                    <Calendar className="h-3 w-3" />
                    {fmtDate(entry.createdAt)}
                  </p>
                </div>
                {hasNumericFields && (
                  <div className="shrink-0 text-right">
                    <p className={`text-base font-bold ${style.text}`}>{total} pts</p>
                    {maxTotal > 0 && (
                      <p className="text-xs text-base-content/40">{pct}% do máx</p>
                    )}
                  </div>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-base-content/30" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-base-content/30" />
                )}
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 gap-2 border-t border-base-content/8 px-5 py-4 sm:grid-cols-2">
                  {fields.map((field) => {
                    const raw = getFieldValue(entry.values, field.fieldKey);
                    const completed =
                      field.type === "boolean" ? raw === true : raw !== null;
                    return (
                      <div
                        key={field.fieldKey}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                          completed
                            ? "border-success/25 bg-success/5"
                            : "border-base-content/8 bg-base-200/40"
                        }`}
                      >
                        {field.type === "boolean" ? (
                          raw === true ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-base-content/25" />
                          )
                        ) : null}
                        <span className="flex-1 font-medium">{field.label}</span>
                        <span className={`font-bold ${style.text}`}>
                          {formatFieldValue(field, raw)}
                        </span>
                      </div>
                    );
                  })}
                  {entry.notes && (
                    <p className="sm:col-span-2 border-l-2 border-l-base-content/15 pl-3 text-sm leading-relaxed text-base-content/60">
                      {entry.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function LabTestView() {
  const params = useParams();
  const testId = params.id as string;
  const { test, fields, entries, loading, error } = useTest(testId);

  const modeDef = useMemo(
    () => (test ? getModeDefinition(test.mode) : null),
    [test],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200/40 px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-base-content/10 bg-base-100 p-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (error || !test || !modeDef) {
    return (
      <div className="min-h-screen bg-base-200/40 px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-error/20 bg-base-100 p-6">
          <p className="font-semibold text-error">Não foi possível carregar o teste.</p>
          <p className="mt-2 text-sm text-base-content/60">
            {error ?? "Teste não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  const Icon = modeDef.icon;
  const style = ACCENT_STYLES[modeDef.accent];
  const hasNumericFields = fields.some((f) => f.type === "number");
  const numericFieldCount = fields.filter((f) => f.type === "number").length;

  return (
    <div className="min-h-screen bg-base-200/40 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`badge badge-sm badge-outline gap-1.5 py-2.5 ${style.text} ${style.badgeBorder}`}
                >
                  <Icon className="h-3 w-3" />
                  {modeDef.label}
                </span>
                {test.season && (
                  <span className="badge badge-sm badge-ghost text-base-content/40">
                    {test.season}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{test.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/40">
                <Calendar className="h-3 w-3" />
                Criado em {test.createdAt ? fmtDate(test.createdAt) : "—"}
              </p>
              {test.description && (
                <p className="mt-2 max-w-3xl text-sm text-base-content/60">
                  {test.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <OverviewStats fields={fields} entries={entries} accent={modeDef.accent} />

        {(hasNumericFields || numericFieldCount > 1) && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {hasNumericFields && (
              <TotalEvolutionChart fields={fields} entries={entries} />
            )}
            {numericFieldCount > 1 && (
              <FieldComparisonChart fields={fields} entries={entries} />
            )}
          </div>
        )}

        <EntryHistory fields={fields} entries={entries} accent={modeDef.accent} />
      </div>
    </div>
  );
}
