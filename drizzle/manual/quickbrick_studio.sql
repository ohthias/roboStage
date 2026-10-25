-- ===========================================================================
-- QuickBrick Studio — script completo para o banco (Neon / PostgreSQL)
--
-- Equivale às migrações drizzle/0003_quickbrick_notebooks.sql e
-- drizzle/0004_quickbrick_league.sql. Use no SQL Editor do Neon (ou psql)
-- se preferir não rodar `npm run db:migrate`.
--
-- • Idempotente: pode rodar mais de uma vez.
-- • Pré-requisitos: tabelas users, teams, milestones, tags e leagues.
-- • Só a FLL Challenge tem suporte ao QuickBrick por enquanto; o script
--   garante que a liga exista no catálogo e liga os cadernos antigos a ela.
-- ===========================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tabelas do caderno
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "quickbrick_diagrams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"season" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "quickbrick_notebook_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quickbrick_notebook_tags_unique" UNIQUE("notebook_id","tag_id")
);

CREATE TABLE IF NOT EXISTS "quickbrick_notebooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"milestone_id" uuid,
	"name" text NOT NULL,
	"robot_name" text,
	"description" text,
	"season" text,
	"cover_color" text,
	"studio_key" text,
	"studio_file_name" text,
	"studio_size" integer,
	"studio_uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_access_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "quickbrick_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"object_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"title" text,
	"notes" text,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "quickbrick_diagrams" ADD CONSTRAINT "quickbrick_diagrams_notebook_id_quickbrick_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_notebook_tags" ADD CONSTRAINT "quickbrick_notebook_tags_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_notebook_tags" ADD CONSTRAINT "quickbrick_notebook_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_photos" ADD CONSTRAINT "quickbrick_photos_notebook_id_quickbrick_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quickbrick_photos" ADD CONSTRAINT "quickbrick_photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "quickbrick_diagrams_notebook_idx" ON "quickbrick_diagrams" USING btree ("notebook_id");

CREATE INDEX IF NOT EXISTS "quickbrick_notebook_tags_notebook_idx" ON "quickbrick_notebook_tags" USING btree ("notebook_id");

CREATE INDEX IF NOT EXISTS "quickbrick_notebook_tags_tag_idx" ON "quickbrick_notebook_tags" USING btree ("tag_id");

CREATE INDEX IF NOT EXISTS "quickbrick_notebooks_user_idx" ON "quickbrick_notebooks" USING btree ("user_id");

CREATE INDEX IF NOT EXISTS "quickbrick_notebooks_team_idx" ON "quickbrick_notebooks" USING btree ("team_id");

CREATE INDEX IF NOT EXISTS "quickbrick_photos_notebook_idx" ON "quickbrick_photos" USING btree ("notebook_id","taken_at");

-- ---------------------------------------------------------------------------
-- 2. Integração com as competições (leagues)
-- ---------------------------------------------------------------------------

ALTER TABLE "quickbrick_notebooks" ADD COLUMN IF NOT EXISTS "league_id" uuid;

DO $$ BEGIN
  ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "quickbrick_notebooks_league_idx" ON "quickbrick_notebooks" USING btree ("league_id");

-- Garante a FLL Challenge no catálogo (só insere se nenhuma liga FLL existir).
INSERT INTO "leagues" ("code", "name", "description")
SELECT 'FLL', 'FIRST LEGO League Challenge', 'Competição de robótica com LEGO: jogo do robô e projeto de inovação.'
WHERE NOT EXISTS (
  SELECT 1 FROM "leagues"
  WHERE ("code" ILIKE '%fll%' OR "name" ILIKE '%lego league%')
    AND ("code" || ' ' || "name") NOT ILIKE '%future%'
)
ON CONFLICT ("code") DO NOTHING;

-- Cadernos sem competição passam a pertencer à FLL Challenge.
UPDATE "quickbrick_notebooks" SET "league_id" = (
  SELECT "id" FROM "leagues"
  WHERE ("code" ILIKE '%fll%' OR "name" ILIKE '%lego league%')
    AND ("code" || ' ' || "name") NOT ILIKE '%future%'
  ORDER BY "code" LIMIT 1
) WHERE "league_id" IS NULL;

COMMIT;

-- ---------------------------------------------------------------------------
-- Conferência (opcional)
-- ---------------------------------------------------------------------------
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'quickbrick_%';
-- SELECT id, code, name FROM leagues ORDER BY code;
