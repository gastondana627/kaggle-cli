#!/bin/bash
# Master Sync - Clean Version for macOS
while true; do
    echo "[$(date +'%H:%M:%S')] Running Kaggle Sync Pipeline..."
    python3 sync_kaggle.py > /dev/null 2>&1
    
    # 1. Update local file for the dashboard
    cp telemetry_calendar.json ../pencil-physics-web/
    
    # 2. Deploy to Vercel
    echo "Pushing live snapshot to Vercel..."
    cd ../pencil-physics-web
    npx vercel --prod --yes
    cd ../kaggle-cli
    
    echo "Done. Sleeping for 60s."
    sleep 60
done