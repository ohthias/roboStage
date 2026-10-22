import type { TagDTO } from "@/types/labels";

export type EntryKind = "folder" | "document" | "labtest" | "thinklab";

/** Item unificado exibido no explorador (subpasta, página, teste ou diagrama). */
export type ExplorerEntry = {
  id: string;
  kind: EntryKind;
  name: string;
  icon: string | null;
  /** Cor da paleta (só pastas). */
  color?: string | null;
  href: string;
  /** ISO string (serializável do server para o client). */
  updatedAt: string | null;
  tags: TagDTO[];
};

export type Crumb = { id: string; name: string };

export const PAGE_SIZE = 12;
export const VIEW_STORAGE_KEY = "robostage:folder-view";
export type ViewMode = "grid" | "list";
