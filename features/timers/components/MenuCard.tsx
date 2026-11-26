import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";

interface MenuCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  /** número exibido no canto (ex.: "01") */
  number?: string;
  /** rótulo curto acima do título */
  tag?: string;
  /** texto do rodapé */
  action?: string;
}

// Classes fixas: Tailwind não gera classes montadas em runtime (`bg-${color}`).
const TONES: Record<string, { icon: string; text: string; hoverBorder: string; hoverBg: string; hoverRing: string; hoverText: string; arrow: string }> = {
  primary: {
    icon: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content",
    text: "text-primary",
    hoverBorder: "hover:border-primary/40",
    hoverBg: "hover:bg-primary/[0.03]",
    hoverRing: "group-hover:border-primary/30",
    hoverText: "group-hover:text-primary",
    arrow: "group-hover:text-primary",
  },
  secondary: {
    icon: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-content",
    text: "text-secondary",
    hoverBorder: "hover:border-secondary/40",
    hoverBg: "hover:bg-secondary/[0.03]",
    hoverRing: "group-hover:border-secondary/30",
    hoverText: "group-hover:text-secondary",
    arrow: "group-hover:text-secondary",
  },
  accent: {
    icon: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-content",
    text: "text-accent",
    hoverBorder: "hover:border-accent/40",
    hoverBg: "hover:bg-accent/[0.03]",
    hoverRing: "group-hover:border-accent/30",
    hoverText: "group-hover:text-accent",
    arrow: "group-hover:text-accent",
  },
  success: {
    icon: "bg-success/10 text-success group-hover:bg-success group-hover:text-success-content",
    text: "text-success",
    hoverBorder: "hover:border-success/40",
    hoverBg: "hover:bg-success/[0.03]",
    hoverRing: "group-hover:border-success/30",
    hoverText: "group-hover:text-success",
    arrow: "group-hover:text-success",
  },
};

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  number,
  tag = "Timer",
  action = "Abrir timer",
}) => {
  const tone = TONES[color] ?? TONES.primary;

  return (
    <div
      className={`group relative flex h-full min-h-[300px] w-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-content/[0.04] sm:p-7 ${tone.hoverBorder} ${tone.hoverBg}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${tone.hoverRing}`}
      />

      <div className="relative flex items-center justify-between">
        <div
          className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${tone.icon}`}
        >
          <Icon size={23} strokeWidth={1.8} />
        </div>

        {number && (
          <span className="font-mono text-xs text-base-content/35">/{number}</span>
        )}
      </div>

      <p className={`relative mt-8 text-[10px] font-bold uppercase tracking-[0.18em] ${tone.text}`}>
        {tag}
      </p>

      <h3 className="relative mt-2 text-xl font-bold tracking-tight">{title}</h3>

      <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">
        {description}
      </p>

      <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-base-300 pt-4 text-sm font-semibold">
        <span className={`transition-colors ${tone.hoverText}`}>
          {action}
        </span>
        <ArrowRight
          size={18}
          className={`shrink-0 text-base-content/40 transition-all duration-300 group-hover:translate-x-1 ${tone.arrow}`}
        />
      </div>
    </div>
  );
};
