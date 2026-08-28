export interface IshikawaSubCause {
  id: string;
  text: string;
  isRootCause?: boolean;
}

export interface IshikawaCause {
  id: string;
  text: string;
  subCauses: IshikawaSubCause[];
  isRootCause?: boolean;
  severity?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface IshikawaCategory {
  id: string;
  name: string;
  causes: IshikawaCause[];
  color?: string;
  icon?: string;
  customPlacement?: 'top' | 'bottom';
}

export interface IshikawaData {
  title: string;
  categories: IshikawaCategory[];
  rawMarkdown: string;
  metadata?: {
    author?: string;
    date?: string;
    team?: string;
    version?: string;
  };
}

export type FishDirection = 'right' | 'left';
export type FishThemeId = 'bento-indigo' | 'classic-blue' | 'emerald-quality' | 'indigo-modern' | 'coral-sunset' | 'slate-dark' | 'amber-warm' | 'minimalist-clean';

export interface ThemeColors {
  id: FishThemeId;
  name: string;
  bg: string;
  paperBg: string;
  spineColor: string;
  headBg: string;
  headBorder: string;
  headText: string;
  categoryColors: {
    stroke: string;
    fill: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  }[];
  causeText: string;
  subCauseText: string;
  subCauseLine: string;
  rootCauseBadge: string;
  gridColor: string;
}

export interface DiagramSettings {
  fishDirection: FishDirection;
  theme: FishThemeId;
  showSubCauses: boolean;
  showGrid: boolean;
  showRootCauseHighlights: boolean;
  showCategoryIcons: boolean;
  boneAngle: number; // in degrees, e.g. 55
  fontSizeScale: number; // 0.8 to 1.4
  spineThickness: number; // 2 to 6
  headShape: 'rounded-box' | 'fish-head' | 'hexagon' | 'pill';
}

export interface TemplateItem {
  id: string;
  title: string;
  subtitle: string;
  categoryType: '6M' | '4P' | '8P' | '4S' | 'Custom';
  description: string;
  markdown: string;
  iconName: string;
}
