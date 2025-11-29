"use client";
import React, { useState, useRef, useEffect } from "react";
import { DiagramType } from "@/types/InnoLabType";
import { useDiagram } from "@/hooks/useDiagram";
import { AVAILABLE_FONTS } from "../../constants";
import {
  ArrowLeft,
  Save,
  Download,
  Trash2,
  Copy,
  Layout,
  Fish,
  Table,
  Group,
  Ungroup,
  GitFork,
  Grid,
  Briefcase,
  Minus,
  Square,
  Circle,
  Diamond,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronDown as ChevronDownIcon,
  ArrowUpToLine,
  ArrowDownToLine,
  MousePointer2,
  Smile,
  Plus,
  BoxSelect,
  Cloud,
  Triangle,
  Hexagon,
  Star,
  Database,
  FileText,
  Activity,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
  Spline,
  MoveLeft,
  MoveRight,
} from "lucide-react";
import DiagramCanvas from "@/components/InnoLab/DiagramCanvas";
import StickerPicker from "@/components/InnoLab/StickerPicker";
import FloatingToolbar from "@/components/InnoLab/FloatingToolbar";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";

// Expanded Color Palettes
const NODE_COLORS = [
  "#ffffff", // White
  "#f8fafc", // Slate 50
  "#e2e8f0", // Slate 200
  "#fee2e2", // Red 100
  "#ffedd5", // Orange 100
  "#fef3c7", // Amber 100
  "#fef9c3", // Yellow 100
  "#ecfccb", // Lime 100
  "#dcfce7", // Green 100
  "#d1fae5", // Emerald 100
  "#ccfbf1", // Teal 100
  "#cffafe", // Cyan 100
  "#e0f2fe", // Sky 100
  "#dbeafe", // Blue 100
  "#e0e7ff", // Indigo 100
  "#ede9fe", // Violet 100
  "#f3e8ff", // Purple 100
  "#fae8ff", // Fuchsia 100
  "#fce7f3", // Pink 100
  "#ffe4e6", // Rose 100
  "transparent",
];

const TEXT_COLORS = [
  "#0f172a", // Slate 900
  "#334155", // Slate 700
  "#64748b", // Slate 500
  "#ef4444", // Red 500
  "#f97316", // Orange 500
  "#f59e0b", // Amber 500
  "#84cc16", // Lime 500
  "#22c55e", // Green 500
  "#10b981", // Emerald 500
  "#14b8a6", // Teal 500
  "#06b6d4", // Cyan 500
  "#0ea5e9", // Sky 500
  "#3b82f6", // Blue 500
  "#6366f1", // Indigo 500
  "#8b5cf6", // Violet 500
  "#a855f7", // Purple 500
  "#d946ef", // Fuchsia 500
  "#ec4899", // Pink 500
  "#f43f5e", // Rose 500
  "#ffffff", // White
];

const CONNECTION_COLORS = [
  "#94a3b8", // Slate 400
  "#1e293b", // Slate 800
  "#ef4444", // Red 500
  "#f97316", // Orange 500
  "#eab308", // Yellow 500
  "#22c55e", // Green 500
  "#14b8a6", // Teal 500
  "#06b6d4", // Cyan 500
  "#3b82f6", // Blue 500
  "#6366f1", // Indigo 500
  "#8b5cf6", // Violet 500
  "#d946ef", // Fuchsia 500
  "#ec4899", // Pink 500
  "#000000", // Black
];

// Helper to get icon for type
const getTypeIcon = (type: DiagramType) => {
  switch (type) {
    case "Mapa Mental":
      return <Layout size={14} />;
    case "Ishikawa":
      return <Fish size={14} />;
    case "5W2H":
      return <Table size={14} />;
    case "Flowchart":
      return <GitFork size={14} />;
    case "SWOT":
      return <Grid size={14} />;
    case "Business Model Canvas":
      return <Briefcase size={14} />;
    default:
      return <Layout size={14} />;
  }
};

export default function InnoLab() {
  const router = useRouter();
  const params = useParams();

  const documentId = params.id as string;
  const [idUser, setIduser] = useState("");

  const { addToast } = useToast();

  useEffect(() => {
    async function loadDocument() {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) {
        addToast("Erro ao carregar diagrama", "error");
        return;
      }

      if (!data) return;

      setDiagramName(data.title);
      setDiagramType(data.diagram_type as DiagramType);
      setIduser(data.user_id);

      const json = data.content || {};
      setInitialDiagram(
        json.nodes ?? [],
        json.connections ?? [],
        json.paths ?? []
      );

      addToast("Diagrama carregado do servidor", "success");
    }

    if (documentId) loadDocument();
  }, [documentId]);

  // States
  const [diagramType, setDiagramType] = useState<DiagramType>("Mapa Mental");
  const [diagramName, setDiagramName] = useState<string>("Untitled Project");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  // Sidebar State: 'properties' (default) or 'layers'
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "properties" | "layers"
  >("properties");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Custom Hook Logic
  const {
    nodes,
    connections,
    paths,
    setInitialDiagram,
    selectedNode,
    setSelectedNode,
    selectedNodeIds,
    setSelectedNodeIds,
    selectedConnectionId,
    zoom,
    setZoom,
    pan,
    interactionMode,
    setInteractionMode,
    selectionBox,
    selectionPath,
    isSpacePressed,
    setIsSpacePressed,
    connectingStartNodeId,
    connectionDragPos,
    draftPath,
    highlighterColor,
    setHighlighterColor,
    highlighterThickness,
    setHighlighterThickness,
    font,
    fontSize,
    fontColor,
    editingNode,
    setEditingNode,
    editText,
    setEditText,
    editPos,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel,
    handleCanvasDoubleClick,
    handleResizeStart,
    finishEditing,
    addNode,
    addZone,
    removeNode,
    duplicateNode,
    groupNodes,
    ungroupNodes,
    updateSelectedNodeColor,
    updateSelectedNodeTextColor,
    updateSelectedNodeShape,
    updateSelectedNodeStyle,
    updateConnection,
    loadTemplateNodes,
    undo,
    redo,
    canUndo,
    canRedo,
    // Layer helpers
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
    toggleLock,
    toggleVisibility,
  } = useDiagram(diagramType);

  // Initial Setup & Load
  useEffect(() => {
    const saved = localStorage.getItem("innolab_saved_diagram");
    if (saved) {
      setHasSavedData(true);
    }
  }, []);

  useEffect(() => {
    if (selectedNode || selectedConnectionId) {
      setIsSidebarOpen(true);
      setActiveSidebarTab("properties");
    } else if (activeSidebarTab !== "layers") {
      // Close if nothing selected and not specifically in layers mode
      setIsSidebarOpen(false);
    }
  }, [selectedNode, selectedConnectionId]);

  const handleSave = async () => {
    const content = {
      nodes,
      connections,
      paths,
    };

    const { error } = await supabase.from("documents").upsert({
      id: documentId,
      title: diagramName,
      diagram_type: diagramType,
      content,
      user_id: idUser,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      addToast("Erro ao salvar no servidor", "error");
      console.error("Supabase Save Error:", error);
    } else {
      addToast("Salvo no Supabase com sucesso!", "success");
    }
  };

  const handleLoad = () => {
    const saved = localStorage.getItem("innolab_saved_diagram");
    if (saved) {
      const data = JSON.parse(saved);
      setDiagramName(data.name);
      setDiagramType(data.type);
      setInitialDiagram(data.nodes, data.connections, data.paths || []);
      addToast("Diagram loaded", "success");
    }
  };

  const handleExport = () => {
    const svg = document.getElementById("diagram-svg");
    if (!svg) return;

    addToast("Generating PNG...", "info");

    const clone = svg.cloneNode(true) as SVGElement;

    const fos = clone.querySelectorAll("foreignObject");
    fos.forEach((fo) => {
      const div = fo.querySelector("div");
      if (div) {
        div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      }
    });

    // Collect and Embed Styles
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );
    let cssText = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&display=swap');
        .glass-panel { display: none; }
      `;

    // Attempt to grab Tailwind styles from the document
    // This helps ensure the exported SVG looks like the app
    Array.from(document.querySelectorAll("style")).forEach((tag) => {
      cssText += tag.innerHTML;
    });

    style.textContent = cssText;
    clone.insertBefore(style, clone.firstChild);

    const svgData = new XMLSerializer().serializeToString(clone);
    // Use encodeURIComponent to handle utf-8 characters properly
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      svgData
    )}`;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const rect = svg.getBoundingClientRect();
      // Use higher scale for crisp text
      const scale = 2;

      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(scale, scale);
        // Draw white background since PNG supports transparency but diagrams usually want a background
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, rect.width, rect.height);

        try {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);

          const png = canvas.toDataURL("image/png");

          const a = document.createElement("a");
          a.href = png;
          a.download = `${diagramName || "diagram"}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addToast("PNG exportado com sucesso!", "success");
        } catch (e) {
          console.warn(
            "Canvas contaminado detectado ou erro de renderização. Revertendo para download SVG.",
            e
          );
          const a = document.createElement("a");
          a.href = svgUrl;
          a.download = `${diagramName || "diagram"}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addToast(
            "Exportando como SVG devido à segurança do navegador",
            "info"
          );
        }
      }
    };

    img.onerror = () => {
      addToast("Erro ao gerar a imagem de exportação.", "error");
    };

    img.src = svgUrl;
  };

  const handleAddTextNode = () => {
    addNode({
      color: "transparent",
      text: "Type something",
      type: "text",
      textColor: "#334155",
      locked: false,
      fontSize: 20,
      fontWeight: "normal",
      textAlign: "left",
    });
  };

  const handleAddSticker = (content: string, type: "emoji" | "image") => {
    if (type === "image") {
      addNode({
        color: "transparent",
        text: "",
        type: "sticker",
        shape: "rect",
        width: 150,
        height: 150,
        backgroundImage: content, // Base64 string
      });
    } else {
      addNode({
        color: "transparent",
        text: content,
        type: "sticker",
        shape: "rect",
        width: 80,
        height: 80,
        fontSize: 64,
      });
    }
  };

  const toggleLayersPanel = () => {
    if (isSidebarOpen && activeSidebarTab === "layers") {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setActiveSidebarTab("layers");
    }
  };

  const currentConnection = selectedConnectionId
    ? connections.find((c) => c.id === selectedConnectionId)
    : null;

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <main className="w-full h-screen overflow-hidden flex flex-col bg-[#f8fafc] font-sans text-slate-800 relative selection:bg-indigo-100">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
      radial-gradient(circle, #94a3b8 1px, transparent 1px)
    `,
          backgroundSize: `20px 20px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          opacity: 0.3,
        }}
      />

      {/* --- Header --- */}
      <header className="absolute top-4 left-0 right-0 z-20 px-6 h-16 flex items-center justify-between pointer-events-none max-w-4xl ml-auto">
        {/* CENTER SECTION */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="backdrop-blur bg-base-100/80 border border-base-300 shadow-xl shadow-primary/5 px-2 py-1.5 rounded-full flex items-center gap-1">
            <button
              onClick={() => {
                handleSave();
                router.push("/dashboard");
              }}
              title="Voltar para a Dashboard"
              className="btn btn-sm btn-ghost"
            >
              <ArrowLeft size={20} />
            </button>
            {/* TYPE DROPDOWN LABEL */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {getTypeIcon(diagramType)}
                <span className="hidden sm:block">{diagramType}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-base-300 mx-1"></div>

            {/* TITLE INPUT */}
            <input
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="bg-transparent font-bold text-base-content text-sm px-3 w-32 sm:w-56 text-center outline-none focus:bg-base-100 focus:ring-2 focus:ring-primary/20 rounded-lg transition-all placeholder:text-base-content/40 py-1"
              placeholder="Diagrama sem título"
            />

            {/* Divider */}
            <div className="w-px h-4 bg-base-300 mx-1"></div>

            {/* STATUS ICON */}
            <div
              className="px-2 flex items-center justify-center w-8 h-8"
              title={hasSavedData ? "Salvo" : "Mudanças não salvas"}
            >
              {hasSavedData ? (
                <Cloud
                  size={16}
                  className="text-success animate-in zoom-in duration-300"
                />
              ) : (
                <div className="w-2 h-2 bg-base-content/40 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl p-2 bg-base-100/80 backdrop-blur border border-base-300 shadow">
          {/* UNDO / REDO */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="btn btn-square btn-ghost btn-sm text-base-content disabled:opacity-50 disabled:cursor-not-allowed"
              title="Desfazer"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="btn btn-square btn-ghost btn-sm text-base-content disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refazer"
            >
              <Redo2 size={18} />
            </button>
          </div>

          {/* ZOOM */}
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
              className="btn btn-square btn-ghost btn-sm"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.1, 0.1))}
              className="btn btn-square btn-ghost btn-sm"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
          </div>

          {/* RELOAD LAST SAVE */}
          {hasSavedData && (
            <button
              onClick={handleLoad}
              className="btn btn-square btn-ghost btn-sm text-base-content/70"
              title="Recarregar último salvamento"
            >
              <RefreshCw size={18} />
            </button>
          )}

          {/* SAVE */}
          <button
            onClick={handleSave}
            className="btn btn-square btn-ghost btn-sm relative"
            title="Salvar diagrama"
          >
            <Save size={18} />
            {!hasSavedData && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></span>
            )}
          </button>

          {/* EXPORT */}
          <button
            onClick={handleExport}
            className="btn btn-square btn-ghost btn-sm"
            title="Exportar como PNG"
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      {/* Left Toolbar */}
      <FloatingToolbar
        onAddNode={() => addNode()}
        onAddText={handleAddTextNode}
        onAddSticker={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
        onAddZone={addZone}
        onRemoveNode={removeNode}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
        isStickerPickerOpen={isStickerPickerOpen}
        onToggleLayers={toggleLayersPanel}
        isLayersOpen={isSidebarOpen && activeSidebarTab === "layers"}
        highlighterColor={highlighterColor}
        setHighlighterColor={setHighlighterColor}
        highlighterThickness={highlighterThickness}
        setHighlighterThickness={setHighlighterThickness}
      />

      <StickerPicker
        isOpen={isStickerPickerOpen}
        onClose={() => setIsStickerPickerOpen(false)}
        onSelect={handleAddSticker}
      />

      {/* Right Sidebar (Properties & Layers) */}
      <aside
        className={`absolute right-4 top-24 bottom-6 w-80 rounded-3xl shadow-xl bg-base-100 border border-base-300 z-30 transition-all duration-300 overflow-hidden flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        {/* HEADER COM TABS DAISYUI */}
        <div className="p-4 border-b border-base-300 bg-base-100">
          <div role="tablist" className="tabs tabs-box w-full">
            <button
              role="tab"
              className={`tab flex-1 ${
                activeSidebarTab === "properties" ? "tab-active" : ""
              }`}
              onClick={() => setActiveSidebarTab("properties")}
            >
              Propriedades
            </button>
            <button
              role="tab"
              className={`tab flex-1 ${
                activeSidebarTab === "layers" ? "tab-active" : ""
              }`}
              onClick={() => setActiveSidebarTab("layers")}
            >
              Camadas
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ================= PROPRIEDADES ================= */}
          {activeSidebarTab === "properties" && (
            <>
              {/* Nenhum item selecionado */}
              {!selectedNodeIds.size && !selectedConnectionId && (
                <div className="flex flex-col items-center justify-center h-60 text-base-content/40">
                  <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center shadow-inner mb-4">
                    <MousePointer2 size={24} />
                  </div>
                  <p className="text-sm font-medium">Nenhum Item Selecionado</p>
                  <p className="text-xs opacity-60 mt-1 text-center">
                    Clique em um item para editar suas propriedades.
                  </p>
                </div>
              )}

              {/* PROPRIEDADES DE CONEXÃO */}
              {selectedConnectionId && currentConnection && (
                <div className="space-y-6">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <GitFork size={15} className="text-primary" />
                    Configurações da Conexão
                  </h3>

                  {/* CORES DA LINHA */}
                  <div className="card bg-base-200 p-4 space-y-3 border border-base-300">
                    <span className="text-[11px] tracking-widest font-bold text-base-content/60">
                      Cor
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {CONNECTION_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            updateConnection(currentConnection.id, { color: c })
                          }
                          className={`w-8 h-8 rounded-full ring-offset-2 transition-all ${
                            currentConnection.color === c
                              ? "ring-2 ring-primary scale-110 shadow"
                              : "ring-0 hover:ring-1 hover:ring-primary/40"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ESPESSURA */}
                  <div className="card bg-base-200 p-4 border border-base-300">
                    <span className="text-[11px] tracking-widest font-bold text-base-content/60">
                      Espessura ({currentConnection.thickness}px)
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={currentConnection.thickness}
                      onChange={(e) =>
                        updateConnection(currentConnection.id, {
                          thickness: parseInt(e.target.value),
                        })
                      }
                      className="range range-primary mt-2"
                    />
                  </div>

                  {/* ESTILO */}
                  <div className="card bg-base-200 p-4 border border-base-300 space-y-2">
                    <span className="text-[11px] tracking-widest font-bold text-base-content/60">
                      Estilo da Conexão
                    </span>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {(["solid", "dashed", "dotted"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            updateConnection(currentConnection.id, { style: s })
                          }
                          className={`btn btn-sm ${
                            currentConnection.style === s
                              ? "btn-primary"
                              : "btn-ghost border-base-300"
                          }`}
                        >
                          <div
                            className="w-5 h-1 border-base-content"
                            style={{
                              borderTop:
                                s === "solid"
                                  ? "2px solid"
                                  : s === "dashed"
                                  ? "2px dashed"
                                  : "2px dotted",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] tracking-widest font-bold text-base-content/60">
                      Tipo de Curva
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["straight", "curved", "step"] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            updateConnection(currentConnection.id, {
                              shape: c,
                            })
                          }
                          className={`btn btn-sm ${
                            currentConnection.shape === c
                              ? "btn-primary"
                              : "btn-ghost border-base-300"
                          }`}
                        >
                          {c === "straight" && <Minus size={16} />}
                          {c === "curved" && <Spline size={16} />}
                          {c === "step" && <BoxSelect size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="card bg-base-200 p-4 border border-base-300 space-y-2">
                    <span className="text-[11px] tracking-widest font-bold text-base-content/60">
                      Tipo de Ponta - Esquerda
                    </span>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {(["none", "arrow", "circle"] as const).map((e) => (
                        <button
                          key={e}
                          onClick={() =>
                            updateConnection(currentConnection.id, {
                              endMarker: e,
                            })
                          }
                          className={`btn btn-sm ${
                            currentConnection.endMarker === e
                              ? "btn-primary"
                              : "btn-ghost border-base-300"
                          }`}
                        >
                          {e === "none" && <Minus size={16} />}
                          {e === "arrow" && <MoveLeft size={16} />}
                          {e === "circle" && <Circle size={8} />}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] tracking-widest font-bold text-base-content/60">
                      Tipo de Ponta - Direita
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["none", "arrow", "circle"] as const).map((e) => (
                        <button
                          key={e}
                          onClick={() =>
                            updateConnection(currentConnection.id, {
                              startMarker: e,
                            })
                          }
                          className={`btn btn-sm ${
                            currentConnection.startMarker === e
                              ? "btn-primary"
                              : "btn-ghost border-base-300"
                          }`}
                        >
                          {e === "none" && <Minus size={16} />}
                          {e === "arrow" && <MoveRight size={16} />}
                          {e === "circle" && <Circle size={8} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ANIMAÇÃO */}
                  <button
                    onClick={() =>
                      updateConnection(currentConnection.id, {
                        animated: !currentConnection.animated,
                      })
                    }
                    className={`btn w-full ${
                      currentConnection.animated ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    <Activity size={16} />
                    <span>Animação</span>
                  </button>

                  <button
                    onClick={removeNode}
                    className="btn btn-error btn-outline w-full"
                  >
                    <Trash2 size={16} /> Remover Conexão
                  </button>
                </div>
              )}

              {/* PROPRIEDADES DE NÓ */}
              {selectedNodeIds.size > 0 && selectedNodeData && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Square size={15} className="text-primary" />
                    Propriedades do Elemento
                  </h3>

                  {/* CORES */}
                  <div className="card bg-base-200 p-4 border border-base-300">
                    <span className="text-[11px] tracking-widest font-bold opacity-60">
                      Cor de Fundo
                    </span>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {NODE_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateSelectedNodeColor(c)}
                          className={`w-7 h-7 rounded-full border transition-all ${
                            selectedNodeData.color === c
                              ? "ring-2 ring-primary scale-110 shadow"
                              : "hover:ring-1 hover:ring-primary/30"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] tracking-widest font-bold opacity-60 mt-4 block">
                      Cor do Texto
                    </span>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateSelectedNodeTextColor(c)}
                          className={`w-7 h-7 rounded-full border transition-all ${
                            selectedNodeData.textColor === c
                              ? "ring-2 ring-primary scale-110 shadow"
                              : "hover:ring-1 hover:ring-primary/30"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* TEXTO */}
                  <div className="card bg-base-200 p-4 border border-base-300 space-y-3">
                    <span className="text-[11px] tracking-widest font-bold opacity-60">
                      Texto
                    </span>

                    {/* FONTE */}
                    <div className="w-full flex items-center gap-2">
                      <select
                        value={selectedNodeData.fontFamily || "Inter"}
                        onChange={(e) =>
                          updateSelectedNodeStyle({
                            fontFamily: e.target.value,
                          })
                        }
                        className="select select-sm w-full bg-base-100 border border-base-300"
                      >
                        {AVAILABLE_FONTS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      {/* TAMANHO DA FONTE */}
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() =>
                            updateSelectedNodeStyle({
                              fontSize: Math.max(
                                8,
                                (selectedNodeData.fontSize || 14) - 2
                              ),
                            })
                          }
                          className="btn btn-sm"
                        >
                          <Minus size={12} />
                        </button>

                        <span className="font-bold text-sm text-center text-base-content">
                          {selectedNodeData.fontSize || 14}
                        </span>

                        <button
                          onClick={() =>
                            updateSelectedNodeStyle({
                              fontSize: Math.min(
                                72,
                                (selectedNodeData.fontSize || 14) + 2
                              ),
                            })
                          }
                          className="btn btn-sm"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* ALINHAMENTO */}
                    <div className="flex gap-2">
                      {[
                        { val: "left", icon: AlignLeft },
                        { val: "center", icon: AlignCenter },
                        { val: "right", icon: AlignRight },
                      ].map(({ val, icon: Icon }) => (
                        <button
                          key={val}
                          onClick={() =>
                            updateSelectedNodeStyle({
                              textAlign: val as any,
                            })
                          }
                          className={`btn btn-sm flex-1 ${
                            selectedNodeData.textAlign === val
                              ? "btn-primary"
                              : "btn-ghost"
                          }`}
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>

                    {/* ESTILO */}
                    <div className="flex gap-2">
                      {[
                        {
                          key: "bold",
                          icon: Bold,
                          prop: "fontWeight",
                          val: "bold",
                        },
                        {
                          key: "italic",
                          icon: Italic,
                          prop: "fontStyle",
                          val: "italic",
                        },
                        {
                          key: "underline",
                          icon: Underline,
                          prop: "textDecoration",
                          val: "underline",
                        },
                      ].map(({ key, icon: Icon, prop, val }) => {
                        const active =
                          selectedNodeData[
                            prop as keyof typeof selectedNodeData
                          ] === val;
                        return (
                          <button
                            key={key}
                            onClick={() =>
                              updateSelectedNodeStyle({
                                [prop]: active ? "normal" : val,
                              })
                            }
                            className={`btn btn-sm flex-1 ${
                              active ? "btn-primary" : "btn-ghost"
                            }`}
                          >
                            <Icon size={14} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SHAPE */}
                  <div className="card bg-base-200 p-4 border border-base-300 space-y-3">
                    <span className="text-[11px] tracking-widest font-bold opacity-60">
                      Forma
                    </span>

                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: "rect", icon: Square },
                        { id: "circle", icon: Circle },
                        { id: "diamond", icon: Diamond },
                        {
                          id: "pill",
                          icon: Minus,
                          className: "w-5 h-3 rounded-full bg-current",
                        },
                        { id: "triangle", icon: Triangle },
                        { id: "hexagon", icon: Hexagon },
                        { id: "star", icon: Star },
                        { id: "cloud", icon: Cloud },
                        { id: "cylinder", icon: Database },
                        { id: "document", icon: FileText },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => updateSelectedNodeShape(s.id as any)}
                          className={`btn btn-sm ${
                            selectedNodeData.shape === s.id
                              ? "btn-primary"
                              : "btn-ghost border-base-300"
                          } flex flex-col items-center justify-center gap-1`}
                        >
                          <s.icon size={14} className={s.className} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BORDA */}
                  <div className="card bg-base-200 p-4 border border-base-300 space-y-2">
                    <span className="text-[11px] tracking-widest font-bold opacity-60">
                      Borda
                    </span>

                    <span className="text-[11px] tracking-widest font-bold opacity-60">
                      Cor da borda
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {NODE_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            updateSelectedNodeStyle({ borderColor: c })
                          }
                          className={`w-7 h-7 rounded-full border border-base-100 transition-all ${
                            selectedNodeData.borderColor === c
                              ? "ring-2 ring-primary scale-110 shadow"
                              : "hover:ring-1 hover:ring-primary/30"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] tracking-widest font-bold opacity-60 mt-4 block">
                      Espessura da borda ({selectedNodeData.borderWidth || 1}px)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={selectedNodeData.borderWidth || 1}
                      onChange={(e) =>
                        updateSelectedNodeStyle({
                          borderWidth: parseInt(e.target.value),
                        })
                      }
                      className="range range-primary mt-2 range-sm"
                    />

                    <span className="text-[11px] tracking-widest font-bold opacity-60 mt-4 block">
                      Estilo da borda
                    </span>

                    <div className="grid grid-cols-4 gap-2">
                      {(["none", "solid", "dashed", "dotted"] as const).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() =>
                              updateSelectedNodeStyle({ borderStyle: s })
                            }
                            className={`btn btn-sm ${
                              selectedNodeData.borderStyle === s
                                ? "btn-primary"
                                : "btn-ghost border-base-300"
                            }`}
                          >
                            {s === "none" ? (
                              <Minus size={10} />
                            ) : (
                              <div
                                className="w-5 h-1 border-base-content"
                                style={{
                                  borderTop:
                                    s === "solid"
                                      ? "2px solid"
                                      : s === "dashed"
                                      ? "2px dashed"
                                      : "2px dotted",
                                }}
                              />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => selectedNode && bringToFront(selectedNode)}
                      className="btn btn-outline btn-sm"
                    >
                      <ArrowUpToLine size={12} /> Frente
                    </button>

                    <button
                      onClick={() => selectedNode && sendToBack(selectedNode)}
                      className="btn btn-outline btn-sm"
                    >
                      <ArrowDownToLine size={12} /> Trás
                    </button>

                    <button
                      onClick={duplicateNode}
                      className="btn btn-outline btn-sm"
                    >
                      <Copy size={12} /> Duplicar
                    </button>

                    {selectedNodeData.groupId ? (
                      <button
                        onClick={ungroupNodes}
                        className="btn btn-outline btn-sm"
                      >
                        <Ungroup size={12} /> Desagrupar
                      </button>
                    ) : (
                      <button
                        onClick={groupNodes}
                        className="btn btn-outline btn-sm"
                      >
                        <Group size={12} /> Agrupar
                      </button>
                    )}
                  </div>

                  <button
                    onClick={removeNode}
                    className="btn btn-error btn-outline w-full"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================= CAMADAS ================= */}
          {activeSidebarTab === "layers" && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold opacity-40 tracking-widest px-1">
                {nodes.length} ITEM{nodes.length !== 1 ? "S" : ""}
              </div>

              {nodes
                .slice()
                .reverse()
                .map((node) => {
                  const isSelected = selectedNodeIds.has(node.id);
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`card p-3 bg-base-100 border transition cursor-pointer ${
                        isSelected
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-base-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Ícone */}
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "bg-base-200 text-base-content/40"
                          }`}
                        >
                          {node.type === "text" ? (
                            <Type size={14} />
                          ) : node.type === "sticker" ? (
                            <Smile size={14} />
                          ) : node.type === "zone" ? (
                            <BoxSelect size={14} />
                          ) : (
                            <Square size={14} />
                          )}
                        </div>

                        {/* NOME */}
                        <div className="flex-1">
                          <p className="font-medium text-xs truncate">
                            {node.text || node.type || "Node"}
                          </p>
                          <span className="text-[10px] opacity-50 capitalize">
                            {node.type}
                          </span>
                        </div>

                        {/* AÇÕES */}
                        <div className="flex gap-1 opacity-60 hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock(node.id);
                            }}
                            className="btn btn-xs btn-ghost"
                          >
                            {node.locked ? (
                              <Lock size={10} />
                            ) : (
                              <Unlock size={10} />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(node.id);
                            }}
                            className="btn btn-xs btn-ghost"
                          >
                            {node.hidden ? (
                              <EyeOff size={10} />
                            ) : (
                              <Eye size={10} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {nodes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 opacity-40">
                  <Layers size={30} />
                  <p className="text-xs mt-2">Seu diagrama está vazio</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 relative z-10">
        <DiagramCanvas
          nodes={nodes}
          connections={connections}
          paths={paths}
          selectedNodeId={selectedNode}
          selectedNodeIds={selectedNodeIds}
          selectedConnectionId={selectedConnectionId}
          zoom={zoom}
          pan={pan}
          selectionBox={selectionBox}
          selectionPath={selectionPath}
          font={font}
          fontSize={fontSize}
          fontColor={fontColor}
          diagramType={diagramType}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleCanvasWheel}
          onDoubleClick={handleCanvasDoubleClick}
          editingNode={editingNode}
          editText={editText}
          setEditText={setEditText}
          setEditingNode={setEditingNode}
          editPos={editPos}
          onFinishEditing={finishEditing}
          onResizeStart={handleResizeStart}
          isSpacePressed={isSpacePressed}
          setIsSpacePressed={setIsSpacePressed}
          connectingStartNodeId={connectingStartNodeId}
          connectionDragPos={connectionDragPos}
          draftPath={draftPath}
          highlighterColor={highlighterColor}
          highlighterThickness={highlighterThickness}
        />
      </div>
    </main>
  );
}
