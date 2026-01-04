
export interface DocumentVersion {
  id: string;
  content: string;
  timestamp: number;
  label?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  icon?: string;
  parentId: string | null;
  isExpanded?: boolean;
  createdAt: number;
  versions?: DocumentVersion[];
}

export interface Template {
  id: string;
  title: string;
  icon: string;
  content: string;
  tags: string[];
}

export type DocumentMap = Record<string, Document>;

export interface AppState {
  documents: DocumentMap;
  activeId: string | null;
}
