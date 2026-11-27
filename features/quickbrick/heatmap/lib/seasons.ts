import { asset } from "@/lib/assets";
import type { Season, SeasonKey } from '@/features/quickbrick/heatmap/types';

export const SEASONS: Record<SeasonKey, Season> = {
  bioglow : {
    key: 'bioglow',
    name: 'Bioglow',
    year: '2025 - 2026',
    accentColor: '#de9b4a00',
    tableColor: '#f3d0a700',
    imagePath: asset("/images/products/quickbrick/Estrategia_fundo.png"),
  },
  
};

export const SEASON_LIST = Object.values(SEASONS);
