"use client";
import { useEffect, useState } from "react";
const TARGET_DATE = new Date("2026-08-04T00:00:00-03:00");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const INITIAL_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getTimeLeft(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return INITIAL_TIME;
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
      <div className="card-body items-center p-3">
        <span className="text-3xl font-black md:text-5xl">
          {String(value).padStart(2, "0")}
        </span>
        <span className="text-center text-[10px] uppercase tracking-[0.2em] opacity-70 md:text-xs">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function FLLCountdownBanner() {
  const [time, setTime] = useState<TimeLeft>(INITIAL_TIME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      setTime(getTimeLeft());
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#024959] text-primary-content">
      <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full border-4 border-[#6FA61C75]" />
      <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border-4 border-[#6FA61C75]" />
      <div className="pointer-events-none absolute inset-0 hidden select-none items-center justify-center sm:flex">
        <span className="whitespace-nowrap text-8xl font-black uppercase text-[#073B47]">
          Próxima Temporada
        </span>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-between gap-6 px-6 py-6 lg:flex-row">
        <div className="flex items-center justify-center">
          <img
            src="/images/logos/fll/seasons/bioglow_logo.png"
            alt="BIOGLOW"
            className="h-16 w-auto object-contain md:h-20"
          />
        </div>
        <div className="grid grid-flow-col auto-cols-max gap-2 md:gap-4">
          <CountdownBox
            value={mounted ? time.days : 0}
            label="dias"
          />
          <CountdownBox
            value={mounted ? time.hours : 0}
            label="horas"
          />
          <CountdownBox
            value={mounted ? time.minutes : 0}
            label="minutos"
          />
          <CountdownBox
            value={mounted ? time.seconds : 0}
            label="segundos"
          />
        </div>
      </div>
    </section>
  );
}