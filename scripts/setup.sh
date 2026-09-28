#!/usr/bin/env bash
set -e

echo "================================================================================"
echo " VERA x DRUNIX SETUP"
echo " Intent-Governed Payment Infrastructure"
echo "================================================================================"

echo "[1/4] Installing Python requirements..."
python -m pip install -q fastapi uvicorn pydantic sqlalchemy redis scikit-learn xgboost networkx pyjwt tabulate

echo "[2/4] Initializing Database & Generating Benchmark Dataset..."
python -c "
from data.generator.synthetic_generator import SyntheticEcosystemGenerator
import json
gen = SyntheticEcosystemGenerator(seed=42)
ds = gen.generate_benchmark_dataset(num_samples=2000)
with open('data/synthetic/vera_pint_benchmark.json', 'w') as f:
    json.dump(ds, f, indent=2)
print('Generated 2,000 benchmark records.')
"

echo "[3/4] Seeding Live Demo Scenarios & Blockchain Blocks..."
python scripts/seed_demo.py

echo "[4/4] Running Initial Research Experiments..."
python scripts/run_experiments.py

echo "================================================================================"
echo "[SUCCESS] VERA x DRUNIX setup completed successfully!"
echo "Run 'bash scripts/start.sh' to launch services."
echo "================================================================================"
