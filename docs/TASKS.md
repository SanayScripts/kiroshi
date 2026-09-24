# TASKS

Format per `project-build-spec.md` §5. ≤90 min each, vertical slices where possible.

- [x] T1 — Scaffold repo [P0] [est: 45] [depends: none]
  - DoD: Next.js 15 + TS app boots, `.gitignore`, `.env.example`, `scripts/verify.sh` exists
  - Verify: `npm run dev` → app serves on localhost; `scripts/verify.sh` → exits 0

- [ ] T2 — Postgres + Drizzle schema: users, orgs, sites, scans, findings [P0] [est: 60] [depends: T1]
  - DoD: migration applies cleanly to a fresh Neon DB
  - Verify: `npx drizzle-kit push` → no errors; `psql` shows all 5 tables

- [ ] T3 — Clerk auth wired, Organizations enabled [P0] [est: 45] [depends: T1]
  - DoD: sign up/in works; a new org is created on first sign-in
  - Verify: manual sign-in → `/dashboard` redirect succeeds; unauthenticated hit → redirected to sign-in

- [ ] T4 — `/health` endpoint [P0] [est: 15] [depends: T2]
  - DoD: returns 200 + DB connectivity check
  - Verify: `curl localhost:3000/api/health` → `{"status":"ok","db":"connected"}`

- [ ] T5 — Site submission form (URL + org) [P0] [est: 45] [depends: T2, T3]
  - DoD: authenticated user can submit a domain; row created with `verified: false`
  - Verify: submit form → row visible in `sites` table

- [ ] T6 — Ownership verification (meta tag or DNS TXT) [P0] [est: 60] [depends: T5]
  - DoD: site flips to `verified: true` only after the check server-side confirms the token
  - Verify: submit unverified domain → crawl blocked; add meta tag → re-check → verified

- [ ] T7 — Cheerio crawler (static pass) [P0] [est: 60] [depends: T6]
  - DoD: given a verified URL, extracts title, meta, headings, links, images, JSON-LD blocks
  - Verify: run against a known static test page → all fields populated correctly

- [ ] T8 — Trigger.dev task + Playwright fallback for JS-rendered pages [P0] [est: 90] [depends: T7]
  - DoD: task detects an empty root div / SPA shell and re-crawls via Playwright inside Trigger.dev
  - Verify: run against a known SPA test page → content that Cheerio missed is captured

- [ ] T9 — Technical SEO scoring rules [P0] [est: 75] [depends: T8]
  - DoD: title/meta length, heading order, alt text coverage, canonical tag, sitemap/robots
    presence each produce a 0-100 sub-score + a specific finding string
  - Verify: unit tests against 3 fixture pages (good/mixed/bad) return expected scores

- [ ] T10 — PageSpeed Insights integration [P0] [est: 45] [depends: T8]
  - DoD: LCP/CLS/INP pulled and stored with correct units
  - Verify: known URL → values match what PageSpeed's own UI reports within tolerance

- [ ] T11 — Structured data audit [P0] [est: 60] [depends: T7]
  - DoD: JSON-LD parsed against ~10-15 schema.org types; missing/invalid schema flagged
  - Verify: fixture page with valid Organization schema → passes; page with none → flagged

- [ ] T12 — GEO static checks: llms.txt, entity clarity signals [P0] [est: 45] [depends: T7]
  - DoD: presence/absence of llms.txt detected; basic entity-structure heuristic scored
  - Verify: fixture with llms.txt present vs. absent → score differs as expected

- [ ] T13 — GEO citation test via Anthropic/Perplexity Sonar [P0] [est: 75] [depends: T6]
  - DoD: given a domain + a handful of relevant prompts, records whether/how it's cited
  - Verify: known well-cited site vs. obscure test domain → visibly different citation results

- [ ] T14 — Composite scoring + category breakdown [P0] [est: 45] [depends: T9, T10, T11, T12, T13]
  - DoD: single composite score computed from weighted sub-scores, stored per scan
  - Verify: unit test — known sub-scores → expected composite within rounding tolerance

- [ ] T15 — Ranked fix list generator [P0] [est: 60] [depends: T14]
  - DoD: every failing check produces a specific, ordered fix (not a generic tip) —
    this is the core differentiator, don't cut it
  - Verify: fixture with 3 known issues → 3 specific fixes returned, ordered by impact

- [ ] T16 — Scan history / re-scan [P0] [est: 30] [depends: T14]
  - DoD: re-running a scan on the same site creates a new row, old ones remain queryable
  - Verify: two scans on one site → both visible, most recent flagged as current

- [ ] T17 — Dashboard: submit + status polling [P0] [est: 60] [depends: T6, T8]
  - DoD: UI shows queued → crawling → scoring → done states
  - Verify: manual run — states visibly transition without a page refresh

- [ ] T18 — Dashboard: score breakdown + charts [P0] [est: 75] [depends: T14]
  - DoD: composite + category scores rendered with token colors per §Design direction
  - Verify: visual check in light + dark mode

- [ ] T19 — Dashboard: fix list + history view [P0] [est: 45] [depends: T15, T16]
  - DoD: fixes shown ranked; history shows trend over time (even if only 1-2 points initially)
  - Verify: visual check with seeded multi-scan fixture data

- [ ] T20 — App metadata + sitemap + robots [P0] [est: 30] [depends: T1]
  - DoD: `app/sitemap.ts`, `app/robots.ts`, per-route Metadata API in place
  - Verify: `/sitemap.xml` and `/robots.txt` resolve correctly

- [ ] T21 — App structured data (Organization/SoftwareApplication) [P0] [est: 30] [depends: T20]
  - DoD: JSON-LD present on marketing pages
  - Verify: Google Rich Results Test (or equivalent validator) passes

- [ ] T22 — App llms.txt + OG images [P0] [est: 30] [depends: T20]
  - DoD: `/llms.txt` served; dynamic OG image per key page
  - Verify: fetch `/llms.txt` → 200; OG preview renders correctly when shared

- [ ] T23 — Marketing pages server-rendered, CWV budget checked [P0] [est: 45] [depends: T20]
  - DoD: landing page has no client-only content gate; passes the app's own PageSpeed check
  - Verify: run the app's own crawler (T10) against its own landing page → passing score

- [ ] T24 — a11y pass: contrast, keyboard nav, ARIA on icon buttons [P0] [est: 45] [depends: T17-T19]
  - DoD: per §7 a11y checklist, checked component by component
  - Verify: keyboard-only walkthrough of submit → dashboard flow succeeds

- [ ] T25 — CI: lint, typecheck, build, test on PR [P0] [est: 45] [depends: T1]
  - DoD: GitHub Actions blocks merge on failure
  - Verify: open a PR with a deliberate lint error → check fails and blocks merge

- [ ] T26 — Deploy: Vercel + Trigger.dev, smoke test [P0] [est: 45] [depends: all above]
  - DoD: full flow (sign up → submit → verify → scan → score → fixes) works on the live URL
  - Verify: clean-browser end-to-end run against production URL

- [ ] T27 — PDF export [P1] [est: 60] [depends: T18, T19]
  - DoD: exportable report matches the dashboard breakdown
  - Verify: generated PDF opens and matches on-screen data

- [ ] T28 — Stripe billing / paid tier [P1] [est: 90] [depends: T26]
  - DoD: a free-tier scan limit exists; upgrade flow works in Stripe test mode
  - Verify: quota exceeded → upgrade prompt → test payment → quota reset

- [ ] T29 — README [P0] [est: 30] [depends: T26]
  - DoD: matches §10 standard (what/architecture/schema/setup/CI/in-out of scope/trade-offs)
  - Verify: a fresh clone following the README's setup section runs locally with no extra steps

- [ ] T30 — CodeQL / dependency audit [P1] [est: 20] [depends: T25]
  - DoD: security scan runs in CI as a non-blocking job initially
  - Verify: workflow appears in Actions tab with a result
