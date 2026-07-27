"use client";
import { useState, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/app/context/ToastContext";
import { Image, RotateCcw, Plus, Pencil, Trash2, Check, X } from "lucide-react";

type SwotItem = {
  id: string;
  text: string;
};

type QuadrantId = "strengths" | "weaknesses" | "opportunities" | "threats";

export const SWOTCanvasDefault = () => {
  const quadrants: {
    id: QuadrantId;
    label: string;
    color: [string, string, string];
  }[] = [
    {
      id: "strengths",
      label: "Forças",
      color: ["bg-success/20", "border-success", "text-success"],
    },
    {
      id: "weaknesses",
      label: "Fraquezas",
      color: ["bg-error/20", "border-error", "text-error"],
    },
    {
      id: "opportunities",
      label: "Oportunidades",
      color: ["bg-info/20", "border-info", "text-info"],
    },
    {
      id: "threats",
      label: "Ameaças",
      color: ["bg-warning/20", "border-warning", "text-warning"],
    },
  ];

  const { addToast } = useToast();

  const [swot, setSwot] = useState<Record<QuadrantId, SwotItem[]>>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });

  // texto do input principal
  const [draft, setDraft] = useState("");

  // controle de edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const quadrantsRef = useRef<HTMLDivElement>(null);

  const makeId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleAddItem = (quadrantId: QuadrantId) => {
    const text = draft.trim();
    if (!text) return;

    const newItem: SwotItem = { id: makeId(), text };
    setSwot((prev) => ({
      ...prev,
      [quadrantId]: [...prev[quadrantId], newItem],
    }));
    setDraft("");
  };

  const handleDeleteItem = (quadrantId: QuadrantId, itemId: string) => {
    setSwot((prev) => ({
      ...prev,
      [quadrantId]: prev[quadrantId].filter((i) => i.id !== itemId),
    }));
    if (editingId === itemId) {
      setEditingId(null);
      setEditingText("");
    }
  };

  const startEditing = (item: SwotItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const confirmEditing = (quadrantId: QuadrantId, itemId: string) => {
    const text = editingText.trim();
    if (!text) {
      handleDeleteItem(quadrantId, itemId);
      return;
    }
    setSwot((prev) => ({
      ...prev,
      [quadrantId]: prev[quadrantId].map((i) =>
        i.id === itemId ? { ...i, text } : i,
      ),
    }));
    setEditingId(null);
    setEditingText("");
  };

  const handleDragStart = (
    e: React.DragEvent,
    item: SwotItem,
    fromQuadrant: QuadrantId,
  ) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
    e.dataTransfer.setData("fromQuadrant", fromQuadrant);
  };

  const handleDrop = (e: React.DragEvent, targetQuadrant: QuadrantId) => {
    e.preventDefault();
    const transferData = e.dataTransfer.getData("item");
    const fromQuadrant = e.dataTransfer.getData("fromQuadrant") as QuadrantId;
    if (!transferData || !fromQuadrant) return;

    const item: SwotItem = JSON.parse(transferData);
    if (fromQuadrant === targetQuadrant) return;

    setSwot((prev) => {
      const updated = { ...prev };
      updated[fromQuadrant] = updated[fromQuadrant].filter(
        (i) => i.id !== item.id,
      );
      updated[targetQuadrant] = [...updated[targetQuadrant], item];
      return updated;
    });
  };

  const exportPNG = async () => {
    if (!quadrantsRef.current) return;

    addToast("Salvando...", "info");
    await document.fonts.ready;

    const element = quadrantsRef.current;
    const padding = 32;

    const originalStyle = {
      height: element.style.height,
      padding: element.style.padding,
    };

    element.style.height = "auto";
    element.style.padding = `${padding}px`;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    element.style.height = originalStyle.height;
    element.style.padding = originalStyle.padding;

    const link = document.createElement("a");
    link.download = `Matriz_SWOT_RoboStage_${new Date().toISOString().split("T")[0]}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    addToast("PNG salvo com sucesso!", "success");
  };

  const resetSwot = () => {
    setSwot({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
    setDraft("");
    setEditingId(null);
    setEditingText("");
    addToast("Matriz SWOT limpa!", "warning");
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-end gap-4 w-full">
        <div className="flex-1 w-full md:w-auto flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem("strengths");
            }}
            placeholder="Adicionar item..."
            className="input input-neutral w-full "
          />
          <button
            onClick={() => handleAddItem("strengths")}
            className="btn btn-neutral"
            title="Adicionar em Forças"
          >
            <Plus className="size-4 inline mr-2" />
            Adicionar
          </button>
        </div>
        <button
          onClick={exportPNG}
          className="btn btn-outline btn-success gap-2"
        >
          <Image className="size-5" />
          Exportar
        </button>

        <button onClick={resetSwot} className="btn btn-outline btn-error gap-2">
          <RotateCcw className="size-5" />
          Resetar
        </button>
      </section>

      {/* Quadrantes SWOT */}
      <div
        ref={quadrantsRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
      >
        {quadrants.map((q) => (
          <div
            key={q.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, q.id)}
            className={`relative flex flex-col rounded-lg border ${q.color[0]} ${q.color[1]} bg-base-100/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300 min-h-[220px]`}
          >
            <div className="card-body p-3 gap-3">
              <h2 className={"card-title text-black text-base " + q.color[2]}>
                {q.label}
              </h2>

              {/* lista de itens */}
              <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                {swot[q.id].length === 0 && (
                  <p className="text-xs italic text-base-content/50">
                    Nenhum item ainda.
                  </p>
                )}

                {swot[q.id].map((item) => (
                  <div
                    key={item.id}
                    draggable={editingId !== item.id}
                    onDragStart={(e) => handleDragStart(e, item, q.id)}
                    className={`flex items-center gap-2 rounded-lg bg-white shadow px-3 py-2 ${
                      editingId === item.id ? "" : "cursor-grab"
                    }`}
                  >
                    {editingId === item.id ? (
                      <>
                        <input
                          autoFocus
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              confirmEditing(q.id, item.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="input input-xs input-bordered flex-1 text-black"
                        />
                        <button
                          onClick={() => confirmEditing(q.id, item.id)}
                          className="btn btn-xs btn-square btn-success"
                          title="Confirmar"
                        >
                          <Check className="size-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="btn btn-xs btn-square btn-ghost"
                          title="Cancelar"
                        >
                          <X className="size-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-black break-words">
                          {item.text}
                        </span>
                        <button
                          onClick={() => startEditing(item)}
                          className="btn btn-xs btn-square btn-ghost"
                          title="Editar"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(q.id, item.id)}
                          className="btn btn-xs btn-square btn-ghost text-error"
                          title="Excluir"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
