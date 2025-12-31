"use client";

import { useEffect, useState } from "react";

const TARGET_TIMESTAMP = Date.UTC(2026, 0, 26, 15, 0, 0); // 26/01/2026 às 12h BR

export default function CountdownBanner() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);

    const update = () => {
      const diff = TARGET_TIMESTAMP - Date.now();
      if (diff <= 0) return;

      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-box bg-base-200 px-6 py-4">
        
        {/* Badge / Texto */}
        <div className="flex items-center gap-3">
          <span className="badge badge-primary badge-outline">
            v4.0.0
          </span>
          <span className="text-sm opacity-70 hidden sm:block">
            26 de janeiro de 2026 • 12h
          </span>
        </div>

        {/* Contador */}
        <div className="flex gap-4 font-mono text-2xl tabular-nums">
          <TimeBox value={time.days} label="dias" />
          <TimeBox value={time.hours} label="horas" />
          <TimeBox value={time.minutes} label="min" />
          <TimeBox value={time.seconds} label="seg" />
        </div>
      </div>
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[3.5rem]">
      <div className="font-semibold">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  );
}
