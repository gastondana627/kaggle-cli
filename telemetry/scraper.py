import asyncio
import json
import csv
import os
from playwright.async_api import async_playwright

def save_to_datasets(data_list):
    os.makedirs("telemetry", exist_ok=True)
    
    # Save JSON
    with open("telemetry/benchmark_results.json", "w") as f:
        json.dump(data_list, f, indent=2)
    
    # Save CSV
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
        await page.get_by_role("button", name="Compare Outputs").click(force=True)
        await page.wait_for_selector("text='Compare model outputs'")
        
        print("⏳ Waiting for UI to render tabs...")
        await page.wait_for_selector("button[role='tab']", timeout=15000)
        
        tabs = await page.locator("button[role='tab']").all()
        print(f"🚀 Benchmarking {len(tabs)} models...")

        for tab in tabs:
            model_name = await tab.inner_text()
            await tab.click()
            
            # Let the specific model's data load into the grid
            await asyncio.sleep(2) 
            
            try:
                # Update these selectors based on the Inspect tool if they return 'N/A'
                score = await page.locator("div[class*='score']").first.inner_text() 
                tokens = await page.locator("span:has-text('tokens')").first.inner_text()
                time_sec = await page.locator("span:has-text('seconds')").first.inner_text()
                
                entry = {
                    "model": model_name,
                    "score": score,
                    "tokens": tokens,
                    "time_seconds": time_sec
                }
                dataset.append(entry)
                print(f"✅ Captured {model_name}")
                
                # Real-time saving to trigger your VSC hot-reload
                save_to_datasets(dataset)
                
            except Exception:
                print(f"⚠️ Could not extract metrics for {model_name}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_scraper())