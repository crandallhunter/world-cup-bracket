ALTER TABLE "submissions" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "ens_name" text;--> statement-breakpoint
CREATE UNIQUE INDEX "submissions_username_lower_unq" ON "submissions" USING btree (lower("username"));