-- ---------------------------------------------------------------------------
-- Blocos sincronizados do Stagebook — inserção manual (equivale a
-- drizzle/0009_synced_blocks.sql). Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "synced_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"title" text DEFAULT 'Bloco sincronizado' NOT NULL,
	"content" jsonb,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ownership_xor" CHECK (("synced_blocks"."user_id" is not null and "synced_blocks"."team_id" is null) or ("synced_blocks"."user_id" is null and "synced_blocks"."team_id" is not null)),
	CONSTRAINT "synced_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "synced_blocks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "synced_blocks_user_id_idx" ON "synced_blocks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "synced_blocks_team_id_idx" ON "synced_blocks" USING btree ("team_id");
