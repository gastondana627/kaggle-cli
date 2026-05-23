import asyncio
import json
import csv
import os
from playwright.async_api import async_playwright

def save_to_datasets(data_list):
    os.makedirs("telemetry", exist_ok=True)
    
    with open("telemetry/benchmark_results.json", "w") as f:
        json.dump(data_list, f, indent=2)
    
    if data_list:
        with open("telemetry/benchmark_results.csv", "w", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=data_list[0].keys())
            writer.writeheader()
            writer.writerows(data_list)
    print(f"📊 Dataset updated: {len(data_list)} models collected.")

async def run_scraper():
    dataset = []
    async with async_playwright() as p:
        browser = await p.chromium.launch_persistent_context("./browser_context", headless=False)
        page = await browser.new_page() 
        await page.goto("https://www.kaggle.com/benchmarks/tasks/gastondana/pencil-physics-mechanical-constraint-test/2", wait_until="networkidle")
        
        print("🎯 Triggering Comparison Modal...")
        await asyncio.sleep(3) 
        await page.get_by_role("button", name="Compare Outputs").click(force=True)
        
        print("⏳ Waiting for UI to render tabs...")
        await page.wait_for_selector("[role='tab']", timeout=15000)
        
        tabs = await page.locator("[role='tab']").all()
        
        # --- THE FIX: Ignore Kaggle's non-model navigation tabs ---
        ignored_tabs = ["Task Detail", "Discussion", "Code", "Data", "Models", "Logs", "Compare Outputs", "Versions"]
        
        print(f"🚀 Filtering {len(tabs)} tabs for AI Models...")

        for tab in tabs:
            try:
                model_name = await tab.inner_text()
                model_name = model_name.strip()
                
                # Skip empty tabs or Kaggle UI tabs
                if not model_name or model_name in ignored_tabs:
                    continue
                
                await tab.click()
                await asyncio.sleep(2) 
                
                # Extract Metrics
                score = await page.locator("div[class*='score']").first.inner_text() 
                
                token_elements = await page.locator("span:has-text('tokens')").all_inner_texts()
                tokens = token_elements[-1] if token_elements else "-"

                time_elements = await page.locator("span:has-text('seconds')").all_inner_texts()
                time_sec = time_elements[-1] if time_elements else "-"
                
                entry = {
                    "model": model_name,
                    "score": score,
                    "tokens": tokens,
                    "time_seconds": time_sec
                }
                dataset.append(entry)
                print(f"✅ Captured {model_name}: {time_sec} | Score: {score}")
                
                save_to_datasets(dataset)
                
            except Exception:
                # Silently skip errors so the loop doesn't break
                pass

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_scraper())