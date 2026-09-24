# SPEC — Kiroshi (SEO/GEO Audit Platform)

Filled per `project-build-spec.md` §3. Two fields are flagged ASSUMPTION — edit before session 1.

```
PROJECT:            Kiroshi — B2B SEO + GEO audit tool
TIME BUDGET:        ASSUMPTION: self-paced, no hard hours budget (not a hackathon build)
DEADLINE:           ASSUMPTION: none fixed — treat "80% checkpoint" as "P0 feature-complete
                     and deployed", not a clock percentage
GOAL (1 sentence):  A user submits a domain they own, gets back a technical-SEO score,
                     a GEO (AI-citation) score, and a ranked list of specific fixes — not
                     just a dashboard.
REVIEWERS/USERS:    You (resume/portfolio credential) + real site owners you seed it with
                     (LocalFusion, Bharzari, friends' sites) for real before/after numbers.
HARD CONSTRAINTS:   Next.js/TypeScript (stated preference). No paid infra beyond free tiers
                     for the MVP. Must produce actionable fixes, not only scores — that's
                     the differentiator vs. every competitor researched (Profound, Semrush,
                     Writesonic all stop at "here's a dashboard").
STACK:              Next.js 15 (App Router) + TS — dashboard/marketing, best fit for a
                       content-crawlable + SSR-capable app you also need to self-optimize.
                     Clerk (Organizations) — fastest path to multi-tenant B2B auth.
                     Postgres (Neon) + Drizzle — relational scores/history + JSONB raw scans.
                     Trigger.dev — durable background jobs with a native Playwright build
                       extension; avoids hand-rolling a separate browser worker or fighting
                       Vercel serverless size/timeout limits. See ADR-001.
                     Cheerio — static HTML parsing, first pass before falling back to a
                       real browser.
                     Google PageSpeed Insights API — Core Web Vitals, don't rebuild Lighthouse.
                     Anthropic API (web search tool) + Perplexity Sonar — the only APIs that
                       return real grounded citations, which is what a GEO score is measuring.
                     Vercel — app hosting, git-integrated preview deploys.
DOMAIN INVARIANTS:  See §Domain invariants below.
DELIVERABLES:       Public repo, live URL, README, this SPEC.md, PROGRESS.md, CI green on main.
```

---

## Clarifying question (asked once, per §3 step 3)

**What's the actual time horizon — a focused 1-2 week build, or ongoing over the semester
alongside coursework/placements?** This changes whether P1 items (billing, PDF export, teams)
are worth attempting now or explicitly deferred. Proceeding on the ASSUMPTION above (self-paced,
milestone-based, not clock-based) until you say otherwise — nothing below depends on getting
this wrong, it only affects how aggressively P1 gets cut.

---

## ADR-001: Trigger.dev over a self-hosted Playwright worker

**Decision:** Run the crawl-and-score pipeline as a Trigger.dev task, using its official
Playwright build extension, instead of a separate always-on worker on Railway/Fly.io.

**Why:** Playwright directly inside Vercel serverless functions is fragile even in 2026 —
it needs `@sparticuz/chromium` bundling workarounds, runs several times slower than local,
and has open reports of Vercel's Fluid Compute breaking active Playwright sessions. Running
a separate worker service solves that but adds a second deployment target, its own CI, and
its own failure modes for a solo-maintained project. Trigger.dev's Playwright extension gives
real Chromium in a managed, long-running task with no serverless size/timeout constraints,
collapsing "background jobs" and "browser automation" into one platform and one bill.

**Trade-off accepted:** vendor dependency on Trigger.dev's free tier / pricing model. If it
ever becomes a blocker, the fallback is a Fly.io worker running Playwright directly — the
crawl logic itself doesn't change, only where it's invoked from.

---

## Requirements matrix

| Requirement | Tier | Task ID |
|---|---|---|
| Domain ownership verification (meta tag or DNS TXT) before crawling | P0 | T6 |
| Crawler: Cheerio pass, Playwright fallback for JS-rendered pages | P0 | T7, T8 |
| Technical SEO checks: title/meta length, headings, alt text, canonical, sitemap/robots | P0 | T9 |
| Core Web Vitals via PageSpeed Insights API | P0 | T10 |
| Structured data audit (JSON-LD, ~10-15 common schema.org types) | P0 | T11 |
| GEO check: llms.txt presence + entity/structure signals | P0 | T12 |
| GEO check: live citation test via Anthropic/Perplexity Sonar | P0 | T13 |
| Composite score + per-category breakdown | P0 | T14 |
| **Ranked, specific fix list per finding** (the actual differentiator) | P0 | T15 |
| Scan history / re-scan a site | P0 | T16 |
| Dashboard UI: submit site → status → results | P0 | T17-T19 |
| App's own SEO/GEO self-optimization (see below) | P0 | T20-T24 |
| CI: lint + typecheck + build + test, blocking on PR | P0 | T25 |
| Deploy: Vercel + Trigger.dev, smoke-tested end-to-end | P0 | T26 |
| PDF export of a report | P1 | T27 |
| Stripe billing / paid tier | P1 | T28 |
| Multi-site comparison / competitor benchmarking | P1 | Cut for v1 |
| Scheduled re-crawls (cron) | P1 | Cut for v1 |
| Team invites beyond the owner | Cut | — (Clerk Organizations supports it later; not built now) |

---

## Domain invariants

- **Scores:** composite and every sub-score ∈ [0, 100] integer. Validated at the API boundary,
  not just in the UI.
- **Core Web Vitals units:** LCP/INP stored and labeled in milliseconds, CLS unitless — never
  mix raw PageSpeed field names with display labels without a unit.
- **Timestamps:** stored UTC (`timestamptz`), displayed in the viewer's local time. A scan is a
  point-in-time snapshot — UI must show "as of `<datetime>`", never imply a live score.
- **URL normalization:** strip trailing slash, force `https://`, lowercase host before storing —
  prevents duplicate site rows for the same domain.
- **Ownership gate:** no crawl runs against a domain until verification (meta tag or DNS TXT)
  succeeds. This is both an ethical/legal guardrail (scraping sites you don't own is a gray
  zone, flagged earlier) and a product simplification — no "scan anyone's URL" mode in v1.
- **Citation score honesty:** the GEO/citation score is explicitly framed in the UI as
  "how {{model}} answered on {{date}}," never as "your AI ranking" — LLM answers are
  non-deterministic, and every commercial competitor gets criticized for overselling this exact
  number as more certain than it is.

---

## App self-optimization requirements (SEO + GEO, dogfooding the product)

These are P0, not polish — the product's own site is the first proof point.

- **Metadata:** Next.js Metadata API on every route, with a title/description template, not
  a static default repeated everywhere.
- **Sitemap + robots:** `app/sitemap.ts` and `app/robots.ts` (Next.js native, no third-party
  package needed).
- **Structured data:** JSON-LD `Organization` + `SoftwareApplication` on the marketing pages.
- **OpenGraph/Twitter cards:** dynamic OG images via `next/og` per page, not one static image
  site-wide.
- **`llms.txt` at the root** describing what the product does — this is literally the artifact
  the tool itself checks for on customer sites, so shipping one is the credibility test.
- **Canonical URLs**, single host (no www/non-www duplicate content).
- **Marketing/landing pages server-rendered**, not client-only shells — content must be
  crawlable without executing JS, same standard the tool holds other sites to.
- **Core Web Vitals budget** on the app's own pages, checked against the same PageSpeed API
  it calls for customers.
- **Semantic HTML + correct heading hierarchy + alt text** on every image, checked per
  component, not at the end.

---

## Design direction (per §7)

- **Tone:** credible technical tool — closer to a dev-facing analytics product than a
  consumer SaaS. Avoid gradients, marketing-site clichés, competing accents.
- **Color:** one hue family (a single blue or teal works for "technical/trustworthy") +
  neutrals; semantic tokens only (`primary`, `muted-foreground`, `destructive`,
  `chart-1..n` for score categories) — no literal hex in components.
- **Type:** one family; monospace reserved for scores, URLs, and raw metric values.
- **Data-viz:** each score category gets one color from the token set in a fixed order across
  every chart, so "technical SEO" is always the same color everywhere in the app.
- **Dark mode:** first-class from the start, not retrofitted — checked per component.
