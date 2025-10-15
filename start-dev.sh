#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set INSTALL=1 to force install deps
if [[ "${INSTALL:-0}" == "1" ]]; then
  (cd "$ROOT" && npm ci --no-audit --no-fund)
  (cd "$ROOT/listenary-backend" && npm ci --no-audit --no-fund)
fi

( cd "$ROOT/listenary-backend" && echo "[backend] npm run dev" && npm run dev ) &
BACK_PID=$!
( cd "$ROOT" && echo "[frontend] npm run dev" && npm run dev ) &
FRONT_PID=$!

echo "----------------------------------------"
echo "Frontend:  http://localhost:8080"
echo "Backend:   http://localhost:3000"
echo "----------------------------------------"

wait $BACK_PID $FRONT_PID


