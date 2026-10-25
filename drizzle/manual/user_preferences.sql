-- Equivalente ao schema db/schema/user-preferences.ts.
-- Preferível: `npx drizzle-kit generate` + `npx drizzle-kit migrate` (mantém o journal em dia).
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "user_id" text PRIMARY KEY NOT NULL,
  "layout_locked" boolean DEFAULT false NOT NULL,
  "sidebar_expanded" boolean DEFAULT false NOT NULL,
  "allow_team_invites" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
