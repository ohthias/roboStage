ALTER TABLE "board_columns" ADD COLUMN "rules" jsonb DEFAULT '{}'::jsonb NOT NULL;
CREATE TABLE "board_milestones" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "board_id" uuid NOT NULL,
  "name" text NOT NULL,
  "due_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "board_cards" ADD COLUMN "milestone_id" uuid;
CREATE INDEX "board_milestones_board_id_idx" ON "board_milestones" USING btree ("board_id");
ALTER TABLE "board_milestones" ADD CONSTRAINT "board_milestones_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "board_cards" ADD CONSTRAINT "board_cards_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."board_milestones"("id") ON DELETE set null ON UPDATE no action;
