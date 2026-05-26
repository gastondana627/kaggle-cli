# 🗺️ Project Map: Pencil Physics Knowledge Graph

This map traces the evolution of the project from a telemetry extraction pipeline to a comprehensive Mechanical Reasoning Benchmark.

## 🏛️ Core Artifacts (Infrastructure & UI)
- **Official Project URL:** [Pencil Physics Vercel Dashboard](https://pencil-physics-web.vercel.app/)
- **Benchmark Core Repo:** [GitHub: gastondana627/kaggle-cli](https://github.com/gastondana627/kaggle-cli)
- **Dashboard UI Client:** `app/DashboardClient.tsx` (Next.js matrix mapping performance & compute cost)

## 📊 Operational Data (Telemetry & Extraction)
- **Playwright Daemon:** `telemetry/scraper.py` (Async extraction engine, bypassing race conditions)
- **Raw Telemetry Source of Truth:** `telemetry/benchmark_results.json`
- **Data Parser & Cost Engine:** `telemetry/parser.py` (Calculates cost metrics from raw tokens)
- **Master Pipeline Execution:** `run_terminal_test.sh`

## 🔮 Future Logic (The Mechanical Reasoning Exam Roadmap)
### 1. Network-Level Interception (Eliminating UI Latency)
- **Goal:** Shift from DOM polling (`document.body.innerText`) to direct XHR/Fetch interception using Playwright's `page.on("response")`.
- **Impact:** Captures JSON payloads instantly before React renders them, completely eliminating 'UI rendering latency'.

### 2. Modular Architecture (Config-Driven Daemon)
- **Goal:** Abstract hardcoded URLs and model selectors in `scraper.py` into a robust `config.json`.
- **Impact:** Allows seamless integration of new 'grid-based' logic puzzles for future testing phases without rewriting the extraction daemon.

### 3. Structural "Stress Tests" (Mental Simulation)
- **Focus:** Gear-based mechanical systems.
- **Concept:** Provide models with a textual or grid representation of interlocking gears (e.g., "Gear A turns clockwise, connected to Gear B, connected to Gear C"). Ask the model to simulate the hidden state and predict the final rotational direction or torque of the last gear.

### 4. Logic-Grid Puzzles (Deductive Reasoning)
- **Focus:** Transitioning to a true 'Exam'.
- **Concept:** Spatially constrained physics puzzles. E.g., "A grid contains a heavy block at (2,2) and a spring at (2,0). If gravity pulls down, what is the final state of the block after 3 ticks?"
