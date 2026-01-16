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

  const filteredMissions =
    catalog[season]?.filter((mission: any) => {
      return (
        mission.id &&
        mission.id !== "GP" &&
        mission.id !== "PT" &&
        mission.id !== "EL"
      );
    }) || [];

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

      // Reorder Missions
      if (type === "MISSION") {
        const sourceStepId = source.droppableId;
        const destStepId = destination.droppableId;

        // Find step indices
        const sourceStepIndex = activeStrategy.steps.findIndex(
          (s) => s.id === sourceStepId
        );
        const destStepIndex = activeStrategy.steps.findIndex(
          (s) => s.id === destStepId
        );

        if (sourceStepIndex === -1 || destStepIndex === -1) return;

        const newSteps = Array.from(activeStrategy.steps);
        const sourceStep = newSteps[sourceStepIndex];
        const destStep = newSteps[destStepIndex];

        // Create copies of mission arrays
        const sourceMissions = Array.from(sourceStep.missions);
        const destMissions =
          sourceStepId === destStepId
            ? sourceMissions
            : Array.from(destStep.missions);

        // Remove from source
        const [movedMission] = sourceMissions.splice(source.index, 1);

        // Add to destination
        destMissions.splice(destination.index, 0, movedMission);

        // Update steps
        newSteps[sourceStepIndex] = { ...sourceStep, missions: sourceMissions };
        if (sourceStepId !== destStepId) {
          newSteps[destStepIndex] = { ...destStep, missions: destMissions };
        }

        setStrategies((prev) =>
          prev.map((s) =>
            s.id === activeStrategy.id ? { ...s, steps: newSteps } : s
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
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <LayoutList size={18} className="text-slate-500" />
            Estrategias
          </h2>
          <button
            onClick={addStrategy}
            className="p-1.5 hover:bg-slate-100 rounded-md text-primary-600 transition-colors"
            title="Criar novo bloco de estrategia"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {strategies.map((strategy) => {
            const missionCount = strategy.steps.reduce(
              (acc, step) => acc + step.missions.length,
              0
            );
            return (
              <div
                key={strategy.id}
                onClick={() => setActiveStrategyId(strategy.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                  activeStrategyId === strategy.id
                    ? "bg-primary-50 border-primary-200 shadow-sm"
                    : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                }`}
              >
                <div className="flex flex-col overflow-hidden">
                  <span
                    className={`font-medium truncate ${
                      activeStrategyId === strategy.id
                        ? "text-primary-800"
                        : "text-slate-700"
                    }`}
                  >
                    {strategy.name}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {missionCount} Missões • {strategy.steps.length} Etapas
                  </span>
                </div>

                <button
                  onClick={() => deleteStrategyById(strategy.id)}
                  className={`p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content - Mission Flow */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              <input
                type="text"
                value={activeStrategy?.name || ""}
                onChange={(e) => editStrategyName(e.target.value)}
                onBlur={() => {
                  if (!activeStrategy?.name.trim()) {
                    editStrategyName("Saida Sem Nome");
                  }
                }}
                onClick={(e) => e.currentTarget.select()}
                className="bg-transparent border-b border-transparent focus:border-primary-300 focus:outline-none text-2xl font-bold w-64"
              />
            </h2>
            <p className="text-sm text-slate-500">
              {activeStrategy?.steps.length === 0
                ? "Fase de Rascunho"
                : "Fluxo de Execução Ativo"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportStrategy}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
              title="Exportar estratégia como JSON"
            >
              <Download size={18} />
              Exportar
            </button>

            <button
              onClick={() => {
                const confirmDelete = confirm(
                  "Você tem certeza que deseja excluir esta estratégia?"
                );
                if (confirmDelete) {
                  deleteStrategyById(activeStrategyId);
                }
              }}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <Trash2 size={18} />
              Excluir
            </button>
          </div>
        </div>

        {/* Visualization Area */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex items-center">
            <div className="flex items-start gap-4 min-w-full">
              {/* Start Node */}
              <div className="flex flex-col items-center justify-center pt-20 gap-4 opacity-50 shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 border-dashed flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400">
                    Início
                  </span>
                </div>
              </div>

              {/* Connecting Line from Start */}
              <div className="pt-28 shrink-0">
                <ArrowRight size={24} className="text-slate-300" />
              </div>

              {activeStrategy?.steps.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20 px-8 text-center animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Plus size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-400 font-medium">Sem missões</p>
                  <p className="text-sm text-slate-400">
                    Clique em alguma missão
                    <br />
                    no catálogo para adicioná-la à estratégia.
                  </p>
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
                      className="flex items-start gap-4"
                    >
                      {activeStrategy?.steps.map((step, stepIndex) => (
                        <Draggable
                          key={step.id}
                          draggableId={step.id}
                          index={stepIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-start gap-4 shrink-0 transition-opacity ${
                                snapshot.isDragging ? "opacity-80" : ""
                              }`}
                            >
                              {/* Mission Stack (Step) */}
                              <div
                                className={`flex flex-col gap-3 relative group/step bg-slate-100/50 p-2 rounded-2xl border transition-all min-w-[280px]
                                                        ${
                                                          snapshot.isDragging
                                                            ? "border-primary-300 shadow-xl bg-white rotate-2 cursor-grabbing"
                                                            : "border-transparent hover:border-slate-200"
                                                        }
                                                     `}
                              >
                                {/* Step Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing p-1 bg-white border border-slate-200 rounded-md shadow-sm opacity-0 group-hover/step:opacity-100 transition-opacity"
                                >
                                  <GripVertical
                                    size={14}
                                    className="text-slate-400"
                                  />
                                </div>

                                {/* Simultaneous Label */}
                                {step.missions.length > 1 && (
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                    Simultâneas
                                  </div>
                                )}

                                <Droppable droppableId={step.id} type="MISSION">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`flex flex-col gap-3 min-h-[100px] rounded-xl transition-colors ${
                                        snapshot.isDraggingOver
                                          ? "bg-primary-50/50"
                                          : ""
                                      }`}
                                    >
                                      {step.missions.map((mission, mIndex) => (
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
                                              style={{
                                                ...provided.draggableProps
                                                  .style,
                                              }}
                                            >
                                              <MissionNode
                                                mission={mission}
                                                index={stepIndex}
                                                subIndex={mIndex}
                                                onUpdate={updateMission}
                                                onDelete={removeMission}
                                                isDragging={snapshot.isDragging}
                                              />
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>

                              {/* Connector Arrow */}
                              <div className="pt-28 text-slate-300">
                                {stepIndex < activeStrategy.steps.length - 1 ? (
                                  <ArrowRight size={24} />
                                ) : (
                                  <div className="flex items-center gap-2 opacity-50 ml-2">
                                    <ArrowRight
                                      size={24}
                                      className="text-slate-300"
                                    />
                                    <div className="w-16 h-16 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center ml-2">
                                      <Target
                                        size={20}
                                        className="text-slate-300"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>
      <div className="w-80 border-r bg-white overflow-y-auto">
        <div className="p-3 space-y-2">
          {filteredMissions.map((m) => (
            <button
              key={m.id}
              onClick={() => addMissionFromCatalog(m)}
              className="w-full text-left p-3 rounded-lg border hover:bg-slate-50"
            >
              <div className="font-semibold text-sm">
                {m.id} — {m.name}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{m.mission}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
