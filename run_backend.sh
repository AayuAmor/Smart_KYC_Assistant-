#!/usr/bin/env bash
set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/backend" && pwd)"
VENV_DIR="$BACKEND_DIR/.venv"

cd "$BACKEND_DIR"

# ── Virtual environment ───────────────────────────────────────────────────────
if [ ! -f "$VENV_DIR/bin/activate" ]; then
  echo "[error] No virtual environment found at $VENV_DIR"
  echo "        Create one with:"
  echo "          cd backend && python3 -m venv .venv && source .venv/bin/activate"
  exit 1
fi

source "$VENV_DIR/bin/activate"

# ── Dependencies (opt-in) ─────────────────────────────────────────────────────
if [ "${INSTALL_DEPS:-false}" = "true" ]; then
  echo "[setup] Installing/updating dependencies..."
  pip install -q -r requirements.txt
fi

# ── .env check ────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "[error] No .env file found in $BACKEND_DIR"
  echo "        Copy .env.example and fill in the values:"
  echo "          cp backend/.env.example backend/.env"
  exit 1
fi

# ── Migrations ────────────────────────────────────────────────────────────────
echo "[db] Running Alembic migrations..."
alembic upgrade head

# ── Server ────────────────────────────────────────────────────────────────────
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
RELOAD="${RELOAD:-true}"

echo ""
echo "  Smart KYC Backend"
echo "  http://$HOST:$PORT"
echo "  docs → http://localhost:$PORT/docs"
echo ""

if [ "$RELOAD" = "true" ]; then
  uvicorn main:app --host "$HOST" --port "$PORT" --reload
else
  uvicorn main:app --host "$HOST" --port "$PORT"
fi
