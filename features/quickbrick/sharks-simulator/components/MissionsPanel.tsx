"use client";
import React, { useRef } from "react";
import {
  CheckCircle2,
  Clock,
  CircleSlash,
  Crosshair,
  Download,
  Eye,
  EyeOff,
  Hexagon,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Mission } from "@/features/quickbrick/sharks-simulator/types";
import { isValidMissionList } from "./missions.service";

export type MissionEditMode = { missionId: string; kind: "zone" | "activation" } | null;

interface MissionsPanelProps {
  missions: Mission[];
  completed: Set<string>;
  touching: Set<string>;
  completionTimes: Record<string, number | null>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  editMode: MissionEditMode;
  draftCount: number;
  onStartEdit: (missionId: string, kind: "zone" | "activation") => void;
  onFinishZone: () => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, patch: Partial<Omit<Mission, "id">>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onReset: () => void;
  onImport: (missions: Mission[]) => void;
  showMissions: boolean;
  onToggleShow: () => void;
}

const SmallNumber: React.FC<{ label: string; value: number; onChange: (v: number) => void; step?: number }> = ({
  label,
  value,
  onChange,
  step = 0.1,
}) => (
  <label className="form-control w-full">
    <span className="text-[10px] font-medium text-base-content/50 mb-1">{label}</span>
    <input
      type="number"
      step={step}
      className="rounded-md border border-base-300 bg-base-100 px-2.5 transition-colors placeholder:text-base-content/40 hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-7 w-full font-mono text-xs"
      value={Number.isFinite(value) ? parseFloat(value.toFixed(1)) : 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  </label>
);

const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  completed,
  touching,
  completionTimes,
  selectedId,
  onSelect,
  editMode,
  draftCount,
  onStartEdit,
  onFinishZone,
  onCancelEdit,
  onUpdate,
  onRemove,
  onAdd,
  onReset,
  onImport,
  showMissions,
  onToggleShow,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const total = missions.length;
  const doneCount = missions.filter((m) => completed.has(m.id)).length;
  const plannedCount = missions.filter((m) => completionTimes[m.id] != null).length;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(missions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sharks-simulator-missoes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidMissionList(parsed)) throw new Error("formato inválido");
      onImport(parsed);
    } catch {
      alert("Arquivo de missões inválido.");
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex min-h-6 items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Missões</h3>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs">
            <span className="text-success font-semibold">{doneCount}</span>
            <span className="text-base-content/40">/{total}</span>
          </span>
          <button
            onClick={onToggleShow}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content size-7 px-0"
            title={showMissions ? "Ocultar no tapete" : "Mostrar no tapete"}
          >
            {showMissions ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200" role="progressbar" aria-valuenow={doneCount} aria-valuemax={total}>
        <div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${(doneCount / Math.max(total, 1)) * 100}%` }} />
      </div>
      <p className="text-[11px] leading-relaxed text-base-content/55 -mt-1">
        A rota atual conclui {plannedCount} de {total}. Uma missão conta quando o centro do robô entra no círculo
        de ativação.
      </p>

      <ul className="space-y-0.5 rounded-lg border border-base-300 bg-base-100 p-1">
        {missions.map((m) => {
          const isDone = completed.has(m.id);
          const t = completionTimes[m.id];
          const isSelected = selectedId === m.id;
          const isTouching = touching.has(m.id);
          const editingThis = editMode?.missionId === m.id;

          return (
            <li
              key={m.id}
              className={`rounded-md border transition-colors ${isSelected ? "border-info/50 bg-base-200" : "border-transparent"}`}
            >
              <button
                onClick={() => onSelect(isSelected ? null : m.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-base-200 rounded-md"
              >
                {isDone ? (
                  <CheckCircle2 size={14} className="text-success shrink-0" />
                ) : t != null ? (
                  <Clock size={14} className="text-warning shrink-0" />
                ) : (
                  <CircleSlash size={14} className="text-base-content/30 shrink-0" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-medium truncate">{m.name}</span>
                  <span className="block text-[10px] font-mono text-base-content/50">
                    {isDone
                      ? `concluída em ${(t! / 1000).toFixed(2)}s`
                      : t != null
                        ? `prevista em ${(t / 1000).toFixed(2)}s`
                        : `alvo (${m.activation.x.toFixed(1)}, ${m.activation.y.toFixed(1)}) · fora da rota`}
                  </span>
                </span>
                {isTouching && (
                  <span className="inline-flex h-4 items-center rounded bg-warning/20 px-1 text-[10px] font-semibold" title="O robô está encostando nesta zona">
                    contato
                  </span>
                )}
              </button>

              {isSelected && (
                <div className="px-2 pb-2 pt-1 space-y-2">
                  <input
                    className="rounded-md border border-base-300 bg-base-100 px-2.5 transition-colors placeholder:text-base-content/40 hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-7 w-full text-xs"
                    value={m.name}
                    onChange={(e) => onUpdate(m.id, { name: e.target.value })}
                    aria-label="Nome da missão"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <SmallNumber
                      label="Alvo X"
                      value={m.activation.x}
                      onChange={(x) => onUpdate(m.id, { activation: { ...m.activation, x } })}
                    />
                    <SmallNumber
                      label="Alvo Y"
                      value={m.activation.y}
                      onChange={(y) => onUpdate(m.id, { activation: { ...m.activation, y } })}
                    />
                    <SmallNumber
                      label="Raio (cm)"
                      step={0.5}
                      value={m.radius}
                      onChange={(radius) => onUpdate(m.id, { radius: Math.max(0.5, radius) })}
                    />
                  </div>

                  {editingThis && editMode?.kind === "zone" ? (
                    <div className="rounded-md bg-info/10 border border-info/30 p-2 space-y-1.5">
                      <p className="text-[10px] text-base-content/70">
                        Clique no tapete para marcar os cantos da zona ({draftCount} ponto
                        {draftCount === 1 ? "" : "s"}).
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-base-300 bg-base-100 hover:border-base-content/30 hover:bg-base-200/60 h-7 px-2 text-xs flex-1 text-info"
                          disabled={draftCount < 3}
                          onClick={onFinishZone}
                        >
                          Concluir
                        </button>
                        <button className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content h-7 px-2 text-xs flex-1" onClick={onCancelEdit}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : editingThis && editMode?.kind === "activation" ? (
                    <div className="rounded-md bg-info/10 border border-info/30 p-2 flex items-center gap-2">
                      <p className="text-[10px] text-base-content/70 flex-1">Clique no tapete para posicionar o alvo.</p>
                      <button className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content h-7 px-2 text-xs" onClick={onCancelEdit}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-base-300 bg-base-100 hover:border-base-content/30 hover:bg-base-200/60 h-7 px-2 text-xs"
                        onClick={() => onStartEdit(m.id, "zone")}
                      >
                        <Hexagon size={11} /> Desenhar zona
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-base-300 bg-base-100 hover:border-base-content/30 hover:bg-base-200/60 h-7 px-2 text-xs"
                        onClick={() => onStartEdit(m.id, "activation")}
                      >
                        <Crosshair size={11} /> Mover alvo
                      </button>
                    </div>
                  )}

                  <button
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-error hover:bg-error/10 h-7 px-2 text-xs w-full"
                    onClick={() => onRemove(m.id)}
                  >
                    <Trash2 size={11} /> Excluir missão
                  </button>
                </div>
              )}
            </li>
          );
        })}
        {missions.length === 0 && (
          <li className="text-[11px] text-base-content/50 text-center py-3">Nenhuma missão cadastrada.</li>
        )}
      </ul>

      <div className="flex gap-1.5">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm border-transparent bg-primary text-primary-content hover:brightness-110 h-7 px-2 text-xs flex-1" onClick={onAdd}>
          <Plus size={12} /> Nova missão
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content size-7 px-0" onClick={handleExport} title="Exportar missões (JSON)">
          <Download size={12} />
        </button>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content size-7 px-0"
          onClick={() => fileRef.current?.click()}
          title="Importar missões (JSON)"
        >
          <Upload size={12} />
        </button>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content size-7 px-0"
          onClick={() => {
            if (confirm("Restaurar as missões padrão? Suas alterações serão perdidas.")) onReset();
          }}
          title="Restaurar missões padrão"
        >
          <RotateCcw size={12} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
};

export default MissionsPanel;
