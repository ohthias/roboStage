-- ---------------------------------------------------------------------------
-- Anatix — inserção manual (equivale a drizzle/0002_anatix_labs.sql).
-- Use só se `npm run db:migrate` falhar. Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql), num banco que já tem users e teams.
-- ---------------------------------------------------------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS "anatix_labs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "team_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "robot_name" text,
  "board" text,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "last_connected_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "anatix_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lab_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "robot_name" text,
  "board" text,
  "protocol_version" integer,
  "baud_rate" integer,
  "frame_count" integer DEFAULT 0 NOT NULL,
  "invalid_frames" integer DEFAULT 0 NOT NULL,
  "dropped_frames" integer DEFAULT 0 NOT NULL,
  "summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ended_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "anatix_frames" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "batch" integer NOT NULL,
  "frames" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Chaves estrangeiras (só cria se ainda não existirem).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anatix_labs_user_id_users_id_fk') THEN
    ALTER TABLE "anatix_labs" ADD CONSTRAINT "anatix_labs_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anatix_labs_team_id_teams_id_fk') THEN
    ALTER TABLE "anatix_labs" ADD CONSTRAINT "anatix_labs_team_id_teams_id_fk"
      FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anatix_sessions_lab_id_anatix_labs_id_fk') THEN
    ALTER TABLE "anatix_sessions" ADD CONSTRAINT "anatix_sessions_lab_id_anatix_labs_id_fk"
      FOREIGN KEY ("lab_id") REFERENCES "public"."anatix_labs"("id") ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anatix_sessions_user_id_users_id_fk') THEN
    ALTER TABLE "anatix_sessions" ADD CONSTRAINT "anatix_sessions_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anatix_frames_session_id_anatix_sessions_id_fk') THEN
    ALTER TABLE "anatix_frames" ADD CONSTRAINT "anatix_frames_session_id_anatix_sessions_id_fk"
      FOREIGN KEY ("session_id") REFERENCES "public"."anatix_sessions"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "anatix_labs_user_idx" ON "anatix_labs" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "anatix_labs_team_idx" ON "anatix_labs" USING btree ("team_id");
CREATE INDEX IF NOT EXISTS "anatix_sessions_lab_idx" ON "anatix_sessions" USING btree ("lab_id");
CREATE INDEX IF NOT EXISTS "anatix_frames_session_idx" ON "anatix_frames" USING btree ("session_id", "batch");

COMMIT;

-- ---------------------------------------------------------------------------
-- Opcional: avisar o Drizzle que a migração 0002 já foi aplicada, para o
-- próximo `npm run db:migrate` não tentar criar as tabelas de novo.
-- Só funciona se a tabela de controle já existir (migrações 0000/0001 rodadas
-- pelo drizzle-kit). O hash é o SHA-256 do arquivo drizzle/0002_anatix_labs.sql.
-- ---------------------------------------------------------------------------
-- INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
-- VALUES ('89fbe171bfdf734ea3e6ffb03074888232179a8b2342cb2e1f28ce4457f7db20', 1792884349884);
