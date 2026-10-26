CREATE TABLE "anatix_frames" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"batch" integer NOT NULL,
	"frames" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anatix_labs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"robot_name" text,
	"board" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anatix_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"robot_name" text,
	"board" text,
	"protocol_version" integer,
	"baud_rate" integer,
	"frame_count" integer DEFAULT 0 NOT NULL,
	"invalid_frames" integer DEFAULT 0 NOT NULL,
	"dropped_frames" integer DEFAULT 0 NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "anatix_frames" ADD CONSTRAINT "anatix_frames_session_id_anatix_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."anatix_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatix_labs" ADD CONSTRAINT "anatix_labs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatix_labs" ADD CONSTRAINT "anatix_labs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatix_sessions" ADD CONSTRAINT "anatix_sessions_lab_id_anatix_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."anatix_labs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatix_sessions" ADD CONSTRAINT "anatix_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anatix_frames_session_idx" ON "anatix_frames" USING btree ("session_id","batch");--> statement-breakpoint
CREATE INDEX "anatix_labs_user_idx" ON "anatix_labs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "anatix_labs_team_idx" ON "anatix_labs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "anatix_sessions_lab_idx" ON "anatix_sessions" USING btree ("lab_id");