"use client";

import { useRef, useState } from "react";
import Hero from "@/components/hero";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [tool, setTool] = useState<string>("pencil");
  const [drawing, setDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setStartPos(pos);
    setDrawing(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (tool === "pencil") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    if (tool === "eraser") eraseAt(pos);
    if (ctx && canvas) {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev, snapshot]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (tool === "pencil") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "eraser") {
      eraseAt(pos);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !canvasRef.current || !startPos) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (tool === "rectangle") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    }

    if (tool === "circle") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (tool === "line") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    if (tool === "arrow") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;

      // Linha principal
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Cabeça da seta
      const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
      const headLength = 10 + strokeWidth * 1.5; // tamanho da ponta

      const arrowX1 = pos.x - headLength * Math.cos(angle - Math.PI / 6);
      const arrowY1 = pos.y - headLength * Math.sin(angle - Math.PI / 6);

      const arrowX2 = pos.x - headLength * Math.cos(angle + Math.PI / 6);
      const arrowY2 = pos.y - headLength * Math.sin(angle + Math.PI / 6);

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(arrowX1, arrowY1);
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(arrowX2, arrowY2);
      ctx.stroke();
    }

    setDrawing(false);
    setStartPos(null);
  };

  const eraseAt = (pos: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(pos.x - 5, pos.y - 5, 10, 10);
  };

  const undoLast = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setHistory((prev) => {
      if (prev.length === 0) return prev; // nada a desfazer

      const newHistory = [...prev];
      const last = newHistory.pop();

      if (last) {
        ctx.putImageData(last, 0, 0);
      }

      return newHistory;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Hero />
      {/* Cabeçalho */}
      <header className="w-full p-4">
        <h1 className="text-2xl font-bold text-foreground">
          lab<span className="text-primary">Arena</span>
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao <i>lab</i> de criação de estratégias de mesa da FIRST
          LEGO League na temporada Uneartherd.
        </p>
        <p className="text-gray-600">
          Crie, explore as possibilidades que o robô da sua equipe é capaz de
          alcançar.
        </p>
        <p className="text-gray-500 text-sm">
          *Os desenhos e informações não são salvos se fechar a aba.
        </p>
      </header>

      {/* Área principal */}
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4">
        {/* Barra de ferramentas - esquerda */}
        <aside className="w-full md:w-14 flex-shrink-0 bg-white border border-gray-200 rounded p-2 space-y-2">
          <div className="flex gap-1 flex-wrap justify-center">
            <button
              onClick={undoLast}
              className="bg-yellow-100 text-yellow-800 rounded p-2 cursor-pointer hover:bg-yellow-200 transition"
              style={{
                lineHeight: "0"
              }}
              title="Desfazer último traço"
            >
              <i className="fi fi-rr-turn-left"></i>
            </button>

            <button
              onClick={() => setTool("rectangle")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "rectangle" ? "bg-gray-200" : ""}`}
              style={{
                lineHeight: "0"
              }}
              title="Quadrado"
            >
              <i className="fi fi-rr-square"></i>
            </button>
            <button
              onClick={() => setTool("circle")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "circle" ? "bg-gray-200" : ""}`}
              style={{
                lineHeight: "0"
              }}
              title="Círculo"
            >
              <i className="fi fi-rr-circle"></i>
            </button>
            <button
              onClick={() => setTool("line")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "line" ? "bg-gray-200" : ""}`}
                style={{
                    lineHeight: "0"
                }}
              title="Linha 2 pontos"
            >
              <i className="fi fi-rr-slash"></i>
            </button>
            <button
              onClick={() => setTool("pencil")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "pencil" ? "bg-gray-200" : ""}`}
                style={{
                    lineHeight: "0"
                }}
              title="Lápis"
            >
              <i className="fi fi-rr-attribution-pencil"></i>
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "eraser" ? "bg-gray-200" : ""}`}
                style={{
                    lineHeight: "0"
                }}
              title="Borracha"
            >
              <i className="fi fi-rr-eraser"></i>
            </button>
            <button
              onClick={() => setTool("arrow")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "arrow" ? "bg-gray-200" : ""}`}
                style={{
                    lineHeight: "0"
                }}
              title="Seta"
            >
              <i className="fi fi-rr-arrow-up-right"></i>
            </button>
          </div>
        </aside>

        {/* Área de desenho - centro */}
        <canvas
          ref={canvasRef}
          className="flex-1 border border-gray-200 rounded relative flex items-center justify-center"
          width={950}
          height={500}
          style={{
            display: "block",
            cursor: tool === "eraser" ? "crosshair" : "default",
            background:
              "url('https://pbs.twimg.com/media/Go7ivzEWoAAwCbN?format=jpg&name=4096x4096') center/cover no-repeat",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Saídas e cores - direita */}
        <aside className="w-full md:w-42 flex-shrink-0 bg-white border border-gray-200 rounded p-2 flex flex-col gap-2">
          <h2 className="text-sm font-bold text-primary-dark">
            Configurações do traço
          </h2>

          {/* Controle de cor */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Cor do traço</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded"
            />
          </div>

          {/* Controle de espessura */}
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs text-gray-600">Espessura</label>
            <input
              type="range"
              min={1}
              max={20}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{strokeWidth}px</span>
          </div>
        </aside>
      </main>

      {/* Barra de exportação e reset - rodapé */}
      <footer className="p-2 rounded bg-white flex flex-wrap gap-2 justify-center border border-gray-200 mx-4 mb-4">
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const link = document.createElement("a");
            link.download = "labarena-desenho.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
          }}
          className="bg-gray-100 text-red-600 rounded p-2 cursor-pointer hover:bg-gray-200 transition"
        >
          Exportar desenho
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }}
          className="bg-red-100 text-red-600 rounded p-2 cursor-pointer hover:bg-red-200 transition"
        >
          Resetar
        </button>
      </footer>
    </div>
  );
}
