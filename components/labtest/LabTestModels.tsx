"use client";

import Image from "next/image";

interface LabTestModelsProps {
  total?: number;
  value: number;
  onChange: (value: number) => void;
}

export function LabTestModels({
  total = 6,
  value,
  onChange,
}: LabTestModelsProps) {
  const activeCount = Math.min(Math.max(value, 0), total);

  const handleModelChange = (index: number) => {
    onChange(index + 1);
  };

  return (
    <section
      aria-label="Discos de Precisão restantes"
      className="rounded-2xl border border-base-content/10 bg-base-200/20 p-4"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-base-content">
            Discos de Precisão
          </p>

          <p className="mt-0.5 text-xs text-base-content/50">
            Informe quantos discos restaram ao final do lançamento.
          </p>
        </div>

        <span className="text-sm tabular-nums text-base-content/60">
          {activeCount} de {total} restantes
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: total }, (_, index) => {
          const isActive = index < activeCount;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleModelChange(index)}
              aria-label={`${index + 1} disco${index === 0 ? "" : "s"} restante${index === 0 ? "" : "s"}`}
              aria-pressed={isActive}
              className="
                group relative block size-20
                cursor-pointer overflow-hidden rounded-xl
                bg-base-100
                transition-all duration-200
                hover:-translate-y-0.5 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-primary
              "
            >
              <Image
                src="/images/labTest/fll_pt_disable.png"
                alt=""
                fill
                sizes="80px"
                className={`
                  object-contain transition-opacity duration-200
                  ${isActive ? "opacity-0" : "opacity-100"}
                  ${!isActive ? "group-hover:opacity-0" : ""}
                `}
              />

              <Image
                src="/images/labTest/fll_pt_active.png"
                alt={`Disco de Precisão ${index + 1}`}
                fill
                sizes="80px"
                className={`
                  object-contain transition-opacity duration-200
                  ${isActive ? "opacity-100" : "opacity-0"}
                  ${!isActive ? "group-hover:opacity-100" : ""}
                `}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}