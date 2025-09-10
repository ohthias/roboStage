"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Press_Start_2P } from "next/font/google";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
});

type Mode = "Round" | "Avaliação" | "Perguntas e Respostas";

const MODES: Record<Mode, { time: number; bg: string }> = {
  Round: { time: 150, bg: "bg-amber-700" },
  Avaliação: { time: 300, bg: "bg-red-700" },
  "Perguntas e Respostas": { time: 300, bg: "bg-cyan-700" },
};

export default function TimerPage() {
  const [mode, setMode] = useState<Mode>("Round");
  const [timeLeft, setTimeLeft] = useState(MODES["Round"].time);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Função para tocar áudio
  const playSound = (file: "start" | "end") => {
    const audio = new Audio(`/sounds/${file}.mp3`);
    audio.play().catch(() => {
      console.warn(`⚠️ Falha ao reproduzir ${file}.mp3`);
    });
  };

  // Atualiza tempo conforme modo
  useEffect(() => {
    setTimeLeft(MODES[mode].time);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  // Inicia contagem
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);

            if (isLinked && mode === "Avaliação") {
              playSound("end");
              setMode("Perguntas e Respostas");
              setTimeLeft(MODES["Perguntas e Respostas"].time);
              setIsRunning(true);
            } else {
              playSound("end");
              setIsRunning(false);
              return 0;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, isLinked]);

  // Formatar tempo (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getBackground = () => {
    if (mode === "Round") {
      return {
        backgroundImage: 'url("/images/background_uneartherd.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      } as React.CSSProperties;
    }

    if (timeLeft <= 10 && timeLeft > 0) {
      const colors = ["bg-red-500", "bg-yellow-500", "bg-orange-500", "bg-pink-500"];
      return { backgroundColor: "", backgroundClass: colors[timeLeft % colors.length] };
    }

    return { backgroundColor: MODES[mode].bg, backgroundClass: "" };
  };

  // Alternar tela cheia
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Ocultar controles no fullscreen quando o mouse para
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      return;
    }

    const handleMouseMove = () => {
      setShowControls(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2500); // esconde após 2.5s sem mexer o mouse
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      style={mode === "Round" ? getBackground() : {}}
      className={`min-h-screen rounded-lg flex flex-col items-center justify-between text-white transition-colors duration-500 ${mode !== "Round" ? getBackground().backgroundColor : ""} ${mode === "Round" ? "relative after:content-[''] after:absolute after:inset-0 after:bg-black after:opacity-60 after:rounded-lg after:pointer-events-none" : ""}`}
    >
      {/* Topo: modos e fullscreen */}
      <div
        className={`w-full flex justify-end items-center z-2 gap-3 p-4 transition-opacity duration-500 ${isFullscreen && !showControls ? "opacity-0" : "opacity-100"
          }`}
      >
        <div className="flex gap-2">
          {Object.keys(MODES).map((m) => (
            <button
              key={m}
              onClick={() => {
                setIsLinked(false);
                setMode(m as Mode);
              }}
              className={`px-3 py-1 rounded-md font-semibold text-sm ${mode === m && !isLinked
                ? "bg-white text-black"
                : "bg-black/40 hover:bg-black/60"
                }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60"
        >
          {isFullscreen ? (
            <ArrowsPointingInIcon className="w-6 h-6" />
          ) : (
            <ArrowsPointingOutIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Centro: Timer com animação e nova fonte */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          key={timeLeft}
          animate={
            timeLeft <= 10 && timeLeft > 0 ? { scale: [1, 1.1, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.6, repeat: timeLeft <= 10 ? Infinity : 0 }}
          className={`text-7xl sm:text-8xl md:text-9xl ${pressStart.className} tracking-widest`}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>

      {/* Inferior: Controles */}
      <div
        className={`flex justify-center z-2 gap-8 mb-8 transition-opacity duration-500 ${isFullscreen && !showControls ? "opacity-0" : "opacity-100"
          }`}
      >
        <button
          onClick={() => {
            if (!isRunning && mode === "Round") {
              playSound("start");
            }
            setIsRunning((prev) => !prev);
          }}
          className="p-4 rounded-full bg-black/40 hover:bg-black/60"
        >
          {isRunning ? (
            <PauseIcon className="w-10 h-10" />
          ) : (
            <PlayIcon className="w-10 h-10" />
          )}
        </button>
        <button
          onClick={() => {
            setTimeLeft(MODES[mode].time);
            setIsRunning(false);
          }}
          className="p-4 rounded-full bg-black/40 hover:bg-black/60"
        >
          <ArrowPathIcon className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
}