-- ---------------------------------------------------------------------------
-- Diário — inserção manual (equivale a drizzle/0010_journal.sql). Pode rodar
-- mais de uma vez. Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"author_id" text NOT NULL,
	"entry_date" date NOT NULL,
	"title" text,
	"template_key" text,
	"content" jsonb DEFAULT '{"categories":[],"sections":[]}'::jsonb NOT NULL,
	"search_text" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entries_ownership_xor" CHECK (("user_id" is not null and "team_id" is null) or ("user_id" is null and "team_id" is not null)),
	CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entries_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "journal_entries_user_date_idx" ON "journal_entries" USING btree ("user_id","entry_date");
CREATE INDEX IF NOT EXISTS "journal_entries_team_date_idx" ON "journal_entries" USING btree ("team_id","entry_date");
CREATE INDEX IF NOT EXISTS "journal_entries_author_date_idx" ON "journal_entries" USING btree ("author_id","entry_date");
CREATE TABLE IF NOT EXISTS "journal_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'NotebookPen' NOT NULL,
	"content" jsonb DEFAULT '{"categories":[],"sections":[]}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_templates_ownership_xor" CHECK (("user_id" is not null and "team_id" is null) or ("user_id" is null and "team_id" is not null)),
	CONSTRAINT "journal_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "journal_templates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "journal_templates_user_idx" ON "journal_templates" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "journal_templates_team_idx" ON "journal_templates" USING btree ("team_id");

COMMIT;
