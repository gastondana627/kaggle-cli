# Kaggle CLI

The official CLI to interact with [Kaggle](https://www.kaggle.com).

---

[User documentation](docs/README.md)

---

## Key Features

Some of the key features are:

* List competitions, download competition data, submit to a competition.
* List, create, update, download or delete datasets.
* List, create, update, download or delete models & model variations.
* List, update & run, download code & output or delete kernels (notebooks).
* Browse and read discussion forums.

## Installation

Install the `kaggle` package with [pip](https://pypi.org/project/pip/):

```sh
pip install kaggle
```

Additional installation instructions can be found [here](docs/README.md#installation).

## Quick start

Explore the available commands by running:

```sh
kaggle --help
```

See the [User documentation](docs/README.md) for more examples & tutorials.

## Development

### `kagglesdk` Updates

New features that interact with `kaggle.com` probably require changes to the Python library, `kagglesdk`.
Make sure to bump the minimum version required for `kagglesdk` in the `dependencies` list specified in
[pyproject.toml][pyproject.toml]]. Make sure the required version is available on the
[pypi.org kagglesdk project](https://pypi.org/project/kagglesdk/#history).

### Prerequisites

We use [hatch](https://hatch.pypa.io) to manage this project.

Follow these [instructions](https://hatch.pypa.io/latest/install/) to install it.

### Run `kaggle` from source

#### Option 1: Execute a one-liner of code from the command line

```sh
hatch run kaggle datasets list
```

#### Option 2: Run many commands in a shell

```sh
hatch shell

# Inside the shell, you can run many commands
kaggle datasets list
kaggle competitions list
...
```

### Lint / Format

```sh
# Lint check
hatch run lint:style
hatch run lint:typing
hatch run lint:all     # for both

# Format
hatch run lint:fmt
```

### Tests

Note: These tests are not true unit tests and are calling the Kaggle web server.

```sh
# Run against kaggle.com
hatch run test:prod

# Run against a local web server (Kaggle engineers only)
hatch run test:local
```

### Integration Tests

To run integration tests on your local machine, you need to set up your Kaggle credentials. You can do this by following the [authentication instructions](docs/README.md#authentication).

After setting up your credentials, you can run the integration tests as follows:

```sh
hatch run test:integration
```

### Running `hatch` commands inside Docker

This is useful to run in a consistent environment and easily switch between Python versions.

The following shows how to run `hatch run lint:all` but this also works for any other hatch commands:

```
# Use default Python version
./docker-hatch run lint:all
```

## Changelog

See [CHANGELOG](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The Kaggle CLI is released under the [Apache 2.0 license](LICENSE.txt).





## UPDATED

---

## 🚀 Custom Telemetry Pipeline: Pencil Physics Integration

This repository contains a custom, deterministic telemetry pipeline designed to bridge live Kaggle cloud evaluation metrics with local VS Code environments. It bypasses React virtualized tables and dynamic loading to stream absolute truth data directly to a local Dev Tool Integration Board.

### Architecture Overview
* **`auto_sync.sh` (The Daemon):** A background polling engine that executes every 60 seconds.
* **`sync_kaggle.py` (The Scraper):** A Playwright-powered headless automation script featuring a "Pagination Hacker" to force Kaggle's UI to render all hidden models.
* **`run_eval.py` (The Local Trigger):** A local execution script used to drop baseline evaluation files during live presentations.

### 🎭 Live Presentation Workflow (The 2-Tab System)

To run the pipeline continuously without interrupting the presentation environment, follow this two-tab terminal approach:

#### Tab 1: The Silent Background Worker
This tab runs the headless scraper loop, silently pulling real scores from Kaggle every minute.
```sh
cd ~/kaggle-cli
source venv/bin/activate
./auto_sync.sh

