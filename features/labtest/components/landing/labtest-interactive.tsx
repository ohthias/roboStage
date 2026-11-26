"use client";
import { asset } from "@/lib/assets";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, Kicker, Tabs } from "@/components/stage";

/*
 * Partes interativas da página do LabTest. O resto da página é renderizado no
 * servidor.
 */

const calibraTests = [
  { key: "motores", label: "Motores", image: asset("/images/products/labtest/calibrabot_motores_individual.png"), text: "Teste cada motor isolado e veja se ele entrega o mesmo comportamento a cada execução." },
  { key: "dupla", label: "Em dupla", image: asset("/images/products/labtest/calibrabot_motores_duplas.png"), text: "Compare combinações de motores e descubra qual par anda mais reto e mais consistente." },
  { key: "gyro", label: "Giroscópio", image: asset("/images/products/labtest/calibrabot_gyro.png"), text: "Meça a precisão dos giros e o quanto o sensor desvia ao longo das repetições." },
  { key: "pid", label: "PID", image: asset("/images/products/labtest/calibrabot_PID.png"), text: "Ajuste as constantes do controle e veja como o robô corrige a trajetória." },
] as const;

type CalibraKey = (typeof calibraTests)[number]["key"];

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
  // null = ainda sem JS: a barra já vem cheia no HTML (nada some sem JS).
  // Depois de montar, o primeiro aviso do observador decide se ela anima.
  const [shown, setShown] = useState<boolean | null>(null);

  useEffect(() => {
    // Observa o trilho (pai): a barra começa com largura 0 e nunca chegaria a 50% visível.
    const element = ref.current?.parentElement ?? ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        } else {
          setShown(false);
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
      className={`h-full rounded-full transition-[width] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${className}`}
      style={{ width: shown === false ? "0%" : `${value}%`, transitionDelay: `${delayMs}ms` }}
    />
  );
}

export function CalibraTabs() {
  const [active, setActive] = useState<CalibraKey>(calibraTests[0].key);
  const test = calibraTests.find((t) => t.key === active) ?? calibraTests[0];
  return (
    <Card featured padded={false} className="overflow-hidden border border-base-300">
      <div className="border-b border-base-300 p-3">
        <Tabs
          tabs={calibraTests.map((t) => ({ value: t.key, label: t.label }))}
          value={active}
          onChange={setActive}
          tone="ink"
          className="w-full"
        />
      </div>
      <div role="tabpanel" aria-label={test.label} className="grid items-center gap-6 p-6 sm:grid-cols-[200px_1fr]">
        <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-white sm:w-full">
          <Image
            key={test.image}
            src={test.image}
            alt={`Ilustração do teste de ${test.label}`}
            fill
            sizes="200px"
            className="object-contain"
          />
        </div>
        <div>
          <Kicker className="text-primary">TESTE · {test.label.toUpperCase()}</Kicker>
          <p className="mt-3 text-base leading-7 text-base-content/75">{test.text}</p>
        </div>
      </div>
    </Card>
  );
}
