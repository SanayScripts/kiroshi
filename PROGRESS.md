# PROGRESS

## Current verified state
- Last verified commit: 6864228
- `scripts/verify.sh` → passing
- Live: not yet deployed

## Time
- Budget: self-paced (see docs/SPEC.md — ASSUMPTION flagged, confirm or edit)
- Elapsed: 0h
- Next checkpoint: P0 feature-complete (milestone-based, not a clock percentage — see SPEC)

## Completed tasks
- T1, T2 (T2 verified against Neon: 5 tables)

## In progress / partially done
(none)

## Next task
T3 — Clerk auth, Organizations enabled (see docs/TASKS.md)

## Flagged issues / deviations
- Time budget / deadline in docs/SPEC.md are assumptions (self-paced, no fixed deadline) —
  confirm or edit before treating the 50%/80% checkpoints in project-build-spec.md §4 as
  literal, since they're calibrated for a clock-budgeted build.
- Branching model: using feature branches + PR (not solo-on-main), per §9's own exception
  for when CI-on-PR is being demonstrated — this project explicitly wants CI/CD as a
  resume-visible artifact.

- npm audit: 1 high (postcss nested in next 15.5, needs attacker-controlled CSS at build) + 5 moderate (drizzle-kit dev-only chain). Revisit before T26.

## Environment notes
- Providers to set up: Neon (Postgres), Clerk, Trigger.dev, Vercel, Google Cloud (PageSpeed
  Insights API key), Anthropic API key, Perplexity API key (Sonar).
- Env var NAMES to record here once created (never values): DATABASE_URL, CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, TRIGGER_SECRET_KEY, PAGESPEED_API_KEY, ANTHROPIC_API_KEY,
  PERPLEXITY_API_KEY.

## Session log
### Session 0 — spec created
- Done: docs/SPEC.md, docs/TASKS.md, scripts/verify.sh, CI workflow scaffolded
- Broke / tricky: none yet
- Commits: (none yet — first commit happens in T1)
