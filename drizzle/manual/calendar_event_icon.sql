-- ---------------------------------------------------------------------------
-- Ícone nos eventos do calendário — inserção manual (equivale a
-- drizzle/0009_calendar_event_icon.sql). Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "icon" text;

COMMIT;
