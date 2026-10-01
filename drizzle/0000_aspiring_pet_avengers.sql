CREATE TYPE "public"."league_relation_type" AS ENUM('participante', 'interessado');--> statement-breakpoint
CREATE TYPE "public"."persona_type" AS ENUM('competidor', 'mentor_tecnico', 'entusiasta', 'organizador');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('owner', 'mentor', 'competidor', 'colaborador');--> statement-breakpoint
CREATE TYPE "public"."test_mode" AS ENUM('runs', 'calibrabot', 'individual', 'custom');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"persona_type" "persona_type",
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leagues_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_league_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"league_id" uuid NOT NULL,
	"relation_type" "league_relation_type" DEFAULT 'interessado' NOT NULL,
	"team_name" text,
	"season" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_league_interests_user_league_unique" UNIQUE("user_id","league_id")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "team_role" DEFAULT 'competidor' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_team_user_unique" UNIQUE("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"league_id" uuid,
	"season" text,
	"organization_name" text,
	"clerk_org_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"folder_id" uuid,
	"parent_id" uuid,
	"title" text DEFAULT 'Sem título' NOT NULL,
	"icon" text,
	"cover" text,
	"description" text,
	"content" jsonb,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ownership_xor" CHECK (("documents"."user_id" is not null and "documents"."team_id" is null) or ("documents"."user_id" is null and "documents"."team_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"parent_id" uuid,
	"name" text DEFAULT 'Nova pasta' NOT NULL,
	"icon" text,
	"position" double precision DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ownership_xor" CHECK (("folders"."user_id" is not null and "folders"."team_id" is null) or ("folders"."user_id" is null and "folders"."team_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "calendar_event_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_event_documents_unique" UNIQUE("event_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"all_day" boolean DEFAULT false NOT NULL,
	"type" text DEFAULT 'evento' NOT NULL,
	"status" text DEFAULT 'confirmado' NOT NULL,
	"color" text,
	"location" text,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ownership_xor" CHECK (("calendar_events"."user_id" is not null and "calendar_events"."team_id" is null) or ("calendar_events"."user_id" is null and "calendar_events"."team_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "board_card_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "board_card_assignees_unique" UNIQUE("card_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "board_card_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "board_card_documents_unique" UNIQUE("card_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "board_card_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "board_card_events_unique" UNIQUE("card_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "board_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"column_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" double precision DEFAULT 0 NOT NULL,
	"due_at" timestamp with time zone,
	"priority" text DEFAULT 'media' NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"position" double precision DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ownership_xor" CHECK (("boards"."user_id" is not null and "boards"."team_id" is null) or ("boards"."user_id" is null and "boards"."team_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"data" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_card_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "board_card_tags_unique" UNIQUE("card_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "document_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_tags_unique" UNIQUE("document_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "test_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"execution_number" integer NOT NULL,
	"notes" text,
	"results" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"folder_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"mode" "test_mode" DEFAULT 'runs' NOT NULL,
	"season" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_access_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "user_league_interests" ADD CONSTRAINT "user_league_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_league_interests" ADD CONSTRAINT "user_league_interests_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_documents" ADD CONSTRAINT "calendar_event_documents_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_documents" ADD CONSTRAINT "calendar_event_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_assignees" ADD CONSTRAINT "board_card_assignees_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."board_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_assignees" ADD CONSTRAINT "board_card_assignees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_documents" ADD CONSTRAINT "board_card_documents_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."board_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_documents" ADD CONSTRAINT "board_card_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_events" ADD CONSTRAINT "board_card_events_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."board_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_events" ADD CONSTRAINT "board_card_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_cards" ADD CONSTRAINT "board_cards_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_cards" ADD CONSTRAINT "board_cards_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "public"."board_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_tags" ADD CONSTRAINT "board_card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."board_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_card_tags" ADD CONSTRAINT "board_card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_persona_type_idx" ON "users" USING btree ("persona_type");--> statement-breakpoint
CREATE INDEX "leagues_code_idx" ON "leagues" USING btree ("code");--> statement-breakpoint
CREATE INDEX "user_league_interests_user_id_idx" ON "user_league_interests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_league_interests_league_id_idx" ON "user_league_interests" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "team_members_team_id_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_members_user_id_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teams_league_id_idx" ON "teams" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "teams_created_by_idx" ON "teams" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_team_id_idx" ON "documents" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "documents_folder_id_idx" ON "documents" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "documents_parent_id_idx" ON "documents" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "documents_user_folder_idx" ON "documents" USING btree ("user_id","folder_id");--> statement-breakpoint
CREATE INDEX "documents_team_folder_idx" ON "documents" USING btree ("team_id","folder_id");--> statement-breakpoint
CREATE INDEX "folders_user_id_idx" ON "folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "folders_team_id_idx" ON "folders" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "folders_parent_id_idx" ON "folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "folders_user_parent_idx" ON "folders" USING btree ("user_id","parent_id");--> statement-breakpoint
CREATE INDEX "folders_team_parent_idx" ON "folders" USING btree ("team_id","parent_id");--> statement-breakpoint
CREATE INDEX "calendar_event_documents_event_id_idx" ON "calendar_event_documents" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "calendar_event_documents_document_id_idx" ON "calendar_event_documents" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "calendar_events_user_id_idx" ON "calendar_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendar_events_team_id_idx" ON "calendar_events" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_at_idx" ON "calendar_events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "calendar_events_user_start_idx" ON "calendar_events" USING btree ("user_id","start_at");--> statement-breakpoint
CREATE INDEX "calendar_events_team_start_idx" ON "calendar_events" USING btree ("team_id","start_at");--> statement-breakpoint
CREATE INDEX "board_card_assignees_card_id_idx" ON "board_card_assignees" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "board_card_assignees_user_id_idx" ON "board_card_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "board_card_documents_card_id_idx" ON "board_card_documents" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "board_card_documents_document_id_idx" ON "board_card_documents" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "board_card_events_card_id_idx" ON "board_card_events" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "board_card_events_event_id_idx" ON "board_card_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "board_cards_board_id_idx" ON "board_cards" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "board_cards_column_id_idx" ON "board_cards" USING btree ("column_id");--> statement-breakpoint
CREATE INDEX "board_cards_due_at_idx" ON "board_cards" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "board_columns_board_id_idx" ON "board_columns" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "boards_user_id_idx" ON "boards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boards_team_id_idx" ON "boards" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "board_card_tags_card_id_idx" ON "board_card_tags" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "board_card_tags_tag_id_idx" ON "board_card_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "document_tags_document_id_idx" ON "document_tags" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_tags_tag_id_idx" ON "document_tags" USING btree ("tag_id");