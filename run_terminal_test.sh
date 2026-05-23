#!/bin/bash
source venv/bin/activate

echo "🚀 Launching telemetry pipeline..."

# 1. Scrape the data (We know this works!)
echo "📊 Syncing high-fidelity telemetry data..."
python3 telemetry/scraper.py

# 2. Parse and generate the dashboard feed
python3 telemetry/parser.py

# 3. Update the UI
mkdir -p app/data
cp telemetry/assertions.json app/data/assertions.json

echo "✨ Telemetry pipeline finished. Dashboard is ready."