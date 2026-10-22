-- ============================================================================
-- 0004 — Tags e Milestones universais
--
--  * milestones deixam de ser "por board" (board_milestones) e passam a
--    pertencer a um scope (usuário OU equipe), valendo para todas as
--    ferramentas. Os ids são preservados (cards e regras de coluna continuam
--    apontando para as mesmas milestones).
--  * tags deixam de ser um catálogo global e passam a ter dono (usuário OU
--    equipe) e cor de fundo personalizável. Cada tag global existente é
--    copiada para cada scope que a utilizava e os vínculos são religados.
--  * novas tabelas de vínculo de tags: eventos, ThinkLab e testes do LabTest.
--  * milestone_id em páginas, eventos, ThinkLab e testes.
--
-- Cada statement é independente (sem tabelas TEMP) para funcionar também com
-- o driver HTTP do Neon, que executa um statement por requisição.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Milestones universais
-- ---------------------------------------------------------------------------
ALTER TABLE "board_milestones" RENAME TO "milestones";
--> statement-breakpoint
ALTER TABLE "milestones" RENAME CONSTRAINT "board_milestones_pkey" TO "milestones_pkey";
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "user_id" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "team_id" uuid;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "description" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "color" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "created_by" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
UPDATE "milestones" m
SET "user_id" = b."user_id", "team_id" = b."team_id", "created_by" = b."created_by"
FROM "boards" b
WHERE b."id" = m."board_id";
--> statement-breakpoint
-- Remove também o índice e a FK de board_id.
ALTER TABLE "milestones" DROP COLUMN "board_id";
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_ownership_xor" CHECK (
  ("user_id" is not null and "team_id" is null) or ("user_id" is null and "team_id" is not null)
);
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_color_hex" CHECK ("color" is null or "color" ~* '^#[0-9a-f]{6}$');
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "milestones_user_id_idx" ON "milestones" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "milestones_team_id_idx" ON "milestones" USING btree ("team_id");
--> statement-breakpoint
CREATE INDEX "milestones_due_at_idx" ON "milestones" USING btree ("due_at");
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 2. milestone_id nas demais ferramentas
-- ---------------------------------------------------------------------------
ALTER TABLE "documents" ADD COLUMN "milestone_id" uuid;
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "milestone_id" uuid;
--> statement-breakpoint
ALTER TABLE "thinklab" ADD COLUMN "milestone_id" uuid;
--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "milestone_id" uuid;
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "thinklab" ADD CONSTRAINT "thinklab_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "documents_milestone_id_idx" ON "documents" USING btree ("milestone_id");
--> statement-breakpoint
CREATE INDEX "calendar_events_milestone_id_idx" ON "calendar_events" USING btree ("milestone_id");
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 3. Tags com dono (scope) e cor
-- ---------------------------------------------------------------------------
ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "user_id" text;
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "team_id" uuid;
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "color" text;
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint

-- 3a. Uma cópia da tag global para cada scope que a usa (páginas e cards).
--     Nomes que só diferem por maiúsculas dentro do mesmo scope viram uma tag só.
INSERT INTO "tags" ("name", "user_id", "team_id")
SELECT DISTINCT ON (s."user_id", s."team_id", lower(t."name"))
  t."name", s."user_id", s."team_id"
FROM "tags" t
JOIN (
  SELECT dt."tag_id", d."user_id", d."team_id"
  FROM "document_tags" dt
  JOIN "documents" d ON d."id" = dt."document_id"
  UNION
  SELECT bct."tag_id", b."user_id", b."team_id"
  FROM "board_card_tags" bct
  JOIN "board_cards" c ON c."id" = bct."card_id"
  JOIN "boards" b ON b."id" = c."board_id"
) s ON s."tag_id" = t."id"
WHERE t."user_id" IS NULL AND t."team_id" IS NULL
ORDER BY s."user_id", s."team_id", lower(t."name"), t."name";
--> statement-breakpoint

-- 3b. Evita colisão do unique (item, tag) quando um item tinha duas tags que
--     só diferiam por maiúsculas.
DELETE FROM "document_tags" a
USING "document_tags" b, "tags" ta, "tags" tb
WHERE a."document_id" = b."document_id" AND a."id" > b."id"
  AND ta."id" = a."tag_id" AND tb."id" = b."tag_id"
  AND lower(ta."name") = lower(tb."name");
--> statement-breakpoint
DELETE FROM "board_card_tags" a
USING "board_card_tags" b, "tags" ta, "tags" tb
WHERE a."card_id" = b."card_id" AND a."id" > b."id"
  AND ta."id" = a."tag_id" AND tb."id" = b."tag_id"
  AND lower(ta."name") = lower(tb."name");
--> statement-breakpoint

-- 3c. Religa os vínculos às tags do scope correto.
UPDATE "document_tags" dt
SET "tag_id" = nt."id"
FROM "documents" d, "tags" ot, "tags" nt
WHERE d."id" = dt."document_id"
  AND ot."id" = dt."tag_id" AND ot."user_id" IS NULL AND ot."team_id" IS NULL
  AND lower(nt."name") = lower(ot."name")
  AND nt."user_id" IS NOT DISTINCT FROM d."user_id"
  AND nt."team_id" IS NOT DISTINCT FROM d."team_id";
--> statement-breakpoint
UPDATE "board_card_tags" bct
SET "tag_id" = nt."id"
FROM "board_cards" c, "boards" b, "tags" ot, "tags" nt
WHERE c."id" = bct."card_id" AND b."id" = c."board_id"
  AND ot."id" = bct."tag_id" AND ot."user_id" IS NULL AND ot."team_id" IS NULL
  AND lower(nt."name") = lower(ot."name")
  AND nt."user_id" IS NOT DISTINCT FROM b."user_id"
  AND nt."team_id" IS NOT DISTINCT FROM b."team_id";
--> statement-breakpoint

-- 3d. Remove o catálogo global antigo (nenhum vínculo aponta mais para ele).
DELETE FROM "tags" WHERE "user_id" IS NULL AND "team_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_ownership_xor" CHECK (
  ("user_id" is not null and "team_id" is null) or ("user_id" is null and "team_id" is not null)
);
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_color_hex" CHECK ("color" is null or "color" ~* '^#[0-9a-f]{6}$');
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "tags" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "tags_team_id_idx" ON "tags" USING btree ("team_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_unique" ON "tags" USING btree ("user_id", lower("name")) WHERE "user_id" is not null;
--> statement-breakpoint
CREATE UNIQUE INDEX "tags_team_name_unique" ON "tags" USING btree ("team_id", lower("name")) WHERE "team_id" is not null;
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 4. Tabelas de vínculo: eventos, ThinkLab e testes
-- ---------------------------------------------------------------------------
CREATE TABLE "calendar_event_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "calendar_event_tags_unique" UNIQUE ("event_id", "tag_id")
);
--> statement-breakpoint
CREATE TABLE "thinklab_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "thinklab_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "thinklab_tags_unique" UNIQUE ("thinklab_id", "tag_id")
);
--> statement-breakpoint
CREATE TABLE "test_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "test_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "test_tags_unique" UNIQUE ("test_id", "tag_id")
);
--> statement-breakpoint
ALTER TABLE "calendar_event_tags" ADD CONSTRAINT "calendar_event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "calendar_event_tags" ADD CONSTRAINT "calendar_event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "thinklab_tags" ADD CONSTRAINT "thinklab_tags_thinklab_id_fkey" FOREIGN KEY ("thinklab_id") REFERENCES "public"."thinklab"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "thinklab_tags" ADD CONSTRAINT "thinklab_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "test_tags" ADD CONSTRAINT "test_tags_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "test_tags" ADD CONSTRAINT "test_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "calendar_event_tags_event_id_idx" ON "calendar_event_tags" USING btree ("event_id");
--> statement-breakpoint
CREATE INDEX "calendar_event_tags_tag_id_idx" ON "calendar_event_tags" USING btree ("tag_id");
--> statement-breakpoint
CREATE INDEX "thinklab_tags_thinklab_id_idx" ON "thinklab_tags" USING btree ("thinklab_id");
--> statement-breakpoint
CREATE INDEX "thinklab_tags_tag_id_idx" ON "thinklab_tags" USING btree ("tag_id");
--> statement-breakpoint
CREATE INDEX "test_tags_test_id_idx" ON "test_tags" USING btree ("test_id");
--> statement-breakpoint
CREATE INDEX "test_tags_tag_id_idx" ON "test_tags" USING btree ("tag_id");
