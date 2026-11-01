"use client";

// ---------------------------------------------------------------------------
// Registro de execuções de um teste (/dashboard/labtest/[id]/execute).
// Uma ou mais execuções podem ser preenchidas de uma vez; cada uma vira uma
// linha em test_executions. Funciona para todos os modos:
//  - Runs (FLL): pontua cada missão com o mesmo motor do pontuador público
//    (resposta = índice da opção), mais discos de precisão.
//  - Calibrabot · Motores: rotação/tempo por motor (ou por dupla escolhida).
//  - Calibrabot · Giroscópio / PID e Personalizado: campos do config,
//    com obrigatórios e limites mínimo/máximo.
// O modo "Round 2:30" tem tela própria (FllRoundExecution).
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import type { FieldDefinition, FieldValue } from "@/types/labtest.types";
import { getModeMeta } from "@/utils/labtest/catalog";
import { loadSeasonMissions } from "@/utils/data/missions-client";
import { getSubMissionKey } from "@/utils/labtest/fll";
import { computeMissionBreakdown } from "@/utils/scores";
import { MissionCard } from "@/components/FormMission/MissionCard";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/actions";
import { updateLabTestStatus } from "@/app/(protected)/dashboard/labtest/new/actions";
import { FieldValueInput } from "./FieldValueInput";
import { computeCalc } from "@/utils/labtest/calc";
import { LabTestModels } from "./LabTestModels";

import { unwrapAction } from "@/utils/stagebook/action-result";
interface ExecuteTestFormProps {
  testId: string;
  mode: string;
  season?: string | null;
  testName: string;
  fields: FieldDefinition[];
  nextExecutionNumber: number;
  isMotorPairs?: boolean;
  config?: Record<string, unknown> | null;
}

type Value = FieldValue["value"];

interface Draft {
  id: number;
  pair: string;
  values: Record<string, Value>;
  responses: Record<string, Record<number, number>>;
  discs: number;
  notes: string;
}

const DISCS = 6;
let nextDraftId = 1;

const isFilled = (v: Value | undefined) =>
  v !== null && v !== undefined && !(typeof v === "string" && !v.trim());

/** Agrupa campos de motor (base__rotacao, base__tempo) por motor/dupla. */
function groupMotorFields(fields: FieldDefinition[]) {
  const groups = new Map<string, FieldDefinition[]>();
  for (const f of fields) {
    const base = f.fieldKey.replace(/__(rotacao|tempo)$/, "");
    groups.set(base, [...(groups.get(base) ?? []), f]);
  }
  return [...groups.entries()].map(([base, list]) => ({
    base,
    title: list[0]?.label.split(" · ")[0] ?? base,
    fields: list,
  }));
}

function contextLine(
  mode: string,
  season: string | null | undefined,
  config: Record<string, unknown> | null | undefined,
  fieldCount: number,
) {
  const c = config ?? {};
  if (mode === "runs") {
    const parts = [season ? season.toUpperCase() : null];
    if (c.runMode === "run-completa") parts.push("Run completa");
    parts.push(`${fieldCount} ${fieldCount === 1 ? "missão" : "missões"}`);
    return parts.filter(Boolean).join(" · ");
  }
  if (c.tipo === "motores")
    return `Motores · ${c.modo === "duplas" ? "duplas" : "individual"}`;
  if (c.tipo === "giroscopio")
    return `Giroscópio · ângulo alvo ${c.anguloAlvo ?? "?"}°`;
  if (c.tipo === "obr")
    return `OBR Resgate · ${typeof c.presetNome === "string" ? c.presetNome : "teste"}`;
  if (c.tipo === "kit-ia")
    return `Kit Ciência e IA · ${typeof c.presetNome === "string" ? c.presetNome : "teste"}`;
  if (c.tipo === "pid")
    return `PID · distância alvo ${c.distanciaAlvo ?? "?"} cm`;
  return `${fieldCount} ${fieldCount === 1 ? "parâmetro" : "parâmetros"}`;
}

export default function ExecuteTestForm({
  testId,
  mode,
  season,
  testName,
  fields,
  nextExecutionNumber,
  isMotorPairs = false,
  config,
}: ExecuteTestFormProps) {
  const router = useRouter();
  const modeLabel = getModeMeta(mode).label;
  const isFllRuns = mode === "runs" && Boolean(season);
  const isMotor = config?.tipo === "motores";

  /* ------------------------- catálogo FLL (runs) ------------------------- */
  const [catalog, setCatalog] = useState<Mission[] | null>(null);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    if (!isFllRuns) return;
    let active = true;
    loadSeasonMissions<Mission>(season ?? "")
      .then((list) => {
        if (!active) return;
        if (!list.length) throw new Error();
        setCatalog(list);
      })
      .catch(() => active && setCatalogError(true));
    return () => {
      active = false;
    };
  }, [isFllRuns, season]);

  const fllMissions = useMemo(
    () =>
      fields
        .map((f) => catalog?.find((m) => m.id === f.fieldKey))
        .filter((m): m is Mission => Boolean(m)),
    [fields, catalog],
  );

  /* ------------------------------ duplas ------------------------------ */
  const pairOptions = useMemo(
    () => (isMotorPairs ? groupMotorFields(fields) : []),
    [isMotorPairs, fields],
  );

  /* ------------------------------ rascunhos ------------------------------ */
  const makeDraft = (): Draft => ({
    id: nextDraftId++,
    pair: pairOptions[0]?.base ?? "",
    values: {},
    responses: {},
    discs: DISCS,
    notes: "",
  });

  const [drafts, setDrafts] = useState<Draft[]>(() => [makeDraft()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const patchDraft = (id: number, patch: (d: Draft) => Partial<Draft>) =>
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch(d) } : d)),
    );

  const fieldsFor = (d: Draft) =>
    pairOptions.length
      ? (pairOptions.find((p) => p.base === d.pair)?.fields ?? [])
      : fields;

  /** Problemas que impedem salvar um rascunho (lista vazia = ok). */
  const problemsOf = (d: Draft): { message: string; keys: string[] }[] => {
    if (isFllRuns) {
      if (catalogError || !catalog)
        return [{ message: "Missões não carregadas", keys: [] }];
      return [];
    }
    // Campos calculados não são digitados.
    const list = fieldsFor(d).filter((f) => !f.calc);
    const out: { message: string; keys: string[] }[] = [];
    if (!list.some((f) => isFilled(d.values[f.fieldKey]))) {
      out.push({ message: "Preencha ao menos um campo", keys: [] });
    }
    const missing = list.filter(
      (f) => f.required && !isFilled(d.values[f.fieldKey]),
    );
    if (missing.length) {
      out.push({
        message: `Obrigatório: ${missing.map((f) => f.label).join(", ")}`,
        keys: missing.map((f) => f.fieldKey),
      });
    }
    const outOfRange = list.filter((f) => {
      const v = d.values[f.fieldKey];
      if (typeof v !== "number") return false;
      return (f.min != null && v < f.min) || (f.max != null && v > f.max);
    });
    for (const f of outOfRange) {
      out.push({
        message: `${f.label} deve ficar entre ${f.min ?? "−∞"} e ${f.max ?? "∞"}`,
        keys: [f.fieldKey],
      });
    }
    return out;
  };

  // GP (Gracious Professionalism) não soma no placar do robô.
  const fllPoints = (d: Draft) =>
    fllMissions
      .filter((m) => m.id !== "GP")
      .reduce(
        (sum, m) => sum + computeMissionBreakdown(m, d.responses[m.id]).total,
        0,
      );

  const inputFields = (d: Draft) => fieldsFor(d).filter((f) => !f.calc);
  const filledCount = (d: Draft) =>
    inputFields(d).filter((f) => isFilled(d.values[f.fieldKey])).length;

  const allProblems = drafts.map(problemsOf);
  const readyCount = allProblems.filter((p) => p.length === 0).length;

  /* -------------------------------- salvar -------------------------------- */
  const buildResults = (d: Draft): Record<string, unknown> => {
    if (isFllRuns) {
      return {
        answers: Object.fromEntries(
          fllMissions.map((mission, order) => {
            const r = d.responses[mission.id] ?? {};
            return [
              mission.id,
              {
                missionId: mission.id,
                order,
                value: r[0] ?? 0,
                subAnswers: Object.fromEntries(
                  (mission["sub-mission"] ?? []).map((sub, i) => [
                    getSubMissionKey(mission, sub, i),
                    r[i + 1] ?? 0,
                  ]),
                ),
                objectiveAnswers: {},
              },
            ];
          }),
        ),
        missions: fllMissions.map((m) => m.id),
        precisionDiscs: {
          total: DISCS,
          remaining: d.discs,
          used: DISCS - d.discs,
        },
      };
    }
    // Só os campos preenchidos (e, em duplas, só os da dupla escolhida).
    // Calculados entram com o valor da fórmula (o servidor recalcula).
    return Object.fromEntries(
      fieldsFor(d).flatMap((f) => {
        if (f.calc) {
          const v = computeCalc(f.calc, d.values);
          return v === null ? [] : [[f.fieldKey, v]];
        }
        return isFilled(d.values[f.fieldKey])
          ? [[f.fieldKey, d.values[f.fieldKey]]]
          : [];
      }),
    );
  };

  const handleSave = async () => {
    setError(null);
    if (allProblems.some((p) => p.length)) {
      setShowErrors(true);
      const idx = allProblems.findIndex((p) => p.length);
      document
        .getElementById(`draft-${drafts[idx].id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      setError(
        drafts.length > 1
          ? `Execução ${idx + 1}: ${allProblems[idx][0].message}.`
          : `${allProblems[idx][0].message}.`,
      );
      return;
    }

    setSubmitting(true);
    let saved = 0;
    try {
      for (const d of drafts) {
        unwrapAction(await createTestExecution({
          testId,
          notes: d.notes.trim() || undefined,
          results: buildResults(d),
        }));
        saved += 1;
        // Tira da tela o que já foi salvo: tentar de novo não duplica.
        setDrafts((prev) => prev.filter((x) => x.id !== d.id));
        if (nextExecutionNumber === 1 && saved === 1) {
          // Melhor esforço: falhar aqui não impede o lançamento já salvo.
          await updateLabTestStatus({ testId, status: "em_andamento" }).catch(() => undefined);
        }
      }
      router.push(`/dashboard/labtest/${testId}`);
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const msg =
        !raw || /failed to fetch|network/i.test(raw)
          ? "Sem conexão com o servidor. Tente de novo."
          : raw;
      setError(saved ? `${saved} salva(s). As demais falharam: ${msg}` : msg);
      setSubmitting(false);
    }
  };

  /* --------------------------------- tela --------------------------------- */
  const btnShape =
    "rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none";
  const saveLabel =
    drafts.length > 1 ? `Salvar ${drafts.length} execuções` : "Salvar execução";

  const renderFields = (
    d: Draft,
    list: FieldDefinition[],
    badKeys: Set<string>,
  ) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map((f) => {
        const inputId = `f-${d.id}-${f.fieldKey}`;
        return (
          <div key={f.fieldKey} className="min-w-0">
            <label
              htmlFor={f.type === "boolean" ? undefined : inputId}
              className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-base-content/80"
            >
              {isMotor ? f.label.split(" · ").pop() : f.label}
              {f.required && (
                <span className="text-error" aria-label="obrigatório">
                  *
                </span>
              )}
            </label>
            {f.description && (
              <p className="-mt-1 mb-1.5 text-xs text-base-content/50">
                {f.description}
              </p>
            )}
            {f.calc ? (
              <div
                id={inputId}
                className="flex h-10 w-full max-w-56 items-center justify-between rounded-tl-lg rounded-br-lg border border-dashed border-base-300 bg-base-200/40 px-3"
                aria-live="polite"
              >
                <span className="font-mono tabular-nums">
                  {(() => {
                    const v = computeCalc(f.calc, d.values);
                    return v === null
                      ? "—"
                      : `${v}${f.unit ? ` ${f.unit}` : ""}`;
                  })()}
                </span>
                <span className="font-mono text-[10px] uppercase text-primary">
                  auto
                </span>
              </div>
            ) : (
              <FieldValueInput
                id={inputId}
                field={f}
                value={d.values[f.fieldKey] ?? null}
                invalid={badKeys.has(f.fieldKey)}
                onChange={(v) =>
                  patchDraft(d.id, (x) => ({
                    values: { ...x.values, [f.fieldKey]: v },
                  }))
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-28 lg:pb-0">
      {/* Cabeçalho */}
      <header>
        <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
          / {modeLabel.toUpperCase()} · EXECUÇÃO #{nextExecutionNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {testName}
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          {contextLine(mode, season, config, fields.length)}
        </p>
      </header>

      {fields.length === 0 ? (
        <div className="rounded-tl-3xl rounded-br-3xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center text-sm text-base-content/55">
          Este teste não tem campos para registrar. Confira a configuração dele.
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="flex flex-col gap-5">
            {isFllRuns && catalogError && (
              <div className="flex items-start gap-2 rounded-tl-2xl rounded-br-2xl border border-error/40 bg-base-100 p-4 text-sm text-error">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                Não foi possível carregar as missões da temporada. Recarregue a
                página.
              </div>
            )}

            {drafts.map((d, index) => {
              const problems = showErrors ? allProblems[index] : [];
              const badKeys = new Set(problems.flatMap((p) => p.keys));
              const number = nextExecutionNumber + index;
              return (
                <section
                  key={d.id}
                  id={`draft-${d.id}`}
                  aria-labelledby={`draft-title-${d.id}`}
                  className={`scroll-mt-24 rounded-tl-3xl rounded-br-3xl border bg-base-100 p-5 sm:p-6 ${
                    problems.length ? "border-error/50" : "border-base-300"
                  }`}
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-tl-lg rounded-br-lg bg-primary font-mono text-xs font-bold text-primary-content">
                      {String(number).padStart(2, "0")}
                    </span>
                    <h2
                      id={`draft-title-${d.id}`}
                      className="flex-1 text-base font-semibold"
                    >
                      Execução #{number}
                    </h2>
                    {isFllRuns && catalog && (
                      <span className="font-mono text-sm tabular-nums text-primary">
                        {fllPoints(d)} pts
                      </span>
                    )}
                    {drafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDrafts((prev) => prev.filter((x) => x.id !== d.id))
                        }
                        className="btn btn-ghost btn-sm btn-square text-base-content/45 hover:text-error"
                        aria-label={`Remover execução #${number}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Runs FLL */}
                  {isFllRuns ? (
                    !catalog ? (
                      !catalogError && (
                        <p className="flex items-center gap-2 text-sm text-base-content/55">
                          <span className="loading loading-spinner loading-xs" />
                          Carregando missões…
                        </p>
                      )
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="[&_.card]:mb-3 [&_.card]:rounded-tl-2xl [&_.card]:rounded-br-2xl [&_.card]:rounded-tr-md [&_.card]:rounded-bl-md [&_.card]:border-base-300">
                          {fllMissions.map((mission) => (
                            <MissionCard
                              key={mission.id}
                              mission={mission}
                              responses={d.responses[mission.id]}
                              imagesEnabled={false}
                              onSelect={(missionId, i, idx) =>
                                patchDraft(d.id, (x) => ({
                                  responses: {
                                    ...x.responses,
                                    [missionId]: {
                                      ...x.responses[missionId],
                                      [i]: idx,
                                    },
                                  },
                                }))
                              }
                            />
                          ))}
                        </div>
                        <LabTestModels
                          total={DISCS}
                          value={d.discs}
                          onChange={(v) =>
                            patchDraft(d.id, () => ({ discs: v }))
                          }
                        />
                      </div>
                    )
                  ) : isMotor ? (
                    /* Motores */
                    <div className="flex flex-col gap-4">
                      {pairOptions.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-sm font-medium text-base-content/80">
                            Dupla testada
                          </p>
                          <div
                            role="radiogroup"
                            aria-label="Dupla testada"
                            className="flex flex-wrap gap-2"
                          >
                            {pairOptions.map((p) => {
                              const active = p.base === d.pair;
                              return (
                                <button
                                  key={p.base}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() =>
                                    patchDraft(d.id, () => ({ pair: p.base }))
                                  }
                                  className={`cursor-pointer rounded-tl-lg rounded-br-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                                    active
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-base-300 hover:border-base-content/30"
                                  }`}
                                >
                                  {p.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {groupMotorFields(fieldsFor(d)).map((g) => (
                        <div
                          key={g.base}
                          className="rounded-tl-2xl rounded-br-2xl border border-base-300 p-4"
                        >
                          <p className="mb-3 font-mono text-xs font-semibold text-base-content/70">
                            {g.title}
                          </p>
                          {renderFields(d, g.fields, badKeys)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Giroscópio, PID e Personalizado */
                    renderFields(d, fieldsFor(d), badKeys)
                  )}

                  <textarea
                    rows={2}
                    placeholder="Observações (opcional)"
                    value={d.notes}
                    onChange={(e) =>
                      patchDraft(d.id, () => ({ notes: e.target.value }))
                    }
                    className="textarea mt-5 w-full resize-none text-sm"
                    aria-label={`Observações da execução #${number}`}
                  />

                  {problems.length > 0 && (
                    <ul className="mt-3 space-y-1 border-l-2 border-error pl-3 text-sm text-error">
                      {problems.map((p) => (
                        <li key={p.message}>{p.message}</li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

            <button
              type="button"
              onClick={() => setDrafts((prev) => [...prev, makeDraft()])}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 py-4 text-sm text-base-content/60 transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="size-4" />
              Adicionar outra execução
            </button>
          </div>

          {/* Resumo */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <div className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5">
              <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
                / RESUMO
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {drafts.map((d, i) => {
                  const ok = allProblems[i].length === 0;
                  return (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2">
                        {ok ? (
                          <CheckCircle2 className="size-4 text-success" />
                        ) : (
                          <Circle className="size-4 text-base-content/35" />
                        )}
                        Execução #{nextExecutionNumber + i}
                      </span>
                      <span className="font-mono text-xs text-base-content/55">
                        {isFllRuns
                          ? catalog
                            ? `${fllPoints(d)} pts`
                            : "—"
                          : `${filledCount(d)}/${inputFields(d).length}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="my-4 h-px bg-base-300" />
              <p className="text-xs text-base-content/55">
                {readyCount} de {drafts.length} pronta
                {drafts.length > 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting || drafts.length === 0}
                className={`btn btn-primary mt-3 w-full ${btnShape}`}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {submitting ? "Salvando…" : saveLabel}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-ghost btn-sm mt-2 w-full text-base-content/55"
              >
                Cancelar
              </button>
              {error && (
                <p
                  className="mt-3 border-l-2 border-error pl-3 text-sm text-error"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Barra fixa (celular / tablet) */}
      {fields.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <p
              className={`min-w-0 flex-1 truncate text-sm ${error ? "text-error" : "text-base-content/60"}`}
              aria-live="polite"
            >
              {error ??
                `${readyCount} de ${drafts.length} pronta${drafts.length > 1 ? "s" : ""}`}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || drafts.length === 0}
              className={`btn btn-primary shrink-0 ${btnShape}`}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {drafts.length > 1 ? `Salvar (${drafts.length})` : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
