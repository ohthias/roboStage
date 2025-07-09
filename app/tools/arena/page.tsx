"use client";

import { useRef, useState } from "react";
import Hero from "@/components/hero";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<string>("pencil");
  const [drawing, setDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imgSize, setImgSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

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

    setDrawing(false);
    setStartPos(null);
  };

  const eraseAt = (pos: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(pos.x - 5, pos.y - 5, 10, 10);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Hero admin={false} />
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
              onClick={() => setTool("rectangle")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "rectangle" ? "bg-gray-200" : ""}`}
              title="Quadrado"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
            <button
              onClick={() => setTool("circle")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "circle" ? "bg-gray-200" : ""}`}
              title="Círculo"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>
            <button
              onClick={() => setTool("line")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "line" ? "bg-gray-200" : ""}`}
              title="Linha 2 pontos"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="6" y1="18" x2="18" y2="6" />
                <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                <circle cx="18" cy="6" r="1.5" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => setTool("pencil")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "pencil" ? "bg-gray-200" : ""}`}
              title="Lápis"
            >
              <i className="fi fi-rr-attribution-pencil"></i>
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`hover:bg-gray-100 p-2 rounded cursor-pointer ${tool === "eraser" ? "bg-gray-200" : ""}`}
              title="Borracha"
            >
              <i className="fi fi-rr-eraser"></i>
            </button>
          </div>
        </aside>

        {/* Área de desenho - centro */}
        <section className="flex-1 bg-white border border-gray-200 rounded relative overflow-auto flex items-center justify-center">
          <div className="relative w-full max-w-full">
            {imgSize.width > 0 && (
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%", // importante
                  height: "auto",
                  cursor: tool === "eraser" ? "crosshair" : "default",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            )}
            <img
              src="https://pbs.twimg.com/media/Go7ivzEWoAAwCbN?format=jpg&name=4096x4096"
              alt="tapete"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                setImgSize({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
                // Ajusta o tamanho real do canvas
                const canvas = canvasRef.current;
                if (canvas) {
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                }
              }}
              style={{
                display: "block",
                height: "auto",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </div>
        </section>

        {/* Saídas e cores - direita */}
        <aside className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-200 rounded p-2 flex flex-col gap-2">
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
