/**
 * Drunix Byzantine Fault Injection & Chaos Sandbox View
 */

import { state } from '../state.js';

export function renderChaos(container) {
  let scenarios = [];
  let activeTraceLogs = [
    "[SYSTEM_IDLE] Drunix Raft consensus engine operating at 100.0% safety.",
    "[TOPOLOGY] 5 Consortium Peer Nodes + 3 Raft Orderer Nodes active.",
    "[STATUS] Ready for adversarial fault injection."
  ];

  async function loadScenarios() {
    try {
      const res = await fetch('/drunix/chaos/scenarios');
      scenarios = await res.json();
      renderUI();
    } catch (e) {
      container.innerHTML = `<div class="text-meta" style="color:var(--red);">Error loading chaos scenarios: ${e.message}</div>`;
    }
  }

  function renderUI() {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
        <div>
          <div class="uppercase-label">ADVERSARIAL RESILIENCE LAB</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">Drunix Byzantine Fault Injection Sandbox</h1>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge badge-allow">CONSENSUS 100% SAFE</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 480px; gap:16px;">
        <!-- Fault Injection Scenarios Grid -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="font-weight:700; color:var(--text); font-size:12px;">AVAILABLE BYZANTINE FAULT SCENARIOS</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            ${scenarios.map(s => `
              <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-weight:700; color:var(--text); font-size:12px;">${s.title}</div>
                  <div class="text-meta" style="margin-top:4px; font-size:10px; line-height:1.4;">
                    ${s.description}
                  </div>
                </div>
                <div style="margin-top:12px;">
                  <div class="drawer-keyvalue-row" style="margin-bottom:8px;">
                    <span class="drawer-key">Est. Recovery</span>
                    <span class="drawer-val font-mono">${s.recovery_time_ms} ms</span>
                  </div>
                  <button class="btn btn-hold btn-inject-scenario" data-id="${s.scenario_id}" style="width:100%; justify-content:center;">
                    Inject Fault ➔
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Invariants Verification Box -->
          <div style="background:var(--surface-2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; margin-top:8px;">
            <div style="font-weight:700; color:var(--text); font-size:11px; margin-bottom:6px;">GUARANTEED DRUNIX INVARIANTS</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-family:var(--font-mono); font-size:10px;">
              <div style="color:var(--green);">✓ Zero Double-Spending (Atomic MVCC)</div>
              <div style="color:var(--green);">✓ Tamper-Evident SHA-256 Merkle Audit</div>
              <div style="color:var(--green);">✓ Raft Quorum Persistence (f < n/2)</div>
              <div style="color:var(--green);">✓ 2-of-3 Dual Control Quorum Enforcement</div>
            </div>
          </div>
        </div>

        <!-- Terminal Execution Trace Log -->
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-weight:700; color:var(--text); font-size:12px;">CONSORTIUM TRACE TERMINAL</span>
            <span class="badge badge-neutral" id="chaos-exec-status">STANDBY</span>
          </div>

          <div class="code-box" id="chaos-terminal-box" style="flex:1; min-height:380px; font-size:10.5px; color:#a8cdff;">
            ${activeTraceLogs.join('\n')}
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-inject-scenario').forEach(btn => {
      btn.onclick = async () => {
        const scenarioId = btn.dataset.id;
        const term = document.getElementById('chaos-terminal-box');
        const statusBadge = document.getElementById('chaos-exec-status');

        statusBadge.textContent = 'INJECTING...';
        statusBadge.className = 'badge badge-hold';
        term.textContent = `[INJECTING] Executing Byzantine scenario: ${scenarioId}...\n`;

        try {
          const res = await fetch('/drunix/chaos/inject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario_id: scenarioId })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Injection failed');

          statusBadge.textContent = 'RESOLVED';
          statusBadge.className = 'badge badge-allow';

          const formattedLogs = [
            `=======================================================`,
            `FAULT INJECTION EVENT: ${data.event_id} [${data.scenario_id}]`,
            `RECOVERY DURATION: ${data.recovery_time_ms} ms`,
            `OUTCOME: ${data.expected_outcome}`,
            `CONSENSUS SAFETY: ${data.consensus_safety}`,
            `=======================================================`,
            ...data.trace_logs
          ];
          activeTraceLogs = formattedLogs;
          term.textContent = formattedLogs.join('\n');
        } catch (err) {
          statusBadge.textContent = 'ERROR';
          term.textContent = `[ERROR] Fault execution error: ${err.message}`;
        }
      };
    });
  }

  loadScenarios();
}
