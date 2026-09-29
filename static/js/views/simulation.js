/**
 * Simulation Lab View
 * Matching Section 21 specification.
 */

import { runSimulationScenario } from '../api/simulation.js';

export function renderSimulation(container) {
  container.innerHTML = `
    <div style="max-width: 700px; display:flex; flex-direction:column; gap:16px;">
      <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
        <div class="uppercase-label">TESTBED & BENCHMARK LAB</div>
        <h1 class="text-h1 mono" style="margin-top:2px;">Adversarial Simulation Environment</h1>
      </div>

      <div style="border:1px solid var(--border); background:var(--surface); padding:16px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px;">
        <div class="drawer-section-title" style="margin-bottom:12px;">SIMULATION PARAMETERS</div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label class="text-meta" style="display:block; margin-bottom:4px;">Scenario</label>
            <select id="sim-scenario" class="input">
              <option value="SOCIAL_ENGINEERING_SCAM">Social Engineering / Digital Arrest Impersonation</option>
              <option value="NORMAL_PAYMENT">Standard Merchant & Utility Payments</option>
              <option value="INTENT_MISMATCH">Invoice Amount Deviation Coercion</option>
              <option value="CROSS_BORDER_REMITTANCE">Cross-Border Remittance Corridor</option>
            </select>
          </div>

          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
            <div>
              <label class="text-meta" style="display:block; margin-bottom:4px;">Users</label>
              <input type="text" class="input" value="10,000" readonly />
            </div>
            <div>
              <label class="text-meta" style="display:block; margin-bottom:4px;">Transactions</label>
              <input type="text" class="input" value="100,000" readonly />
            </div>
            <div>
              <label class="text-meta" style="display:block; margin-bottom:4px;">Attack rate</label>
              <input type="text" class="input" value="3%" readonly />
            </div>
            <div>
              <label class="text-meta" style="display:block; margin-bottom:4px;">Seed</label>
              <input type="text" class="input" value="42" readonly />
            </div>
          </div>

          <div>
            <button class="btn btn-primary" id="btn-run-sim" style="width:100%; justify-content:center; padding:8px 0;">
              RUN SIMULATION
            </button>
          </div>
        </div>
      </div>

      <!-- Execution Terminal Box -->
      <div id="sim-log-box" style="display:none; border:1px solid var(--border); background:var(--bg); padding:14px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px;">
        <div class="uppercase-label" style="margin-bottom:8px;">EXECUTION LOG</div>
        <div id="sim-log-stream" style="color:var(--text-muted); line-height:1.6; max-height:220px; overflow-y:auto;"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-run-sim')?.addEventListener('click', async () => {
    const scenarioKey = document.getElementById('sim-scenario').value;
    const logBox = document.getElementById('sim-log-box');
    const logStream = document.getElementById('sim-log-stream');
    logBox.style.display = 'block';

    const steps = [
      'Generating synthetic users (Seed 42)...',
      'Generating transaction baseline distribution...',
      'Injecting adversarial scam scenario vectors...',
      'Executing VERA intent & multi-modal evaluation pipeline...',
      'Submitting risk decisions to Drunix consensus peers...',
      'Evaluating false positive and false negative detection metrics...'
    ];

    logStream.innerHTML = '';
    for (let i = 0; i < steps.length; i++) {
      logStream.innerHTML += `<div>[${new Date().toLocaleTimeString('en-IN')}] ${steps[i]}</div>`;
      await new Promise(r => setTimeout(r, 200));
    }

    try {
      const res = await runSimulationScenario(scenarioKey);
      logStream.innerHTML += `
        <div style="color:var(--green); margin-top:8px; font-weight:600;">
          SIMULATION COMPLETE:
        </div>
        <pre style="color:var(--text); font-size:10px; margin-top:4px; overflow-x:auto;">${JSON.stringify(res, null, 2)}</pre>
      `;
    } catch (e) {
      logStream.innerHTML += `<div style="color:var(--red); margin-top:8px;">Error: ${e.message}</div>`;
    }
  });
}
