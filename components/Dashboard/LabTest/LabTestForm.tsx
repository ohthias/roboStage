"use client";

import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type FormEvent,
} from "react";
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

import { createClient } from "@/utils/supabase/client";
import { BaseModal } from "../UI/BaseModal";
import { useToast } from "@/app/context/ToastContext";
const supabase = createClient();
// Types
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

// Constants
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
    sublabel: "Crie saidas de missões para gerar runs personalizadas",
    icon: ListOrdered,
    badge: "Runs",
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

// Helpers
function combination(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  let num = 1,
    den = 1;
  for (let i = 0; i < r; i++) {
    num *= n - i;
    den *= i + 1;
  }
  return Math.round(num / den);
}

// Sub-components
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

function InfoBox({ children }: { children: ReactNode }) {
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
      aria-pressed={selected}
      className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50
        ${selected
          ? 'bg-primary text-white'
          : 'bg-transparent text-base-content/70 hover:bg-base-200'}
      `}
    >
      {/* Minimal indicator */}
      <span className={`w-2 h-2 rounded-full ${selected ? 'bg-white' : 'bg-base-content/40'}`} />
      <span className="truncate">{mission.name}</span>
      <span className={`ml-auto text-[10px] ${selected ? 'text-white' : 'text-base-content/50'}`}>{mission.id}</span>
    </button>
  );
}

// Panel: Criação de Runs
function RunsPanel({
  missions,
  loading,
  missionCount,
  setMissionCount,
  selected,
  setSelected,
}: {
  missions: Mission[];
  loading: boolean;
  missionCount: number;
  setMissionCount: (v: number) => void;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const moveItem = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    setSelected((prev) => {
      const fromIndex = prev.indexOf(fromId);
      const toIndex = prev.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);
      return next;
    });
  };

  const remove = (id: string) =>
    setSelected((prev) => prev.filter((m) => m !== id));

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
            value={selected.length > 0 ? selected.length : missionCount}
            onChange={(e) => setMissionCount(Number(e.target.value))}
            className="input input-bordered input-sm w-28 focus:input-primary"
            disabled
          />
        </div>
      </div>

      <SectionDivider label="Selecionar missões" />

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
                  draggable
                  onDragStart={() => setDraggedId(id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedId) moveItem(draggedId, id);
                    setDraggedId(null);
                  }}
                  onDragEnd={() => setDraggedId(null)}
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

// Panel: CalibraBot
function CalibrabotPanel({
  componentType,
  setComponentType,
  qtyOnRobot,
  setQtyOnRobot,
  totalComponents,
  setTotalComponents,
  variables,
  setVariables,
}: {
  componentType: string;
  setComponentType: (v: string) => void;
  qtyOnRobot: number;
  setQtyOnRobot: (v: number) => void;
  totalComponents: number;
  setTotalComponents: (v: number) => void;
  variables: CalibVariable[];
  setVariables: React.Dispatch<React.SetStateAction<CalibVariable[]>>;
}) {
  const combos = combination(totalComponents, qtyOnRobot);

  const addVar = () => {
    const nextId = variables.length
      ? Math.max(...variables.map((v) => v.id)) + 1
      : 1;
    setVariables((v) => [...v, { id: nextId, name: "" }]);
  };

  const removeVar = (id: number) =>
    setVariables((v) => v.filter((x) => x.id !== id));

  const updateVar = (id: number, name: string) =>
    setVariables((v) => v.map((x) => (x.id === id ? { ...x, name } : x)));

  return (
    <div className="flex flex-col gap-5">
      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Tipo de componente</span>
        </label>
        <select
          className="select select-bordered select-sm focus:select-primary w-full"
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
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
            onChange={(e) => setQtyOnRobot(Number(e.target.value))}
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
            onChange={(e) => setTotalComponents(Number(e.target.value))}
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

// Panel: Missão Individual
function IndividualPanel({
  missions,
  loading,
  selected,
  setSelected,
  notes,
  setNotes,
}: {
  missions: Mission[];
  loading: boolean;
  selected: string;
  setSelected: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {missions.map((m) => (
              <MissionTag
                key={m.id}
                mission={m}
                selected={selected === m.id}
                onClick={() => setSelected(m.id === selected ? "" : m.id)}
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
          onChange={(e) => setNotes(e.target.value)}
          className="textarea textarea-bordered focus:textarea-primary resize-none text-sm leading-relaxed w-full"
        />
      </div>

      <InfoBox>
        Fluxo: base → executa a missão → retorna à base. Após criar, registre
        múltiplas tentativas e acompanhe a evolução do desempenho.
      </InfoBox>
    </div>
  );
}

// Main component
export default function LabTestForm({ onSuccess, onCancel }: LabTestFormProps) {
  const [mode, setMode] = useState<Mode>("runs");
  const [name, setName] = useState("");
  const [season, setSeason] = useState<Season>("submerged");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);

  // estados do runs
  const [missionCount, setMissionCount] = useState(5);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  // estados do calibrabot
  const [componentType, setComponentType] = useState("");
  const [qtyOnRobot, setQtyOnRobot] = useState(2);
  const [totalComponents, setTotalComponents] = useState(4);
  const [variables, setVariables] = useState<CalibVariable[]>([
    { id: 1, name: "" },
  ]);

  // estados do individual
  const [selectedIndividualMission, setSelectedIndividualMission] =
    useState("");
  const [notes, setNotes] = useState("");

  const { addToast } = useToast();

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        .map((m) => ({ id: m.id, name: m.name }));
      setMissions(filtered);
    } finally {
      setLoadingMissions(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "calibrabot") fetchMissions(season);
  }, [season, mode, fetchMissions]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setSubmitError("Informe o nome do teste.");
      return;
    }

    if (mode !== "calibrabot" && !season) {
      setSubmitError("Selecione a temporada.");
      return;
    }

    if (mode === "runs" && selectedRuns.length === 0) {
      setSubmitError("Selecione ao menos uma missão para criar a run.");
      return;
    }

    if (mode === "individual" && !selectedIndividualMission) {
      setSubmitError("Selecione uma missão para o teste individual.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("Você precisa estar autenticado para criar um teste.");
      }

      const now = new Date().toISOString();

      const config: Record<string, unknown> = {
        mode,
      };

      let description: string | null = null;
      let testSeason: Season | null = season || null;

      if (mode === "runs") {
        config.missionCount = selectedRuns.length;
        config.selectedMissionIds = selectedRuns;
        config.order = selectedRuns.map((id) => {
          const m = missions.find((x) => x.id === id);
          return { mission_key: id, mission_name: m?.name ?? id };
        });
      }

      if (mode === "calibrabot") {
        testSeason = null;
        config.componentType = componentType;
        config.qtyOnRobot = qtyOnRobot;
        config.totalComponents = totalComponents;
        config.combinations = combination(totalComponents, qtyOnRobot);
        config.variables = variables
          .filter((v) => v.name.trim())
          .map((v, index) => ({
            variable_order: index,
            name: v.name.trim(),
          }));
      }

      if (mode === "individual") {
        const mission = missions.find(
          (m) => m.id === selectedIndividualMission,
        );
        description = notes.trim() || null;
        config.selectedMission = {
          mission_key: selectedIndividualMission,
          mission_name: mission?.name ?? selectedIndividualMission,
        };
        config.notes = notes.trim() || "";
      }

      const testPayload = {
        user_id: user.id,
        name: cleanName,
        description,
        mode,
        season: testSeason,
        status: "draft",
        config,
        created_at: now,
        updated_at: now,
        last_access_at: now,
      };

      const { data: testRow, error: testError } = await supabase
        .from("tests")
        .insert(testPayload)
        .select("id")
        .single();

      if (testError) throw testError;
      if (!testRow?.id) throw new Error("Falha ao criar o teste.");

      const testId = testRow.id as string;

      if (mode === "runs") {
        const rows = selectedRuns.map((id, index) => {
          const mission = missions.find((m) => m.id === id);
          return {
            test_id: testId,
            mission_key: id,
            mission_name: mission?.name ?? id,
            mission_order: index + 1,
            season,
            max_value: mission?.maxValue ?? null,
          };
        });

        const { error: missionsError } = await supabase
          .from("test_missions")
          .insert(rows);
        if (missionsError) throw missionsError;
      }

      if (mode === "calibrabot") {
        const rows = variables
          .filter((v) => v.name.trim())
          .map((v, index) => ({
            test_id: testId,
            variable_order: index,
            name: v.name.trim(),
            value: null,
            unit: null,
          }));

        if (rows.length > 0) {
          const { error: varsError } = await supabase
            .from("test_variables")
            .insert(rows);
          if (varsError) throw varsError;
        }
      }

      if (mode === "individual") {
        const mission = missions.find(
          (m) => m.id === selectedIndividualMission,
        );

        const { error: missionError } = await supabase
          .from("test_missions")
          .insert([
            {
              test_id: testId,
              mission_key: selectedIndividualMission,
              mission_name: mission?.name ?? selectedIndividualMission,
              mission_order: 1,
              season,
              max_value: mission?.maxValue ?? null,
            },
          ]);

        if (missionError) throw missionError;
      }

      addToast("Teste criado com sucesso!", "success");
      onSuccess?.();
    } catch (err) {
      addToast("Erro ao criar o teste. Tente novamente.", "error");
      setSubmitError(
        err instanceof Error ? err.message : "Não foi possível salvar o teste.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      title="Criar novo teste"
      description="Configure os detalhes iniciais do teste e selecione as missões ou variáveis conforme o modo escolhido."
      onClose={() => onCancel?.()}
      size="md"
      open
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 max-w-2xl mx-auto"
      >
        {submitError && (
          <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        )}

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
            missionCount={missionCount}
            setMissionCount={setMissionCount}
            selected={selectedRuns}
            setSelected={setSelectedRuns}
          />
        )}

        {mode === "calibrabot" && (
          <CalibrabotPanel
            componentType={componentType}
            setComponentType={setComponentType}
            qtyOnRobot={qtyOnRobot}
            setQtyOnRobot={setQtyOnRobot}
            totalComponents={totalComponents}
            setTotalComponents={setTotalComponents}
            variables={variables}
            setVariables={setVariables}
          />
        )}

        {mode === "individual" && (
          <IndividualPanel
            missions={missions}
            loading={loadingMissions}
            selected={selectedIndividualMission}
            setSelected={setSelectedIndividualMission}
            notes={notes}
            setNotes={setNotes}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="btn btn-primary gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            {submitting ? "Salvando..." : "Criar teste"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
