import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  doublePrecision,
  index,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";

/**
 * CORREÇÃO DE MODELAGEM (schema original): userId era NOT NULL e teamId era
 * opcional "por cima" — ou seja, um registro podia ter os dois preenchidos ao
 * mesmo tempo, o que deixa o dono do recurso ambíguo (ver spec, seção 7).
 *
 * Agora os dois são nullable e um CHECK garante que exatamente um dos dois
 * esteja preenchido:
 *   - userId preenchido + teamId nulo  → recurso PESSOAL
 *   - userId nulo        + teamId preenchido → recurso de EQUIPE
 * `createdBy`/`updatedBy` continuam representando autoria (quem criou/editou),
 * nunca ownership — por isso são sempre obrigatórios/independentes do scope.
 */
const ownershipCheck = (userIdCol: any, teamIdCol: any) =>
  check(
    "ownership_xor",
    sql`(${userIdCol} is not null and ${teamIdCol} is null) or (${userIdCol} is null and ${teamIdCol} is not null)`
  );

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    // Auto-referência: null = pasta na raiz do Stagebook (dentro do scope).
    parentId: uuid("parent_id"),
    name: text("name").notNull().default("Nova pasta"),
    icon: text("icon"), // emoji, ex: "📁"
    // Ordenação dentro do mesmo parentId + scope. Ponto flutuante para permitir
    // inserir entre dois itens sem reescrever a posição dos vizinhos.
    position: doublePrecision("position").notNull().default(0),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("folders_user_id_idx").on(table.userId),
    teamIdIdx: index("folders_team_id_idx").on(table.teamId),
    parentIdIdx: index("folders_parent_id_idx").on(table.parentId),
    // Índices compostos: consulta mais comum é "listar filhos de X dentro do scope Y".
    userParentIdx: index("folders_user_parent_idx").on(
      table.userId,
      table.parentId
    ),
    teamParentIdx: index("folders_team_parent_idx").on(
      table.teamId,
      table.parentId
    ),
    ownershipCheckConstraint: ownershipCheck(table.userId, table.teamId),
    // Ao excluir uma pasta, suas subpastas são excluídas em cascata (seção 42).
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "folders_parent_id_fkey",
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "folders_user_id_fkey",
    }).onDelete("cascade"),
    // CORREÇÃO: era "set null" — mas teamId agora é ownership, não um extra.
    // Se a equipe é apagada, o espaço de equipe inteiro deixa de existir.
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "folders_team_id_fkey",
    }).onDelete("cascade"),
  })
);

/**
 * `documents` é a tabela que a aplicação trata como Page do Stagebook
 * (seção 9). Mantido o nome da tabela por compatibilidade; o app usa
 * `Page`/`PageRow` como apelido conceitual (ver lib/stagebook/types.ts).
 */
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    // null = página na raiz do Stagebook (fora de qualquer pasta).
    folderId: uuid("folder_id"),
    // Hierarquia Page → Page (seção 10). Independente de folderId.
    parentId: uuid("parent_id"),
    title: text("title").notNull().default("Sem título"),
    icon: text("icon"), // emoji, ex: "📝"
    cover: text("cover"), // URL da capa (opcional)
    description: text("description"),
    // Estado serializado do editor Lexical (editorState.toJSON()).
    content: jsonb("content").$type<Record<string, unknown> | null>(),
    // Propriedades personalizadas livres (chave/valor), sem exigir migração
    // de schema para cada novo campo que o usuário queira anexar à página.
    properties: jsonb("properties")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    // Ordenação dentro do mesmo (folderId, parentId) + scope.
    position: doublePrecision("position").notNull().default(0),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("documents_user_id_idx").on(table.userId),
    teamIdIdx: index("documents_team_id_idx").on(table.teamId),
    folderIdIdx: index("documents_folder_id_idx").on(table.folderId),
    parentIdIdx: index("documents_parent_id_idx").on(table.parentId),
    userFolderIdx: index("documents_user_folder_idx").on(
      table.userId,
      table.folderId
    ),
    teamFolderIdx: index("documents_team_folder_idx").on(
      table.teamId,
      table.folderId
    ),
    ownershipCheckConstraint: ownershipCheck(table.userId, table.teamId),
    // Se a pasta for excluída, a página volta para a raiz (não é apagada).
    folderFk: foreignKey({
      columns: [table.folderId],
      foreignColumns: [folders.id],
      name: "documents_folder_id_fkey",
    }).onDelete("set null"),
    // Se a página-pai for excluída, as subpages sobem um nível (não cascateia
    // silenciosamente — seção 42).
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "documents_parent_id_fkey",
    }).onDelete("set null"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "documents_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "documents_team_id_fkey",
    }).onDelete("cascade"),
  })
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
export type FolderRow = typeof folders.$inferSelect;
export type NewFolderRow = typeof folders.$inferInsert;
