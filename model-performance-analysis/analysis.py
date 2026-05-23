import os
import json
import pandas as pd
import plotly.express as px

# 1. Path to your specific local benchmark run log
log_path = "../benchmark-results/Pencil_Physics_Mechanical_Constraint_Test-run_id_Run_1_google_gemini-3-flash-preview.run.json"
local_score = None

if os.path.exists(log_path):
    with open(log_path, "r") as f:
        try:
            run_data = json.load(f)
            history = run_data.get("history", run_data.get("results", []))
            if history:
                local_score = float(history[-1].get("score", history[-1].get("correct", 0)))
            else:
                local_score = float(run_data.get("score", 0.26))
        except Exception as e:
            print(f"⚠️ Error reading local JSON: {e}")

# 2. Master Model Layout (The complete Kaggle Task configuration matrix)
master_matrix = {
    # === CRASHED/ERRORS ===
    "Gemini 2.5 Pro": {"Accuracy": 0.00, "Status": "Execution Error", "Label": "ERROR"},
    "Gemini 2.5 Flash": {"Accuracy": 0.00, "Status": "Execution Error", "Label": "ERROR"},
    "DeepSeek V3.2": {"Accuracy": 0.00, "Status": "Execution Error", "Label": "ERROR"},
    "Claude Opus 4.6": {"Accuracy": 0.00, "Status": "Execution Error", "Label": "ERROR"},
    
    # === COMPLETED RUNS ===
    "Gemma 4 26B A4B": {"Accuracy": 0.72, "Status": "Success", "Label": "0.72"},
    "Gemini 2.0 Flash Lite": {"Accuracy": 0.67, "Status": "Success", "Label": "0.67"},
    "Gemini 3.1 Flash-Lite Preview": {"Accuracy": 0.67, "Status": "Success", "Label": "0.67"},
    "Gemma 4 31B": {"Accuracy": 0.56, "Status": "Success", "Label": "0.56"},
    "Claude Sonnet 4.6": {"Accuracy": 0.53, "Status": "Success", "Label": "0.53"},
    "Grok 4.20 (Non-Reasoning)": {"Accuracy": 0.42, "Status": "Success", "Label": "0.42"},
    "Qwen 3 235B A22B Instruct": {"Accuracy": 0.33, "Status": "Success", "Label": "0.33"},
    "Claude Opus 4.7": {"Accuracy": 0.33, "Status": "Success", "Label": "0.33"},
    "GLM-5": {"Accuracy": 0.33, "Status": "Success", "Label": "0.33"},
    "Claude Haiku 4.5": {"Accuracy": 0.31, "Status": "Success", "Label": "0.31"},
    "Gemini 3.1 Pro Preview": {"Accuracy": 0.30, "Status": "Success", "Label": "0.30"},
    "Gemini 2.0 Flash": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "Qwen 3 Next 80B Instruct": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "Qwen 3 Coder 480B": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "Deepseek V3.1": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "GPT-5.4 nano": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "GPT-5.4 mini": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "GPT-5.5": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "Grok 4.20 Reasoning": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "Qwen 3 Next 80B Thinking": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    "Gemini 3 Flash Preview": {"Accuracy": 0.26, "Status": "Success", "Label": "0.26"},
    
    # === UNTESTED / WAITING FOR QUOTA ===
    "Claude Opus 4.5": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "Claude Sonnet 4.5": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "Claude Opus 4.1": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "Claude Sonnet 4": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "DeepSeek-R1": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "GPT-5.4": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "gpt-oss-20b": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"},
    "gpt-oss-120b": {"Accuracy": 0.00, "Status": "Untested", "Label": "Still Needs Testing ⏳"}
}

# 3. Intercept with your local run pipeline if present
if local_score is not None:
    master_matrix["Gemini 3 Flash Preview"] = {
        "Accuracy": local_score, 
        "Status": "Your Pipeline",
        "Label": f"{local_score:.2f} (Active Dev)"
    }

# Convert dictionary to DataFrame
formatted_data = []
for model, meta in master_matrix.items():
    formatted_data.append({
        "Model": model,
        "Accuracy": meta["Accuracy"],
        "Status": meta["Status"],
        "Label": meta["Label"]
    })

df = pd.DataFrame(formatted_data)

# Custom sorting: Active Pipeline first, then Successes, then Errors, then Untested tasks
status_order = {"Your Pipeline": 0, "Success": 1, "Execution Error": 2, "Untested": 3}
df["SortOrder"] = df["Status"].map(status_order)
df = df.sort_values(by=["SortOrder", "Accuracy"], ascending=[True, False])

# Reverse to display cleanly from top to bottom in horizontal bar format
df = df.iloc[::-1]

# 4. Generate the Visualization Canvas
fig = px.bar(
    df,
    x="Accuracy",
    y="Model",
    color="Status",
    orientation="h",
    text="Label",
    title="Pencil Physics: Full Benchmark Coverage & Testing Progress Roadmap",
    labels={"Accuracy": "Evaluation Score (Accuracy Matrix)", "Model": "Model Architecture"},
    color_discrete_map={
        "Your Pipeline": "#FFD700",       # Gold
        "Success": "#1f77b4",             # Corporate Blue
        "Execution Error": "#D32F2F",      # Warning Red
        "Untested": "#A0A0A0"              # Neutral Grey for remaining roadmap items
    }
)

# 5. Fine-tune layout sizing to fit all models cleanly
fig.update_traces(textposition="outside", cliponaxis=False)
fig.update_layout(
    xaxis_range=[0.0, 1.0],
    margin=dict(l=260, r=120, t=60, b=50),
    height=1100,  # Increased height to seamlessly support the entire Kaggle modal catalog
    showlegend=True,
    legend=dict(title="Testing Class", yanchor="top", y=0.99, xanchor="left", x=1.02)
)

print("📊 Progress map completely updated. Opening browser window...")
fig.show()