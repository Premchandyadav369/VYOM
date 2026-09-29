/**
 * Relationship Graph View
 * Matching Section 16 specification.
 */

import { state } from '../state.js';

export function renderGraph(container) {
  let selectedNode = {
    id: 'RCP-2918',
    type: 'RECIPIENT',
    firstSeen: '12 Sep 2026',
    txCount: 28,
    senders: 9,
    risk: 'MEDIUM',
    connectedEntities: 3
  };

  function updateInspector(node) {
    const el = document.getElementById('graph-inspector-panel');
    if (!el) return;
    el.innerHTML = `
      <div class="uppercase-label" style="margin-bottom:8px;">NODE INSPECTOR</div>
      <div style="font-size:13px; font-weight:700; color:var(--text); margin-bottom:10px;">${node.id}</div>

      <div class="drawer-keyvalue-row">
        <span class="drawer-key">First seen</span>
        <span class="drawer-val">${node.firstSeen}</span>
      </div>
      <div class="drawer-keyvalue-row">
        <span class="drawer-key">Transactions</span>
        <span class="drawer-val">${node.txCount}</span>
      </div>
      <div class="drawer-keyvalue-row">
        <span class="drawer-key">Unique senders</span>
        <span class="drawer-val">${node.senders}</span>
      </div>
      <div class="drawer-keyvalue-row">
        <span class="drawer-key">Risk classification</span>
        <span class="drawer-val" style="color:${node.risk === 'HIGH' ? 'var(--red)' : (node.risk === 'MEDIUM' ? 'var(--amber)' : 'var(--green)')};">${node.risk}</span>
      </div>
      <div class="drawer-keyvalue-row">
        <span class="drawer-key">Connected risk entities</span>
        <span class="drawer-val">${node.connectedEntities}</span>
      </div>

      <hr style="border:none; border-top:1px solid var(--border); margin:10px 0;" />

      <button class="btn btn-secondary text-xs" style="width:100%; justify-content:center;" onclick="window.veraViewNodeTransactions('${node.id}')">
        Filter Transactions for Node ➔
      </button>
    `;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
      <div>
        <div class="uppercase-label">COUNTERPARTY TOPOLOGY</div>
        <h1 class="text-h1 mono" style="margin-top:2px;">Entity Graph Explorer</h1>
      </div>
      <span class="text-meta">Click any node to inspect relationship data</span>
    </div>

    <div class="graph-container" style="height: calc(100vh - var(--topbar-h) - var(--statusbar-h) - 70px);">
      <!-- Clean SVG Diagram -->
      <svg class="graph-canvas" viewBox="0 0 800 500">
        <!-- Connecting Lines -->
        <line x1="200" y1="200" x2="450" y2="140" stroke="var(--border-strong)" stroke-width="1.5" />
        <line x1="200" y1="200" x2="200" y2="340" stroke="var(--border-strong)" stroke-width="1.5" />
        <line x1="200" y1="340" x2="200" y2="420" stroke="var(--border-strong)" stroke-width="1.5" />

        <line x1="450" y1="140" x2="650" y2="90" stroke="var(--border-strong)" stroke-width="1.5" />
        <line x1="450" y1="140" x2="650" y2="200" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="3 3" />
        <line x1="650" y1="200" x2="650" y2="280" stroke="var(--border-strong)" stroke-width="1.5" />

        <!-- User Node -->
        <g style="cursor:pointer;" class="svg-node" data-id="USR-0192" data-type="USER" data-first="01 Jan 2026" data-tx="142" data-senders="1" data-risk="LOW" data-conn="1">
          <rect x="130" y="176" width="140" height="48" rx="2" fill="var(--surface-2)" stroke="var(--blue)" stroke-width="1" />
          <text x="200" y="196" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="11" font-weight="600">USER</text>
          <text x="200" y="214" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="10">USR-0192</text>
        </g>

        <!-- Device Node -->
        <g style="cursor:pointer;" class="svg-node" data-id="DEV-8921" data-type="DEVICE" data-first="15 Mar 2026" data-tx="32" data-senders="1" data-risk="LOW" data-conn="1">
          <rect x="130" y="320" width="140" height="40" rx="2" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1" />
          <text x="200" y="345" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="10">DEVICE (Android)</text>
        </g>

        <!-- Transaction Node -->
        <g style="cursor:pointer;" class="svg-node" data-id="PAY-82A19" data-type="TRANSACTION" data-first="Today" data-tx="1" data-senders="1" data-risk="MEDIUM" data-conn="2">
          <rect x="130" y="404" width="140" height="34" rx="2" fill="var(--surface-3)" stroke="var(--border)" stroke-width="1" />
          <text x="200" y="426" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="10">TX: ₹84,000</text>
        </g>

        <!-- Recipient Node -->
        <g style="cursor:pointer;" class="svg-node" data-id="RCP-2918" data-type="RECIPIENT" data-first="12 Sep 2026" data-tx="28" data-senders="9" data-risk="MEDIUM" data-conn="3">
          <rect x="380" y="116" width="140" height="48" rx="2" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1" />
          <text x="450" y="136" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="11" font-weight="600">RECIPIENT</text>
          <text x="450" y="154" text-anchor="middle" fill="var(--amber)" font-family="var(--font-mono)" font-size="10">RCP-2918</text>
        </g>

        <!-- Linked Account Node -->
        <g style="cursor:pointer;" class="svg-node" data-id="ACC-HDFC-991" data-type="ACCOUNT" data-first="04 Aug 2026" data-tx="44" data-senders="4" data-risk="LOW" data-conn="1">
          <rect x="580" y="70" width="140" height="40" rx="2" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1" />
          <text x="650" y="95" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="10">ACCOUNT (HDFC)</text>
        </g>

        <!-- Connected Mule User Node -->
        <g style="cursor:pointer;" class="svg-node" data-id="USR-MULE-44" data-type="MULE" data-first="24 Sep 2026" data-tx="19" data-senders="8" data-risk="HIGH" data-conn="4">
          <rect x="580" y="180" width="140" height="40" rx="2" fill="var(--red-bg)" stroke="var(--red-border)" stroke-width="1" />
          <text x="650" y="205" text-anchor="middle" fill="var(--red)" font-family="var(--font-mono)" font-size="10">MULE CLUSTER</text>
        </g>
      </svg>

      <!-- Overlay Inspector Panel -->
      <div id="graph-inspector-panel" class="graph-overlay-inspector"></div>
    </div>
  `;

  updateInspector(selectedNode);

  container.querySelectorAll('.svg-node').forEach(nodeEl => {
    nodeEl.addEventListener('click', () => {
      const node = {
        id: nodeEl.dataset.id,
        type: nodeEl.dataset.type,
        firstSeen: nodeEl.dataset.first,
        txCount: nodeEl.dataset.tx,
        senders: nodeEl.dataset.senders,
        risk: nodeEl.dataset.risk,
        connectedEntities: nodeEl.dataset.conn
      };
      updateInspector(node);
    });
  });

  window.veraViewNodeTransactions = (nodeId) => {
    state.searchQuery = nodeId;
    state.setView('payments');
  };
}
