#!/bin/bash

echo "🚀 Starting Kaggle Auto-Sync Watcher..."
echo "📡 Polling the live cloud matrix every 30 seconds. Press [Ctrl+C] to stop."
echo "----------------------------------------------------------------------"

while true; do
    # Run the real scraping script quietly
    python3 sync_kaggle.py > /dev/null 2>&1
    
    # Print a clean timestamp to your terminal so you know it's working
    echo "[$(date +'%H:%M:%S')] 🔄 Checked cloud matrix. Sleeping for 30s..."
    
    # Wait 30 seconds before checking again (polite to Kaggle's servers)
    sleep 30
done
