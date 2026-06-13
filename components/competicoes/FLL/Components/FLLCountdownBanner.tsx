"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-08-04T00:00:00");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="card bg-[#F2D9BB] text-[#0C1A1E] shadow-md">
      <div className="card-body p-3 items-center">
        <span className="text-3xl md:text-5xl font-black">
          {String(value).padStart(2, "0")}
        </span>

        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 text-center">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function FLLCountdownBanner() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#024959] text-primary-content">
      {/* círculos decorativos */}
      <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full border-4 border-[#6FA61C75]" />
      <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border-4 border-[#6FA61C75]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none top-1/2 hidden sm:block mx-auto">
        <span className="text-8xl font-black uppercase whitespace-nowrap text-[#073B47]">
          Próxima Temporada
        </span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 px-6 py-6">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img
            src="/images/logos/bioglow_logo.png"
            alt="BIOGLOW"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </div>

        {/* Contador */}
        <div className="grid grid-flow-col auto-cols-max gap-2 md:gap-4">
          <CountdownBox value={time.days} label="dias" />
          <CountdownBox value={time.hours} label="horas" />
          <CountdownBox value={time.minutes} label="minutos" />
          <CountdownBox value={time.seconds} label="segundos" />
        </div>
      </div>
    </section>
  );
}