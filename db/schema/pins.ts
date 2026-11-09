import { pgTable, uuid, text, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { teams } from "./teams";

/**
 * Itens fixados na barra lateral (até 3 por espaço). `team_id` é o espaço em
 * que o item foi fixado (null = espaço pessoal): cada espaço tem os seus
 * fixados, e a barra mostra só os do espaço ativo — assim um link nunca leva
 * a um item que o espaço atual não consegue abrir.
 *
 * `kind`: "labtest" | "thinklab" | "quickbrick" | "stagebook" (texto livre
 * validado na aplicação). Sem FK para o recurso (é polimórfico): itens
 * excluídos somem da barra na leitura e a linha é limpa no próximo acesso.
 */
export const userPins = pgTable(
  "user_pins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    resourceId: uuid("resource_id").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("user_pins_user_team_idx").on(t.userId, t.teamId),
    unique("user_pins_user_resource_unique").on(t.userId, t.kind, t.resourceId),
  ],
);

export type UserPinRow = typeof userPins.$inferSelect;
