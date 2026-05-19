import os
import json
import re
import requests

# Target public benchmark task URL
URL = "https://www.kaggle.com/benchmarks/tasks/gastondana/pencil-physics-mechanical-constraint-test"
RESULTS_DIR = "./benchmark-results"

MASTER_MODELS = [
    "Gemini 2.5 Pro", "Gemini 2.5 Flash", "DeepSeek V3.2", "Claude Opus 4.6",
    "Gemma 4 26B A4B", "Gemini 2.0 Flash Lite", "Gemini 3.1 Flash-Lite Preview",
    "Gemma 4 31B", "Claude Sonnet 4.6", "Grok 4.20 (Non-Reasoning)",
    "Qwen 3 235B A22B Instruct", "Claude Opus 4.7", "GLM-5", "Claude Haiku 4.5",
    "Gemini 3.1 Pro Preview", "Gemini 2.0 Flash", "Qwen 3 Next 80B Instruct",
    "Qwen 3 Coder 480B", "Deepseek V3.1", "GPT-5.4 nano", "GPT-5.4 mini",
    "GPT-5.5", "Grok 4.20 Reasoning", "Qwen 3 Next 80B Thinking",
    "Gemini 3 Flash Preview", "gpt-oss-20b", "gpt-oss-120b", "Claude Opus 4.5",
    "Claude Sonnet 4.5", "Claude Opus 4.1", "Claude Sonnet 4", "DeepSeek-R1", "GPT-5.4"
]

def clean_string(s):
    return "".join(c for c in s.lower() if c.isalnum())

def sync_cloud_runs():
    print(f"📡 Fetching live evaluation matrix from Kaggle...")
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(URL, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to reach Kaggle page (Status: {response.status_code})")
            return
            
        html_content = response.text
        
        # Pull data structures embedded inside Kaggle's initial hydration state
        state_match = re.search(r"window\.Kaggle\.state\s*=\s*({.*?});", html_content)
        extracted_results = {}
        
        if state_match:
            try:
                state_json = json.loads(state_match.group(1))
                # Dynamic structural extraction across the benchmark payload tree
                results_list = state_json.get("benchmarkTask", {}).get("results", [])
                for entry in results_list:
                    m_name = entry.get("modelName")
                    m_score = entry.get("score")
                    if m_name and m_score is not None:
                        extracted_results[m_name] = float(m_score)
            except Exception:
                pass

        # Fallback Regex Parsing Engine if hydration state keys shift
        if not extracted_results:
            # Matches strings resembling model definitions followed by fractional score markers
            pattern = r'"modelName"\s*:\s*"([^"]+)"\s*,\s*"score"\s*:\s*([0-9.]+)'
            matches = re.findall(pattern, html_content)
            for m_name, m_score in matches:
                extracted_results[m_name] = float(m_score)

        if not extracted_results:
            print("⚠️ Could not parse automated state. Scraping visible layout data text...")
            # Emergency scrape targeting structural text blocks
            text_blocks = re.findall(r"([A-Za-z0-9.\-\s()]+)\s*\*([0-9.]+)\*", html_content)
            for m_name, m_score in text_blocks:
                name_strip = m_name.strip()
                if any(clean_string(name_strip) in clean_string(m) for m in MASTER_MODELS):
                    extracted_results[name_strip] = float(m_score)

        if not extracted_results:
            print("❌ No model results could be isolated from the public page payload.")
            print("💡 Tip: Use the 'Download via API' button on the Kaggle UI to drop the json file directly.")
            return

        print(f"⚡ Found {len(extracted_results)} model runs in the cloud. Syncing down to disk...")
        
        synced_count = 0
        for cloud_name, score in extracted_results.items():
            clean_cloud = clean_string(cloud_name)
            
            # Match cloud names to our rigid dashboard matrix slots
            matched_master = None
            for master_name in MASTER_MODELS:
                clean_master = clean_string(master_name)
                if clean_cloud in clean_master or clean_master in clean_cloud:
                    matched_master = master_name
                    break
            
            if matched_master:
                # Convert friendly name to a standard file handle (e.g., "Gemini 2.5 Pro" -> "gemini-2.5-pro.run.json")
                file_slug = matched_master.lower().replace(" ", "-").replace("(", "").replace(")", "")
                target_file = os.path.join(RESULTS_DIR, f"{file_slug}.run.json")
                
                # Write local run tracker file
                with open(target_file, "w") as f:
                    json.dump({"score": score, "status": "success"}, f, indent=2)
                
                print(f"  📥 Synced: {matched_master} -> {score}")
                synced_count += 1
                
        print(f"\n🎉 Sync complete! Successfully synchronized {synced_count} models to your local workspace.")

    except Exception as e:
        print(f"❌ Critical error running syncing pipeline: {str(e)}")

if __name__ == "__main__":
    sync_cloud_runs()