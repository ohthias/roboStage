"use client";

import React from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Panel Kit                                                          */
/*  Primitivos compartilhados por todos os painéis laterais/toolbars   */
/*  do site (Section, Card, botões, toggle, slider) — garante que      */
/*  espaçamento, tipografia e cores fiquem consistentes em todo lugar. */
/* ------------------------------------------------------------------ */

type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number }
>;

/* ---------- Section ---------- */

type SectionProps = {
  title: string;
  children: React.ReactNode;
  /** Elemento opcional alinhado à direita do título (ex: botão "adicionar") */
  action?: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({ title, children, action }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-[11px] font-semibold tracking-wide uppercase text-base-content/60">
        {title}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

/* ---------- Card ---------- */

export const PanelCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`p-4 bg-base-100 border border-base-300 rounded-xl shadow-sm ${className}`}
  >
    {children}
  </div>
);

/* ---------- Botão de seleção com ícone (ferramenta / modo) ---------- */

type IconToggleProps = {
  active: boolean;
  onClick: () => void;
  Icon: IconComponent;
  label: string;
  /** Mostra o texto do label ao lado do ícone (útil quando há espaço) */
  showLabel?: boolean;
};

export const IconToggle: React.FC<IconToggleProps> = ({
  active,
  onClick,
  Icon,
  label,
  showLabel = false,
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    aria-pressed={active}
    aria-label={label}
    title={label}
    className={`
      flex items-center justify-center gap-2 h-9 w-full rounded-lg border transition-all
      ${active
        ? "bg-primary text-primary-content border-primary shadow-sm"
        : "bg-base-100 border-base-300 hover:bg-base-300/40"
      }
    `}
  >
    <Icon size={18} />
    {showLabel && <span className="text-xs font-medium">{label}</span>}
  </motion.button>
);

/* ---------- Botão de ação (desfazer, exportar, limpar...) ---------- */

type ActionButtonProps = {
  onClick: () => void;
  Icon?: IconComponent;
  label: string;
  disabled?: boolean;
  variant?: "neutral" | "error" | "primary";
  outline?: boolean;
  className?: string;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  Icon,
  label,
  disabled,
  variant = "neutral",
  outline = false,
  className = "",
}) => {
  const variantClass =
    variant === "error" ? "btn-error" : variant === "primary" ? "btn-primary" : "btn-neutral";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      title={label}
      className={`btn btn-sm ${outline ? "btn-outline" : ""} ${variantClass} ${className}`}
    >
      {Icon && <Icon size={16} />}
      <span className="ml-1">{label}</span>
    </motion.button>
  );
};

/* ---------- Linha de toggle (label + switch) ---------- */

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-1 cursor-pointer">
    <span className="text-xs opacity-80">{label}</span>
    <div
      className={`relative h-4 w-8 rounded-full cursor-pointer transition-colors ${
        checked ? "bg-primary" : "bg-base-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div
        className={`absolute top-[2px] h-3 w-3 rounded-full bg-white transition-all ${
          checked ? "right-[2px]" : "left-[2px]"
        }`}
      />
    </div>
  </label>
);

/* ---------- Linha de slider (label + valor + range) ---------- */

type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display?: string;
  onChange: (v: number) => void;
};

export const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}) => (
  <div className="flex flex-col gap-2 mb-3 last:mb-0">
    <div className="flex justify-between text-[11px] font-mono text-base-content/60">
      <span>{label}</span>
      <span className="text-primary">{display ?? value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="range range-sm range-primary w-full"
    />
  </div>
);
