/**
 * Relationship Graph View
 * Enhanced with Time-Travel AML Smurfing & Layering Replay Scrubber.
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

  let timeStage = 4; // 0 to 4

  const STAGES = [
    { title: 'T-0: Baseline Clean Network', desc: 'Legitimate consumer flow with established merchant aggregators.', activeNodes: ['usr', 'dev', 'tx1'], alert: 'CLEAN' },
    { title: 'T+2h: Synthetic Account Registration', desc: 'New unverified device registers handle customs.clearance.hold@scam.', activeNodes: ['usr', 'dev', 'tx1', 'rcp'], alert: 'NEW_UNVERIFIED_VPA' },
    { title: 'T+6h: Smurfing Ingestion Phase', desc: 'Rapid velocity burst: 4 disparate senders route funds into mule account.', activeNodes: ['usr', 'dev', 'tx1', 'rcp', 'mule1'], alert: 'FAN_IN_VELOCITY_SPIKE' },
    { title: 'T+24h: Peeling Chain & Layering', desc: 'Funds peeled across 3 intermediary layer accounts to evade standard AML thresholds.', activeNodes: ['usr', 'dev', 'tx1', 'rcp', 'mule1', 'mule2', 'layer'], alert: 'PEELING_CHAIN_DETECTED' },
    { title: 'T+72h: Syndicate Consolidation & Quarantine', desc: 'Consolidation attempt to offshore exit wallet. VERA triggers Drunix cryptographic freeze.', activeNodes: ['usr', 'dev', 'tx1', 'rcp', 'mule1', 'mule2', 'layer', 'exit'], alert: 'SYNDICATE_FREEZE_ANCHORED' }
  ];

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
        <span class="drawer-val" style="color:${node.risk === 'HIGH' || node.risk === 'CRITICAL' ? 'var(--red)' : (node.risk === 'MEDIUM' ? 'var(--amber)' : 'var(--green)')};">${node.risk}</span>
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

  function renderView() {
    const currentStage = STAGES[timeStage];

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
        <div>
          <div class="uppercase-label">COUNTERPARTY TOPOLOGY & AML FORENSICS</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">Entity Graph & Time-Travel Replay</h1>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge ${currentStage.alert === 'CLEAN' ? 'badge-allow' : 'badge-hold'}">${currentStage.alert}</span>
        </div>
      </div>

      <!-- Time Travel Scrubber Bar -->
      <div class="slider-container" style="margin-bottom:12px;">
        <span class="text-meta" style="min-width:110px;">AML TIME-TRAVEL:</span>
        <input type="range" min="0" max="4" value="${timeStage}" class="time-slider" id="time-travel-range" />
        <span class="text-meta" style="font-weight:700; color:var(--text); min-width:80px; text-align:right;">
          ${['T-0', 'T+2h', 'T+6h', 'T+24h', 'T+72h'][timeStage]}
        </span>
      </div>

      <!-- Active Stage Narrative Banner -->
      <div style="background:var(--surface-2); border:1px solid var(--border); border-left:3px solid ${timeStage >= 3 ? 'var(--red)' : (timeStage >= 1 ? 'var(--amber)' : 'var(--blue)')}; padding:8px 12px; border-radius:var(--radius-sm); margin-bottom:12px; font-family:var(--font-mono); font-size:11px;">
        <div style="font-weight:700; color:var(--text);">${currentStage.title}</div>
        <div style="color:var(--text-secondary); margin-top:2px; font-size:10px;">${currentStage.desc}</div>
      </div>

      <div class="graph-container" style="height: calc(100vh - var(--topbar-h) - var(--statusbar-h) - 150px);">
        <!-- SVG Relationship Topology -->
        <svg class="graph-canvas" viewBox="0 0 800 480">
          <!-- Baseline Lines -->
          <line x1="160" y1="180" x2="380" y2="120" stroke="${timeStage >= 1 ? 'var(--amber)' : 'var(--border-strong)'}" stroke-width="${timeStage >= 1 ? 2 : 1.5}" />
          <line x1="160" y1="180" x2="160" y2="300" stroke="var(--border-strong)" stroke-width="1.5" />
          <line x1="160" y1="300" x2="160" y2="380" stroke="var(--border-strong)" stroke-width="1.5" />

          <!-- Smurfing & Layering Lines (T+6h, T+24h, T+72h) -->
          ${timeStage >= 2 ? `
            <line x1="380" y1="120" x2="580" y2="80" stroke="var(--red)" stroke-width="2" stroke-dasharray="${timeStage === 2 ? '4 2' : 'none'}" />
            <line x1="380" y1="120" x2="580" y2="180" stroke="var(--red)" stroke-width="2" />
          ` : ''}

          ${timeStage >= 3 ? `
            <line x1="580" y1="180" x2="700" y2="240" stroke="var(--red)" stroke-width="2" stroke-dasharray="3 3" />
            <line x1="580" y1="80" x2="700" y2="120" stroke="var(--red)" stroke-width="2" />
          ` : ''}

          ${timeStage >= 4 ? `
            <line x1="700" y1="240" x2="700" y2="360" stroke="#ff4d4f" stroke-width="2.5" />
          ` : ''}

          <!-- User Node -->
          <g style="cursor:pointer;" class="svg-node" data-id="USR-0192" data-type="USER" data-first="01 Jan 2026" data-tx="142" data-senders="1" data-risk="LOW" data-conn="1">
            <rect x="90" y="156" width="140" height="48" rx="2" fill="var(--surface-2)" stroke="var(--blue)" stroke-width="1.5" />
            <text x="160" y="176" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="11" font-weight="600">VICTIM / USER</text>
            <text x="160" y="194" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="10">rohit@okaxis</text>
          </g>

          <!-- Device Node -->
          <g style="cursor:pointer;" class="svg-node" data-id="DEV-8921" data-type="DEVICE" data-first="15 Mar 2026" data-tx="32" data-senders="1" data-risk="LOW" data-conn="1">
            <rect x="90" y="280" width="140" height="40" rx="2" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1" />
            <text x="160" y="305" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="10">DEVICE (Android 14)</text>
          </g>

          <!-- Transaction Node -->
          <g style="cursor:pointer;" class="svg-node" data-id="PAY-757718" data-type="TRANSACTION" data-first="Today" data-tx="1" data-senders="1" data-risk="HIGH" data-conn="2">
            <rect x="90" y="364" width="140" height="34" rx="2" fill="var(--surface-3)" stroke="var(--border)" stroke-width="1" />
            <text x="160" y="386" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="10">TX: ₹45,000</text>
          </g>

          <!-- Stage 1+: Recipient Mule Ingestion Node -->
          ${timeStage >= 1 ? `
            <g style="cursor:pointer;" class="svg-node" data-id="RCP-MULE-PRIMARY" data-type="MULE_GATEWAY" data-first="Today" data-tx="4" data-senders="4" data-risk="HIGH" data-conn="4">
              <rect x="310" y="96" width="140" height="48" rx="2" fill="var(--surface-2)" stroke="${timeStage >= 2 ? 'var(--red)' : 'var(--amber)'}" stroke-width="1.5" />
              <text x="380" y="116" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="11" font-weight="600">MULE PRIMARY</text>
              <text x="380" y="134" text-anchor="middle" fill="${timeStage >= 2 ? 'var(--red)' : 'var(--amber)'}" font-family="var(--font-mono)" font-size="9.5">customs.hold@scam</text>
            </g>
          ` : ''}

          <!-- Stage 2+: Smurfing Intermediary Nodes -->
          ${timeStage >= 2 ? `
            <g style="cursor:pointer;" class="svg-node" data-id="MULE-FAN-1" data-type="SMURFING_INTERMEDIARY" data-first="Today" data-tx="8" data-senders="3" data-risk="HIGH" data-conn="2">
              <rect x="510" y="56" width="140" height="46" rx="2" fill="var(--surface-2)" stroke="var(--red)" stroke-width="1" />
              <text x="580" y="76" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="10" font-weight="600">INTERMEDIARY-A</text>
              <text x="580" y="92" text-anchor="middle" fill="var(--red)" font-family="var(--font-mono)" font-size="9">mule.acc1@ybl</text>
            </g>

            <g style="cursor:pointer;" class="svg-node" data-id="MULE-FAN-2" data-type="SMURFING_INTERMEDIARY" data-first="Today" data-tx="6" data-senders="2" data-risk="HIGH" data-conn="2">
              <rect x="510" y="156" width="140" height="46" rx="2" fill="var(--surface-2)" stroke="var(--red)" stroke-width="1" />
              <text x="580" y="176" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="10" font-weight="600">INTERMEDIARY-B</text>
              <text x="580" y="192" text-anchor="middle" fill="var(--red)" font-family="var(--font-mono)" font-size="9">mule.acc2@paytm</text>
            </g>
          ` : ''}

          <!-- Stage 3+: Layering Shell Node -->
          ${timeStage >= 3 ? `
            <g style="cursor:pointer;" class="svg-node" data-id="LAYER-SHELL" data-type="LAYERING_SHELL" data-first="Today" data-tx="19" data-senders="8" data-risk="CRITICAL" data-conn="5">
              <rect x="630" y="216" width="140" height="48" rx="2" fill="#211215" stroke="var(--red)" stroke-width="2" />
              <text x="700" y="236" text-anchor="middle" fill="#ff7875" font-family="var(--font-mono)" font-size="10" font-weight="700">LAYERING HUB</text>
              <text x="700" y="254" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9">crypto_p2p_desk@upi</text>
            </g>
          ` : ''}

          <!-- Stage 4: Exit Consolidation Wallet -->
          ${timeStage >= 4 ? `
            <g style="cursor:pointer;" class="svg-node" data-id="EXIT-WALLET-SYNDICATE" data-type="EXIT_WALLET" data-first="Today" data-tx="45" data-senders="14" data-risk="CRITICAL" data-conn="8">
              <rect x="630" y="340" width="140" height="48" rx="2" fill="#381014" stroke="#ff4d4f" stroke-width="2" />
              <text x="700" y="360" text-anchor="middle" fill="#ff4d4f" font-family="var(--font-mono)" font-size="11" font-weight="700">EXIT DRAIN WALLET</text>
              <text x="700" y="378" text-anchor="middle" fill="#ffffff" font-family="var(--font-mono)" font-size="9">FROZEN ON DRUNIX</text>
            </g>
          ` : ''}
        </svg>

        <!-- Right Side Node Inspector Card -->
        <div class="graph-inspector" id="graph-inspector-panel"></div>
      </div>
    `;

    // Reattach node clicks
    document.querySelectorAll('.svg-node').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        selectedNode = {
          id: id,
          type: el.dataset.type,
          firstSeen: el.dataset.first,
          txCount: el.dataset.tx,
          senders: el.dataset.senders,
          risk: el.dataset.risk,
          connectedEntities: el.dataset.conn
        };
        updateInspector(selectedNode);
      });
    });

    updateInspector(selectedNode);

    // Reattach slider handler
    const slider = document.getElementById('time-travel-range');
    if (slider) {
      slider.oninput = (e) => {
        timeStage = parseInt(e.target.value, 10);
        renderView();
      };
    }
  }

  window.veraViewNodeTransactions = function(nodeId) {
    state.setFilterQuery(nodeId);
    state.setCurrentView('payments');
  };

  renderView();
}
