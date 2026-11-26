"use client";

import { useEffect, useState } from "react";
import { ACCENT_TEXT } from "./shared";

const ROUND_SECONDS = 150; // 2:30, tempo de uma rodada da FLL

const missions = [
  "Saída 1 · Missão 01",
  "Saída 1 · Missão 03",
  "Saída 2 · Missão 05",
  "Saída 2 · Missão 08",
  "Saída 3 · Missão 11",
  "Saída 3 · Missão 14",
];

function useTraining() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = setInterval(() => setTick((n) => n + 1), 900);
    return () => clearInterval(id);
  }, []);

  const elapsed = (tick * 6) % ROUND_SECONDS;
  const remaining = ROUND_SECONDS - elapsed;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  // pontuação das últimas 12 saídas registradas
  const runs = Array.from({ length: 12 }, (_, i) => {
    const k = Math.floor(tick / 4) - 11 + i;
    return Math.round(310 + 55 * Math.sin(k / 2.2) + 25 * Math.cos(k * 1.3));
  });
  const last = runs[runs.length - 1];
  const best = Math.max(...runs);
  const avg = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);

  const log = Array.from({ length: 4 }, (_, i) => {
    const k = tick - 3 + i;
    const m = missions[((k % missions.length) + missions.length) % missions.length];
    const ok = (k * 7) % 5 !== 0;
    return { key: k, m, ok, t: `${String(Math.floor(((k * 6) % 150) / 60))}:${String(((k * 6) % 150) % 60).padStart(2, "0")}` };
  });

  return { mm, ss, remaining, runs, last, best, avg, log };
}

export default function LivePreview() {
  const { mm, ss, remaining, runs, last, best, avg, log } = useTraining();
  const max = Math.max(...runs);
  const min = Math.min(...runs) - 40;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50"
      />

      <div
        className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]"
        role="img"
        aria-label="Exemplo ilustrativo de um treino registrado no RoboStage: cronômetro da rodada, pontuação das saídas e missões concluídas."
      >
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            <span className="font-mono text-xs text-base-content/60">
              Treino de mesa · ao vivo
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-base-content/35">
            EXEMPLO
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-base-300 border-b border-base-300">
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-primary">
              RODADA
            </p>
            <p
              className={`mt-1 font-mono text-xl font-bold tabular-nums ${remaining <= 30 ? "text-primary" : ""}`}
            >
              {mm}:{ss}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-secondary">
              ÚLTIMA SAÍDA
            </p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums">
              {last}
              <span className="ml-1 text-xs font-normal text-base-content/50">
                pts
              </span>
            </p>
          </div>
          <div className="px-4 py-3">
            <p className={`text-[10px] font-bold tracking-[0.15em] ${ACCENT_TEXT}`}>
              MÉDIA
            </p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums">
              {avg}
              <span className="ml-1 text-xs font-normal text-base-content/50">
                pts
              </span>
            </p>
          </div>
        </div>

        <div className="flex h-28 items-end gap-1.5 px-5 pt-4" aria-hidden="true">
          {runs.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-500 ${
                v === best
                  ? "bg-primary"
                  : i === runs.length - 1
                    ? "bg-secondary"
                    : "bg-secondary/25"
              }`}
              style={{ height: `${((v - min) / (max - min)) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between px-5 pt-2 font-mono text-[10px] text-base-content/40">
          <span>12 saídas</span>
          <span>
            melhor: <span className="text-primary">{best}</span>
          </span>
        </div>

        <ul className="mt-4 space-y-1 bg-[#1f1c18] px-5 py-4 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
          {log.map(({ key, m, ok, t }, i) => (
            <li
              key={key}
              className={`flex items-center justify-between gap-3 ${i === log.length - 1 ? "opacity-100" : "opacity-60"}`}
            >
              <span className="truncate">
                <span className="opacity-60">[{t}]</span> {m}
              </span>
              <span className={ok ? "text-[#9be15d]" : "text-[#ff8a7a]"}>
                {ok ? "✓ concluída" : "✗ refazer"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
