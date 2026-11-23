-- ---------------------------------------------------------------------------
-- Diário ↔ tags/marcos/vínculos e metas — inserção manual (equivale a
-- drizzle/0011_journal_labels_goals.sql). Rode depois de journal.sql. Pode rodar
-- mais de uma vez. Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "criteria" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "completed_by" text;
ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "milestone_id" uuid;
DO $$ BEGIN
	ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "journal_entries_milestone_idx" ON "journal_entries" USING btree ("milestone_id");
CREATE TABLE IF NOT EXISTS "journal_entry_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entry_tags_unique" UNIQUE("entry_id","tag_id"),
	CONSTRAINT "journal_entry_tags_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entry_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "journal_entry_tags_entry_idx" ON "journal_entry_tags" USING btree ("entry_id");
CREATE INDEX IF NOT EXISTS "journal_entry_tags_tag_idx" ON "journal_entry_tags" USING btree ("tag_id");
CREATE TABLE IF NOT EXISTS "journal_entry_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"document_id" uuid,
	"test_id" uuid,
	"quickbrick_id" uuid,
	"thinklab_id" uuid,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entry_links_one_target" CHECK (num_nonnulls("document_id", "test_id", "quickbrick_id", "thinklab_id") = 1),
	CONSTRAINT "journal_entry_links_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entry_links_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entry_links_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entry_links_quickbrick_id_fkey" FOREIGN KEY ("quickbrick_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entry_links_thinklab_id_fkey" FOREIGN KEY ("thinklab_id") REFERENCES "public"."thinklab"("id") ON DELETE cascade ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "journal_entry_links_entry_idx" ON "journal_entry_links" USING btree ("entry_id");
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entry_links_document_unique" ON "journal_entry_links" USING btree ("entry_id","document_id") WHERE "document_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entry_links_test_unique" ON "journal_entry_links" USING btree ("entry_id","test_id") WHERE "test_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entry_links_quickbrick_unique" ON "journal_entry_links" USING btree ("entry_id","quickbrick_id") WHERE "quickbrick_id" is not null;
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entry_links_thinklab_unique" ON "journal_entry_links" USING btree ("entry_id","thinklab_id") WHERE "thinklab_id" is not null;
CREATE INDEX IF NOT EXISTS "journal_entry_links_document_idx" ON "journal_entry_links" USING btree ("document_id");
CREATE INDEX IF NOT EXISTS "journal_entry_links_test_idx" ON "journal_entry_links" USING btree ("test_id");
CREATE INDEX IF NOT EXISTS "journal_entry_links_quickbrick_idx" ON "journal_entry_links" USING btree ("quickbrick_id");
CREATE INDEX IF NOT EXISTS "journal_entry_links_thinklab_idx" ON "journal_entry_links" USING btree ("thinklab_id");

COMMIT;
