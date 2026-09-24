import { sql } from "drizzle-orm";
import {
  pgTable, pgEnum, text, uuid, boolean, integer, jsonb, timestamp,
  uniqueIndex, index, check,
} from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true });

export const scanStatus = pgEnum("scan_status", [
  "queued", "crawling", "scoring", "done", "failed",
]);
export const findingCategory = pgEnum("finding_category", [
  "technical_seo", "core_web_vitals", "structured_data", "geo_static", "geo_citation",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(), // Clerk org id
  name: text("name").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: text("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(), // normalized: lowercase host, https, no trailing slash
    verified: boolean("verified").notNull().default(false),
    verificationToken: text("verification_token").notNull(),
    verifiedAt: ts("verified_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sites_org_domain_uq").on(t.orgId, t.domain)],
);

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    status: scanStatus("status").notNull().default("queued"),
    compositeScore: integer("composite_score"),
    categoryScores: jsonb("category_scores").$type<Record<string, number>>(),
    raw: jsonb("raw"), // crawl + PSI + citation payloads
    error: text("error"),
    createdAt: ts("created_at").notNull().defaultNow(),
    completedAt: ts("completed_at"),
  },
  (t) => [
    index("scans_site_created_idx").on(t.siteId, t.createdAt),
    check("scans_composite_range", sql`${t.compositeScore} IS NULL OR ${t.compositeScore} BETWEEN 0 AND 100`),
  ],
);

export const findings = pgTable(
  "findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
    category: findingCategory("category").notNull(),
    checkId: text("check_id").notNull(),
    impact: integer("impact").notNull(), // 0-100, drives rank
    rank: integer("rank").notNull(),
    message: text("message").notNull(),
    fix: text("fix").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("findings_scan_rank_uq").on(t.scanId, t.rank),
    check("findings_impact_range", sql`${t.impact} BETWEEN 0 AND 100`),
  ],
);
