import type { folders } from "@/db/schema/notebook";

/**
 * Tipos de pasta derivados do schema (antes eram três definições à mão:
 * `FolderRow` no layout de documentos, `FolderItem` na lista de pastas e
 * `EditFolderOption` no LabTest). Só tipos — nada de servidor vai para o
 * cliente.
 */
type FolderSelect = typeof folders.$inferSelect;

/** Pasta na árvore do Stagebook. */
export type FolderRow = Pick<FolderSelect, "id" | "parentId" | "name" | "icon" | "position">;

/** Pasta na página de pastas, com aparência e contagem de documentos. */
export type FolderItem = FolderRow & Pick<FolderSelect, "color"> & { documentCount: number };

/** Opção de pasta num seletor: `label` é o caminho completo ("Pai / Filha"). */
export type FolderOption = Pick<FolderSelect, "id" | "icon" | "color"> & { label: string };
