-- Equivalente a drizzle/0009_showlive_pref.sql (db/schema/user-preferences.ts).
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "showlive_enabled" boolean DEFAULT false NOT NULL;
