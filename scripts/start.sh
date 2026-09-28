#!/usr/bin/env bash
set -e

echo "Starting VERA x DRUNIX services..."

if command -v docker &> /dev/null && [ "$1" == "--docker" ]; then
    echo "Starting via Docker Compose (PostgreSQL, KeyDB, NPCI Drunix, VERA API & Web)..."
    docker compose up -d
else
    echo "Starting in Native Local Mode (FastAPI Backend + Drunix Simulator)..."
    python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
fi
