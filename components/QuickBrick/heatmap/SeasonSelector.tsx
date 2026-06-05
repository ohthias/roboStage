'use client';

import { motion } from 'framer-motion';
import { CalendarDays, ChevronRight } from 'lucide-react';
import type { SeasonKey } from '@/types/heatmap';
import { SEASON_LIST } from '@/utils/heatmap/seasons';

type Props = {
  current: SeasonKey;
  onChange: (key: SeasonKey) => void;
};

export default function SeasonSelector({ current, onChange }: Props) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>Temporada</span>
        </div>
        <div className="flex flex-col gap-2">
        {SEASON_LIST.map((s) => {
          const active = s.key === current;
          return (
            <motion.button
              key={s.key}
              onClick={() => onChange(s.key)}
              whileTap={{ scale: 0.97 }}
              className={`btn btn-sm justify-between gap-2 rounded-box border ${active ? 'btn-primary' : 'btn-ghost'}`}
              style={active ? { '--accent-season': s.accentColor } as React.CSSProperties : undefined}
            >
              <span className="flex items-center gap-2 text-left">
                <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-primary-content' : 'bg-base-300'}`} />
                <span>{s.name}</span>
              </span>
              <span className="flex items-center gap-1 text-xs opacity-80">
                <span>{s.year}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          );
        })}
      </div>
      </div>
    </div>
  );
}
