import os
import json
import re
from playwright.sync_api import sync_playwright
from run_eval import ALL_MODELS

URL = "https://www.kaggle.com/benchmarks/tasks/gastondana/pencil-physics-mechanical-constraint-test"
RESULTS_DIR = "./benchmark-results"

def clean_string(s):
    return "".join(c for c in s.lower() if c.isalnum())

def sync_cloud_runs():
    print("�� Booting VISIBLE browser to hack the pagination dropdown...")
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    extracted_results = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
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
            # Scroll down to bring the pagination footer into view
            page.evaluate("window.scrollBy(0, 1000)")
            page.wait_for_timeout(2000)
            
            # Look for the exact text label
            pagination_label = page.locator("text=Rows per page")
            
            if pagination_label.is_visible(timeout=3000):
                print("�� FOUND IT! Highlighting the pagination area...")
                
                # Get the parent container and look for the clickable dropdown box (usually a div or button)
                dropdown_trigger = pagination_label.locator("xpath=..").locator("[role='button'], button, select, div:has(svg)").first
                dropdown_trigger.highlight()
                page.wait_for_timeout(2000)
                
                print("🖱️ Clicking to open the menu...")
                dropdown_trigger.click()
                page.wait_for_timeout(1000) # Wait for the menu animation
                
                print("🎯 Hunting for the 'All' option in the list...")
                # Search for the "All" option in the popup list box
                # Material UI lists usually use role="option" or standard list items
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
        # Increased loop to account for the massive single-page table
        for i in range(8):
            page.evaluate("window.scrollBy(0, 800)")
            page.wait_for_timeout(1000)
            all_text += page.inner_text("body") + "\n"
            
        browser.close()

    print("\n🔍 Analyzing page data...")
    for master_name in ALL_MODELS.keys():
        escaped_name = re.escape(master_name)
        pattern = f"{escaped_name}[^0-9]{{0,50}}?(0\\.[0-9]+)"
        match = re.search(pattern, all_text, re.IGNORECASE)
        if match:
            extracted_results[master_name] = float(match.group(1))

    if not extracted_results:
        print("❌ Automation Failure.")
        return

    synced_count = 0
    for matched_master, score in extracted_results.items():
        filename = ALL_MODELS[matched_master]
        target_file = os.path.join(RESULTS_DIR, filename)
        with open(target_file, "w") as f:
            json.dump({"model": matched_master, "score": float(score), "status": "success"}, f, indent=2)
        synced_count += 1
            
    print(f"\n🎉 Verified {synced_count} models with live cloud state.")

if __name__ == "__main__":
    sync_cloud_runs()
