CREATE TABLE "submission_scores" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"division_id" text NOT NULL,
	"score" jsonb NOT NULL,
	"tiebreaker" integer,
	"champion" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"identity_type" text NOT NULL,
	"division_id" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bracket" jsonb NOT NULL,
	CONSTRAINT "submissions_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE "tournament_results" (
	"id" integer PRIMARY KEY NOT NULL,
	"results" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "used_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" text NOT NULL,
	"contract_address" text NOT NULL,
	"submission_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "used_tokens_contract_token_unq" UNIQUE("contract_address","token_id")
);
--> statement-breakpoint
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "used_tokens" ADD CONSTRAINT "used_tokens_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submissions_division_idx" ON "submissions" USING btree ("division_id");--> statement-breakpoint
CREATE INDEX "submissions_submitted_at_idx" ON "submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "used_tokens_submission_idx" ON "used_tokens" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "used_tokens_wallet_idx" ON "used_tokens" USING btree ("wallet_address");