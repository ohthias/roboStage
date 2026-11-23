-- ---------------------------------------------------------------------------
-- Legado da equipe — inserção manual (equivale a drizzle/0012_team_legacy.sql).
-- Rode depois de journal_labels_goals.sql. Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS "team_legacy_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"kind" text DEFAULT 'season' NOT NULL,
	"parent_id" uuid,
	"title" text NOT NULL,
	"season_key" text,
	"start_date" date,
	"end_date" date,
	"location" text,
	"color" text,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_legacy_chapters_kind" CHECK ("kind" in ('season', 'competition')),
	CONSTRAINT "team_legacy_chapters_parent_kind" CHECK ("parent_id" is null or "kind" = 'competition'),
	CONSTRAINT "team_legacy_chapters_dates" CHECK ("start_date" is null or "end_date" is null or "start_date" <= "end_date"),
	CONSTRAINT "team_legacy_chapters_color_hex" CHECK ("color" is null or "color" ~* '^#[0-9a-f]{6}$'),
	CONSTRAINT "team_legacy_chapters_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_chapters_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."team_legacy_chapters"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "team_legacy_chapters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "team_legacy_chapters_team_idx" ON "team_legacy_chapters" USING btree ("team_id","start_date");
CREATE INDEX IF NOT EXISTS "team_legacy_chapters_parent_idx" ON "team_legacy_chapters" USING btree ("parent_id");
CREATE TABLE IF NOT EXISTS "team_legacy_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"document_id" uuid,
	"test_id" uuid,
	"quickbrick_id" uuid,
	"thinklab_id" uuid,
	"journal_id" uuid,
	"note" text,
	"position" double precision DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_legacy_items_one_target" CHECK (num_nonnulls("document_id", "test_id", "quickbrick_id", "thinklab_id", "journal_id") = 1),
	CONSTRAINT "team_legacy_items_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."team_legacy_chapters"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_items_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_items_quickbrick_id_fkey" FOREIGN KEY ("quickbrick_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_items_thinklab_id_fkey" FOREIGN KEY ("thinklab_id") REFERENCES "public"."thinklab"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_items_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_legacy_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "team_legacy_items_chapter_idx" ON "team_legacy_items" USING btree ("chapter_id","position");
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_document_unique" ON "team_legacy_items" USING btree ("chapter_id","document_id") WHERE "document_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_test_unique" ON "team_legacy_items" USING btree ("chapter_id","test_id") WHERE "test_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_quickbrick_unique" ON "team_legacy_items" USING btree ("chapter_id","quickbrick_id") WHERE "quickbrick_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_thinklab_unique" ON "team_legacy_items" USING btree ("chapter_id","thinklab_id") WHERE "thinklab_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "team_legacy_items_journal_unique" ON "team_legacy_items" USING btree ("chapter_id","journal_id") WHERE "journal_id" is not null;
CREATE INDEX IF NOT EXISTS "team_legacy_items_document_idx" ON "team_legacy_items" USING btree ("document_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_test_idx" ON "team_legacy_items" USING btree ("test_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_quickbrick_idx" ON "team_legacy_items" USING btree ("quickbrick_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_thinklab_idx" ON "team_legacy_items" USING btree ("thinklab_id");
CREATE INDEX IF NOT EXISTS "team_legacy_items_journal_idx" ON "team_legacy_items" USING btree ("journal_id");

COMMIT;
