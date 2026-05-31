#!/usr/bin/env bash
set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/backend" && pwd)"
VENV="$BACKEND_DIR/.venv"

cd "$BACKEND_DIR"

# ── Virtual environment ───────────────────────────────────────────────────────
if ! "$VENV/bin/python" -m pip --version &>/dev/null 2>&1; then
  echo "[setup] Creating virtual environment..."
  rm -rf "$VENV"
  python3 -m venv "$VENV"
fi

# ── Dependencies ──────────────────────────────────────────────────────────────
echo "[setup] Installing dependencies..."
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q -r requirements.txt

# ── .env check ────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "[setup] .env created from .env.example — edit DATABASE_URL and API keys, then re-run."
  exit 0
fi

# ── Migrations ────────────────────────────────────────────────────────────────
echo "[db] Running migrations..."
"$VENV/bin/alembic" upgrade head

# ── Server ────────────────────────────────────────────────────────────────────
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"

echo ""
echo "  Smart KYC Backend → http://localhost:$PORT"
echo "  Docs              → http://localhost:$PORT/docs"
echo ""

exec "$VENV/bin/uvicorn" main:app --host "$HOST" --port "$PORT" --reload
