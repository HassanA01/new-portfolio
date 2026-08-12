CREATE TABLE "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"duration" text NOT NULL,
	"impact" text NOT NULL,
	"tech_stack" text[] NOT NULL,
	"highlights" text[] NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"tech" text[] NOT NULL,
	"image" text NOT NULL,
	"github" text NOT NULL,
	"live" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "projects_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "experience_company_title_idx" ON "experience" USING btree ("company","title");