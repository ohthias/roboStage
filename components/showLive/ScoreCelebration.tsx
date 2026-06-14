"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  equipe: string;
  round: string;
  points: number;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "triangle";
  opacity: number;
}

const COLORS = ["#f97316","#3b82f6","#22c55e","#a855f7","#eab308","#ec4899","#06b6d4","#ef4444"];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function ScoreCelebration({ equipe, round, points, onClose }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const [phase, setPhase] = useState<"enter" | "celebrate" | "rest">("enter");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Contador animado com easing
  useEffect(() => {
    if (phase !== "celebrate") return;
    const duration = 1800;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * points));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [phase, points]);

  // Fase enter → celebrate
  useEffect(() => {
    const t = setTimeout(() => setPhase("celebrate"), 300);
    return () => clearTimeout(t);
  }, []);

  // Lançar confetti quando celebrate
  useEffect(() => {
    if (phase !== "celebrate") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Criar partículas em duas rajadas (esquerda e direita)
    const particles: Particle[] = [];
    const shapes: Particle["shape"][] = ["rect", "circle", "triangle"];

    for (let i = 0; i < 120; i++) {
      const fromLeft = i % 2 === 0;
      particles.push({
        id: i,
        x: fromLeft ? randomBetween(0, canvas.width * 0.3) : randomBetween(canvas.width * 0.7, canvas.width),
        y: randomBetween(-20, canvas.height * 0.3),
        vx: fromLeft ? randomBetween(1, 5) : randomBetween(-5, -1),
        vy: randomBetween(2, 7),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: randomBetween(6, 14),
        rotation: randomBetween(0, 360),
        rotationSpeed: randomBetween(-4, 4),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 1,
      });
    }

    particlesRef.current = particles;
    startTimeRef.current = performance.now();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function drawTriangle(ctx: CanvasRenderingContext2D, size: number) {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, size);
      ctx.lineTo(-size, size);
      ctx.closePath();
      ctx.fill();
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = performance.now() - startTimeRef.current;

      let alive = false;
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += 0.12; // gravity
        p.vx *= 0.995; // air resistance
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // fade quando sai da tela
        if (p.y > canvas.height * 0.75) {
          p.opacity = Math.max(0, p.opacity - 0.03);
        }

        if (p.opacity > 0 && p.y < canvas.height + 20) alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "triangle") {
          drawTriangle(ctx, p.size / 2);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        ctx.restore();
      }

      if (alive || elapsed < 3000) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase]);

  const isHighScore = points >= 200;

  return (
    <main
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-base-300/40 backdrop-blur-sm"
    >
      {/* Canvas confetti — camada de fundo */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Halo de luz atrás do card — camada intermediária */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 480,
          height: 480,
          background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
          zIndex: 1,
          transform: `scale(${phase === "celebrate" ? 1 : 0.4})`,
          transition: "transform 1s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />

      {/* Card principal — camada frontal */}
      <div
        style={{
          zIndex: 2,
          transform: phase === "celebrate" ? "translateY(0) scale(1)" : "translateY(32px) scale(0.92)",
          opacity: phase === "celebrate" ? 1 : 0,
          transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
        }}
        className="flex flex-col items-center gap-5 px-8 py-10 text-center max-w-sm w-full mx-4 rounded-2xl shadow-2xl"
      >
        {/* Troféu com anel pulsante */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full"
            style={{
              width: 88,
              height: 88,
              background: "rgba(234,179,8,0.15)",
              animation: phase === "celebrate" ? "pulse-ring 2s ease-out infinite" : "none",
            }}
          />
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              boxShadow: "0 4px 24px rgba(234,179,8,0.4)",
            }}
          >
            <span style={{ fontSize: 34, lineHeight: 1 }}>🏆</span>
          </div>
        </div>

        {/* Nome da equipe */}
        <div className="flex flex-col gap-1">
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.15em" }}
          >
            {round}
          </span>
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              color: "var(--color-text-primary)",
            }}
          >
            {equipe}
          </h1>
        </div>

        {/* Divisor */}
        <div
          style={{
            width: 40,
            height: 2,
            borderRadius: 99,
            background: "linear-gradient(90deg, #a855f7, #3b82f6)",
          }}
        />

        {/* Pontuação */}
        <div className="flex flex-col items-center gap-0">
          <span
            className="tabular-nums font-bold leading-none"
            style={{
              fontSize: "clamp(4rem, 18vw, 6rem)",
              background: isHighScore
                ? "linear-gradient(135deg, #f97316 0%, #a855f7 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {displayed}
          </span>
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.2em" }}
          >
            pontos
          </span>
        </div>

        {/* Badge condicional */}
        {isHighScore && (
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(249,115,22,0.12)",
              color: "#f97316",
              border: "1px solid rgba(249,115,22,0.25)",
            }}
          >
            ✦ Pontuação alta
          </div>
        )}

        {/* Botão */}
        <button
          className="btn btn-primary btn-wide rounded-xl mt-2"
          onClick={onClose}
          style={{ letterSpacing: "0.02em" }}
        >
          Próxima equipe
        </button>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(1.5); opacity: 0;   }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  );
}