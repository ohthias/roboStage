CREATE TYPE "public"."field_source" AS ENUM('manual', 'device');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('number', 'boolean', 'text', 'select', 'duration');--> statement-breakpoint
CREATE TYPE "public"."test_mode" AS ENUM('runs', 'calibrabot', 'individual', 'custom');--> statement-breakpoint
CREATE TABLE "test_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"execution_number" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_field_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_field_values_execution_id_field_key_key" UNIQUE("execution_id","field_key")
);
--> statement-breakpoint
CREATE TABLE "test_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"label" text NOT NULL,
	"field_type" "field_type" DEFAULT 'number' NOT NULL,
	"unit" text,
	"target_value" numeric,
	"field_order" integer DEFAULT 0 NOT NULL,
	"options" jsonb,
	"required" boolean DEFAULT false NOT NULL,
	"source" "field_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_fields_test_id_field_key_key" UNIQUE("test_id","field_key")
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
DROP TABLE "lab_test_attachments" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_executions" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_metrics" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_parameter_values" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_parameters" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_results" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_tag_assignments" CASCADE;--> statement-breakpoint
DROP TABLE "lab_tests" CASCADE;--> statement-breakpoint
DROP TABLE "fll_missions" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_failures" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_mission_results" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_run_details" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_run_plan" CASCADE;--> statement-breakpoint
DROP TABLE "strategies" CASCADE;--> statement-breakpoint
DROP TABLE "strategy_versions" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_calibration_details" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_calibration_plan" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_readings" CASCADE;--> statement-breakpoint
ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_field_values" ADD CONSTRAINT "test_field_values_execution_id_test_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."test_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_fields" ADD CONSTRAINT "test_fields_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."calibration_result";--> statement-breakpoint
DROP TYPE "public"."calibration_type";--> statement-breakpoint
DROP TYPE "public"."failure_severity";--> statement-breakpoint
DROP TYPE "public"."metric_type";--> statement-breakpoint
DROP TYPE "public"."parameter_type";--> statement-breakpoint
DROP TYPE "public"."lab_test_status";--> statement-breakpoint
DROP TYPE "public"."lab_test_type";