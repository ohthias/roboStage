"use client";

import { Calendar, ClipboardCheck, Trophy, ListChecks, LucideIcon } from "lucide-react";
import { ConfereAIMode, ConfereAIModeId } from "@/utils/competitions/fll/confere-ai/types";

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
    <div
      role="tablist"
      aria-label="Modos do ConfereAí"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {modes.map((mode) => {
        const Icon = ICONS[mode.icon] ?? ListChecks;
        const isActive = mode.id === activeMode;

        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(mode.id)}
            className={`card border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive
                ? "border-primary bg-primary/10"
                : "border-base-300 bg-base-100 hover:bg-base-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                className={`h-5 w-5 ${isActive ? "text-primary" : "text-base-content/70"}`}
                aria-hidden="true"
              />
              <span className="font-semibold">{mode.shortName}</span>
            </div>
            <p className="mt-1 text-sm text-base-content/60">{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
}
