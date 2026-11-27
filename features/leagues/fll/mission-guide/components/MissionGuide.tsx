"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeSeasonMissions } from "@/features/leagues/fll/mission-guide/lib/normalize";
import type {
  MissionFilterKey,
  MissionGuideEditorialFile,
  MissionGuideMission,
  RawMission,
} from "@/features/leagues/fll/mission-guide/lib/types";
import { matchesFilter, matchesSearch } from "@/features/leagues/fll/mission-guide/lib/utils";
import { MissionFilters } from "./MissionFilters";
import { MissionGrid } from "./MissionGrid";
import { MissionCardSkeletonGrid } from "./MissionCardSkeleton";
import { MissionModal } from "./MissionModal";
import { MissionSearch } from "./MissionSearch";
import Header from "@/components/layout/Header";
import { RefreshCw } from "lucide-react";
import { Button, EmptyState } from "@/components/stage";
import { loadMissionGuide, loadSeasonMissions } from "@/lib/data/missions-client";

// Only BIOGLOW™ Future Edition ships in this first version. The season key is
// isolated here so a future season selector only needs to change this value
// (and where it's read from — e.g. a route param or a <select>).
const SEASON = "bioglow";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; missions: MissionGuideMission[] };

async function loadMissionGuideData(): Promise<MissionGuideMission[]> {
  // Editorial content is optional — if it's missing or fails to load, the UI
  // simply falls back to hiding mechanism/strategy/tips sections per mission.
  const [rawMissions, editorialFile] = await Promise.all([
    loadSeasonMissions<RawMission>(SEASON),
    loadMissionGuide<MissionGuideEditorialFile>(SEASON).catch(() => null),
  ]);

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-8">
      <Header name="Guia de Missões" highlight="BIOGLOW™ Founders Edition" description="Explore as missões da temporada e descubra dicas, estratégias e mecanismos para cada uma delas." type="Documentos" />
      {state.status === "error" ? (
        <EmptyState
          title="Não foi possível carregar as missões."
          description="Verifique sua conexão e tente novamente."
          action={
            <Button tone="primary" size="sm" onClick={fetchData} iconLeft={<RefreshCw size={16} />}>
              Tentar novamente
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <MissionSearch value={search} onChange={setSearch} />
            <MissionFilters value={filter} onChange={setFilter} />
          </div>

          {state.status === "loading" ? (
            <>
              <p className="stage-kicker text-base-content/45" role="status">
                / CARREGANDO MISSÕES...
              </p>
              <MissionCardSkeletonGrid />
            </>
          ) : (
            <>
              <p className="stage-kicker -mb-4 text-base-content/45" aria-live="polite">
                / {filteredMissions.length} DE {missions.length} MISSÕES
              </p>
              <MissionGrid
                missions={filteredMissions}
                onSelect={setSelectedMissionId}
                onClearSearch={handleClearSearch}
              />
            </>
          )}
        </>
      )}

      <MissionModal mission={selectedMission} onClose={handleCloseModal} />
    </main>
  );
}
