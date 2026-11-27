"use client";

import { Calendar, ClipboardCheck, ListChecks, LucideIcon, Trophy } from "lucide-react";
import { cn } from "@/components/stage";
import { ConfereAIMode, ConfereAIModeId } from "@/features/leagues/fll/confere-ai/lib/types";

const ICONS: Record<string, LucideIcon> = {
  calendar: Calendar,
  "clipboard-check": ClipboardCheck,
  trophy: Trophy,
};

interface ModeSelectorProps {
  modes: ConfereAIMode[];
  activeMode: ConfereAIModeId;
  onSelect: (modeId: ConfereAIModeId) => void;
}

export default function ModeSelector({ modes, activeMode, onSelect }: ModeSelectorProps) {
  return (
    <div role="tablist" aria-label="Modos do ConfereAí" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {modes.map((mode, i) => {
        const Icon = ICONS[mode.icon] ?? ListChecks;
        const isActive = mode.id === activeMode;

        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(mode.id)}
            className={cn(
              "stage-paper group relative flex flex-col gap-2 rounded-tl-2xl rounded-br-2xl border p-4 text-left transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive
                ? "-translate-y-0.5 border-base-content bg-base-100 shadow-[6px_6px_0_0_var(--color-primary)]"
                : "border-base-300 bg-base-100 hover:-translate-y-0.5 hover:border-base-content/40",
            )}
          >
            <span className="flex items-center justify-between">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-tl-lg rounded-br-lg transition-colors",
                  isActive ? "bg-primary text-primary-content" : "bg-primary/10 text-primary",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="font-mono text-xs text-base-content/30">0{i + 1}</span>
            </span>
            <span className="font-black tracking-tight">{mode.shortName}</span>
            <span className="text-sm leading-6 text-base-content/60">{mode.description}</span>
          </button>
        );
      })}
    </div>
  );
}
