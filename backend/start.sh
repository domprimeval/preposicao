#!/bin/bash
apt-get install -y libreoffice --quiet 2>/dev/null || true
uvicorn main:app --host 0.0.0.0 --port $PORT
