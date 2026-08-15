"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveRunPlan } from "../../actions";
import type { Mission, SeasonMissions } from "./types";

interface SelectedMission {
  mission: Mission;
  fullAttempt: boolean;
  notes: string;
}

export function RunSetup({ testId }: { testId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [seasons, setSeasons] = useState<SeasonMissions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedMission[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/data/missions")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar as missões");
        return res.json();
      })
      .then((data: SeasonMissions) => setSeasons(data))
      .catch(() => setLoadError("Não foi possível carregar as missões. Tenta recarregar a página."));
  }, []);

  const seasonNames = useMemo(() => (seasons ? Object.keys(seasons) : []), [seasons]);
  const missionsOfSeason = season && seasons ? seasons[season] : [];
  // A missão "PT" (tokens de precisão) e "EL" (inspeção) não são metas de jogo
  // escolhíveis — só as missões numeradas entram no plano do teste.
  const selectableMissions = missionsOfSeason.filter((m) => /^M\d+/.test(m.id));

  function toggleMission(mission: Mission) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.mission.id === mission.id);
      if (exists) return prev.filter((s) => s.mission.id !== mission.id);
      return [...prev, { mission, fullAttempt: true, notes: "" }];
    });
  }

  function updateSelected(missionId: string, patch: Partial<SelectedMission>) {
    setSelected((prev) =>
      prev.map((s) => (s.mission.id === missionId ? { ...s, ...patch } : s))
    );
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit() {
    if (selected.length === 0) {
      setSubmitError("Selecione ao menos uma missão.");
      return;
    }
    setSubmitError(null);

    startTransition(async () => {
      try {
        await saveRunPlan(
          testId,
          selected.map((s, index) => ({
            missionId: s.mission.id,
            orderIndex: index,
            fullAttempt: s.fullAttempt,
            notes: s.notes || undefined,
          }))
        );
        router.push(`/dashboard/labtest/${testId}`);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Não foi possível salvar o plano.");
      }
    });
  }

  if (loadError) {
    return <div className="alert alert-error text-sm">{loadError}</div>;
  }

  if (!seasons) {
    return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="label">
          <span className="label-text">Temporada</span>
        </div>
        <div className="join flex-wrap">
          {seasonNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setSeason(name);
                setSelected([]);
              }}
              className={`join-item btn btn-sm capitalize ${
                season === name ? "btn-warning" : "btn-ghost border-base-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {season && (
        <div>
          <div className="label">
            <span className="label-text">Missões disponíveis</span>
            <span className="label-text-alt">{selected.length} selecionadas</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selectableMissions.map((mission) => {
              const isSelected = selected.some((s) => s.mission.id === mission.id);
              return (
                <label
                  key={mission.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                    isSelected ? "border-warning bg-warning/5" : "border-base-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-warning mt-0.5"
                    checked={isSelected}
                    onChange={() => toggleMission(mission)}
                  />
                  <span>
                    <span className="font-mono text-xs text-base-content/50">{mission.id}</span>{" "}
                    <span className="font-semibold">{mission.name}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <div className="label">
            <span className="label-text">Ordem e forma de execução</span>
          </div>
          <ul className="flex flex-col gap-2">
            {selected.map((s, index) => (
              <li
                key={s.mission.id}
                className="flex flex-col gap-2 rounded-lg border border-base-300 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs px-1"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover para cima"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs px-1"
                      onClick={() => move(index, 1)}
                      disabled={index === selected.length - 1}
                      aria-label="Mover para baixo"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="badge badge-neutral">{index + 1}</span>
                  <span className="text-sm font-medium">{s.mission.name}</span>
                </div>

                <div className="join">
                  <button
                    type="button"
                    onClick={() => updateSelected(s.mission.id, { fullAttempt: true })}
                    className={`join-item btn btn-xs ${s.fullAttempt ? "btn-warning" : "btn-ghost border-base-300"}`}
                  >
                    Completa
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelected(s.mission.id, { fullAttempt: false })}
                    className={`join-item btn btn-xs ${!s.fullAttempt ? "btn-warning" : "btn-ghost border-base-300"}`}
                  >
                    Parcial
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitError && <div className="alert alert-error text-sm">{submitError}</div>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-warning"
          onClick={handleSubmit}
          disabled={isPending || selected.length === 0}
        >
          {isPending ? "Salvando…" : "Salvar plano do teste"}
        </button>
      </div>
    </div>
  );
}