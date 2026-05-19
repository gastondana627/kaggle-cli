sequenceDiagram
    autonumber
    actor Dev as Developer (VS Code)
    participant Worker as auto_sync.sh (Daemon)
    participant Scraper as sync_kaggle.py (Playwright)
    participant Kaggle as Kaggle Web/React API
    participant FS as Local File System (JSON)
    participant Extension as VS Code Integration Board

    note over Worker, Scraper: Background Polling (Every 60s)
    Worker->>Scraper: Trigger Execution
    Scraper->>Kaggle: GET Target URL (Wait for DOM)
    Scraper->>Kaggle: Execute Pagination Hacker (Click 'All')
    Kaggle-->>Scraper: Render Full Matrix
    Scraper->>Scraper: Triple-Layer Data Extraction
    Scraper->>FS: Overwrite target .run.json files
    FS-->>Extension: File Watcher Triggered
    Extension-->>Dev: UI Dynamically Updates
    
    note over Dev, FS: Manual Execution (The Presentation)
    Dev->>FS: python3 run_eval.py (Drop base score)
    FS-->>Extension: File Watcher Triggered