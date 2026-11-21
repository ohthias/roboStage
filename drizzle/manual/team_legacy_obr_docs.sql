-- ---------------------------------------------------------------------------
-- Legado: OBR/ligas, etapas e mais tipos de item — inserção manual (equivale a
-- drizzle/0013_team_legacy_obr_docs.sql). Rode depois de team_legacy.sql.
-- Pode rodar mais de uma vez. Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

ALTER TABLE "team_legacy_chapters" ADD COLUMN IF NOT EXISTS "league" text;
ALTER TABLE "team_legacy_chapters" ADD COLUMN IF NOT EXISTS "stage" text;
DO $$ BEGIN
	ALTER TABLE "team_legacy_chapters" ADD CONSTRAINT "team_legacy_chapters_league" CHECK ("league" is null or "league" in ('fll', 'obr', 'ftc', 'outra'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
	ALTER TABLE "team_legacy_chapters" ADD CONSTRAINT "team_legacy_chapters_stage" CHECK ("stage" is null or ("kind" = 'competition' and "stage" in ('regional', 'estadual', 'nacional', 'internacional', 'amistoso')));
EXCEPTION WHEN duplicate_object THEN null; END $$;
-- Temporadas FLL já criadas ganham a liga.
UPDATE "team_legacy_chapters" SET "league" = 'fll' WHERE "league" is null and "season_key" in ('bioglow', 'unearthed', 'submerged', 'masterpiece');
ALTER TABLE "team_legacy_items" ADD COLUMN IF NOT EXISTS "board_id" uuid;
ALTER TABLE "team_legacy_items" ADD COLUMN IF NOT EXISTS "folder_id" uuid;
ALTER TABLE "team_legacy_items" ADD COLUMN IF NOT EXISTS "session_id" uuid;
ALTER TABLE "team_legacy_items" ADD COLUMN IF NOT EXISTS "milestone_id" uuid;
ALTER TABLE "team_legacy_items" DROP CONSTRAINT IF EXISTS "team_legacy_items_one_target";
ALTER TABLE "team_legacy_items" ADD CONSTRAINT "team_legacy_items_one_target" CHECK (num_nonnulls("document_id", "test_id", "quickbrick_id", "thinklab_id", "journal_id", "board_id", "folder_id", "session_id", "milestone_id") = 1);
DO $$ BEGIN
	ALTER TABLE "team_legacy_items" ADD CONSTRAINT "team_legacy_items_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
	ALTER TABLE "team_legacy_items" ADD CONSTRAINT "team_legacy_items_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
	ALTER TABLE "team_legacy_items" ADD CONSTRAINT "team_legacy_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
	ALTER TABLE "team_legacy_items" ADD CONSTRAINT "team_legacy_items_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_board_unique" ON "team_legacy_items" USING btree ("chapter_id","board_id") WHERE "board_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_folder_unique" ON "team_legacy_items" USING btree ("chapter_id","folder_id") WHERE "folder_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_session_unique" ON "team_legacy_items" USING btree ("chapter_id","session_id") WHERE "session_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_milestone_unique" ON "team_legacy_items" USING btree ("chapter_id","milestone_id") WHERE "milestone_id" is not null;
CREATE INDEX IF NOT EXISTS "team_legacy_items_board_idx" ON "team_legacy_items" USING btree ("board_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_folder_idx" ON "team_legacy_items" USING btree ("folder_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_session_idx" ON "team_legacy_items" USING btree ("session_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_milestone_idx" ON "team_legacy_items" USING btree ("milestone_id");

COMMIT;
