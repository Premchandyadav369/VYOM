/**
 * Research Lab View
 * Matching Section 22 specification.
 */

import { fetchResearchBaselines, fetchResearchAblation } from '../api/simulation.js';

export async function renderResearch(container) {
  container.innerHTML = `<div style="padding:40px; text-align:center; font-family:var(--font-mono); color:var(--text-dim);">Loading empirical experiment data...</div>`;

  try {
    const [baselines, ablation] = await Promise.all([
      fetchResearchBaselines(),
      fetchResearchAblation()
    ]);

    container.innerHTML = `
      <div style="max-width: 860px; display:flex; flex-direction:column; gap:16px;">
        <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
          <div class="uppercase-label">SCIENTIFIC BENCHMARKS</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">VYOM Empirical Experiments</h1>
        </div>

        <!-- Experiment 14 Abstract Panel -->
        <div style="border:1px solid var(--border); background:var(--surface); padding:14px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
            <div style="font-weight:700; color:var(--text);">Experiment 14: Intent Verification Efficacy</div>
            <span class="badge badge-allow">COMPLETE</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px; color:var(--text-secondary);">
            <div>
              <span class="text-meta">Question:</span>
              <span style="color:var(--text); margin-left:6px;">Does explicit payment intent improve detection of authorized harmful payments?</span>
            </div>
            <div>
              <span class="text-meta">Baseline:</span>
              <span style="margin-left:6px;">Transaction-only rule and outlier filters</span>
            </div>
            <div>
              <span class="text-meta">Treatment:</span>
              <span style="margin-left:6px;">Intent narrative embedding + behavioral deviation + recipient trust subgraph</span>
            </div>
            <div>
              <span class="text-meta">Dataset:</span>
              <span style="margin-left:6px;">VYOM-PINT (10,000 synthetic Indian payment vectors) | Seed: 42</span>
            </div>
          </div>
        </div>

        <!-- Baseline Evaluation Table -->
        <div class="data-table-container">
          <div style="padding:8px 10px; background:var(--surface-2); border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:10px; font-weight:600; color:var(--text-muted);">
            BASELINE BENCHMARK COMPARISON
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>MODEL</th>
                <th>AUC-ROC</th>
                <th>PRECISION</th>
                <th>RECALL</th>
                <th>SFE RATIO</th>
                <th>LATENCY</th>
              </tr>
            </thead>
            <tbody>
              ${baselines.map(b => `
                <tr class="${(b.model_name.includes('VYOM') || b.model_name.includes('VERA')) ? 'row-selected' : ''}">
                  <td class="strong">${b.model_name}</td>
                  <td class="tabular-nums">${b.auc_roc.toFixed(3)}</td>
                  <td class="tabular-nums">${b.precision.toFixed(3)}</td>
                  <td class="tabular-nums">${b.recall.toFixed(3)}</td>
                  <td class="tabular-nums">${b.sfe_score.toFixed(2)}x</td>
                  <td class="text-meta">${b.latency_ms}ms</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Ablation Table -->
        <div class="data-table-container">
          <div style="padding:8px 10px; background:var(--surface-2); border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:10px; font-weight:600; color:var(--text-muted);">
            SYSTEMATIC ABLATION STUDY (CONFIGURATIONS A – H)
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>CONFIG</th>
                <th>ACTIVE SIGNALS</th>
                <th>AUC-ROC</th>
                <th>RECALL</th>
                <th>FALSE POSITIVES</th>
              </tr>
            </thead>
            <tbody>
              ${ablation.map(a => `
                <tr class="${a.config_id === 'Config H' ? 'row-selected' : ''}">
                  <td class="strong">${a.config_id}</td>
                  <td>${a.features}</td>
                  <td class="tabular-nums">${a.auc_roc.toFixed(3)}</td>
                  <td class="tabular-nums">${a.recall.toFixed(3)}</td>
                  <td class="tabular-nums">${a.false_positive_rate.toFixed(3)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="padding:20px; color:var(--red); font-family:var(--font-mono);">Research data error: ${err.message}</div>`;
  }
}
