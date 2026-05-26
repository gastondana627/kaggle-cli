# 🏆 Pencil Physics: Mechanical Reasoning Benchmark

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![Playwright](https://img.shields.io/badge/Playwright-Async-45ba4b?style=flat&logo=playwright)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)

A high-fidelity benchmarking engine designed to evaluate the true depth of SOTA models' spatial and physical comprehension. This project is transitioning from a multimodal performance telemetry extraction pipeline into a rigorous **Mechanical Reasoning Exam**, explicitly targeting models that linguistically over-index but fail to track "hidden state" mechanical physics.

---

## 🧠 The Benchmark: The "Pencil Physics" Anomaly

This project tracks SOTA reasoning engines against the "Pencil Physics" mechanical constraint test. "Pencil Man" acts as an adversarial prompt, testing a model's ability to maintain conceptual identity within a chaotic environment while strictly adhering to the laws of physics. We hypothesize that models rely on linguistic prediction rather than true mental simulation, leading to catastrophic failures in multi-step mechanical constraint tracking.

---

## ⚙️ Architecture & Data Integrity

Kaggle lacks a native telemetry API for deep comparison metrics. This repository solves that using a custom extraction layer:

1. **Autonomous Telemetry Extraction (`scraper.py`):** Uses an asynchronous Playwright engine. Currently optimizing to shift from 0.5s DOM polling to direct Network-Level Interception to completely eliminate UI rendering latency.
2. **Data Reconciliation:** Results are cross-audited against official benchmark logs to account for discrepancies where UI-reported data may be incomplete.
3. **Verified Source of Truth:** All metrics are committed to the repository, ensuring the dashboard displays audited, high-fidelity performance data.
4. **Performance Dashboard (`DashboardClient.tsx`):** A custom Next.js matrix mapping performance scores against normalized compute costs.

---

## 📏 Standard Submission Format for Mechanical Reasoning

As we evolve into a mechanical reasoning exam, we enforce strict output validation for all models tested on logic-grid puzzles (e.g., sliding blocks, gear ratios, pulley systems).

Models **MUST** adhere to the following `Standard Submission Format`:
1. **Hidden State Tracking:** The model must sequentially log the physical state (coordinates, torque, velocity, etc.) of every dynamic object at each discrete time-step ($T=0, T=1, \dots$).
2. **Final Answer:** The final computed state or position must be clearly separated at the end.

> **Failure Condition:** If a model outputs the correct final answer but fails to provide the explicitly tracked "Hidden State" step-by-step logic, the benchmark will flag the submission as an **'Invalid Reasoning Path'**.

---

## 🗂️ Versioning

To ensure clarity in our testing methodology, this project strictly separates its benchmark phases:

- **v1.x (Current) - Telemetry Extraction Results:** Benchmarking model performance, inference time, and token costs based on existing Kaggle test datasets. Reflected in the current dashboard.
- **v2.x (Roadmap) - Mechanical Reasoning Exam Scores:** Moving beyond pure telemetry. Models will be scored purely on their ability to execute the `Standard Submission Format` and solve complex, zero-shot grid-based mechanical logic puzzles.

---

## 🛣️ Future Roadmap

- **Modular Playwright Daemon:** Abstracting the Playwright extractor into a config-driven architecture to dynamically inject grid-based logic puzzles into the test suite.
- **Network-Level Interception:** Bypassing DOM polling (`document.body.innerText`) in favor of direct `page.on("response")` XHR/Fetch interception to capture true payload inference time.
- **Ground Truth Validator:** Building a standalone Python engine that mathematically calculates the absolute correct grid state of any mechanical puzzle to autonomously auto-grade LLM responses without human intervention.

---

## 📂 Project Structure

```text
kaggle-cli/
├── app/
│   └── DashboardClient.tsx        # Next.js UI & Cost-Matrix Logic
├── telemetry/
│   ├── scraper.py                 # Async Playwright extraction engine
│   ├── benchmark_results.json     # SOURCE OF TRUTH: Verified Telemetry Dataset
│   └── benchmark_results.csv      # Tabular data backup
├── PROJECT_MAP.md                 # Project Knowledge Graph
├── run_terminal_test.sh           # Master pipeline execution script
└── package.json                   # Dependencies

```

---

## 🚀 Research & Resources

### Project Ecosystem & Credits

* **The Benchmark:** [Official Pencil Physics Mechanical Constraint Test](https://www.kaggle.com/benchmarks/tasks/gastondana/pencil-physics-mechanical-constraint-test)
* **Telemetry Dataset:** [GitHub: Verified Benchmark Results (JSON)](https://github.com/gastondana627/kaggle-cli/blob/main/telemetry/benchmark_results.json)
* **Orchestration Source:** [GitHub: Scraper & Dashboard Code](https://github.com/gastondana627/kaggle-cli)
* **Live Performance Matrix:** [Pencil Physics Vercel Dashboard](https://pencil-physics-web.vercel.app/)
* **Visual Telemetry Diary:** [Daily Progress via Pencil Man (X)](https://x.com/Gaston_Pay_Up/status/2058781417266356621?s=20)

---

## 🛠️ Usage

### 1. Installation

**Frontend:**

```bash
npm install

```

**Python Scraper:**

```bash
pip install playwright asyncio
playwright install chromium

```

### 2. Execution

Run the scraping pipeline to ingest the latest model performance logs:

```bash
bash ./run_terminal_test.sh

```

### 3. Development

Launch the dashboard locally to audit the new data:

```bash
npm run dev

```

---

*Created for the Pencil Physics Mechanical Constraint Test R&D Initiative.*
