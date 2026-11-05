-- Sessões de treino, escala de funções e feed de atividade das equipes.
--
-- `team_activity`: linha do tempo da equipe (agregada na escrita).
-- `training_sessions` (+ presença): contêiner de um treino/competição; no
-- máximo UMA em andamento por equipe (índice parcial), o que permite vincular
-- execuções do LabTest e sessões Anatix automaticamente.
-- `team_duty_roles` / `session_duty_assignments`: escala de funções.
-- Colunas novas em tabelas existentes são nullable: não precisa de backfill.
CREATE TABLE IF NOT EXISTS "team_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"actor_id" text,
	"verb" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_activity_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "team_activity_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_activity_team_updated_idx" ON "team_activity" USING btree ("team_id","updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_activity_aggregate_idx" ON "team_activity" USING btree ("team_id","actor_id","verb","entity_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"title" text NOT NULL,
	"kind" text DEFAULT 'treino' NOT NULL,
	"status" text DEFAULT 'planejada' NOT NULL,
	"calendar_event_id" uuid,
	"milestone_id" uuid,
	"location" text,
	"notes" text,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"round_count" integer DEFAULT 0 NOT NULL,
	"current_round" integer,
	"roster_published_at" timestamp with time zone,
	"roster_snapshot" jsonb,
	"scheduled_for" timestamp with time zone,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "training_sessions_calendar_event_id_calendar_events_id_fk" FOREIGN KEY ("calendar_event_id") REFERENCES "public"."calendar_events"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "training_sessions_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "training_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_sessions_team_idx" ON "training_sessions" USING btree ("team_id","started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_sessions_calendar_event_idx" ON "training_sessions" USING btree ("calendar_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "training_sessions_one_active_per_team" ON "training_sessions" USING btree ("team_id") WHERE status = 'em_andamento';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_session_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_session_attendees_session_user_unique" UNIQUE("session_id","user_id"),
	CONSTRAINT "training_session_attendees_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "training_session_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_duty_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"color" text,
	"position" integer DEFAULT 0 NOT NULL,
	"max_per_slot" integer,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_duty_roles_team_label_unique" UNIQUE("team_id","label"),
	CONSTRAINT "team_duty_roles_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_duty_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"duty_role_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"round" integer,
	"assigned_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_duty_assignments_unique" UNIQUE NULLS NOT DISTINCT("session_id","duty_role_id","user_id","round"),
	CONSTRAINT "session_duty_assignments_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "session_duty_assignments_duty_role_id_team_duty_roles_id_fk" FOREIGN KEY ("duty_role_id") REFERENCES "public"."team_duty_roles"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "session_duty_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_duty_assignments_session_idx" ON "session_duty_assignments" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_duty_assignments_user_idx" ON "session_duty_assignments" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "test_executions" ADD COLUMN IF NOT EXISTS "training_session_id" uuid;--> statement-breakpoint
ALTER TABLE "test_executions" ADD COLUMN IF NOT EXISTS "created_by" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_training_session_id_training_sessions_id_fk" FOREIGN KEY ("training_session_id") REFERENCES "public"."training_sessions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "test_executions_training_session_idx" ON "test_executions" USING btree ("training_session_id");--> statement-breakpoint
ALTER TABLE "anatix_sessions" ADD COLUMN IF NOT EXISTS "training_session_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anatix_sessions" ADD CONSTRAINT "anatix_sessions_training_session_id_training_sessions_id_fk" FOREIGN KEY ("training_session_id") REFERENCES "public"."training_sessions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "anatix_sessions_training_session_idx" ON "anatix_sessions" USING btree ("training_session_id");
