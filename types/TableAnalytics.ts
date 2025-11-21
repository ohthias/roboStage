export type ColumnType = 'text' | 'number' | 'select';

export interface Column {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[]; // For select type (comma separated in UI)
  isSystem?: boolean; // If true, cannot be deleted (e.g., Name)
}

export interface Mission {
  id: string;
  [key: string]: any; // Dynamic keys based on column IDs
}

export interface AnalysisResult {
  summary: string;
  recommendations: string[];
}

export enum ViewMode {
  TABLE = 'table',
  ANALYTICS = 'analytics'
}