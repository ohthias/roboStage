ALTER TABLE "quickbrick_notebooks" ADD COLUMN "league_id" uuid;--> statement-breakpoint
ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quickbrick_notebooks_league_idx" ON "quickbrick_notebooks" USING btree ("league_id");--> statement-breakpoint
-- Cadernos criados antes da integração passam a pertencer à FLL Challenge.
UPDATE "quickbrick_notebooks" SET "league_id" = (
	SELECT "id" FROM "leagues"
	WHERE ("code" ILIKE '%fll%' OR "name" ILIKE '%lego league%')
	  AND ("code" || ' ' || "name") NOT ILIKE '%future%'
	ORDER BY "code" LIMIT 1
) WHERE "league_id" IS NULL;
