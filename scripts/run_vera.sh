#!/usr/bin/env bash
echo "Launching VERA Intent Firewall API..."
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000
