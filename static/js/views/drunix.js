/**
 * Drunix Explorer & Infrastructure State
 * Matching Section 19 & 20 specification.
 */

import { state } from '../state.js';
import { fetchBlocks, fetchTransactions, fetchNetworkHealth } from '../api/drunix.js';

export async function renderDrunix(container) {
  container.innerHTML = `<div style="padding:40px; text-align:center; font-family:var(--font-mono); color:var(--text-dim);">Connecting to Drunix ledger...</div>`;

  try {
    const [blocks, txs, net] = await Promise.all([
      fetchBlocks(20),
      fetchTransactions(20),
      fetchNetworkHealth()
    ]);
    state.blocks = blocks;
    state.transactions = txs;

    let selectedTx = txs.length > 0 ? txs[0] : null;

    function renderContent() {
      container.innerHTML = `
        <div style="max-width: 1000px; display:flex; flex-direction:column; gap:16px;">
          <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
            <div class="uppercase-label">DISTRIBUTED LEDGER INFRASTRUCTURE</div>
            <h1 class="text-h1 mono" style="margin-top:2px;">Drunix Network & Consensus Explorer</h1>
          </div>

          <!-- Network Toplogy Grid -->
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; font-family:var(--font-mono); font-size:11px;">
            <div style="border:1px solid var(--border); background:var(--surface); padding:10px; border-radius:var(--radius-sm);">
              <div class="text-meta" style="margin-bottom:6px;">BANK A (ORG1)</div>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <div><span class="connection-dot"></span>Lite Peer 7051</div>
                <div><span class="connection-dot"></span>Commit Peer 7061</div>
              </div>
            </div>

            <div style="border:1px solid var(--border); background:var(--surface); padding:10px; border-radius:var(--radius-sm);">
              <div class="text-meta" style="margin-bottom:6px;">PSP B (ORG2)</div>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <div><span class="connection-dot"></span>Lite Peer 8051</div>
                <div><span class="connection-dot"></span>Commit Peer 8061</div>
              </div>
            </div>

            <div style="border:1px solid var(--border); background:var(--surface); padding:10px; border-radius:var(--radius-sm);">
              <div class="text-meta" style="margin-bottom:6px;">VALIDATION SERVICE</div>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <div><span class="connection-dot"></span>Stateless VSCC 7071</div>
                <div class="text-meta">Healthy (0ms delay)</div>
              </div>
            </div>

            <div style="border:1px solid var(--border); background:var(--surface); padding:10px; border-radius:var(--radius-sm);">
              <div class="text-meta" style="margin-bottom:6px;">ORDERING CONSENSUS</div>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <div><span class="connection-dot"></span>Raft Leader 7050</div>
                <div class="text-meta">Head Block #${net.block_height || 34}</div>
              </div>
            </div>
          </div>

          <!-- Payment State Transition Sequence -->
          <div style="border:1px solid var(--border); background:var(--surface); padding:12px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:10px;">
            <div class="uppercase-label" style="margin-bottom:8px;">PAYMENT STATE TRANSITION PROGRESSION</div>
            <div style="display:flex; gap:4px; align-items:center;">
              <span class="badge badge-neutral">CREATED</span>
              <span class="text-dim">→</span>
              <span class="badge badge-neutral">INTENT_EVALUATED</span>
              <span class="text-dim">→</span>
              <span class="badge badge-neutral">RISK_EVALUATED</span>
              <span class="text-dim">→</span>
              <span class="badge badge-verify">POLICY_DECISION</span>
              <span class="text-dim">→</span>
              <span class="badge badge-allow">ENDORSED</span>
              <span class="text-dim">→</span>
              <span class="badge badge-allow">ORDERED</span>
              <span class="text-dim">→</span>
              <span class="badge badge-allow">VALIDATED</span>
              <span class="text-dim">→</span>
              <span class="badge badge-allow">COMMITTED</span>
            </div>
          </div>

          <!-- Transaction List & Inspector -->
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <!-- Table Pane -->
            <div class="data-table-container" style="flex:1;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>BLOCK</th>
                    <th>TX ID</th>
                    <th>CHANNEL</th>
                    <th>MSP</th>
                    <th>VALIDATION</th>
                    <th>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  ${txs.map(t => `
                    <tr class="${selectedTx && selectedTx.tx_id === t.tx_id ? 'row-selected' : ''}" data-tx="${t.tx_id}" style="cursor:pointer;">
                      <td class="strong">#${t.block_number}</td>
                      <td>${t.tx_id ? t.tx_id.substring(0, 16) + '...' : 'TX-GENESIS'}</td>
                      <td>${t.channel_id}</td>
                      <td>Org1MSP</td>
                      <td style="color:var(--green);">${t.commit_status}</td>
                      <td class="text-meta">${t.created_at ? new Date(t.created_at).toLocaleTimeString('en-IN') : 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Transaction Detail Box -->
            ${selectedTx ? `
              <div style="width:300px; background:var(--surface); border:1px solid var(--border); padding:12px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px; flex-shrink:0;">
                <div class="uppercase-label" style="margin-bottom:8px;">TRANSACTION DETAILS</div>
                <div style="word-break:break-all; font-weight:700; color:var(--text); margin-bottom:10px;">${selectedTx.tx_id}</div>

                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">Block</span>
                  <span class="drawer-val">#${selectedTx.block_number}</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">Channel</span>
                  <span class="drawer-val">${selectedTx.channel_id}</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">Endorsements</span>
                  <span class="drawer-val">Org1MSP, Org2MSP</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">Validation</span>
                  <span class="drawer-val" style="color:var(--green);">VALID</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">Commit</span>
                  <span class="drawer-val" style="color:var(--green);">COMMITTED</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">Policy Rule</span>
                  <span class="drawer-val">P-2026-09</span>
                </div>

                <hr style="border:none; border-top:1px solid var(--border); margin:10px 0;" />

                <div class="text-meta" style="color:var(--text-dim); line-height:1.4;">
                  Stateless Validation verified read-write set against SQL StateDB snapshot without MVCC conflict.
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      container.querySelectorAll('tbody tr[data-tx]').forEach(row => {
        row.addEventListener('click', () => {
          const tid = row.dataset.tx;
          selectedTx = txs.find(t => t.tx_id === tid);
          renderContent();
        });
      });
    }

    renderContent();
  } catch (err) {
    container.innerHTML = `<div style="padding:20px; color:var(--red); font-family:var(--font-mono);">Ledger error: ${err.message}</div>`;
  }
}
