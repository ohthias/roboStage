CREATE TABLE "quickbrick_diagrams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"season" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quickbrick_notebook_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quickbrick_notebook_tags_unique" UNIQUE("notebook_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "quickbrick_notebooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"milestone_id" uuid,
	"name" text NOT NULL,
	"robot_name" text,
	"description" text,
	"season" text,
	"cover_color" text,
	"studio_key" text,
	"studio_file_name" text,
	"studio_size" integer,
	"studio_uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_access_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quickbrick_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"object_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"title" text,
	"notes" text,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quickbrick_diagrams" ADD CONSTRAINT "quickbrick_diagrams_notebook_id_quickbrick_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_notebook_tags" ADD CONSTRAINT "quickbrick_notebook_tags_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_notebook_tags" ADD CONSTRAINT "quickbrick_notebook_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_notebooks" ADD CONSTRAINT "quickbrick_notebooks_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_photos" ADD CONSTRAINT "quickbrick_photos_notebook_id_quickbrick_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."quickbrick_notebooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quickbrick_photos" ADD CONSTRAINT "quickbrick_photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quickbrick_diagrams_notebook_idx" ON "quickbrick_diagrams" USING btree ("notebook_id");--> statement-breakpoint
CREATE INDEX "quickbrick_notebook_tags_notebook_idx" ON "quickbrick_notebook_tags" USING btree ("notebook_id");--> statement-breakpoint
CREATE INDEX "quickbrick_notebook_tags_tag_idx" ON "quickbrick_notebook_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "quickbrick_notebooks_user_idx" ON "quickbrick_notebooks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quickbrick_notebooks_team_idx" ON "quickbrick_notebooks" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "quickbrick_photos_notebook_idx" ON "quickbrick_photos" USING btree ("notebook_id","taken_at");