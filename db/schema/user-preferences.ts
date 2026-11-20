import { boolean, foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Preferências do usuário (uma linha por usuário; sem linha = valores padrão).
 * Ficam no banco — e não em localStorage — para valerem em qualquer
 * dispositivo e para o SERVIDOR poder respeitá-las (ex.: bloquear convites).
 */
export const userPreferences = pgTable(
  "user_preferences",
  {
    userId: text("user_id").primaryKey(),
    /** Trava menus e painéis na posição escolhida (não podem ser movidos/recolhidos). */
    layoutLocked: boolean("layout_locked").notNull().default(false),
    /** Posição desejada do menu lateral no desktop: expandido (true) ou só ícones (false). */
    sidebarExpanded: boolean("sidebar_expanded").notNull().default(false),
    /** Falso = ninguém consegue adicionar este usuário a equipes. */
    allowTeamInvites: boolean("allow_team_invites").notNull().default(true),
    /** Painel do ShowLive habilitado para o usuário (coluna já existente no banco). */
    showliveEnabled: boolean("showlive_enabled").notNull().default(false),
    /**
     * Opt-in para e-mails de novidades (LGPD: começa desligado e só liga com
     * escolha explícita — no onboarding ou em Configurações). Lido pelo
     * robostage-admin para montar o público das campanhas de "Novidades".
     */
    emailProductUpdates: boolean("email_product_updates").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_preferences_user_id_fkey",
    }).onDelete("cascade"),
  })
);

export type UserPreferencesRow = typeof userPreferences.$inferSelect;
