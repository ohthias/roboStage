import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Check,
  Settings,
  MoreHorizontal,
  Type,
  Hash,
  List,
  FileDown,
  ChevronDown,
  ChevronRight,
  Lock,
  Info,
  Package,
  Search,
  Trophy,
} from "lucide-react";
import {
  Column,
  Mission,
  ColumnType,
  ScoreValue,
} from "@/types/TableAnalytics";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import { useToast } from "@/app/context/ToastContext";
import {
  updateMissionValue,
  isSubMissionUnlocked,
} from "@/utils/quickbrick/scoring";

interface MissionTableProps {
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[] | null>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  season?: string;
}

export const MissionTable: React.FC<MissionTableProps> = ({
  columns,
  missions,
  setMissions,
  setColumns,
  season,
}) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColData, setNewColData] = useState<{
    label: string;
    type: ColumnType;
    options: string;
  }>({
    label: "",
    type: "text",
    options: "",
  });

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // State for column menu
  const [activeMenuColId, setActiveMenuColId] = useState<string | null>(null);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const modalClearColl = useRef<ModalConfirmRef>(null);

  const { addToast } = useToast();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuColId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const RESERVED_COLUMN_IDS = new Set(["name", "points", "maxPoints"]);

  const handleCellChange = (missionId: string, colId: string, value: any) => {
    setMissions((prev) =>
      prev
        ? prev.map((m) => {
            if (m.id !== missionId) return m;
            // Points/maxPoints are computed automatically for official, scored
            // missions — only allow free typing for custom missions the user added.
            if (RESERVED_COLUMN_IDS.has(colId) && m.definition) return m;
            return { ...m, [colId]: value };
          })
        : prev,
    );
  };

  // Updates a mission's own scoring value, or one of its sub-missions' values,
  // recomputing achieved/max points automatically.
  const handleValueChange = (
    missionId: string,
    field: "self" | string,
    value: ScoreValue,
  ) => {
    setMissions((prev) =>
      prev
        ? prev.map((m) =>
            m.id === missionId ? updateMissionValue(m, field, value) : m,
          )
        : prev,
    );
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addMission = () => {
    const newId = Math.random().toString(36).substring(2, 11);
    const newMission: Mission = {
      id: newId,
      name: "Nova Missão",
      points: 0,
      maxPoints: 0,
    };
    columns.forEach((c) => {
      if (RESERVED_COLUMN_IDS.has(c.id)) return;
      newMission[c.id] = "";
    });
    setMissions([...missions, newMission]);
  };

  const removeMission = (id: string) => {
    setMissions(missions.filter((m) => m.id !== id));
  };

  const addColumn = () => {
    if (!newColData.label.trim()) return;

    // Generate a safe ID from the label
    const cleanLabel = newColData.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    let newId = `${cleanLabel}_${Math.random().toString(36).substring(2, 6)}`;
    if (RESERVED_COLUMN_IDS.has(newId)) newId = `custom_${newId}`;

    const newCol: Column = {
      id: newId,
      label: newColData.label,
      type: newColData.type,
      options:
        newColData.type === "select"
          ? newColData.options
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
    };

    setColumns([...columns, newCol]);

    // Add this field to all existing missions to keep schema consistent
    setMissions((prev) =>
      prev
        ? prev.map((m) => ({
            ...m,
            [newId]: "",
          }))
        : [],
    );

    setIsAddingColumn(false);
    setNewColData({ label: "", type: "text", options: "" });
    addToast("Coluna criada!", "success");
  };

  const removeColumn = (colId: string) => {
    modalClearColl.current?.open(
      "Tem certeza que deseja excluir esta coluna?",
      () => {
        actuallyRemoveColumn(colId);
      },
    );
  };

  const actuallyRemoveColumn = (colId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== colId));

    setMissions((prev) =>
      prev
        ? prev.map((m) => {
            const newM = { ...m };
            delete newM[colId];
            return newM;
          })
        : prev,
    );

    setActiveMenuColId(null);
  };

  const startEditing = (col: Column) => {
    setEditingColId(col.id);
    setEditLabel(col.label);
    setActiveMenuColId(null);
  };

  const saveColEdit = () => {
    if (editingColId && editLabel.trim()) {
      setColumns((cols) =>
        cols.map((c) =>
          c.id === editingColId ? { ...c, label: editLabel } : c,
        ),
      );
    }
    setEditingColId(null);
  };

  const getIconForType = (type: ColumnType) => {
    switch (type) {
      case "number":
        return <Hash size={14} className="text-blue-500" />;
      case "select":
        return <List size={14} className="text-purple-500" />;
      default:
        return <Type size={14} className="text-slate-500" />;
    }
  };

  const exportToPdf = () => {
    const doc = new jsPDF();

    const tableColumn = columns.map((col) => col.label);
    const tableRows = filteredMissions.map((mission) => {
      return columns.map((col) => {
        let val = mission[col.id];
        if (val === undefined || val === null) return "";
        return String(val);
      });
    });

    doc.setFontSize(18);
    doc.text(`Tabela de Missões - ${season}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [254, 226, 226] },
      theme: "grid",
      foot: [
        [
          "Total",
          ...columns
            .slice(1)
            .map((c) =>
              c.id === "points"
                ? String(totalPoints)
                : c.id === "maxPoints"
                  ? String(totalMaxPoints)
                  : "",
            ),
        ],
      ],
    });

    doc.save(`fll_${season || "tabela"}.pdf`);
    addToast("Exportação concluída! Baixando arquivo PDF.", "success");
  };

  const filteredMissions = useMemo(() => {
    if (!search.trim()) return missions;
    const q = search.trim().toLowerCase();
    return missions.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.definition?.description?.toLowerCase().includes(q),
    );
  }, [missions, search]);

  const totalPoints = useMemo(
    () => missions.reduce((sum, m) => sum + (Number(m.points) || 0), 0),
    [missions],
  );
  const totalMaxPoints = useMemo(
    () => missions.reduce((sum, m) => sum + (Number(m.maxPoints) || 0), 0),
    [missions],
  );

  // ---------------------------------------------------------------------
  // Scoring control renderers
  // ---------------------------------------------------------------------

  const renderOwnControl = (mission: Mission) => {
    const scoring = mission.definition?.scoring;
    if (!scoring)
      return <span className="text-base-content/30 text-xs">—</span>;

    if (scoring.kind === "boolean") {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-success"
            checked={mission.value === true}
            onChange={(e) =>
              handleValueChange(mission.id, "self", e.target.checked)
            }
          />
          <span className="text-xs text-base-content/60">
            {scoring.points} pts
          </span>
        </label>
      );
    }

    if (scoring.kind === "options") {
      return (
        <select
          className="select select-bordered select-xs w-full max-w-[160px]"
          value={typeof mission.value === "string" ? mission.value : ""}
          onChange={(e) =>
            handleValueChange(mission.id, "self", e.target.value || undefined)
          }
        >
          <option value="">—</option>
          {scoring.options.map((opt, i) => (
            <option key={opt} value={opt}>
              {opt} ({scoring.points[i] ?? 0} pts)
            </option>
          ))}
        </select>
      );
    }

    // count
    const val = typeof mission.value === "number" ? mission.value : 0;
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={scoring.min}
          max={scoring.max}
          className="input input-bordered input-xs w-16"
          value={val}
          onChange={(e) => {
            const n = Math.max(
              scoring.min,
              Math.min(scoring.max, Number(e.target.value) || 0),
            );
            handleValueChange(mission.id, "self", n);
          }}
        />
        <span className="text-xs text-base-content/40">/ {scoring.max}</span>
      </div>
    );
  };

  const renderSubControl = (mission: Mission, subId: string, scoring: any) => {
    const unlocked = mission.definition
      ? isSubMissionUnlocked(
          mission,
          mission.definition.subMissions.find((s) => s.id === subId)!,
        )
      : true;
    const value = mission.subValues?.[subId];

    if (scoring.kind === "boolean") {
      return (
        <input
          type="checkbox"
          className="toggle toggle-xs toggle-success"
          disabled={!unlocked}
          checked={value === true}
          onChange={(e) =>
            handleValueChange(mission.id, subId, e.target.checked)
          }
        />
      );
    }

    if (scoring.kind === "options") {
      return (
        <select
          className="select select-bordered select-xs w-full max-w-[160px]"
          disabled={!unlocked}
          value={typeof value === "string" ? value : ""}
          onChange={(e) =>
            handleValueChange(mission.id, subId, e.target.value || undefined)
          }
        >
          <option value="">—</option>
          {scoring.options.map((opt: string, i: number) => (
            <option key={opt} value={opt}>
              {opt} ({scoring.points[i] ?? 0} pts)
            </option>
          ))}
        </select>
      );
    }

    const val = typeof value === "number" ? value : 0;
    return (
      <input
        type="number"
        min={scoring.min}
        max={scoring.max}
        disabled={!unlocked}
        className="input input-bordered input-xs w-16"
        value={val}
        onChange={(e) => {
          const n = Math.max(
            scoring.min,
            Math.min(scoring.max, Number(e.target.value) || 0),
          );
          handleValueChange(mission.id, subId, n);
        }}
      />
    );
  };

  const renderExpandedSubMissions = (mission: Mission) => {
    if (!mission.definition || mission.definition.subMissions.length === 0)
      return null;
    const gateFailed = mission.definition.subMissions.some(
      (s) => s.zeroWholeMissionIfFalse && mission.subValues?.[s.id] !== true,
    );
    return (
      <tr className="bg-base-200/40">
        <td colSpan={columns.length + 3} className="px-6 py-3">
          {gateFailed && (
            <div className="alert alert-warning py-1.5 px-3 mb-2 text-xs">
              Condição obrigatória não cumprida — esta missão está pontuando 0
              até que seja satisfeita.
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {mission.definition.subMissions.map((sub) => {
              const unlocked = isSubMissionUnlocked(mission, sub);
              return (
                <div
                  key={sub.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 bg-base-100 ${
                    sub.zeroWholeMissionIfFalse
                      ? "border-warning/40"
                      : "border-base-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="text-xs text-base-content/80 truncate"
                      title={sub.label}
                    >
                      {sub.label}
                    </span>
                    {sub.note && (
                      <span title={sub.note}>
                        <Info size={12} className="text-info shrink-0" />
                      </span>
                    )}
                    {!unlocked && (
                      <span title="Bloqueado: requisitos ainda não cumpridos">
                        <Lock
                          size={12}
                          className="text-base-content/40 shrink-0"
                        />
                      </span>
                    )}
                  </div>
                  {renderSubControl(mission, sub.id, sub.scoring)}
                </div>
              );
            })}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-base-200 flex flex-wrap gap-3 justify-between items-center bg-base-200">
        <h2 className="text-lg font-semibold text-base-content">
          Quadro de Missões
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          <label className="input input-bordered input-sm flex items-center gap-2 w-48">
            <Search size={14} className="text-base-content/40" />
            <input
              type="text"
              className="grow"
              placeholder="Buscar missão..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            onClick={exportToPdf}
            className="btn btn-ghost btn-sm gap-2"
            title="Exportar como PDF"
          >
            <FileDown size={16} />
            Exportar PDF
          </button>
          <button
            onClick={() => setIsAddingColumn(!isAddingColumn)}
            className={`btn btn-sm ${
              isAddingColumn ? "btn-secondary" : "btn-ghost"
            }`}
          >
            <Settings size={16} />
            Gerenciar Colunas
          </button>
          <button
            onClick={addMission}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Missão
          </button>
        </div>
      </div>

      {/* Add Column Form */}
      {isAddingColumn && (
        <div className="bg-base-300/50 py-4 px-6 border-b border-base-200 animate-in fade-in slide-in-from-top-2 transition-all">
          <h3 className="text-sm font-semibold text-base-content/70 mb-3 flex items-center gap-2">
            <Plus size={16} />
            Adicionar Nova Coluna
          </h3>
          <div className="flex flex-wrap gap-4 items-end p-4 bg-base-100 rounded-lg border border-base-200 shadow-sm">
            <div className="flex-1">
              <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                Nome
              </label>
              <input
                type="text"
                value={newColData.label}
                onChange={(e) =>
                  setNewColData({ ...newColData, label: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && addColumn()}
                className="input input-bordered input-sm w-full"
                placeholder="Ex: Prioridade"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                Tipo
              </label>
              <select
                value={newColData.type}
                onChange={(e) =>
                  setNewColData({
                    ...newColData,
                    type: e.target.value as ColumnType,
                  })
                }
                className="select select-bordered select-sm w-36 px-2 rounded-box"
              >
                <option value="text">Texto (Abc)</option>
                <option value="number">Número (123)</option>
                <option value="select">Lista (Opções)</option>
              </select>
            </div>
            {newColData.type === "select" && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                  Opções{" "}
                  <span className="text-base-content/40 font-normal normal-case">
                    (separadas por vírgula)
                  </span>
                </label>
                <input
                  type="text"
                  value={newColData.options}
                  onChange={(e) =>
                    setNewColData({ ...newColData, options: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addColumn()}
                  className="input input-bordered input-sm w-full"
                  placeholder="Ex: Alta, Média, Baixa"
                />
              </div>
            )}
            <div className="flex gap-2 pb-0.5 ml-auto">
              <button
                onClick={() => setIsAddingColumn(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancelar
              </button>
              <button
                onClick={addColumn}
                disabled={!newColData.label}
                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check size={16} />
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto flex-1 custom-scrollbar relative bg-base-100/50">
        <table className="table w-full text-sm">
          <thead className="text-xs text-base-content/70 uppercase bg-base-200 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-3 w-8"></th>
              {columns.map((col) => (
                <React.Fragment key={col.id}>
                  {col.id === "points" && (
                    <th className="px-4 py-3 font-semibold min-w-[170px]">
                      Pontuação
                    </th>
                  )}
                  <th className="px-4 py-3 font-semibold min-w-[150px] group">
                    <div className="flex items-center justify-between gap-2">
                      {editingColId === col.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            className="input input-sm w-full"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onBlur={saveColEdit}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveColEdit()
                            }
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-base-content">
                          {getIconForType(col.type)}
                          <span>{col.label}</span>
                        </div>
                      )}

                      {!col.isSystem && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuColId(
                                activeMenuColId === col.id ? null : col.id,
                              )
                            }
                            className={`btn btn-ghost btn-xs p-1 rounded ${
                              activeMenuColId === col.id
                                ? "bg-base-200"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {activeMenuColId === col.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 w-36 bg-base-100 rounded-lg shadow-lg border border-base-200 z-50 py-1 flex flex-col"
                            >
                              <button
                                onClick={() => startEditing(col)}
                                className="px-3 py-2 text-left hover:bg-base-200 text-base-content flex items-center gap-2 text-sm w-full"
                              >
                                <Settings size={12} /> Renomear
                              </button>
                              <button
                                onClick={() => removeColumn(col.id)}
                                className="px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm w-full"
                              >
                                <Trash2 size={12} /> Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                </React.Fragment>
              ))}
              <th className="px-4 py-3 w-16 text-center"></th>
            </tr>
          </thead>
          <tbody className="bg-base-100">
            {filteredMissions.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 3}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-base-content/50">
                    <div className="p-4 bg-base-200 rounded-full mb-3">
                      <List size={32} className="text-base-content/30" />
                    </div>
                    <p className="font-medium text-base-content">
                      {search
                        ? "Nenhuma missão encontrada"
                        : "Sua tabela está vazia"}
                    </p>
                    <p className="text-sm mb-4 text-base-content/70">
                      {search
                        ? "Tente buscar por outro termo."
                        : "Comece adicionando missões para sua estratégia."}
                    </p>
                    {!search && (
                      <button
                        onClick={addMission}
                        className="btn btn-link text-primary"
                      >
                        Adicionar primeira missão
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {filteredMissions.map((mission) => {
              const hasSubs =
                (mission.definition?.subMissions?.length ?? 0) > 0;
              const isOpen = expanded.has(mission.id);
              return (
                <React.Fragment key={mission.id}>
                  <tr className="group hover:bg-primary/10 transition-colors">
                    <td className="px-2 py-2 text-center">
                      {hasSubs && (
                        <button
                          onClick={() => toggleExpanded(mission.id)}
                          className="btn btn-ghost btn-xs p-1"
                          title={
                            isOpen
                              ? "Ocultar sub-missões"
                              : "Mostrar sub-missões"
                          }
                        >
                          {isOpen ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      )}
                    </td>
                    {columns.map((col) => (
                      <React.Fragment key={`${mission.id}-${col.id}`}>
                        {col.id === "points" && (
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1.5">
                              {renderOwnControl(mission)}
                              {mission.definition?.requiresEquipment && (
                                <span title="Requer equipamento">
                                  <Package
                                    size={12}
                                    className="text-base-content/40"
                                  />
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-2 relative">
                          {col.readOnly && mission.definition ? (
                            <span
                              className={`font-mono text-sm ${
                                col.id === "points" && (mission.points ?? 0) > 0
                                  ? "text-success font-semibold"
                                  : "text-base-content/70"
                              }`}
                            >
                              {mission[col.id] ?? 0}
                            </span>
                          ) : col.type === "select" ? (
                            <select
                              value={mission[col.id] || ""}
                              onChange={(e) =>
                                handleCellChange(
                                  mission.id,
                                  col.id,
                                  e.target.value,
                                )
                              }
                              className="select select-ghost select-sm w-full"
                            >
                              <option value="" className="text-base-content/40">
                                Selecione...
                              </option>
                              {col.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : col.type === "number" ? (
                            <input
                              type="number"
                              value={mission[col.id] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleCellChange(
                                  mission.id,
                                  col.id,
                                  val === "" ? "" : parseFloat(val),
                                );
                              }}
                              className="input input-ghost input-sm w-full font-mono"
                              placeholder="-"
                            />
                          ) : (
                            <input
                              type="text"
                              value={mission[col.id] || ""}
                              onChange={(e) =>
                                handleCellChange(
                                  mission.id,
                                  col.id,
                                  e.target.value,
                                )
                              }
                              className={`input input-ghost input-sm w-full ${
                                col.id === "name" ? "font-semibold" : ""
                              }`}
                              placeholder="..."
                            />
                          )}
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="px-2 py-2 sticky right-0 bg-base-100 group-hover:bg-primary/10 text-center">
                      <button
                        onClick={() => removeMission(mission.id)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        title="Remover Missão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {isOpen && renderExpandedSubMissions(mission)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <ModalConfirm
        ref={modalClearColl}
        title="Excluir Coluna"
        confirmLabel="Sim"
        cancelLabel="Cancelar"
      />
    </div>
  );
};
