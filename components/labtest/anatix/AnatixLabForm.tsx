"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Map as MapIcon, Table2 } from "lucide-react";
import {
  createAnatixLab,
  updateAnatixLab,
} from "@/app/(protected)/dashboard/labtest/anatix/actions";
import {
  ANATIX_BAUD_RATES,
  DEFAULT_ANATIX_CONFIG,
  type AnatixLabConfig,
  type AnatixLabRecord,
  type AnatixViewKey,
} from "@/types/anatix.types";

const VIEW_OPTIONS: { key: AnatixViewKey; label: string; hint: string; icon: typeof BarChart3 }[] = [
  { key: "charts", label: "Gráficos", hint: "Métricas no tempo, loop, seções e eventos", icon: BarChart3 },
  { key: "maps", label: "Mapas", hint: "Mapa XY, mapa de calor e mapa de estados", icon: MapIcon },
  { key: "tables", label: "Tabelas", hint: "Resumo das métricas, eventos e console", icon: Table2 },
];

export function AnatixLabForm({
  lab,
  onDone,
}: {
  lab?: AnatixLabRecord;
  onDone?: (lab: AnatixLabRecord) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(lab?.name ?? "");
  const [description, setDescription] = useState(lab?.description ?? "");
  const [config, setConfig] = useState<AnatixLabConfig>(lab?.config ?? DEFAULT_ANATIX_CONFIG);

  const noView = !Object.values(config.views).some(Boolean);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (noView) return setError("Escolha ao menos uma forma de análise.");
    setError(null);
    startTransition(async () => {
      try {
        const saved = lab
          ? await updateAnatixLab({ labId: lab.id, name, description, config })
          : await createAnatixLab({ name, description, config });
        onDone?.(saved);
        if (!lab) router.push(`/dashboard/labtest/anatix/${saved.id}`);
        else router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 overflow-y-auto h-[calc(100vh-10rem)]">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-base-content/70">Nome do laboratório</span>
        <input
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Ex.: Seguidor de linha — PID"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-base-content/70">Descrição (opcional)</span>
        <textarea
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={400}
          rows={2}
          placeholder="O que este laboratório vai analisar?"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-base-content/70">Baud rate</span>
        <select
          className="select select-bordered w-full"
          value={config.baudRate}
          onChange={(e) => setConfig({ ...config, baudRate: Number(e.target.value) })}
        >
          {ANATIX_BAUD_RATES.map((b) => (
            <option key={b} value={b}>
              {b.toLocaleString("pt-BR")} {b === 115200 ? "(padrão)" : ""}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-base-content/50">
          Precisa ser igual ao <code>Serial.begin()</code> do robô.
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-semibold text-base-content/70">Formas de análise</legend>
        {VIEW_OPTIONS.map(({ key, label, hint, icon: Icon }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={config.views[key]}
              onChange={(e) =>
                setConfig({ ...config, views: { ...config.views, [key]: e.target.checked } })
              }
            />
            <Icon className="size-4 text-base-content/60" />
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-base-content/50">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending && <span className="loading loading-spinner loading-sm" />}
        {lab ? "Salvar alterações" : "Criar laboratório"}
      </button>
    </form>
  );
}
