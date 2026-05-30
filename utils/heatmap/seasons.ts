import type { Season, SeasonKey } from '@/types/heatmap';

export const SEASONS: Record<SeasonKey, Season> = {
  unearthed : {
    key: 'unearthed',
    name: 'Unearthed',
    year: '2025 - 2026',
    accentColor: '#de9b4a00',
    tableColor: '#f3d0a700',
    imagePath: '/images/QuickBrick/Estrategia_fundo.png',
  },
  
};

export const SEASON_LIST = Object.values(SEASONS);
