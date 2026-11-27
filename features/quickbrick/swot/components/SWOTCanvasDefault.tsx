"use client";
import { useState, useRef } from "react";
import { useChangeNotifier } from "@/lib/hooks/useChangeNotifier";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/components/providers/ToastContext";
import { Image, RotateCcw, Plus, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import { IconButton, ToolBadge, ToolButton, ToolInput, ToolScope, Toolbar, ToolbarGroup, ToolbarSpacer, cn } from "@/components/stage";

type SwotItem = {
  id: string;
  text: string;
};

type QuadrantId = "strengths" | "weaknesses" | "opportunities" | "threats";

export type SwotDefaultState = Record<QuadrantId, SwotItem[]>;

export const SWOTCanvasDefault = ({
  initialSwot,
  onSwotChange,
}: {
  /** Estado salvo (caderno do QuickBrick Studio). */
  initialSwot?: Partial<SwotDefaultState>;
  /** Avisado a cada mudança — usado para salvar no banco. */
  onSwotChange?: (swot: SwotDefaultState) => void;
} = {}) => {
  const quadrants: { id: QuadrantId; letter: string; label: string; hint: string; bar: string; chip: string }[] = [
    { id: "strengths", letter: "S", label: "Forças", hint: "Interno · ajuda", bar: "border-t-success", chip: "bg-success text-success-content" },
    { id: "weaknesses", letter: "W", label: "Fraquezas", hint: "Interno · atrapalha", bar: "border-t-error", chip: "bg-error text-error-content" },
    { id: "opportunities", letter: "O", label: "Oportunidades", hint: "Externo · ajuda", bar: "border-t-info", chip: "bg-info text-info-content" },
    { id: "threats", letter: "T", label: "Ameaças", hint: "Externo · atrapalha", bar: "border-t-warning", chip: "bg-warning text-warning-content" },
  ];

  const { addToast } = useToast();

  const [swot, setSwot] = useState<Record<QuadrantId, SwotItem[]>>(() => ({
    strengths: initialSwot?.strengths ?? [],
    weaknesses: initialSwot?.weaknesses ?? [],
    opportunities: initialSwot?.opportunities ?? [],
    threats: initialSwot?.threats ?? [],
  }));
  useChangeNotifier(swot, onSwotChange);

  // texto do campo de cada quadrante
  const [drafts, setDrafts] = useState<Record<QuadrantId, string>>({ strengths: "", weaknesses: "", opportunities: "", threats: "" });
  const [dragOver, setDragOver] = useState<QuadrantId | null>(null);

  // controle de edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const quadrantsRef = useRef<HTMLDivElement>(null);

  const makeId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleAddItem = (quadrantId: QuadrantId) => {
    const text = drafts[quadrantId].trim();
    if (!text) return;

    const newItem: SwotItem = { id: makeId(), text };
    setSwot((prev) => ({
      ...prev,
      [quadrantId]: [...prev[quadrantId], newItem],
    }));
    setDrafts((d) => ({ ...d, [quadrantId]: "" }));
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
    setDragOver(null);
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
    setDrafts({ strengths: "", weaknesses: "", opportunities: "", threats: "" });
    setEditingId(null);
    setEditingText("");
    addToast("Matriz SWOT limpa!", "warning");
  };

  const total = swot.strengths.length + swot.weaknesses.length + swot.opportunities.length + swot.threats.length;

  return (
    <ToolScope className="overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300">
      <Toolbar label="Ações da matriz SWOT" className="px-3">
        <ToolbarGroup>
          <span className="px-1 text-[13px] font-bold">Matriz SWOT</span>
          <ToolBadge>{total} itens</ToolBadge>
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarGroup>
          <ToolButton variant="ghost" icon={<RotateCcw />} onClick={resetSwot}>
            Resetar
          </ToolButton>
          <ToolButton variant="primary" icon={<Image />} onClick={exportPNG}>
            Exportar PNG
          </ToolButton>
        </ToolbarGroup>
      </Toolbar>

      <div ref={quadrantsRef} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
        {quadrants.map((q) => (
          <section
            key={q.id}
            aria-label={q.label}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOver !== q.id) setDragOver(q.id);
            }}
            onDragLeave={() => setDragOver((d) => (d === q.id ? null : d))}
            onDrop={(e) => handleDrop(e, q.id)}
            className={cn(
              "flex min-h-[240px] flex-col overflow-hidden rounded-lg border border-t-[3px] border-base-300 bg-base-100 transition-shadow",
              q.bar,
              dragOver === q.id && "ring-2 ring-primary/40",
            )}
          >
            <header className="flex items-center justify-between gap-2 border-b border-base-300 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={cn("grid size-7 place-items-center rounded-tl-md rounded-br-md font-mono text-sm font-bold", q.chip)}>{q.letter}</span>
                <div>
                  <h3 className="text-[13px] font-bold leading-tight">{q.label}</h3>
                  <p className="text-[11px] leading-tight text-base-content/50">{q.hint}</p>
                </div>
              </div>
              <ToolBadge className="font-mono">{swot[q.id].length}</ToolBadge>
            </header>

            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
              {swot[q.id].length === 0 && (
                <p className="rounded-md border border-dashed border-base-300 px-3 py-4 text-center text-xs text-base-content/45">
                  Nenhum item ainda. Escreva abaixo ou arraste de outro quadrante.
                </p>
              )}

              {swot[q.id].map((item) => (
                <div
                  key={item.id}
                  draggable={editingId !== item.id}
                  onDragStart={(e) => handleDragStart(e, item, q.id)}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-md border border-base-300 bg-base-100 py-1 pl-1.5 pr-1 shadow-sm",
                    editingId !== item.id && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  {editingId === item.id ? (
                    <>
                      <ToolInput
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEditing(q.id, item.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="h-7"
                      />
                      <IconButton label="Confirmar" icon={<Check />} size="xs" variant="primary" onClick={() => confirmEditing(q.id, item.id)} />
                      <IconButton label="Cancelar" icon={<X />} size="xs" onClick={cancelEditing} />
                    </>
                  ) : (
                    <>
                      <GripVertical className="size-3.5 shrink-0 text-base-content/30" aria-hidden="true" />
                      <span className="flex-1 break-words text-[13px]">{item.text}</span>
                      <span className="flex opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <IconButton label="Editar" icon={<Pencil />} size="xs" onClick={() => startEditing(item)} />
                        <IconButton label="Excluir" icon={<Trash2 />} size="xs" variant="danger" onClick={() => handleDeleteItem(q.id, item.id)} />
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <form
              data-html2canvas-ignore
              className="flex items-center gap-1.5 border-t border-base-300 bg-base-200/40 px-3 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItem(q.id);
              }}
            >
              <ToolInput
                value={drafts[q.id]}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                placeholder={`+ Adicionar em ${q.label}`}
                aria-label={`Adicionar item em ${q.label}`}
              />
              <IconButton type="submit" label={`Adicionar em ${q.label}`} icon={<Plus />} variant="primary" disabled={!drafts[q.id].trim()} />
            </form>
          </section>
        ))}
      </div>
    </ToolScope>
  );
};
