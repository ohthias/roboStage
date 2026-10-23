CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"layout_locked" boolean DEFAULT false NOT NULL,
	"sidebar_expanded" boolean DEFAULT false NOT NULL,
	"allow_team_invites" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;