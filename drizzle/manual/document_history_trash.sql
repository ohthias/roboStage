-- ---------------------------------------------------------------------------
-- Histórico de versões e lixeira do Stagebook — inserção manual (equivale a
-- drizzle/0006_document_history_trash.sql). Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "font" text;
CREATE INDEX IF NOT EXISTS "documents_deleted_at_idx" ON "documents" USING btree ("deleted_at");

CREATE TABLE IF NOT EXISTS "document_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "document_id" uuid NOT NULL,
  "title" text NOT NULL,
  "icon" text,
  "content" jsonb,
  "created_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id")
    REFERENCES "documents"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "document_versions_document_created_idx"
  ON "document_versions" USING btree ("document_id", "created_at");

COMMIT;
