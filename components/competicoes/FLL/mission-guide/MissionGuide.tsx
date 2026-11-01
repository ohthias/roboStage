"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeSeasonMissions } from "@/utils/competitions/fll/mission-guide/normalize";
import type {
  MissionFilterKey,
  MissionGuideEditorialFile,
  MissionGuideMission,
  RawMission,
} from "@/utils/competitions/fll/mission-guide/types";
import { matchesFilter, matchesSearch } from "@/utils/competitions/fll/mission-guide/utils";
import { MissionFilters } from "./MissionFilters";
import { MissionGrid } from "./MissionGrid";
import { MissionCardSkeletonGrid } from "./MissionCardSkeleton";
import { MissionModal } from "./MissionModal";
import { MissionSearch } from "./MissionSearch";
import Header from "@/components/UI/Header";
import { loadSeasonMissions } from "@/utils/data/missions-client";

// Only BIOGLOW™ Future Edition ships in this first version. The season key is
// isolated here so a future season selector only needs to change this value
// (and where it's read from — e.g. a route param or a <select>).
const SEASON = "bioglow";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; missions: MissionGuideMission[] };

async function loadMissionGuideData(): Promise<MissionGuideMission[]> {
  const [rawMissions, editorialRes] = await Promise.all([
    loadSeasonMissions<RawMission>(SEASON),
    fetch(`/data/fll/mission-guide/${SEASON}.json`),
  ]);

  // Editorial content is optional — if it's missing or fails to load, the UI
  // simply falls back to hiding mechanism/strategy/tips sections per mission.
  let editorialFile: MissionGuideEditorialFile | null = null;
  if (editorialRes.ok) {
    editorialFile = (await editorialRes.json()) as MissionGuideEditorialFile;
  }

  return normalizeSeasonMissions(rawMissions, editorialFile?.missions);
}

export function MissionGuide() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MissionFilterKey>("all");
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setState({ status: "loading" });
    loadMissionGuideData()
      .then((missions) => setState({ status: "ready", missions }))
      .catch(() => setState({ status: "error" }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const missions = state.status === "ready" ? state.missions : [];

  const filteredMissions = useMemo(() => {
    return missions.filter(
      (mission) => matchesSearch(mission, search) && matchesFilter(mission, filter)
    );
  }, [missions, search, filter]);

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === selectedMissionId) ?? null,
    [missions, selectedMissionId]
  );

  const handleClearSearch = useCallback(() => setSearch(""), []);
  const handleCloseModal = useCallback(() => setSelectedMissionId(null), []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 w-full">
      <Header name="Guia de Missões" highlight="BIOGLOW™ Founders Edition" description="Explore as missões da temporada e descubra dicas, estratégias e mecanismos para cada uma delas." type="Documentos" />
      {state.status === "error" ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-error/40 py-16 text-center">
          <p className="text-lg font-semibold">Não foi possível carregar as missões.</p>
          <p className="text-sm text-base-content/60">
            Verifique sua conexão e tente novamente.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchData}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <MissionSearch value={search} onChange={setSearch} />
            <MissionFilters value={filter} onChange={setFilter} />
          </div>

          {state.status === "loading" ? (
            <>
              <p className="text-sm text-base-content/60" role="status">
                Carregando missões...
              </p>
              <MissionCardSkeletonGrid />
            </>
          ) : (
            <MissionGrid
              missions={filteredMissions}
              onSelect={setSelectedMissionId}
              onClearSearch={handleClearSearch}
            />
          )}
        </>
      )}

      <MissionModal mission={selectedMission} onClose={handleCloseModal} />
    </div>
  );
}
