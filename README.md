# 🏆 Pencil Physics: Live Telemetry & AI Benchmarking Pipeline

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![Playwright](https://img.shields.io/badge/Playwright-Async-45ba4b?style=flat&logo=playwright)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)

A fully automated, end-to-end CI/CD pipeline and Next.js dashboard built to extract, process, and visualize multimodal AI performance data from Kaggle. 

---

## 🧠 The Benchmark: The "Pencil Physics" Anomaly

This project tracks state-of-the-art (SOTA) multimodal reasoning engines against a strict mechanical constraint test. Generative AI often excels at atmospheric beauty but fails at rigid spatial reasoning. 

**"Pencil Man"** acts as an adversarial prompt, testing a model's ability to map a chaotic, minimalist entity into a highly rendered environment while strictly adhering to the laws of physics and structural integrity. 

Because fully autonomous agentic evaluation often misses the nuances of visual logic, this benchmark heavily relies on Human-in-the-loop (HITL) workflows and manual direction to validate true multimodal comprehension. It separates basic "pretty picture generators" from spatially aware reasoning engines.

---

## ⚙️ Architecture & MLOps Pipeline

Kaggle currently lacks a native API for extracting deep, tab-specific model comparison telemetry (Input Tokens, Output Tokens, Execution Time). To solve this, this repository implements a custom extraction architecture:

1. **Headless Telemetry Extraction (`scraper.py`):** An asynchronous Playwright Python bot navigates the Kaggle DOM. It utilizes targeted string-slicing logic to bypass React state-caching quirks, strictly isolating the active-tab telemetry for high-fidelity data extraction.
2. **Data Transformation:** The bot auto-compiles the scraped data into structured JSON and CSV artifacts, ensuring accurate separation of Input and Output tokens.
3. **Continuous Deployment:** Pushing changes to the telemetry datasets automatically triggers a strict type-checked Vercel build.
4. **Dark Space UI (`DashboardClient.tsx`):** A custom Next.js frontend visualizes the data matrix, mapping performance scores against normalized estimated compute costs to identify the most efficient reasoning engines.

---

## 📂 Project Structure

```text
kaggle-cli/
├── app/
│   └── DashboardClient.tsx        # Next.js UI, Cost-Matrix Logic, & Auto-Brawl Arena
├── telemetry/
│   ├── scraper.py                 # Async Playwright extraction engine
│   ├── benchmark_results.json     # The "Source of Truth" Live Dataset
│   └── benchmark_results.csv      # Tabular data backup
├── run_terminal_test.sh           # Master pipeline execution script
├── package.json                   # Node dependencies & TypeScript configs
└── pyproject.toml                 # Python environment configuration
```

---

## 🚀 Local Setup & Execution

### 1. Install Dependencies

Ensure your Python virtual environment (`.venv`) is activated, then install the required stacks:

**Node/Next.js Frontend:**
```bash
npm install
npm install --save-dev @types/react @types/node @types/react-dom
```

**Python/Playwright Backend:**
```bash
pip install playwright asyncio
playwright install chromium
```

### 2. Run the Telemetry Scraper

Execute the bash script to launch the headless browser. This bot will quietly scrape the latest Kaggle outputs, parse the DOM, and update the local JSON/CSV datasets:
```bash
bash ./run_terminal_test.sh
```

### 3. Launch the Dashboard

Preview the live data matrix and UI locally before pushing to Vercel:
```bash
npm run dev
```

---

*Created for the Pencil Physics Mechanical Constraint Test R&D Initiative.*