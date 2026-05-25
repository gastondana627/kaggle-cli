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

async def extract_model_telemetry(page, model_name):
    input_val, output_val, time_sec = "-", "-", "-"
    
    # Python-based Polling: Check the screen 40 times (20 seconds max)
    for _ in range(40):
        # 1. Grab raw text using innerText to preserve line breaks and spacing
        raw_text = await page.evaluate("document.body.innerText")
        
        # 2. Isolate the text for the current model
        parts = raw_text.split(model_name)
        if len(parts) > 1:
            target_text = parts[-1]
            
            # Look for lines containing "input tokens"
            lines = [l.strip() for l in target_text.split('\n') if "input" in l.lower()]
            if lines:
                # The detailed log line is always the longest
                best_line = max(lines, key=len)
                
                in_m = re.search(r'([0-9,]+)\s*input', best_line, re.IGNORECASE)
                out_m = re.search(r'([0-9,]+)\s*output', best_line, re.IGNORECASE)
                t_m = re.search(r'([0-9.]+)\s*s\b', best_line, re.IGNORECASE)
                
                if in_m:
                    current_input_int = int(in_m.group(1).replace(',', ''))
                    
                    # Store the parsed values
                    input_val = str(current_input_int)
                    if out_m: output_val = out_m.group(1).replace(',', '')
                    if t_m: time_sec = t_m.group(1)
                    
                    # 3. THE TRIGGER: If tokens > 10,000, we know the heavy payload loaded!
                    # Break the loop immediately so we don't waste time waiting.
                    if current_input_int > 10000:
                        break
                        
        # If we haven't found the big payload yet, wait 0.5s and check the screen again
        await page.wait_for_timeout(500)
        
    return {"input": input_val, "output": output_val, "time": time_sec}


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
        
        tabs = await page.locator("button:has-text('GPT-'), button:has-text('Claude'), button:has-text('Gemini'), button:has-text('DeepSeek'), button:has-text('Qwen'), button:has-text('Gemma'), button:has-text('Grok'), button:has-text('GLM'), button:has-text('gpt-oss')").all()

        ignored_tabs = ["Task Detail", "Discussion", "Code", "Data", "Models", "Logs", "Compare Outputs", "Versions"]
        
        unique_tabs = []
        seen_names = set()

        for tab in tabs:
            name_raw = await tab.inner_text()
            if not name_raw: continue
            lines = [line.strip() for line in name_raw.split('\n') if line.strip()]
            clean_name = lines[0]
            if clean_name in ignored_tabs or clean_name in seen_names: continue
            score_val = lines[-1] if len(lines) > 1 else "-"
            if "error" in score_val.lower(): score_val = "Error"
            unique_tabs.append((clean_name, score_val, tab))
            seen_names.add(clean_name)

        print(f"🚀 Found {len(unique_tabs)} unique AI Models. Extracting telemetry...")

        for clean_name, score_val, tab in unique_tabs:
            try:
                await tab.scroll_into_view_if_needed()
                await tab.click(force=True)
                
                # Hand over control to our custom Python polling extractor
                telemetry = await extract_model_telemetry(page, clean_name)
                
                entry = {
                    "model": clean_name,
                    "score": score_val,
                    "input_tokens": telemetry["input"],
                    "output_tokens": telemetry["output"],
                    "time_seconds": telemetry["time"]
                }
                dataset.append(entry)
                print(f"✅ Captured {clean_name} | In: {telemetry['input']} | Out: {telemetry['output']} | Time: {telemetry['time']}s")
                
                save_to_datasets(dataset)
                
            except Exception as e:
                print(f"⚠️ Skipped {clean_name}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_scraper())