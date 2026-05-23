import asyncio
import json
import csv
import os
import re
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
        await asyncio.sleep(4) 
        
        await page.get_by_role("button", name="Compare Outputs").click(force=True)
        print("⏳ Waiting for modal to open and load models...")
        await asyncio.sleep(4) 

        print("🔍 Searching for model buttons...")
        
        # Look for buttons that contain known AI prefixes
        tabs = await page.locator("button:has-text('GPT-'), button:has-text('Claude'), button:has-text('Gemini'), button:has-text('DeepSeek'), button:has-text('Qwen'), button:has-text('Gemma'), button:has-text('Grok'), button:has-text('GLM'), button:has-text('gpt-oss')").all()

        ignored_tabs = ["Task Detail", "Discussion", "Code", "Data", "Models", "Logs", "Compare Outputs", "Versions"]
        
        unique_tabs = []
        seen_names = set()

        for tab in tabs:
            name_raw = await tab.inner_text()
            if not name_raw: 
                continue
            
            # The button text looks like: "claude-opus-4-6-default \n Anthropic \n 0.59"
            # Let's split it into lines and clean it up
            lines = [line.strip() for line in name_raw.split('\n') if line.strip()]
            clean_name = lines[0]
            
            if clean_name in ignored_tabs or clean_name in seen_names:
                continue
                
            # Grab the score directly from the bottom of the button text!
            score_val = lines[-1] if len(lines) > 1 else "-"
            if "error" in score_val.lower():
                score_val = "Error"
            
            unique_tabs.append((clean_name, score_val, tab))
            seen_names.add(clean_name)

        print(f"🚀 Found {len(unique_tabs)} unique AI Models. Extracting telemetry...")

        for clean_name, score_val, tab in unique_tabs:
            try:
                await tab.scroll_into_view_if_needed()
                await tab.click(force=True)
                
                # Wait exactly 2.5 seconds for the grid to render
                await asyncio.sleep(2.5) 
                
                tokens_val = "-"
                time_sec = "-"
                
                try:
                    # FIX: Filter for ONLY the currently visible summary panel
                    summary_loc = page.locator("text=/output tokens/i").filter(state="visible").last
                    
                    # Bumped timeout slightly to 2s to allow the React state to swap
                    await summary_loc.wait_for(timeout=2000) 
                    summary_text = await summary_loc.inner_text()
                    
                    # REGEX PARSING:
                    # Look for the number right before "output tokens"
                    token_match = re.search(r'([0-9]+)\s*output tokens', summary_text)
                    if token_match:
                        tokens_val = token_match.group(1)
                        
                    # Look for the number right before the "s" at the end (e.g. 436.45s)
                    time_match = re.search(r'([0-9.]+)\s*s\b', summary_text)
                    if time_match:
                        time_sec = time_match.group(1)
                        
                except Exception:
                    # If the string isn't found, it gracefully fails and leaves them as "-"
                    pass
                
                entry = {
                    "model": clean_name,
                    "score": score_val,
                    "tokens": tokens_val,
                    "time_seconds": time_sec
                }
                dataset.append(entry)
                print(f"✅ Captured {clean_name} | Score: {score_val} | Tokens: {tokens_val} | Time: {time_sec}s")
                
                # Save immediately so Next.js hot-reloads instantly
                save_to_datasets(dataset)
                
            except Exception as e:
                print(f"⚠️ Skipped {clean_name}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_scraper())