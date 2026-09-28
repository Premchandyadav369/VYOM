"""
VERA Research Experiments Runner
Executes:
1. Baseline comparisons (Rules, Logistic Regression, XGBoost, Isolation Forest, Graph, Temporal, VERA)
2. Ablation studies (A through H)
3. Safety-Friction Pareto Frontier calculations
4. Scientific Hypothesis Validation (H1 - H6)
Saves results to research/experiments/ and research/tables/ for paper and dashboard.
"""

import os
import sys
import json
import tabulate

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.evaluation.benchmark_evaluator import BenchmarkEvaluator


def main():
    print("=" * 80)
    print("VERA x DRUNIX: SCIENTIFIC BENCHMARK & EXPERIMENTAL EVALUATION")
    print("=" * 80)

    evaluator = BenchmarkEvaluator()

    # 1. Run Baselines
    print("\n[+] 1. Running Model Baselines on VERA-PINT Benchmark...")
    baselines = evaluator.run_all_baselines()
    headers_bl = ["Model", "PR-AUC", "ROC-AUC", "Precision", "Recall", "F1", "FPR", "Scam Rec (%)", "Intent Mismatch (%)", "Latency (ms)", "SFE"]
    rows_bl = [
        [b["model"], b["pr_auc"], b["roc_auc"], b["precision"], b["recall"], b["f1"], b["fpr"], b["scam_recall"], b["intent_mismatch_recall"], b["latency_ms"], b["sfe_score"]]
        for b in baselines
    ]
    print(tabulate.tabulate(rows_bl, headers=headers_bl, tablefmt="github"))

    # 2. Run Ablation Study
    print("\n[+] 2. Running Systematic Ablation Study (Configurations A - H)...")
    ablations = evaluator.run_ablation_study()
    headers_ab = ["Ablation Configuration", "PR-AUC", "Recall", "FPR", "Scam Rec (%)", "Intent Mismatch (%)", "Latency (ms)", "SFE"]
    rows_ab = [
        [a["model"], a["pr_auc"], a["recall"], a["fpr"], a["scam_recall"], a["intent_mismatch_recall"], a["latency_ms"], a["sfe_score"]]
        for a in ablations
    ]
    print(tabulate.tabulate(rows_ab, headers=headers_ab, tablefmt="github"))

    # 3. Hypotheses Validation
    print("\n[+] 3. Scientific Hypotheses Validation (H1 - H6)...")
    hypotheses = evaluator.evaluate_research_hypotheses()
    for h in hypotheses:
        print(f"[{h['status']}] {h['id']}: {h['hypothesis']}")
        print(f"     Evidence: {h['evidence']} (p {h['p_value']})\n")

    # 4. Save results to artifacts directory
    os.makedirs("research/experiments", exist_ok=True)
    os.makedirs("research/tables", exist_ok=True)

    with open("research/experiments/baselines_results.json", "w") as f:
        json.dump(baselines, f, indent=2)

    with open("research/experiments/ablation_results.json", "w") as f:
        json.dump(ablations, f, indent=2)

    with open("research/experiments/hypotheses_results.json", "w") as f:
        json.dump(hypotheses, f, indent=2)

    with open("research/experiments/sfe_frontier.json", "w") as f:
        json.dump(evaluator.get_safety_friction_frontier(), f, indent=2)

    print("[SUCCESS] All experimental outputs persisted to research/experiments/!")


if __name__ == "__main__":
    main()
