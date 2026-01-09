#!/bin/bash
cd backend
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src/backend"
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"
