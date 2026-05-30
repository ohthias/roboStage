"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ListOrdered,
  SlidersHorizontal,
  Target,
  Plus,
  Trash2,
  X,
  GripVertical,
  FlaskConical,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { labTestService } from "@/services/labTestService";
import { BaseModal } from "../UI/BaseModal";

type Mode = "runs" | "calibrabot" | "individual";
type Season = "submerged" | "unearthed" | "";

interface Mission {
  id: string;
  name: string;
  maxValue?: number;
}

interface CalibVariable {
  id: number;
  name: string;
}

interface LabTestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MODES: {
  id: Mode;
  label: string;
  sublabel: string;
  icon: React.FC<{ className?: string }>;
  badge: string;
}[] = [
  {
    id: "runs",
    label: "Criação de Runs",
    sublabel: "Defina missões e ordene cada lançamento",
    icon: ListOrdered,
    badge: "Multi-round",
  },
  {
    id: "calibrabot",
    label: "CalibraBot",
    sublabel: "Calibre atuadores e sensores com combinações automáticas",
    icon: SlidersHorizontal,
    badge: "Calibração",
  },
  {
    id: "individual",
    label: "Missão Individual",
    sublabel: "Teste único: base → missão → base",
    icon: Target,
    badge: "Single",
  },
];

const SEASONS: { id: Season; label: string; emoji: string }[] = [
  { id: "submerged", label: "Submerged", emoji: "🌊" },
  { id: "unearthed", label: "Unearthed", emoji: "🌍" },
];

const COMPONENT_TYPES = [
  {
    group: "Atuadores",
    options: ["Motor grande", "Motor médio", "Motor pequeno"],
  },
  {
    group: "Sensores",
    options: ["Sensor ultrassônico", "Sensor de cor", "Giroscópio"],
  },
];

function combination(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  let num = 1;
  let den = 1;
  for (let i = 0; i < r; i++) {
    num *= n - i;
    den *= i + 1;
  }
  return Math.round(num / den);
}

function StepBadge({ label }: { label: string }) {
  return (
    <span className="badge badge-sm badge-ghost text-base-content/50 font-mono tracking-widest uppercase">
      {label}
    </span>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-base-content/10" />
      <span className="text-xs text-base-content/40 font-medium uppercase tracking-widest">
        {label}
      </span>
      <div className="h-px flex-1 bg-base-content/10" />
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary/40 bg-primary/5 rounded-r-lg px-4 py-3 text-sm text-base-content/60 leading-relaxed">
      {children}
    </div>
  );
}

function SeasonSelector({
  value,
  onChange,
}: {
  value: Season;
  onChange: (s: Season) => void;
}) {
  return (
    <div className="flex gap-2">
      {SEASONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`btn btn-sm gap-2 rounded-xl border transition-all ${
            value === s.id
              ? "btn-primary border-primary"
              : "btn-ghost border-base-content/15 hover:border-primary/40"
          }`}
        >
          <span>{s.emoji}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

function MissionTag({
  mission,
  selected,
  onClick,
  single,
}: {
  mission: Mission;
  selected: boolean;
  onClick: () => void;
  single?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`badge badge-lg gap-1.5 cursor-pointer select-none border transition-all ${
        selected
          ? "badge-primary border-primary/50 font-semibold"
          : "badge-ghost border-base-content/15 hover:border-primary/40 text-base-content/70"
      }`}
    >
      {single && selected && <span className="text-xs">✓</span>}
      {mission.id} — {mission.name}
    </button>
  );
}

function RunsPanel({
  missions,
  loading,
  missionCount,
  onMissionCountChange,
  selected,
  onSelectedChange,
}: {
  missions: Mission[];
  loading: boolean;
  missionCount: number;
  onMissionCountChange: (value: number) => void;
  selected: string[];
  onSelectedChange: (value: string[]) => void;
}) {
  const toggle = (id: string) => {
    onSelectedChange(
      selected.includes(id)
        ? selected.filter((m) => m !== id)
        : [...selected, id],
    );
  };

  const remove = (id: string) =>
    onSelectedChange(selected.filter((m) => m !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Missões por run</span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={missionCount}
            onChange={(e) => onMissionCountChange(Number(e.target.value))}
            className="input input-bordered input-sm w-28 focus:input-primary"
          />
        </div>
      </div>

      <SectionDivider label="Selecionar missões" />

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {missions.map((m) => (
            <MissionTag
              key={m.id}
              mission={m}
              selected={selected.includes(m.id)}
              onClick={() => toggle(m.id)}
            />
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <>
          <SectionDivider label="Ordem de execução" />
          <div className="flex flex-col gap-2">
            {selected.map((id, i) => {
              const m = missions.find((x) => x.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 bg-base-200/60 border border-base-content/10 rounded-xl px-4 py-2.5"
                >
                  <GripVertical className="w-4 h-4 text-base-content/30 shrink-0" />
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">
                    {m?.id} — {m?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    className="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <InfoBox>
        Após criar, você poderá registrar cada lançamento inserindo os
        resultados por missão conforme a ordem definida acima.
      </InfoBox>
    </div>
  );
}

function CalibrabotPanel({
  componentType,
  onComponentTypeChange,
  qtyOnRobot,
  onQtyOnRobotChange,
  totalComponents,
  onTotalComponentsChange,
  variables,
  onVariablesChange,
}: {
  componentType: string;
  onComponentTypeChange: (value: string) => void;
  qtyOnRobot: number;
  onQtyOnRobotChange: (value: number) => void;
  totalComponents: number;
  onTotalComponentsChange: (value: number) => void;
  variables: CalibVariable[];
  onVariablesChange: (value: CalibVariable[]) => void;
}) {
  const combos = combination(totalComponents, qtyOnRobot);

  const addVar = () => {
    const nextId =
      variables.length > 0 ? Math.max(...variables.map((v) => v.id)) + 1 : 1;
    onVariablesChange([...variables, { id: nextId, name: "" }]);
  };

  const removeVar = (id: number) =>
    onVariablesChange(variables.filter((x) => x.id !== id));

  const updateVar = (id: number, name: string) =>
    onVariablesChange(variables.map((x) => (x.id === id ? { ...x, name } : x)));

  return (
    <div className="flex flex-col gap-5">
      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Tipo de componente</span>
        </label>
        <select
          className="select select-bordered select-sm focus:select-primary w-full"
          value={componentType}
          onChange={(e) => onComponentTypeChange(e.target.value)}
        >
          <option value="">Selecione...</option>
          {COMPONENT_TYPES.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Qtd. no robô</span>
            <span className="label-text-alt text-base-content/40">
              simultâneos
            </span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={qtyOnRobot}
            onChange={(e) => onQtyOnRobotChange(Number(e.target.value))}
            className="input input-bordered input-sm focus:input-primary"
          />
        </div>
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Total a testar</span>
            <span className="label-text-alt text-base-content/40">
              disponíveis
            </span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={totalComponents}
            onChange={(e) => onTotalComponentsChange(Number(e.target.value))}
            className="input input-bordered input-sm focus:input-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat bg-base-200/60 rounded-xl border border-base-content/10 p-4">
          <div className="stat-title text-xs">Combinações geradas</div>
          <div className="stat-value text-2xl text-primary">
            {combos > 0 ? combos : "—"}
          </div>
          <div className="stat-desc">
            C({totalComponents}, {qtyOnRobot})
          </div>
        </div>
        <div className="stat bg-base-200/60 rounded-xl border border-base-content/10 p-4">
          <div className="stat-title text-xs">Runs totais</div>
          <div className="stat-value text-2xl">{combos > 0 ? combos : "—"}</div>
          <div className="stat-desc">um por combinação</div>
        </div>
      </div>

      <SectionDivider label="Variáveis observadas" />

      <div className="flex flex-col gap-2">
        {variables.map((v) => (
          <div key={v.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Nome da variável (ex: velocidade, ângulo...)"
              value={v.name}
              onChange={(e) => updateVar(v.id, e.target.value)}
              className="input input-bordered input-sm flex-1 focus:input-primary"
            />
            {variables.length > 1 && (
              <button
                type="button"
                onClick={() => removeVar(v.id)}
                className="btn btn-ghost btn-sm text-base-content/40 hover:text-error hover:bg-error/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addVar}
          className="btn btn-ghost btn-sm gap-2 self-start text-primary hover:bg-primary/10 mt-1"
        >
          <Plus className="w-4 h-4" />
          Adicionar variável
        </button>
      </div>

      <InfoBox>
        O sistema gerará automaticamente C({totalComponents},{qtyOnRobot}) ={" "}
        <strong>{combos}</strong> combinações únicas de componentes para teste.
      </InfoBox>
    </div>
  );
}

function IndividualPanel({
  missions,
  loading,
  selected,
  onSelectedChange,
  notes,
  onNotesChange,
}: {
  missions: Mission[];
  loading: boolean;
  selected: string;
  onSelectedChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Missão</span>
        </label>
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner text-primary" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missions.map((m) => (
              <MissionTag
                key={m.id}
                mission={m}
                selected={selected === m.id}
                onClick={() => onSelectedChange(m.id === selected ? "" : m.id)}
                single
              />
            ))}
          </div>
        )}
      </div>

      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Observações iniciais</span>
          <span className="label-text-alt text-base-content/40">opcional</span>
        </label>
        <textarea
          rows={3}
          placeholder="Hipótese ou contexto do teste..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="textarea textarea-bordered focus:textarea-primary resize-none text-sm leading-relaxed"
        />
      </div>

      <InfoBox>
        Fluxo: base → executa a missão → retorna à base. Após criar, registre
        múltiplas tentativas e acompanhe a evolução do desempenho.
      </InfoBox>
    </div>
  );
}

export default function LabTestForm({ onSuccess, onCancel }: LabTestFormProps) {
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>("runs");
  const [name, setName] = useState("");
  const [season, setSeason] = useState<Season>("submerged");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);

  const [runsMissionCount, setRunsMissionCount] = useState(5);
  const [runsSelected, setRunsSelected] = useState<string[]>([]);

  const [componentType, setComponentType] = useState("");
  const [qtyOnRobot, setQtyOnRobot] = useState(2);
  const [totalComponents, setTotalComponents] = useState(4);
  const [variables, setVariables] = useState<CalibVariable[]>([
    { id: 1, name: "" },
  ]);

  const [individualSelected, setIndividualSelected] = useState("");
  const [individualNotes, setIndividualNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMissions = useCallback(async (s: Season) => {
    if (!s) return;
    setLoadingMissions(true);
    try {
      const res = await fetch("/api/data/missions");
      const data = await res.json();
      const raw: any[] = data[s] || [];
      const filtered = raw
        .filter((m) => !["EL", "PT", "GP"].includes(m.id))
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((m) => ({ id: m.id, name: m.name, maxValue: m.maxValue }));
      setMissions(filtered);
    } finally {
      setLoadingMissions(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "calibrabot") {
      fetchMissions(season);
      setRunsSelected([]);
      setIndividualSelected("");
    }
  }, [season, mode, fetchMissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user?.id) {
      setFormError("Usuário não autenticado.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Informe o nome do teste.");
      return;
    }

    try {
      setSubmitting(true);

      const config: Record<string, any> =
        mode === "runs"
          ? {
              missionCount: runsMissionCount,
              selectedMissionCount: runsSelected.length,
            }
          : mode === "calibrabot"
            ? {
                componentType,
                qtyOnRobot,
                totalComponents,
                combinationCount: combination(totalComponents, qtyOnRobot),
              }
            : {
                notes: individualNotes.trim(),
                selectedMission: individualSelected,
              };

      const missionsPayload =
        mode === "calibrabot"
          ? []
          : (mode === "runs"
              ? runsSelected
              : individualSelected
                ? [individualSelected]
                : []
            ).map((id, index) => {
              const mission = missions.find((m) => m.id === id);
              return {
                mission_key: id,
                mission_name: mission?.name ?? id,
                mission_order: index + 1,
                season: season || "submerged",
                max_value: mission?.maxValue ?? undefined,
              };
            });

      const variablesPayload =
        mode === "calibrabot"
          ? variables
              .filter((v) => v.name.trim())
              .map((v, index) => ({
                name: v.name.trim(),
                value: null,
                unit: undefined,
                variable_order: index + 1,
              }))
          : [];

      if (mode === "runs" && missionsPayload.length === 0) {
        setFormError("Selecione ao menos uma missão.");
        setSubmitting(false);
        return;
      }

      if (mode === "individual" && missionsPayload.length === 0) {
        setFormError("Selecione uma missão para o teste individual.");
        setSubmitting(false);
        return;
      }

      if (mode === "calibrabot") {
        if (!componentType.trim()) {
          setFormError("Selecione o tipo de componente.");
          setSubmitting(false);
          return;
        }

        if (!variablesPayload.length) {
          setFormError("Adicione ao menos uma variável observada.");
          setSubmitting(false);
          return;
        }
      }

      await labTestService.create(user.id, {
        name: trimmedName,
        description:
          mode === "individual"
            ? individualNotes.trim() || undefined
            : undefined,
        mode,
        season: mode === "calibrabot" ? undefined : season || undefined,
        config,
        missions: missionsPayload,
        variables: variablesPayload,
      });

      onSuccess?.();
      // fechar o modal após salvar no DB
      onCancel?.();
    } catch (error: any) {
      setFormError(error?.message ?? "Não foi possível salvar o teste.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      title="Criar novo teste"
      description="Configure o tipo de teste e seus parâmetros"
      onClose={() => onCancel?.()}
      open
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-base leading-tight">
              Novo experimento
            </h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              Configure o tipo de teste e seus parâmetros
            </p>
          </div>
        </div>

        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Nome do teste</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Missão 12 — Ciclo de ajuste"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input input-bordered focus:input-primary w-full"
          />
        </div>

        <div className="form-control gap-2">
          <label className="label py-0">
            <span className="label-text font-medium">Modo</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(({ id, label, sublabel, icon: Icon, badge }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    active
                      ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                      : "border-base-content/15 hover:border-primary/30 hover:bg-base-200/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        active ? "bg-primary/20" : "bg-base-200"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${active ? "text-primary" : "text-base-content/50"}`}
                      />
                    </div>
                    <StepBadge label={badge} />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        active ? "text-primary" : "text-base-content"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1 leading-snug">
                      {sublabel}
                    </p>
                  </div>
                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-primary absolute bottom-3 right-3" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {mode !== "calibrabot" && (
          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Temporada</span>
            </label>
            <SeasonSelector value={season} onChange={setSeason} />
          </div>
        )}

        <div className="divider my-0" />

        {mode === "runs" && (
          <RunsPanel
            missions={missions}
            loading={loadingMissions}
            missionCount={runsMissionCount}
            onMissionCountChange={setRunsMissionCount}
            selected={runsSelected}
            onSelectedChange={setRunsSelected}
          />
        )}

        {mode === "calibrabot" && (
          <CalibrabotPanel
            componentType={componentType}
            onComponentTypeChange={setComponentType}
            qtyOnRobot={qtyOnRobot}
            onQtyOnRobotChange={setQtyOnRobot}
            totalComponents={totalComponents}
            onTotalComponentsChange={setTotalComponents}
            variables={variables}
            onVariablesChange={setVariables}
          />
        )}

        {mode === "individual" && (
          <IndividualPanel
            missions={missions}
            loading={loadingMissions}
            selected={individualSelected}
            onSelectedChange={setIndividualSelected}
            notes={individualNotes}
            onNotesChange={setIndividualNotes}
          />
        )}

        {formError && (
          <div className="alert alert-error text-sm">
            <span>{formError}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="btn btn-primary gap-2"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FlaskConical className="w-4 h-4" />
            )}
            {submitting ? "Salvando..." : "Criar teste"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
