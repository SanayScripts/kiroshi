CREATE TYPE "public"."finding_category" AS ENUM('technical_seo', 'core_web_vitals', 'structured_data', 'geo_static', 'geo_citation');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('queued', 'crawling', 'scoring', 'done', 'failed');--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"category" "finding_category" NOT NULL,
	"check_id" text NOT NULL,
	"impact" integer NOT NULL,
	"rank" integer NOT NULL,
	"message" text NOT NULL,
	"fix" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "findings_impact_range" CHECK ("findings"."impact" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"status" "scan_status" DEFAULT 'queued' NOT NULL,
	"composite_score" integer,
	"category_scores" jsonb,
	"raw" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "scans_composite_range" CHECK ("scans"."composite_score" IS NULL OR "scans"."composite_score" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"domain" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verification_token" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "findings_scan_rank_uq" ON "findings" USING btree ("scan_id","rank");--> statement-breakpoint
CREATE INDEX "scans_site_created_idx" ON "scans" USING btree ("site_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sites_org_domain_uq" ON "sites" USING btree ("org_id","domain");