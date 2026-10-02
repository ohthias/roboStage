CREATE TYPE "public"."calibration_result" AS ENUM('aprovado', 'necessita_ajuste', 'reprovado');--> statement-breakpoint
CREATE TYPE "public"."calibration_type" AS ENUM('sensor', 'motor', 'servo', 'pid', 'giroscopio', 'sensor_cor', 'sensor_distancia', 'linha', 'curvas', 'outro');--> statement-breakpoint
CREATE TYPE "public"."failure_severity" AS ENUM('baixa', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."league_relation_type" AS ENUM('participante', 'interessado');--> statement-breakpoint
CREATE TYPE "public"."metric_type" AS ENUM('number', 'text', 'boolean');--> statement-breakpoint
CREATE TYPE "public"."parameter_type" AS ENUM('number', 'text', 'boolean', 'select');--> statement-breakpoint
CREATE TYPE "public"."persona_type" AS ENUM('competidor', 'mentor_tecnico', 'entusiasta', 'organizador');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('owner', 'mentor', 'competidor', 'colaborador');--> statement-breakpoint
CREATE TYPE "public"."lab_test_status" AS ENUM('rascunho', 'ativo', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."lab_test_type" AS ENUM('run', 'calibrabot', 'personalizado');--> statement-breakpoint
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
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"folder_id" uuid,
	"title" text DEFAULT 'Sem título' NOT NULL,
	"icon" text,
	"content" jsonb,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"parent_id" uuid,
	"name" text DEFAULT 'Nova pasta' NOT NULL,
	"icon" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "lab_test_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid,
	"execution_id" uuid,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_test_attachments_owner_check" CHECK ("lab_test_attachments"."test_id" IS NOT NULL OR "lab_test_attachments"."execution_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "lab_test_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"operator_id" text NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_seconds" numeric(10, 2),
	"notes" text,
	"result_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_test_executions_test_attempt_unique" UNIQUE("test_id","attempt_number")
);
--> statement-breakpoint
CREATE TABLE "lab_test_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"name" text NOT NULL,
	"unit" text,
	"type" "metric_type" DEFAULT 'number' NOT NULL,
	"higher_is_better" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_test_parameter_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"parameter_id" uuid NOT NULL,
	"value" text,
	CONSTRAINT "lab_test_parameter_values_unique" UNIQUE("execution_id","parameter_id")
);
--> statement-breakpoint
CREATE TABLE "lab_test_parameters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "parameter_type" DEFAULT 'text' NOT NULL,
	"unit" text,
	"default_value" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"metric_id" uuid NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "lab_test_results_unique" UNIQUE("execution_id","metric_id")
);
--> statement-breakpoint
CREATE TABLE "lab_test_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "lab_test_tag_assignments_unique" UNIQUE("test_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "lab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "lab_test_type" NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"status" "lab_test_status" DEFAULT 'ativo' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fll_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"season" text NOT NULL,
	"category" text,
	"definition" jsonb,
	"max_score" integer NOT NULL,
	CONSTRAINT "fll_missions_code_season_unique" UNIQUE("code","season")
);
--> statement-breakpoint
CREATE TABLE "lab_test_failures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"severity" "failure_severity" DEFAULT 'media' NOT NULL,
	"mission_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_test_mission_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"mission_id" uuid NOT NULL,
	"score_obtained" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"notes" text,
	CONSTRAINT "lab_test_mission_results_unique" UNIQUE("execution_id","mission_id")
);
--> statement-breakpoint
CREATE TABLE "lab_test_run_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"strategy_version_id" uuid,
	"season" text NOT NULL,
	"arena" text,
	"total_score" integer,
	"final_time_seconds" numeric(10, 2),
	"penalties" integer DEFAULT 0,
	"final_result" text,
	CONSTRAINT "lab_test_run_details_execution_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "lab_test_run_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"mission_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"full_attempt" boolean DEFAULT true NOT NULL,
	"notes" text,
	CONSTRAINT "lab_test_run_plan_unique" UNIQUE("test_id","mission_id")
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"version_label" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_test_calibration_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"calibration_type" "calibration_type" NOT NULL,
	"robot_model" text,
	"firmware" text,
	"battery_used" text,
	"sensor_used" text,
	"motor_used" text,
	"port_used" text,
	"ideal_value_found" text,
	"configuration_used" text,
	"result" "calibration_result" DEFAULT 'necessita_ajuste' NOT NULL,
	"final_notes" text,
	CONSTRAINT "lab_test_calibration_details_execution_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "lab_test_calibration_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"calibration_type" "calibration_type" NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_test_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"value" text NOT NULL,
	"unit" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "user_league_interests" ADD CONSTRAINT "user_league_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_league_interests" ADD CONSTRAINT "user_league_interests_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_attachments" ADD CONSTRAINT "lab_test_attachments_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_attachments" ADD CONSTRAINT "lab_test_attachments_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_attachments" ADD CONSTRAINT "lab_test_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_executions" ADD CONSTRAINT "lab_test_executions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_metrics" ADD CONSTRAINT "lab_test_metrics_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_parameter_values" ADD CONSTRAINT "lab_test_parameter_values_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_parameter_values" ADD CONSTRAINT "lab_test_parameter_values_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "public"."lab_test_parameters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_parameters" ADD CONSTRAINT "lab_test_parameters_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_results" ADD CONSTRAINT "lab_test_results_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_results" ADD CONSTRAINT "lab_test_results_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."lab_test_metrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_tag_assignments" ADD CONSTRAINT "lab_test_tag_assignments_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_tag_assignments" ADD CONSTRAINT "lab_test_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_failures" ADD CONSTRAINT "lab_test_failures_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_failures" ADD CONSTRAINT "lab_test_failures_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "public"."fll_missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_mission_results" ADD CONSTRAINT "lab_test_mission_results_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_mission_results" ADD CONSTRAINT "lab_test_mission_results_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "public"."fll_missions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_run_details" ADD CONSTRAINT "lab_test_run_details_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_run_details" ADD CONSTRAINT "lab_test_run_details_strategy_version_id_fkey" FOREIGN KEY ("strategy_version_id") REFERENCES "public"."strategy_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_run_plan" ADD CONSTRAINT "lab_test_run_plan_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_run_plan" ADD CONSTRAINT "lab_test_run_plan_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "public"."fll_missions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_versions" ADD CONSTRAINT "strategy_versions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" ADD CONSTRAINT "lab_test_calibration_details_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_calibration_plan" ADD CONSTRAINT "lab_test_calibration_plan_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_readings" ADD CONSTRAINT "lab_test_readings_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."lab_test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "folders_user_id_idx" ON "folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "folders_team_id_idx" ON "folders" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "folders_parent_id_idx" ON "folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "lab_test_attachments_test_id_idx" ON "lab_test_attachments" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "lab_test_attachments_execution_id_idx" ON "lab_test_attachments" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "lab_test_executions_test_id_idx" ON "lab_test_executions" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "lab_test_executions_operator_id_idx" ON "lab_test_executions" USING btree ("operator_id");--> statement-breakpoint
CREATE INDEX "lab_test_metrics_test_id_idx" ON "lab_test_metrics" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "lab_test_parameter_values_execution_id_idx" ON "lab_test_parameter_values" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "lab_test_parameter_values_parameter_id_idx" ON "lab_test_parameter_values" USING btree ("parameter_id");--> statement-breakpoint
CREATE INDEX "lab_test_parameters_test_id_idx" ON "lab_test_parameters" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "lab_test_results_execution_id_idx" ON "lab_test_results" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "lab_test_results_metric_id_idx" ON "lab_test_results" USING btree ("metric_id");--> statement-breakpoint
CREATE INDEX "lab_tests_user_id_idx" ON "lab_tests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lab_tests_team_id_idx" ON "lab_tests" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "lab_tests_type_idx" ON "lab_tests" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lab_tests_status_idx" ON "lab_tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fll_missions_season_idx" ON "fll_missions" USING btree ("season");--> statement-breakpoint
CREATE INDEX "lab_test_failures_execution_id_idx" ON "lab_test_failures" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "lab_test_failures_mission_id_idx" ON "lab_test_failures" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "lab_test_mission_results_execution_id_idx" ON "lab_test_mission_results" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "lab_test_mission_results_mission_id_idx" ON "lab_test_mission_results" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "lab_test_run_details_season_idx" ON "lab_test_run_details" USING btree ("season");--> statement-breakpoint
CREATE INDEX "strategies_test_id_idx" ON "strategies" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "strategy_versions_strategy_id_idx" ON "strategy_versions" USING btree ("strategy_id");--> statement-breakpoint
CREATE INDEX "lab_test_calibration_details_type_idx" ON "lab_test_calibration_details" USING btree ("calibration_type");--> statement-breakpoint
CREATE INDEX "lab_test_calibration_plan_test_id_idx" ON "lab_test_calibration_plan" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "lab_test_readings_execution_id_idx" ON "lab_test_readings" USING btree ("execution_id");