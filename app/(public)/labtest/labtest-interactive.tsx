"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/*
 * Partes interativas da página do LabTest. O resto da página é renderizado no
 * servidor; antes ela inteira era de cliente e levava o framer-motion só para
 * animar estas barras.
 */

const calibraTests = [
  { key: "motores", label: "Motores", image: "/images/labTest/calibrabot_motores_individual.png", text: "Teste cada motor isolado e veja se ele entrega o mesmo comportamento a cada execução." },
  { key: "dupla", label: "Motores em dupla", image: "/images/labTest/calibrabot_motores_duplas.png", text: "Compare combinações de motores e descubra qual par anda mais reto e mais consistente." },
  { key: "gyro", label: "Giroscópio", image: "/images/labTest/calibrabot_gyro.png", text: "Meça a precisão dos giros e o quanto o sensor desvia ao longo das repetições." },
  { key: "pid", label: "PID", image: "/images/labTest/calibrabot_PID.png", text: "Ajuste as constantes do controle e veja como o robô corrige a trajetória." },
];

/** Barra que cresce até `value`% quando entra na tela (respeita "reduzir movimento"). */
export function GrowBar({
  value,
  delayMs = 0,
  className = "",
}: {
  value: number;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-full rounded-sm transition-[width] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${className}`}
      style={{ width: shown ? `${value}%` : "0%", transitionDelay: `${delayMs}ms` }}
    />
  );
}

export function CalibraTabs() {
  const [active, setActive] = useState(calibraTests[0].key);
  const test = calibraTests.find((t) => t.key === active) ?? calibraTests[0];
  return (
    <div className="overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-primary)]">
      <div role="tablist" aria-label="Testes do CalibraBot" className="flex gap-1 overflow-x-auto border-b border-base-300 p-2">
        {calibraTests.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`shrink-0 rounded-tl-md rounded-br-md px-3 py-1.5 font-mono text-xs transition-colors ${
              active === t.key ? "bg-base-content text-base-100" : "text-base-content/65 hover:bg-base-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid items-center gap-6 p-6 sm:grid-cols-[180px_1fr]">
        <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-white sm:w-full">
          <Image
            key={test.image}
            src={test.image}
            alt={`Ilustração do teste de ${test.label}`}
            fill
            sizes="180px"
            className="object-contain"
          />
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary">TESTE · {test.label.toUpperCase()}</p>
          <p className="mt-2 text-base leading-7 text-base-content/70">{test.text}</p>
        </div>
      </div>
    </div>
  );
}
