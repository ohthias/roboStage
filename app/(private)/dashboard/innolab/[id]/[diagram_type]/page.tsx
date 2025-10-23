"use client";
import DiagramCanvas from "@/components/InnoLab/DiagramCanvas";
import Toolbar from "@/components/InnoLab/Toolbar";
import { getDiagramById, updateDiagram } from "@/lib/supabase/diagrams";
import { DiagramType } from "@/types/InnoLabType";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDiagram } from "@/hooks/useDiagram";
import { generateInitialNodes } from "@/lib/diagrams";
import { exportCanvasAsPNG } from "@/lib/canvaUtils";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { useToast } from "@/app/context/ToastContext";

export default function InnoLab() {
  const router = useRouter();
  const params = useParams();
  const [diagramType, setDiagramType] = useState<DiagramType>("Mapa Mental");
  const [diagramName, setDiagramName] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const {
    nodes,
    setNodes,
    connections,
    setConnections,
    selectedNode,
    setSelectedNode,
    zoom,
    setZoom,
    font,
    setFont,
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    editingNode,
    setEditingNode,
    editText,
    setEditText,
    editPos,
    setEditPos,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel,
    handleCanvasDoubleClick,
    addNode,
    removeNode,
    updateSelectedNodeColor,
    updateSelectedNodeTextColor,
  } = useDiagram(diagramType);

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  // Função para decodificar o tipo de diagrama do parâmetro
  const decodeDiagramType = (raw: string): DiagramType => {
    const decoded = decodeURIComponent(raw);
    const cleaned = decoded
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const lower = cleaned.toLowerCase();

    if (lower.includes("ishikawa")) return "Ishikawa";
    if (lower.includes("5w2h") || /5\s*w\s*2\s*h/.test(lower)) return "5W2H";
    if (
      lower.includes("mapa") ||
      lower.includes("mental") ||
      lower.includes("mind")
    )
      return "Mapa Mental";

    return "Mapa Mental";
  };

  useEffect(() => {
    const fetchOrCreateDiagram = async () => {
      setLoading(true);
      try {
        const id = String(params?.id);
        const rawType = String(params?.diagram_type ?? "");
        const detectedType = decodeDiagramType(rawType);
        setDiagramType(detectedType);

        // 🔹 Tenta carregar do banco
        const data = await getDiagramById(id);

        if (data && data.content && data.content.nodes?.length) {
          // ✅ Caso exista e tenha conteúdo
          setDiagramType(data.diagram_type);
          const content = data.content;
          setNodes(content.nodes || []);
          setConnections(content.connections || []);
          setZoom(content.zoom || 1);
          setFont(content.font || "Arial");
          setFontSize(content.fontSize || 16);
          setFontColor(content.fontColor || "#000000");
          setDiagramName(data.title || "");
        } else {
          // ⚙️ Caso não exista ou esteja vazio → gerar modelo inicial
          const { nodes: initialNodes, connections: initialConnections } =
            generateInitialNodes(detectedType);

          const initialContent = {
            nodes: initialNodes,
            connections: initialConnections,
            zoom: 1,
            font: "Arial",
            fontSize: 16,
            fontColor: "#000000",
          };

          setNodes(initialNodes);
          setConnections(initialConnections);
          setZoom(1);
          setFont("Arial");
          setFontSize(16);
          setFontColor("#000000");

          // 🔸 Cria ou atualiza o registro no banco
          await updateDiagram(id, {
            content: initialContent,
            diagram_type: detectedType,
          });

          addToast("Modelo inicial criado!", "info");
        }
      } catch (err) {
        console.error("Erro ao carregar ou criar diagrama:", err);
        addToast("Erro ao carregar o diagrama.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateDiagram();
  }, [params?.id, params?.diagram_type]);

  const handleAutoSave = useCallback(async () => {
    try {
      const content = {
        nodes,
        connections,
        zoom,
        font,
        fontSize,
        fontColor,
      };
      await updateDiagram(String(params?.id), { content });
      addToast("Alterações salvas!", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao salvar o diagrama.", "error");
    }
  }, [nodes, connections, zoom, font, fontSize, fontColor, params?.id]);

  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      exportCanvasAsPNG(canvasRef.current, diagramType);
      addToast("Diagrama exportado como PNG!", "success");
    }
  }, [diagramType]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden flex flex-col font-sans text-base-content">
      <header className="navbar bg-base-100 shadow-md z-20 border-b border-base-300 px-2">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-accent btn-outline btn-sm flex items-center gap-2"
            onClick={() => router.push("/dashboard#innolab")}
          >
            Voltar
          </button>
          <span className="font-bold text-lg text-secondary">InnoLab</span>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <span className="font-semibold text-base-content/70">
            {diagramName} -{" "}
            {diagramType === "Mapa Mental"
              ? "Mapa Mental"
              : diagramType === "Ishikawa"
              ? "Diagrama de Ishikawa"
              : "Diagrama 5W2H"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary btn-sm flex items-center gap-2"
            onClick={handleAutoSave}
          >
            💾 Salvar
          </button>
          <button
            className="btn btn-secondary btn-sm flex items-center gap-2"
            onClick={handleExport}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export PNG
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <Toolbar
          diagramType={diagramType}
          onAddNode={addNode}
          onRemoveNode={removeNode}
          font={font}
          onFontChange={setFont}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          fontColor={fontColor}
          onFontColorChange={setFontColor}
          selectedNode={selectedNodeData}
          onNodeColorChange={updateSelectedNodeColor}
          onNodeTextColorChange={updateSelectedNodeTextColor}
        />
        <div
          className="flex-1 relative bg-base-200"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          <DiagramCanvas
            ref={canvasRef}
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNode}
            zoom={zoom}
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
          />
        </div>
      </div>
    </main>
  );
}
