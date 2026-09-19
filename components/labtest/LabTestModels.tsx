"use client";

import { useState } from "react";
import Image from "next/image";

interface LabTestModelsProps {
  total?: number;
  initialActive?: number;
}

export function LabTestModels({
  total = 6,
  initialActive = 6,
}: LabTestModelsProps) {
  const [activeCount, setActiveCount] = useState(
    Math.min(Math.max(initialActive, 0), total)
  );

  const handleModelChange = (index: number) => {
    setActiveCount(index + 1);
  };

  return (
    <section
      aria-label="Modelos ativos"
      className="mx-5 mt-6 rounded-2xl border border-base-content/10 bg-base-200/20 p-4"
    >
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-base-content">
          Disco de Precisão
        </p>

        <span className="text-sm tabular-nums text-base-content/60">
          {activeCount} de {total} restantes
        </span>
      </div>

      {/* Modelos */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: total }, (_, index) => {
          const isActive = index < activeCount;

          return (
            <label
              key={index}
              className={`
                group relative block size-20 cursor-pointer
                overflow-hidden rounded-xl
                bg-base-100
                transition-all duration-200
                hover:-translate-y-0.5 hover:scale-105
              `}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => handleModelChange(index)}
                aria-label={`Ativar modelo ${index + 1}`}
                className="sr-only"
              />

              {/* Modelo desativado */}
              <Image
                src="/images/labTest/fll_pt_disable.png"
                alt={`Modelo ${index + 1}`}
                fill
                sizes="80px"
                className={`
                  object-contain
                  transition-opacity duration-200
                  ${isActive ? "opacity-0" : "opacity-100"}
                  ${!isActive ? "group-hover:opacity-0" : ""}
                `}
              />

              {/* Modelo ativo */}
              <Image
                src="/images/labTest/fll_pt_active.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="80px"
                className={`
                  object-contain
                  transition-opacity duration-200
                  ${isActive ? "opacity-100" : "opacity-0"}
                  ${!isActive ? "group-hover:opacity-100" : ""}
                `}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}