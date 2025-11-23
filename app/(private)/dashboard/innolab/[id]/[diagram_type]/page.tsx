"use client";
import React, { useState, useRef, useEffect } from "react";
import { DiagramType } from "@/types/InnoLabType";
import { useDiagram } from "@/hooks/useDiagram";
import { DIAGRAM_TYPES, AVAILABLE_FONTS } from "../../constants";
import {
  ArrowLeft,
  Save,
  Share2,
  Download,
  Trash2,
  Copy,
  Palette,
  ChevronDown,
  Check,
  Layout,
  Fish,
  Table,
  Group,
  Ungroup,
  GitFork,
  Grid,
  Briefcase,
  Minus,
  MoreHorizontal,
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
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ArrowUpToLine,
  ArrowDownToLine,
  MousePointer2,
  Smile,
  Plus,
  BoxSelect,
  Cloud,
  Home,
  Triangle,
  Hexagon,
  Star,
  Database,
  FileText,
  Spline,
  Activity,
  ArrowRight,
  MoveHorizontal,
  CornerDownRight,
  Frame,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import DiagramCanvas from "@/components/InnoLab/DiagramCanvas";
import StickerPicker from "@/components/InnoLab/StickerPicker";
import FloatingToolbar from "@/components/InnoLab/FloatingToolbar";

// Simulating the Next.js hooks for standalone preview
const useRouter = () => ({
  push: (path: string) => console.log("Navigate to", path),
});
const useParams = () => ({ id: "demo-1", diagram_type: "Mind Map" });
const useToast = () => {
  return {
    addToast: (msg: string, type: "success" | "error" | "info") => {
      console.log(`[${type.toUpperCase()}] ${msg}`);
      if (typeof document !== "undefined") {
        const div = document.createElement("div");
        div.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg z-50 animate-in slide-in-from-bottom-5 fade-in ${
          type === "error"
            ? "bg-red-500"
            : type === "success"
            ? "bg-green-500"
            : "bg-slate-700"
        }`;
        div.innerText = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
      }
    },
  };
};

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
  const { addToast } = useToast();

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

  // Open sidebar if something is selected, defaulting to properties
  useEffect(() => {
    if (selectedNode || selectedConnectionId) {
      setIsSidebarOpen(true);
      setActiveSidebarTab("properties");
    } else if (activeSidebarTab !== "layers") {
      // Close if nothing selected and not specifically in layers mode
      setIsSidebarOpen(false);
    }
  }, [selectedNode, selectedConnectionId]);

  const handleSave = () => {
    const data = {
      nodes,
      connections,
      paths,
      type: diagramType,
      name: diagramName,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("innolab_saved_diagram", JSON.stringify(data));
    setHasSavedData(true);
    addToast("Diagram saved successfully", "success");
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

    // Clone to modify for export without affecting DOM
    const clone = svg.cloneNode(true) as SVGElement;

    // Fix foreignObjects for proper rendering in Image
    const fos = clone.querySelectorAll("foreignObject");
    fos.forEach((fo) => {
      const div = fo.querySelector("div");
      if (div) {
        // Browsers need the XHTML namespace on the root element inside foreignObject
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
          addToast("PNG Exported successfully!", "success");
        } catch (e) {
          console.warn(
            "Tainted canvas detected or render error. Falling back to SVG download.",
            e
          );
          // Fallback to SVG download if canvas fails
          const a = document.createElement("a");
          a.href = svgUrl;
          a.download = `${diagramName || "diagram"}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addToast("Exported as SVG due to browser security", "info");
        }
      }
    };

    img.onerror = () => {
      addToast("Error generating export image.", "error");
    };

    img.src = svgUrl;
  };

  const handleTypeChange = (type: DiagramType) => {
    setDiagramType(type);
    setIsTypeDropdownOpen(false);
    loadTemplateNodes(type);
    addToast(`Switched to ${type}`, "info");
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
          backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
          backgroundSize: `20px 20px`,
          opacity: 0.3,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* --- Header --- */}
      <header className="absolute top-4 left-0 right-0 h-16 z-20 flex justify-between items-start px-6 pointer-events-none">
        {/* Left: Back & Brand */}
        <div className="pointer-events-auto flex items-center gap-3 ml-16">
          <button
            onClick={() => router.push("/dashboard")}
            className="glass-panel p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group"
            title="Back to Dashboard"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
        </div>

        {/* Center: Centralized Navbar */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-auto flex flex-col items-center z-30">
          <div className="glass-panel px-1.5 py-1.5 rounded-full flex items-center shadow-xl shadow-indigo-500/5 border border-white/80 gap-1 backdrop-blur-xl">
            {/* Type Badge / Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-full text-xs font-bold transition-all border border-transparent hover:border-indigo-100 group"
              >
                {getTypeIcon(diagramType)}
                <span className="hidden sm:block">{diagramType}</span>
                <ChevronDown
                  size={12}
                  className="opacity-50 group-hover:opacity-100 transition-opacity"
                />
              </button>

              {/* Dropdown */}
              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 glass-panel rounded-2xl p-1.5 shadow-xl animate-in fade-in zoom-in duration-100 flex flex-col gap-1 z-50 border border-white/60">
                  {DIAGRAM_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={`flex items-center gap-3 p-2 rounded-xl text-xs font-medium text-left transition-all ${
                        diagramType === t
                          ? "bg-indigo-50 text-indigo-600"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg ${
                          diagramType === t
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {getTypeIcon(t)}
                      </div>
                      {t}
                      {diagramType === t && (
                        <Check size={12} className="ml-auto text-indigo-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            {/* Title Input */}
            <input
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="bg-transparent font-bold text-slate-700 text-sm px-3 w-32 sm:w-56 text-center outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-lg transition-all placeholder:text-slate-300 py-1"
              placeholder="Untitled Diagram"
            />

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            {/* Status Icon */}
            <div
              className="px-2 text-slate-400 flex items-center justify-center w-8 h-8"
              title={hasSavedData ? "Saved locally" : "Unsaved changes"}
            >
              {hasSavedData ? (
                <Cloud
                  size={16}
                  className="text-emerald-500 animate-in zoom-in duration-300"
                />
              ) : (
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="pointer-events-auto glass-panel p-1.5 rounded-2xl flex items-center gap-1 shadow-lg shadow-slate-200/50 border border-white/50">
          {/* History Tools */}
          <div className="glass-panel p-2 rounded-2xl flex flex-row gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-3 rounded-xl transition-colors ${
                canUndo
                  ? "hover:bg-slate-100 text-slate-600"
                  : "text-slate-300 cursor-not-allowed"
              }`}
              title="Undo"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-3 rounded-xl transition-colors ${
                canRedo
                  ? "hover:bg-slate-100 text-slate-600"
                  : "text-slate-300 cursor-not-allowed"
              }`}
              title="Redo"
            >
              <Redo2 size={20} />
            </button>
          </div>

          {/* View Controls */}
          <div className="glass-panel p-2 rounded-2xl flex flex-row gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
              className="p-3 hover:bg-slate-100 rounded-xl text-slate-600"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.1, 0.1))}
              className="p-3 hover:bg-slate-100 rounded-xl text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
          </div>

          {hasSavedData && (
            <button
              onClick={handleLoad}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              title="Reload last save"
            >
              <RefreshCw size={20} />
            </button>
          )}
          <button
            onClick={handleSave}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors group relative"
            title="Save"
          >
            <Save size={20} />
            {!hasSavedData && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white"></span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            title="Export Image (PNG)"
          >
            <Download size={20} />
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
        onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 3))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 0.1))}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
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
        className={`absolute right-4 top-24 bottom-6 w-80 rounded-3xl shadow-2xl shadow-slate-300/50 z-30 transform transition-transform duration-300 flex flex-col overflow-hidden border border-white/50 bg-white ${
          isSidebarOpen ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        {/* Sidebar Header & Tabs */}
        <div className="px-4 pt-4 pb-2 bg-white backdrop-blur-md z-10 border-b border-white/20">
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 shadow-inner">
            <button
              onClick={() => setActiveSidebarTab("properties")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeSidebarTab === "properties"
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-black/5"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveSidebarTab("layers")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeSidebarTab === "layers"
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-black/5"
              }`}
            >
              Layers
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {activeSidebarTab === "properties" && (
            <>
              {/* Case: Connection Selected */}
              {selectedConnectionId && currentConnection && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center gap-2 text-slate-700 font-bold pb-2 border-b border-slate-200/50">
                    <GitFork size={16} className="text-indigo-500" />
                    <span>Line Settings</span>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                      Stroke Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {CONNECTION_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            updateConnection(currentConnection.id, { color: c })
                          }
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-indigo-500/20 ${
                            currentConnection.color === c
                              ? "border-indigo-500 scale-110 shadow-md"
                              : "border-transparent shadow-sm"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thickness */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Thickness
                      </label>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 rounded-full">
                        {currentConnection.thickness || 2}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentConnection.thickness || 2}
                      onChange={(e) =>
                        updateConnection(currentConnection.id, {
                          thickness: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer hover:bg-slate-300 transition-colors"
                    />
                  </div>

                  {/* Line Style */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                      Stroke Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["solid", "dashed", "dotted"].map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            updateConnection(currentConnection.id, {
                              style: s as any,
                            })
                          }
                          className={`h-10 flex items-center justify-center border rounded-xl transition-all duration-200 ${
                            currentConnection.style === s ||
                            (!currentConnection.style && s === "solid")
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200"
                          }`}
                          title={s}
                        >
                          <svg width="24" height="4" className="w-2/3">
                            <line
                              x1="0"
                              y1="2"
                              x2="100%"
                              y2="2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={
                                s === "dashed"
                                  ? "4 2"
                                  : s === "dotted"
                                  ? "1 2"
                                  : "0"
                              }
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Shape */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                      Line Shape
                    </label>
                    <div className="flex bg-slate-100/50 border border-slate-200 rounded-xl p-1">
                      {[
                        {
                          val: "straight",
                          icon: MoveHorizontal,
                          label: "Straight",
                        },
                        { val: "curved", icon: Spline, label: "Curved" },
                        { val: "step", icon: CornerDownRight, label: "Step" },
                      ].map(({ val, icon: Icon, label }) => (
                        <button
                          key={val}
                          onClick={() =>
                            updateConnection(currentConnection.id, {
                              shape: val as any,
                            })
                          }
                          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all ${
                            currentConnection.shape === val ||
                            (!currentConnection.shape && val === "straight")
                              ? "bg-white shadow text-indigo-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title={label}
                        >
                          <Icon size={16} />
                          <span className="text-[9px] font-medium">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Markers & Animation */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                      Endpoints & Effect
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2">
                        <span className="text-xs text-slate-600 font-medium">
                          Start Point
                        </span>
                        <div className="flex gap-1">
                          {["none", "circle", "arrow"].map((m) => (
                            <button
                              key={m}
                              onClick={() =>
                                updateConnection(currentConnection.id, {
                                  startMarker: m as any,
                                })
                              }
                              className={`p-1.5 rounded-lg ${
                                currentConnection.startMarker === m ||
                                (!currentConnection.startMarker && m === "none")
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "text-slate-400 hover:bg-slate-100"
                              }`}
                            >
                              {m === "none" ? (
                                <Minus size={12} />
                              ) : m === "arrow" ? (
                                <ArrowRight
                                  size={12}
                                  className="transform rotate-180"
                                />
                              ) : (
                                <Circle size={8} fill="currentColor" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2">
                        <span className="text-xs text-slate-600 font-medium">
                          End Point
                        </span>
                        <div className="flex gap-1">
                          {["none", "circle", "arrow"].map((m) => {
                            const isActive =
                              currentConnection.endMarker === m ||
                              (!currentConnection.endMarker &&
                                m === "none" &&
                                diagramType !== "Flowchart") ||
                              (!currentConnection.endMarker &&
                                m === "arrow" &&
                                diagramType === "Flowchart");
                            return (
                              <button
                                key={m}
                                onClick={() =>
                                  updateConnection(currentConnection.id, {
                                    endMarker: m as any,
                                  })
                                }
                                className={`p-1.5 rounded-lg ${
                                  isActive
                                    ? "bg-indigo-100 text-indigo-600"
                                    : "text-slate-400 hover:bg-slate-100"
                                }`}
                              >
                                {m === "none" ? (
                                  <Minus size={12} />
                                ) : m === "arrow" ? (
                                  <ArrowRight size={12} />
                                ) : (
                                  <Circle size={8} fill="currentColor" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          updateConnection(currentConnection.id, {
                            animated: !currentConnection.animated,
                          })
                        }
                        className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${
                          currentConnection.animated
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Activity size={14} />
                          <span className="text-xs font-medium">
                            Flow Animation
                          </span>
                        </div>
                        <div
                          className={`w-8 h-4 rounded-full relative transition-colors ${
                            currentConnection.animated
                              ? "bg-indigo-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                              currentConnection.animated
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={removeNode}
                    className="w-full py-3 mt-4 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 size={16} /> Delete Connection
                  </button>
                </div>
              )}

              {/* Case: Node(s) Selected */}
              {selectedNodeIds.size > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                  {/* Selection Info Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      {selectedNodeData?.type === "zone" ? (
                        <>
                          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <BoxSelect size={14} />
                          </div>
                          <span>Zone</span>
                        </>
                      ) : selectedNodeData?.type === "text" ? (
                        <>
                          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Type size={14} />
                          </div>
                          <span>Text Block</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Square size={14} />
                          </div>
                          <span>
                            {selectedNodeIds.size > 1
                              ? `${selectedNodeIds.size} Selected`
                              : "Properties"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Style Section (Colors & Shape) */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Palette size={12} /> Appearance
                    </h3>

                    <div className="grid grid-cols-1 gap-4 bg-white p-3 rounded-xl border border-white/50 shadow-sm">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 mb-2 block">
                          {selectedNodeData?.type === "text"
                            ? "Background Color"
                            : "Fill Color"}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {NODE_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => updateSelectedNodeColor(c)}
                              className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                                c === "transparent" ? "bg-slate-100" : ""
                              }`}
                              style={{
                                backgroundColor: c,
                                borderColor:
                                  selectedNodeData?.color === c
                                    ? "#6366f1"
                                    : "#e2e8f0",
                              }}
                              title={c}
                            >
                              {c === "transparent" && (
                                <div className="w-full h-0.5 bg-red-400 transform -rotate-45 translate-y-2.5"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Show Text Color only if not image/sticker */}
                      {selectedNodeData?.type !== "sticker" && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 mb-2 block">
                            Text Color
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {TEXT_COLORS.map((c) => (
                              <button
                                key={c}
                                onClick={() => updateSelectedNodeTextColor(c)}
                                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-md`}
                                style={{
                                  backgroundColor: c,
                                  borderColor:
                                    selectedNodeData?.textColor === c
                                      ? "#6366f1"
                                      : "transparent",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shape Selector - Hide for Labels/Stickers/Zones/Text */}
                    {selectedNodeData?.type !== "label" &&
                      selectedNodeData?.type !== "text" &&
                      selectedNodeData?.type !== "sticker" &&
                      selectedNodeData?.type !== "zone" && (
                        <div className="bg-white/50 p-3 rounded-xl border border-white/50 shadow-sm">
                          <span className="text-[10px] font-semibold text-slate-500 mb-2 block">
                            Shape
                          </span>
                          <div className="grid grid-cols-5 gap-1.5">
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
                            ].map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() =>
                                    updateSelectedNodeShape(item.id as any)
                                  }
                                  className={`p-2 border rounded-lg flex justify-center items-center transition-all aspect-square ${
                                    selectedNodeData?.shape === item.id
                                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                      : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                  }`}
                                  title={item.id}
                                >
                                  {item.className ? (
                                    <div className={item.className} />
                                  ) : (
                                    <Icon size={16} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Border Settings */}
                    {selectedNodeData?.type !== "sticker" && (
                      <div className="bg-white/50 p-3 rounded-xl border border-white/50 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Frame size={12} />
                          <span className="text-[10px] font-semibold">
                            Border Styling
                          </span>
                        </div>

                        {/* Border Color */}
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {CONNECTION_COLORS.map((c) => (
                              <button
                                key={c}
                                onClick={() =>
                                  updateSelectedNodeStyle({ borderColor: c })
                                }
                                className={`w-5 h-5 rounded-full border transition-all hover:scale-110 ${
                                  selectedNodeData?.borderColor === c
                                    ? "ring-2 ring-indigo-200 scale-110"
                                    : "border-slate-200"
                                }`}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                            <button
                              onClick={() =>
                                updateSelectedNodeStyle({
                                  borderColor: undefined,
                                })
                              }
                              className="w-5 h-5 rounded-full border border-slate-200 bg-white flex items-center justify-center text-[8px] text-slate-400"
                              title="Default"
                            >
                              x
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {/* Border Width */}
                          <div className="flex-1">
                            <label className="text-[9px] font-medium text-slate-400 block mb-1">
                              Width
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="8"
                              value={
                                selectedNodeData?.borderWidth !== undefined
                                  ? selectedNodeData.borderWidth
                                  : 1
                              }
                              onChange={(e) =>
                                updateSelectedNodeStyle({
                                  borderWidth: parseInt(e.target.value),
                                })
                              }
                              className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* Border Style */}
                          <div className="flex-1">
                            <label className="text-[9px] font-medium text-slate-400 block mb-1">
                              Style
                            </label>
                            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                              {["solid", "dashed", "dotted", "none"].map(
                                (s) => (
                                  <button
                                    key={s}
                                    onClick={() =>
                                      updateSelectedNodeStyle({
                                        borderStyle: s as any,
                                      })
                                    }
                                    className={`flex-1 h-6 flex items-center justify-center rounded transition-all ${
                                      selectedNodeData?.borderStyle === s ||
                                      (!selectedNodeData?.borderStyle &&
                                        s === "solid")
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                    title={s}
                                  >
                                    {s === "none" ? (
                                      <Minus size={10} />
                                    ) : (
                                      <div
                                        className="w-3 h-0.5 bg-current"
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
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Typography Section */}
                  {selectedNodeData?.type !== "sticker" && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Type size={12} /> Typography
                      </h3>

                      <div className="bg-white/50 p-3 rounded-xl border border-white/50 shadow-sm space-y-3">
                        {/* Font Family */}
                        <div className="relative">
                          <select
                            value={selectedNodeData?.fontFamily || font}
                            onChange={(e) =>
                              updateSelectedNodeStyle({
                                fontFamily: e.target.value,
                              })
                            }
                            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                          >
                            {AVAILABLE_FONTS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={14}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Size Controls */}
                          <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden flex-1">
                            <button
                              onClick={() =>
                                updateSelectedNodeStyle({
                                  fontSize: Math.max(
                                    8,
                                    (selectedNodeData?.fontSize || fontSize) - 2
                                  ),
                                })
                              }
                              className="px-3 py-2 hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="flex-1 text-center text-xs font-bold text-slate-700 select-none">
                              {selectedNodeData?.fontSize || fontSize}
                            </span>
                            <button
                              onClick={() =>
                                updateSelectedNodeStyle({
                                  fontSize: Math.min(
                                    72,
                                    (selectedNodeData?.fontSize || fontSize) + 2
                                  ),
                                })
                              }
                              className="px-3 py-2 hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Alignment */}
                          <div className="flex bg-slate-100/50 border border-slate-200 rounded-xl p-1">
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
                                className={`p-1.5 rounded-lg transition-all ${
                                  selectedNodeData?.textAlign === val ||
                                  (!selectedNodeData?.textAlign &&
                                    val === "center")
                                    ? "bg-white shadow text-indigo-600"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                              >
                                <Icon size={14} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Style Toggles */}
                        <div className="flex gap-2">
                          {[
                            {
                              key: "fontWeight",
                              val: "bold",
                              icon: Bold,
                              default: "normal",
                            },
                            {
                              key: "fontStyle",
                              val: "italic",
                              icon: Italic,
                              default: "normal",
                            },
                            {
                              key: "textDecoration",
                              val: "underline",
                              icon: Underline,
                              default: "none",
                            },
                          ].map(({ key, val, icon: Icon, default: def }) => {
                            const isActive =
                              (selectedNodeData as any)?.[key] === val;
                            return (
                              <button
                                key={key}
                                onClick={() =>
                                  updateSelectedNodeStyle({
                                    [key]: isActive ? def : val,
                                  })
                                }
                                className={`flex-1 py-1.5 rounded-xl border text-xs flex justify-center items-center transition-all ${
                                  isActive
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500"
                                }`}
                              >
                                <Icon size={14} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions & Arrangement */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Layout size={12} /> Arrange & Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          selectedNode && bringToFront(selectedNode)
                        }
                        className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 flex items-center gap-2 justify-center transition-all"
                      >
                        <ArrowUpToLine size={14} /> Bring Front
                      </button>
                      <button
                        onClick={() => selectedNode && sendToBack(selectedNode)}
                        className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 flex items-center gap-2 justify-center transition-all"
                      >
                        <ArrowDownToLine size={14} /> Send Back
                      </button>

                      <button
                        onClick={duplicateNode}
                        className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 flex items-center gap-2 justify-center transition-all"
                      >
                        <Copy size={14} /> Duplicate
                      </button>

                      {selectedNodeIds.size > 1 ? (
                        <button
                          onClick={groupNodes}
                          className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 flex items-center gap-2 justify-center transition-all"
                        >
                          <Group size={14} /> Group
                        </button>
                      ) : (
                        selectedNodeData?.groupId && (
                          <button
                            onClick={ungroupNodes}
                            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 flex items-center gap-2 justify-center transition-all"
                          >
                            <Ungroup size={14} /> Ungroup
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={removeNode}
                      className="w-full py-3 mt-2 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 size={16} /> Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!selectedNodeIds.size && !selectedConnectionId && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <MousePointer2
                      size={24}
                      className="opacity-40 text-slate-500"
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    No Item Selected
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Click on a node, sticker, or connection to edit its
                    properties.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Layers Panel */}
          {activeSidebarTab === "layers" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200 pb-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {nodes.length} Item{nodes.length !== 1 ? "s" : ""}
                </span>
              </div>
              {[...nodes].reverse().map((node, index) => {
                const isSelected = selectedNodeIds.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                        : "bg-white/60 border-transparent hover:bg-white hover:shadow-sm"
                    }`}
                    onClick={() => {
                      setSelectedNode(node.id);
                      setSelectedNodeIds(new Set([node.id]));
                    }}
                  >
                    {/* Icon based on type */}
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-400 group-hover:text-slate-500"
                      }`}
                    >
                      {node.type === "label" || node.type === "text" ? (
                        <Type size={14} />
                      ) : node.type === "sticker" ? (
                        <Smile size={14} />
                      ) : node.type === "zone" ? (
                        <BoxSelect size={14} />
                      ) : (
                        <Square size={14} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`truncate text-xs font-semibold ${
                          isSelected ? "text-indigo-900" : "text-slate-700"
                        }`}
                      >
                        {node.text ||
                          (node.type === "sticker"
                            ? "Sticker"
                            : node.type === "zone"
                            ? "Zone"
                            : "Untitled")}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {node.type || "Node"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div
                      className={`flex items-center gap-1 transition-opacity ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {/* Lock/Hide */}
                      <div className="flex flex-col gap-1 mr-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(node.id);
                          }}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                            node.locked
                              ? "text-amber-500 bg-amber-50"
                              : "text-slate-300"
                          }`}
                          title={node.locked ? "Unlock" : "Lock"}
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
                          className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                            node.hidden ? "text-slate-300" : "text-slate-300"
                          }`}
                          title={node.hidden ? "Show" : "Hide"}
                        >
                          {node.hidden ? (
                            <EyeOff size={10} />
                          ) : (
                            <Eye size={10} />
                          )}
                        </button>
                      </div>

                      {/* Ordering */}
                      <div className="flex flex-col gap-1 pl-1 border-l border-slate-100">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerUp(node.id);
                            }}
                            title="Move Up"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <ChevronUp size={10} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              bringToFront(node.id);
                            }}
                            title="Bring to Front"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <ArrowUpToLine size={10} />
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerDown(node.id);
                            }}
                            title="Move Down"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <ChevronDownIcon size={10} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sendToBack(node.id);
                            }}
                            title="Send to Back"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <ArrowDownToLine size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {nodes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                  <Layers size={32} className="mb-2 opacity-30" />
                  <p className="text-xs">Canvas is empty</p>
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
