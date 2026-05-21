import os
import json
import re
from datetime import datetime
from playwright.sync_api import sync_playwright

URL = "https://www.kaggle.com/benchmarks/tasks/gastondana/pencil-physics-mechanical-constraint-test"
RESULTS_DIR = "./benchmark-results"

def clean_string(s):
    return "".join(c for c in s.lower() if c.isalnum())

def load_models_config():
    config_path = "models_config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f).get("models", {})
    return {}

def update_telemetry_calendar(model_name, score, cost):
    # This saves it directly to the root of your kaggle-cli folder
    calendar_path = "telemetry_calendar.json"
    today = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    # Load existing ledger or create a new dict
    if os.path.exists(calendar_path):
        with open(calendar_path, "r") as f:
            try:
                calendar_data = json.load(f)
            except json.JSONDecodeError:
                calendar_data = {}
    else:
        calendar_data = {}

    # Ensure today's array exists
    if today not in calendar_data:
        calendar_data[today] = []

    # Append the new run
    calendar_data[today].append({
        "model": model_name,
        "score": score,
        "estimated_cost": cost,
        "timestamp": now_time
    })

    # Save back to disk
    with open(calendar_path, "w") as f:
        json.dump(calendar_data, f, indent=2)


def sync_cloud_runs():
    models_config = load_models_config()
    if not models_config:
        print("❌ Error: models_config.json not found or empty.")
        return

    print("🤖 Booting HEADLESS browser to hack the pagination dropdown...")
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    extracted_results = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_timeout(5000)
        
        try:
            page.get_by_text("Leaderboard", exact=True).click(timeout=5000)
            page.wait_for_timeout(3000)
        except Exception:
            pass

        print("🎯 Hunting for the 'Rows per page' dropdown...")
        try:
            page.evaluate("window.scrollBy(0, 1000)")
            page.wait_for_timeout(2000)
            
            pagination_label = page.locator("text=Rows per page")
            
            if pagination_label.is_visible(timeout=3000):
                print("👀 FOUND IT! Highlighting the pagination area...")
                
                dropdown_trigger = pagination_label.locator("xpath=..").locator("[role='button'], button, select, div:has(svg)").first
                dropdown_trigger.highlight()
                page.wait_for_timeout(2000)
                
                print("🖱️ Clicking to open the menu...")
                dropdown_trigger.click()
                page.wait_for_timeout(1000)
                
                print("🎯 Hunting for the 'All' option in the list...")
                all_option = page.locator("[role='option']:has-text('All'), li:has-text('All')").first
                
                all_option.highlight()
                page.wait_for_timeout(2000)
                
                print("🖱️ Clicking 'All'...")
                all_option.click()
                
                print("⏳ Waiting 3 seconds for Kaggle to render the massive table...")
                page.wait_for_timeout(3000)
            else:
                print("🤷‍♂️ Couldn't find 'Rows per page'.")
        except Exception as e:
            print(f"⚠️ Dropdown hack failed: {str(e)}")

        print("📜 Scrolling down slowly to capture the massive table...")
        all_text = ""
        for i in range(8):
            page.evaluate("window.scrollBy(0, 800)")
            page.wait_for_timeout(1000)
            all_text += page.inner_text("body") + "\n"
            
        browser.close()

    print("\n🔍 Analyzing page data...")
    for master_name in models_config.keys():
        escaped_name = re.escape(master_name)
        pattern = f"{escaped_name}[^0-9]{{0,50}}?(0\\.[0-9]+)"
        match = re.search(pattern, all_text, re.IGNORECASE)
        if match:
            extracted_results[master_name] = float(match.group(1))
        else:
            print(f"⚠️ Missing from Kaggle Leaderboard: {master_name}")

    if not extracted_results:
        print("❌ Automation Failure. No models extracted.")
        return

    synced_count = 0
    for matched_master, score in extracted_results.items():
        filename = models_config[matched_master]
        target_file = os.path.join(RESULTS_DIR, filename)
        
        # Save standard run file
        with open(target_file, "w") as f:
            json.dump({"model": matched_master, "score": float(score), "status": "success"}, f, indent=2)
            
        # UPDATE CALENDAR LEDGER
        cost = 3.00 if matched_master == "DeepSeek-R1" else 0.00
        update_telemetry_calendar(matched_master, float(score), cost)
        
        synced_count += 1
            
    print(f"\n🎉 Verified {synced_count} models with live cloud state.")

if __name__ == "__main__":
    sync_cloud_runs()