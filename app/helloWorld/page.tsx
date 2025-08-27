"use client";
import React, { useId, useState } from "react";
import { motion } from "framer-motion";

/**
 * LEGO-STYLE BLOCKS REVISED FOR Next.js + TailwindCSS
 *
 * Alterações:
 * - Blocos sem cantos arredondados (retângulos retos)
 * - Cores ajustadas
 * - Grupo: blocos empilhados verticalmente
 * - Todos os blocos agora têm 4 pinos (studs) alinhados
 * - Animação de encaixe ao selecionar (bounce/scale)
 */

function useUniqueGradientId(prefix: string) {
  const uid = useId().replace(/:/g, "");
  return `${prefix}-${uid}`;
}

type LegoBrickProps = {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
};

const LegoBrick: React.FC<LegoBrickProps> = ({
  color = "blue-600",
  width = 160,
  height = 60,
  className = "",
}) => {
  const gradId = useUniqueGradientId("brickGrad");
  const w = width;
  const h = height;
  const studR = 8;
  const studsPerRow = 4;
  const rows = 1;
  const spacingX = w / (studsPerRow + 1);

  return (
    <motion.svg
      initial={{ y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`text-primary ${className}`}
      width={w}
      height={h + 24}
      viewBox={`0 0 ${w} ${h + 24}`}
      role="img"
      aria-label="Bloco de montar"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={`rgb(var(--tw-${color.replace("-", ", ")}))`}
            stopOpacity="0.95"
          />
          <stop
            offset="100%"
            stopColor={`rgb(var(--tw-${color.replace("-", ", ")}))`}
            stopOpacity="1"
          />
        </linearGradient>
      </defs>

      {/* Corpo do bloco */}
      <path
        d={`
    M 0 ${24 + h} 
    V ${24 + 8} 
    Q 0 24 8 24 
    H ${w - 8} 
    Q ${w} 24 ${w} ${24 + 8} 
    V ${24 + h} 
    Z
  `}
        fill={`currentColor`}
      />

      {/* Studs (4 pinos: 2 colunas x 2 linhas) */}
      {Array.from({ length: rows }).map((_, rowIdx) =>
        Array.from({ length: studsPerRow }).map((_, colIdx) => {
          const cx = spacingX * (colIdx + 1);
          const cy = 21;
          return (
            <path
              key={`stud-${rowIdx}-${colIdx}`}
              d={`
    M ${cx - studR} ${cy} 
    A ${studR} ${studR} 0 0 1 ${cx + studR} ${cy} 
    L ${cx + studR} ${cy + studR / 2} 
    L ${cx - studR} ${cy + studR / 2} 
    Z
  `}
              fill={`currentColor`}
              stroke="#000"
              strokeOpacity="0.1"
            />
          );
        })
      )}
    </motion.svg>
  );
};

const SingleBrick: React.FC<{ color?: string }> = ({
  color = "yellow-600",
}) => {
  return <LegoBrick color={color} width={120} height={45} />;
};

const StackedBricks: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <LegoBrick color="red-600" width={120} height={45} />
      <LegoBrick color="green-600" width={120} height={45} />
      <LegoBrick color="blue-600" width={120} height={45} />
    </div>
  );
};

const CustomBrick: React.FC<{ color?: string }> = ({ color = "purple-600" }) => {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      {/* Parte vertical */}
      <rect x="15" y="30" width="20" height="65" rx="6" className={`fill-${color}`} />
      {/* Parte horizontal */}
      <rect x="25" y="75" width="70" height="20" rx="6" className={`fill-${color}`} />
      {/* Studs */}
      <circle cx="25" cy="45" r="6" fill="white" />
      <circle cx="25" cy="65" r="6" fill="white" />
      <circle cx="45" cy="82" r="6" fill="white" />
      <circle cx="25" cy="82" r="6" fill="white" />
      <circle cx="65" cy="82" r="6" fill="white" />
      <circle cx="85" cy="82" r="6" fill="white" />
    </svg>
  );
};

type BrickOptionProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const BrickOption: React.FC<BrickOptionProps> = ({
  label,
  selected = false,
  onClick,
  children,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      animate={selected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`group relative flex flex-col items-center p-4 transition-transform duration-200 ${
        selected ? "ring-4 ring-primary/30" : "hover:scale-105"
      }`}
    >
      <div>{children}</div>
      <span className="mt-2 text-sm font-semibold">{label}</span>
    </motion.button>
  );
};

export type TestType = "grupo" | "individual" | "personalizado";

export const TestTypeSelector: React.FC<{
  value?: TestType;
  onChange?: (val: TestType) => void;
}> = ({ value = "individual", onChange }) => {
  const [internal, setInternal] = useState<TestType>(value);
  const current = value ?? internal;

  const set = (val: TestType) => {
    setInternal(val);
    onChange?.(val);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
        <BrickOption
          label="Individual"
          selected={current === "individual"}
          onClick={() => set("individual")}
        >
          <SingleBrick />
        </BrickOption>

        <BrickOption
          label="Grupo"
          selected={current === "grupo"}
          onClick={() => set("grupo")}
        >
          <StackedBricks />

        </BrickOption>
          <BrickOption
            label="Personalizado"
            selected={current === "personalizado"}
            onClick={() => set("personalizado")}
          >
            <CustomBrick />
          </BrickOption>
      </div>
    </div>
  );
};

export default function Page() {
  const [tipo, setTipo] = useState<TestType>("individual");

  return (
    <main className="min-h-screen w-full flex flex-col items-center gap-10 p-6">
      <h1 className="text-3xl font-extrabold">Test Page</h1>
      <p className="opacity-70">
        Selecione o tipo de teste com blocos de montar.
      </p>

      <TestTypeSelector value={tipo} onChange={setTipo} />
    </main>
  );
}
