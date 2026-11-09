-- Equivalente às mudanças em db/schema/boards.ts (conclusão de tarefas do Kanban).
-- Preferível: `npx drizzle-kit generate` + `npx drizzle-kit migrate` (mantém o journal em dia).
ALTER TABLE "board_cards" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;
ALTER TABLE "board_cards" ADD COLUMN IF NOT EXISTS "completed_by" text;
CREATE INDEX IF NOT EXISTS "board_cards_completed_at_idx" ON "board_cards" ("completed_at");
-- `board_columns.rules.autoComplete` é um campo novo dentro do JSONB: não exige migração.
