import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { personaTypeEnum } from "./enums";

/**
 * Espelha o usuário autenticado pelo Clerk.
 * O id é o MESMO "user_xxx" gerado pelo Clerk — não usamos uuid aqui de propósito,
 * para poder usar users.id diretamente como foreign key em todo o resto do banco
 * sem precisar de uma tabela de mapeamento.
 *
 * Sincronização: um webhook do Clerk (user.created / user.updated / user.deleted)
 * faz upsert/delete nesta tabela. Ver db/clerk-sync.ts.
 *
 * personaType e onboardingCompletedAt são opcionais na criação porque o webhook
 * dispara antes do usuário escolher seu perfil dentro do produto — o fluxo de
 * onboarding preenche isso depois.
 */
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user id, ex: "user_2abc..."
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),

    // Perfil dentro do universo de robótica.
    personaType: personaTypeEnum("persona_type"),

    // Marca quando o usuário concluiu o onboarding (persona + ligas).
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    personaTypeIdx: index("users_persona_type_idx").on(table.personaType),
  })
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
