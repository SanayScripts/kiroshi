#!/usr/bin/env bash
set -euo pipefail

echo "== install check =="
npm ci --silent

echo "== typecheck =="
npx tsc --noEmit

echo "== lint =="
npm run lint --silent

echo "== build =="
npm run build --silent

echo "== test =="
npm run test --silent -- --run

echo "== migration status =="
if [ -f drizzle.config.ts ]; then npx drizzle-kit check; else echo "skipped (pre-T2)"; fi

echo "verify.sh: ALL CHECKS PASSED"
