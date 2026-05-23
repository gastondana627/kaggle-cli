import json
import glob
import os

MODEL_COST_DB = {
    "Claude Haiku 4.5": {"in": 0.00000025, "out": 0.00000125},
    "Claude Opus 4.6": {"in": 0.000015, "out": 0.000075},
    "Gemini 2.0 Flash": {"in": 0.0000001, "out": 0.0000004},
    "GPT-5.4": {"in": 0.000005, "out": 0.000015},
}

def get_cost(model_name, input_t, output_t):
    rate = MODEL_COST_DB.get(model_name, {"in": 0.000001, "out": 0.000003})
    return (input_t * rate["in"]) + (output_t * rate["out"])

def parse_assertions():
    all_data = []
    raw_files = glob.glob("telemetry/raw_data/*.json")
    
    if not raw_files:
        print("⚠️ No raw JSON files found in telemetry/raw_data/")
        return

    for file in raw_files:
        try:
            with open(file, 'r') as f:
                content = json.load(f)
                
                # Normalize: ensure we are always iterating over a list of models
                models = content if isinstance(content, list) else [content]
                
                for data in models:
                    model_name = data.get("model_name", "Unknown Model")
                    assertions = data.get("assertions", [])
                    input_t = data.get("input_tokens", 0)
                    output_t = data.get("output_tokens", 0)
                    
                    passes = sum(1 for a in assertions if a is True)
                    total = len(assertions)
                    
                    all_data.append({
                        "name": model_name,
                        "score": round(passes / total, 4) if total > 0 else 0,
                        "label": f"{passes}/{total}",
                        "cost": round(get_cost(model_name, input_t, output_t), 4),
                        "assertions": assertions,
                        "input_tokens": input_t,
                        "output_tokens": output_t
                    })
        except Exception as e:
            print(f"❌ Error parsing {file}: {e}")
            
    with open("telemetry/assertions.json", "w") as f:
        json.dump(all_data, f, indent=2)
    
    print(f"✅ assertions.json generated with {len(all_data)} model results.")

if __name__ == "__main__":
    parse_assertions()