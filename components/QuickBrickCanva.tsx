"use client";
import { useRef, useState, useEffect } from "react";

export default function QuickBrickCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (startPos && endPos) {
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Cálculo da distância em cm
          const escalaX = 200 / canvas.width;
          const escalaY = 142 / canvas.height;
          const dx = (endPos.x - startPos.x) * escalaX;
          const dy = (endPos.y - startPos.y) * escalaY;
          const distanciaCm = Math.sqrt(dx * dx + dy * dy).toFixed(1);

          // Texto no meio da linha
          ctx.font = "16px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.fillText(`${distanciaCm} cm`, (startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2 - 5);
        }
      }
    }
  }, [startPos, endPos]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setEndPos(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setEndPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="w-full h-[80vh] flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={800} // será ajustado via CSS
        height={(800 * 142) / 200}
        style={{ border: "1px solid black", maxWidth: "100%", height: "auto" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
