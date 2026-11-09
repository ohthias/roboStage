-- Histórico de versões e lixeira do Stagebook.
--
-- `documents.deleted_at`: páginas excluídas vão para a lixeira e podem ser
-- restauradas por 7 dias. `document_versions`: as 5 versões mais recentes de
-- cada página (as anteriores são apagadas pela aplicação). `documents.font`:
-- fonte escolhida para a página inteira no editor.
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "font" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_deleted_at_idx" ON "documents" USING btree ("deleted_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"title" text NOT NULL,
	"icon" text,
	"content" jsonb,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_versions_document_created_idx" ON "document_versions" USING btree ("document_id","created_at");
