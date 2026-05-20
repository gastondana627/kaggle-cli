This is the right move. That generic Kaggle documentation was creating "noise" that hid the actual engineering work you put into this repository.

By stripping it down to just your project, you turn this into a proper **System Documentation** file. Here is your new, clean, and professional `README.md` for the `kaggle-cli` repository.

---

# Pencil Physics Engine (`kaggle-cli`)

The backend engine and data orchestration layer for the **Pencil Physics Mechanical Constraint Test**. This repository manages the scraping, data synchronization, and pipeline execution that feeds your live benchmarking platform.

---

## 🏗️ System Overview

This project serves as the "Engine" in your 3-repo architecture. It is responsible for fetching raw telemetry from Kaggle, processing it into actionable metrics, and deploying snapshots to your web frontend.

## 🚀 The Telemetry Pipeline

The core of this repository is the automated daemon that ensures your benchmark data stays fresh.

| Script | Role |
| --- | --- |
| `auto_sync.sh` | **The Daemon:** Polls every 60 seconds; triggers scraping and deployment. |
| `sync_kaggle.py` | **The Scraper:** Playwright-powered engine; extracts scores from Kaggle's UI. |
| `run_eval.py` | **The Trigger:** Local evaluation tool; generates baseline runs. |

### Running the Pipeline

To start the synchronization daemon:

```bash
./auto_sync.sh

```

*This script automatically updates the local `telemetry_calendar.json` and pushes the latest production build to Vercel.*

---

## 📂 Project Structure

```text
kaggle-cli/
├── src/kaggle/           # Core API & scraping logic
├── benchmark-results/    # Local storage for .run.json files
├── telemetry_calendar.json # The "Source of Truth" for the dashboard
├── auto_sync.sh          # Master daemon script
├── sync_kaggle.py        # Scraping implementation
├── run_eval.py           # Evaluation runner
└── pyproject.toml        # Environment configuration

```

## 🛠️ System Integration

This repository is one-third of the **Pencil Physics** system. It maintains the following sync relationship:

1. **Engine (`kaggle-cli`):** Scrapes data and generates `telemetry_calendar.json`.
2. **Dashboard (`pencil-physics-dashboard`):** Watches the local root directory to render live metrics in VS Code.
3. **Web (`pencil-physics-web`):** Receives the bridged JSON files and hosts the live [Pencil Physics Benchmark](https://pencil-physics-4b7ay8sdz-gastondana627s-projects.vercel.app/).

## Prerequisites

* **Python Environment:** Ensure the project virtual environment (`.venv`) is activated.
* **Kaggle Auth:** Ensure your environment variables for Kaggle API access are configured (as per standard Kaggle CLI setup).

---

*Created for the Pencil Physics Mechanical Constraint Test.*

---

<<<<<<< HEAD
#### Tab 1: The Silent Background Worker
This tab runs the headless scraper loop, silently pulling real scores from Kaggle every minute.
```sh
cd ~/kaggle-cli
source venv/bin/activate
./auto_sync.sh

=======
>>>>>>> be43094 (Update README with system documentation)
