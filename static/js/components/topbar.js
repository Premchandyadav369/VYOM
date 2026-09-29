/**
 * Topbar Component
 * Upgraded with 1-Click Demo Scenario Injector and Keyboard Shortcut Modal.
 */

import { state } from '../state.js';

export function renderTopbar(container, onOpenSearch) {
  const titles = {
    overview: 'Overview',
    payments: 'Payments',
    investigation: 'Investigations',
    risk: 'Risk Scoring',
    graph: 'Relationship Graph',
    drunix: 'Drunix Explorer',
    nodes: 'Consortium Topology',
    transactions: 'Ledger Transactions',
    chaos: 'Consensus Chaos',
    rules: 'Policy Rules',
    cbdc_nexus: 'CBDC & Project Nexus',
    remittance: 'Remittance',
    assets: 'Tokenized Assets',
    simulation: 'Simulation Lab',
    research: 'Research Baselines',
    security: 'Threat Model',
    audit: 'Audit Logs'
  };

  const currentTitle = titles[state.currentView] || 'Operations';

  container.innerHTML = `
    <div class="topbar-left">
      <span style="font-family:var(--font-mono); font-weight:700; color:var(--text);">VERA</span>
      <span class="text-dim">/</span>
      <span class="topbar-workspace-tag">${currentTitle}</span>
    </div>

    <div class="topbar-right">
      <!-- 1-Click Interactive Demo Scenario Launcher -->
      <div style="position:relative; display:inline-block;">
        <button class="btn btn-sm btn-primary" id="btn-demo-scenarios" style="padding:2px 8px; font-weight:600;">
          ⚡ Quick Demo Scenario ▾
        </button>
        <div id="demo-scenarios-menu" style="display:none; position:absolute; top:100%; right:0; margin-top:4px; width:260px; background:var(--surface); border:1px solid var(--border-strong); border-radius:var(--radius-sm); box-shadow:0 12px 24px rgba(0,0,0,0.6); z-index:100; padding:4px;">
          <div class="text-meta" style="padding:4px 8px; font-weight:700; border-bottom:1px solid var(--border);">INJECT REAL-TIME SCENARIO</div>
          <button class="btn-scenario-opt" data-scenario="DIGITAL_ARREST" style="display:block; width:100%; text-align:left; padding:6px 8px; background:transparent; border:none; color:var(--red); font-family:var(--font-mono); font-size:10.5px; cursor:pointer;">
            🚨 Digital Arrest Scam (₹98,000)
            <div class="text-meta" style="font-size:9px; color:var(--text-muted);">Coercion active, CBI seizure narrative</div>
          </button>
          <button class="btn-scenario-opt" data-scenario="MULE_SYNDICATE" style="display:block; width:100%; text-align:left; padding:6px 8px; background:transparent; border:none; color:var(--amber); font-family:var(--font-mono); font-size:10.5px; cursor:pointer;">
            ⚠️ Mule Syndicate Structuring (₹3,50,000)
            <div class="text-meta" style="font-size:9px; color:var(--text-muted);">High-value layering, Quorum required</div>
          </button>
          <button class="btn-scenario-opt" data-scenario="STANDARD_GROCERY" style="display:block; width:100%; text-align:left; padding:6px 8px; background:transparent; border:none; color:var(--green); font-family:var(--font-mono); font-size:10.5px; cursor:pointer;">
            ✓ Standard Grocery Purchase (₹1,850)
            <div class="text-meta" style="font-size:9px; color:var(--text-muted);">Blinkit order, instant Drunix commit</div>
          </button>
          <button class="btn-scenario-opt" data-scenario="CROSS_BORDER_NEXUS" style="display:block; width:100%; text-align:left; padding:6px 8px; background:transparent; border:none; color:var(--blue); font-family:var(--font-mono); font-size:10.5px; cursor:pointer;">
            🌐 Project Nexus Cross-Border (₹65,000)
            <div class="text-meta" style="font-size:9px; color:var(--text-muted);">India UPI ➔ Singapore PayNow clearing</div>
          </button>
        </div>
      </div>

      <button class="btn btn-sm" id="btn-topbar-search" style="padding:2px 8px;">
        <span>Search</span>
        <span class="kbd-badge" style="font-size:9px; margin-left:4px;">Ctrl+K</span>
      </button>

      <button class="btn btn-sm" id="btn-shortcuts-help" style="padding:2px 6px;" title="Keyboard Shortcuts">
        <span>?</span>
      </button>

      <span style="display:flex; align-items:center; gap:4px; font-size:11px;">
        <span class="connection-dot"></span>
        <span style="color:var(--green); font-weight:600;">Consensus Online</span>
      </span>

      <span class="text-meta" style="color:var(--text-dim);">
        Tier-3 SOC Lead
      </span>
    </div>
  `;

  document.getElementById('btn-topbar-search')?.addEventListener('click', onOpenSearch);

  // Demo menu toggle
  const btnDemo = document.getElementById('btn-demo-scenarios');
  const menuDemo = document.getElementById('demo-scenarios-menu');
  if (btnDemo && menuDemo) {
    btnDemo.onclick = (e) => {
      e.stopPropagation();
      menuDemo.style.display = menuDemo.style.display === 'block' ? 'none' : 'block';
    };

    document.addEventListener('click', () => {
      menuDemo.style.display = 'none';
    });

    menuDemo.querySelectorAll('.btn-scenario-opt').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        menuDemo.style.display = 'none';
        const scenario = btn.dataset.scenario;
        try {
          const res = await fetch('/demo/inject-scenario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario_name: scenario })
          });
          const data = await res.json();
          if (data.payment) {
            state.setSelectedPayment(data.payment);
            state.setView('payments');
          }
        } catch (err) {
          alert('Scenario injection failed: ' + err.message);
        }
      };
    });
  }

  // Keyboard shortcut modal trigger
  document.getElementById('btn-shortcuts-help')?.addEventListener('click', showShortcutsModal);
}

export function showShortcutsModal() {
  let modal = document.getElementById('shortcuts-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'shortcuts-modal-overlay';
    modal.className = 'cmd-overlay';
    modal.innerHTML = `
      <div class="cmd-modal" style="width:480px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <div style="font-weight:700; color:var(--text); font-size:13px;">KEYBOARD SHORTCUTS</div>
          <button class="btn btn-sm" id="btn-close-shortcuts">✕</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; font-family:var(--font-mono); font-size:11px;">
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Open Command Search</span>
            <span class="kbd-badge">Ctrl + K / ⌘K</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Close Drawer / Modals</span>
            <span class="kbd-badge">Esc</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Quick Scenarios Menu</span>
            <span class="kbd-badge">S</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Switch to Overview</span>
            <span class="kbd-badge">G then O</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Switch to Payments</span>
            <span class="kbd-badge">G then P</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span style="color:var(--text-secondary);">Show Shortcuts Help</span>
            <span class="kbd-badge">?</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    document.getElementById('btn-close-shortcuts').onclick = () => {
      modal.style.display = 'none';
    };
  }
  modal.style.display = 'flex';
}
