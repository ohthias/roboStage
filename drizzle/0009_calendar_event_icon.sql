-- Ícone opcional nos eventos do calendário (mesmo formato do ícone das páginas).
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "icon" text;
