import os
import subprocess

def run_telemetry_pipeline():
    print("🚀 Initializing Telemetry Pipeline...")
    
    # 1. Run your existing parser on the raw output
    # This assumes parser.py handles the file finding
    result = subprocess.run(['python3', 'telemetry/parser.py'], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Data parsed successfully.")
        # 2. Copy the processed assertions to your app's data directory
        # This keeps your UI's data folder constantly updated
        import shutil
        shutil.copy('telemetry/assertions.json', 'app/data/assertions.json')
        print("✨ Dashboard telemetry updated.")
    else:
        print("❌ Telemetry failed:", result.stderr)

if __name__ == "__main__":
    run_telemetry_pipeline()