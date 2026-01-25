"use client";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  Target,
  LayoutList,
  GitGraph,
  GripVertical,
  Download,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ApiMission, ExitStrategy, Mission, MissionStep } from "./types";
import { MissionNode } from "./MissionNode";

interface StrategyBoardProps {
  seasonSelect?: string;
}

export const StrategyBoard: React.FC<StrategyBoardProps> = ({
  seasonSelect = "masterpiece",
}) => {
  const [catalog, setCatalog] = useState<Record<string, ApiMission[]>>({});
  const [season, setSeason] = useState<
    "masterpiece" | "submerged" | "unearthed"
  >(seasonSelect as "masterpiece" | "submerged" | "unearthed");

  useEffect(() => {
    fetch("/api/data/missions")
      .then((res) => res.json())
      .then((data) => setCatalog(data))
      .catch((err) => console.error("Failed to load missions", err));
  }, []);

  useEffect(() => {
    setSeason(seasonSelect as "masterpiece" | "submerged" | "unearthed");
  }, [seasonSelect]);

  const [strategies, setStrategies] = useState<ExitStrategy[]>([
    {
      id: "strat-1",
      name: "Saida 1",
      createdAt: Date.now(),
      steps: [],
    },
  ]);

  const [activeStrategyId, setActiveStrategyId] = useState<string>("strat-1");
  const activeStrategy =
    strategies.find((s) => s.id === activeStrategyId) || strategies[0];

  const addStrategy = useCallback(() => {
    const newStrategy: ExitStrategy = {
      id: `strat-${Date.now()}`,
      name: `Saida ${strategies.length + 1}`,
      steps: [],
      createdAt: Date.now(),
    };
    setStrategies((prev) => [...prev, newStrategy]);
    setActiveStrategyId(newStrategy.id);
  }, [strategies.length]);

  const deleteStrategyById = useCallback(
    (id: string) => {
      if (strategies.length <= 1) {
        alert("You must have at least one strategy.");
        return;
      }

      const newStrategies = strategies.filter((s) => s.id !== id);
      setStrategies(newStrategies);

      if (activeStrategyId === id) {
        setActiveStrategyId(newStrategies[0].id);
      }
    },
    [strategies, activeStrategyId]
  );

  const exportStrategy = useCallback(() => {
    if (!activeStrategy) return;

    try {
      const jsonString = JSON.stringify(activeStrategy, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const safeName = activeStrategy.name
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      link.href = url;
      link.download = `${safeName}_export.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export strategy", error);
      alert("Failed to export strategy.");
    }
  }, [activeStrategy]);

  const updateMission = useCallback(
    (missionId: string, updates: Partial<Mission>) => {
      if (!activeStrategy) return;
      setStrategies((prev) =>
        prev.map((s) => {
          if (s.id === activeStrategy.id) {
            const newSteps = s.steps.map((step) => {
              const newMissions = step.missions.map((m) =>
                m.id === missionId ? { ...m, ...updates } : m
              );
              return { ...step, missions: newMissions };
            });
            return { ...s, steps: newSteps };
          }
          return s;
        })
      );
    },
    [activeStrategy]
  );

  const usedMissionIds = useMemo(() => {
    const ids = new Set<string>();

    strategies.forEach((strategy) => {
      strategy.steps.forEach((step) => {
        step.missions.forEach((mission) => {
          ids.add(mission.apiMissionId);
        });
      });
    });

    return ids;
  }, [strategies]);

  const filteredMissions =
    catalog[season]?.filter((mission: ApiMission) => {
      return (
        mission.id &&
        mission.id !== "GP" &&
        mission.id !== "PT" &&
        mission.id !== "EL" &&
        !usedMissionIds.has(mission.id)
      );
    }) || [];

  const addMissionFromCatalog = useCallback(
    (apiMission: ApiMission) => {
      if (!activeStrategy) return;

      // segurança extra
      if (usedMissionIds.has(apiMission.id)) return;

      const timestamp = Date.now();

      const newMission: Mission = {
        id: `mission-${apiMission.id}-${timestamp}`,
        apiMissionId: apiMission.id,
        name: apiMission.name,
        description: apiMission.mission,
        status: "pending",
        image: apiMission.image,
      };

      const newStep: MissionStep = {
        id: `step-${timestamp}`,
        missions: [newMission],
      };

      setStrategies((prev) =>
        prev.map((s) =>
          s.id === activeStrategy.id
            ? { ...s, steps: [...s.steps, newStep] }
            : s
        )
      );
    },
    [activeStrategy, usedMissionIds]
  );

  const removeMission = useCallback(
    (missionId: string) => {
      if (!activeStrategy) return;
      setStrategies((prev) =>
        prev.map((s) => {
          if (s.id === activeStrategy.id) {
            // Filter out the mission
            const newSteps = s.steps
              .map((step) => ({
                ...step,
                missions: step.missions.filter((m) => m.id !== missionId),
              }))
              .filter((step) => step.missions.length > 0);

            return { ...s, steps: newSteps };
          }
          return s;
        })
      );
    },
    [activeStrategy]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, type } = result;

      if (!destination) return;
      if (!activeStrategy) return;

      // Reorder Steps
      if (type === "STEP") {
        if (source.index === destination.index) return;

        const newSteps = Array.from(activeStrategy.steps);
        const [movedStep] = newSteps.splice(source.index, 1);
        newSteps.splice(destination.index, 0, movedStep);

        setStrategies((prev) =>
          prev.map((s) =>
            s.id === activeStrategy.id ? { ...s, steps: newSteps } : s
          )
        );
        return;
      }

      if (type === "MISSION") {
        if (!destination) return;

        const sourceStepId = source.droppableId;
        const destDroppableId = destination.droppableId;

        const newSteps = Array.from(activeStrategy.steps);

        const sourceStepIndex = newSteps.findIndex(
          (s) => s.id === sourceStepId
        );

        if (sourceStepIndex === -1) return;

        const sourceStep = newSteps[sourceStepIndex];
        const sourceMissions = Array.from(sourceStep.missions);

        const [movedMission] = sourceMissions.splice(source.index, 1);

        // 🔹 CASO 1 — solto fora (criar novo step)
        if (destDroppableId === "NEW_STEP_DROPZONE") {
          const timestamp = Date.now();

          const newStep: MissionStep = {
            id: `step-${timestamp}`,
            missions: [movedMission],
          };

          newSteps[sourceStepIndex] = {
            ...sourceStep,
            missions: sourceMissions,
          };

          newSteps.push(newStep);
        }
        // 🔹 CASO 2 — mover para outro step existente
        else {
          const destStepIndex = newSteps.findIndex(
            (s) => s.id === destDroppableId
          );

          if (destStepIndex === -1) return;

          const destStep = newSteps[destStepIndex];
          const destMissions = Array.from(destStep.missions);

          destMissions.splice(destination.index, 0, movedMission);

          newSteps[sourceStepIndex] = {
            ...sourceStep,
            missions: sourceMissions,
          };

          newSteps[destStepIndex] = {
            ...destStep,
            missions: destMissions,
          };
        }

        const cleanedSteps = newSteps.filter(
          (step) => step.missions.length > 0
        );

        setStrategies((prev) =>
          prev.map((s) =>
            s.id === activeStrategy.id ? { ...s, steps: cleanedSteps } : s
          )
        );
      }
    },
    [activeStrategy]
  );

  const editStrategyName = useCallback(
    (newName: string) => {
      if (!activeStrategy) return;
      setStrategies((prev) =>
        prev.map((s) =>
          s.id === activeStrategy.id ? { ...s, name: newName } : s
        )
      );
    },
    [activeStrategy]
  );

  return (
    <div className="flex h-full w-full">
      {/* Sidebar - Strategies List */}
      <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col h-full z-10">
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <LayoutList size={18} />
            Estratégias
          </h2>
          <button
            onClick={addStrategy}
            className="btn btn-ghost btn-sm btn-circle"
            title="Criar nova estratégia"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {strategies.map((strategy) => {
            const missionCount = strategy.steps.reduce(
              (acc, step) => acc + step.missions.length,
              0
            );

            const active = activeStrategyId === strategy.id;

            return (
              <div
                key={strategy.id}
                onClick={() => setActiveStrategyId(strategy.id)}
                className={`group cursor-pointer rounded-lg border p-3 transition
              ${
                active
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-base-200 border-transparent"
              }`}
              >
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <div className="font-medium truncate">{strategy.name}</div>
                    <div className="text-xs opacity-60">
                      {missionCount} Missões • {strategy.steps.length} Etapas
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStrategyById(strategy.id);
                    }}
                    className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-base-200/40 overflow-hidden">
        {/* Toolbar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-base-300 bg-base-100 sticky top-0 z-10">
          <div>
            <input
              type="text"
              value={activeStrategy?.name || ""}
              onChange={(e) => editStrategyName(e.target.value)}
              onBlur={() => {
                if (!activeStrategy?.name.trim()) {
                  editStrategyName("Saída sem nome");
                }
              }}
              className="input input-ghost text-xl font-bold w-64"
            />
            <p className="text-sm opacity-60">
              {activeStrategy?.steps.length === 0
                ? "Fase de rascunho"
                : "Fluxo de execução ativo"}
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={exportStrategy} className="btn btn-outline btn-sm">
              <Download size={16} />
              Exportar
            </button>

            <button
              onClick={() => {
                if (confirm("Deseja excluir esta estratégia?")) {
                  deleteStrategyById(activeStrategyId);
                }
              }}
              className="btn btn-neutral btn-sm"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        </div>

        {/* Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex items-start gap-4 min-w-full">
              {/* Start */}
              <div className="pt-20 opacity-50">
                <div className="w-16 h-16 rounded-full border border-dashed flex items-center justify-center">
                  <span className="text-xs">Início</span>
                </div>
              </div>

              <ArrowRight className="mt-28 opacity-40" />

              {activeStrategy?.steps.length === 0 ? (
                <div className="text-center opacity-60 pt-24">
                  <Plus size={28} />
                  <p className="font-medium mt-2">Sem missões</p>
                  <p className="text-sm">Selecione uma missão no catálogo</p>
                </div>
              ) : (
                <Droppable
                  droppableId="board"
                  direction="horizontal"
                  type="STEP"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-4"
                    >
                      {activeStrategy.steps.map((step, stepIndex) => (
                        <Draggable
                          key={step.id}
                          draggableId={step.id}
                          index={stepIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex gap-4
                            ${snapshot.isDragging ? "opacity-80" : ""}`}
                            >
                              <div className="card bg-base-100 border border-base-300 w-72">
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute -top-3 left-1/2 -translate-x-1/2 btn btn-xs btn-ghost cursor-grab"
                                >
                                  <GripVertical size={14} />
                                </div>

                                <div className="card-body gap-3">
                                  <Droppable
                                    droppableId={step.id}
                                    type="MISSION"
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-2 min-h-[80px]"
                                      >
                                        {step.missions.map(
                                          (mission, mIndex) => (
                                            <Draggable
                                              key={mission.id}
                                              draggableId={mission.id}
                                              index={mIndex}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                >
                                                  <MissionNode
                                                    mission={mission}
                                                    index={stepIndex}
                                                    subIndex={mIndex}
                                                    onUpdate={updateMission}
                                                    onDelete={removeMission}
                                                    isDragging={
                                                      snapshot.isDragging
                                                    }
                                                  />
                                                </div>
                                              )}
                                            </Draggable>
                                          )
                                        )}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {/* Dropzone para criar novo step */}
                      <Droppable droppableId="NEW_STEP_DROPZONE" type="MISSION">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex items-center justify-center w-40 min-h-[260px] rounded-xl border-2 border-dashed transition
                            ${
                              snapshot.isDraggingOver
                                ? "border-primary bg-primary/10"
                                : "border-base-300 opacity-40"
                            }`}
                          >
                            <div className="text-xs text-center opacity-70">
                              Solte aqui para criar
                              <br />
                              nova etapa
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Mission Catalog */}
      <aside className="w-80 bg-base-100 border-l border-base-300 overflow-y-auto">
        <div className="p-3 space-y-2">
          {filteredMissions.map((m) => (
            <button
              key={m.id}
              onClick={() => addMissionFromCatalog(m)}
              className="card card-compact bg-base-100 border hover:bg-base-200 text-left"
            >
              <div className="card-body">
                <div className="font-semibold text-sm">
                  {m.id} — {m.name}
                </div>
                <p className="text-xs opacity-60 line-clamp-2">{m.mission}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};
