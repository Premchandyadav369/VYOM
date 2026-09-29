/**
 * Topbar Component - Red Noir Edition
 * Styled with Glowing Shimmer, Rotating Border Demo CTA, and VYOM Identity.
 */

import { state } from '../state.js';

export function renderTopbar(container, onOpenSearch) {
  const titles = {
    overview: 'Overview & Threat Matrix',
    payments: 'Live Payment Stream',
    investigation: 'Investigations',
    risk: 'Intent & Risk Scoring',
    graph: 'Relationship Graph & Time-Travel',
    drunix: 'Drunix Ledger Explorer',
    nodes: 'Consortium Topology (4 Peers)',
    transactions: 'Ledger Transactions',
    chaos: 'Consensus Chaos Sandbox',
    rules: 'Policy Rules Engine',
    cbdc_nexus: 'Programmable CBDC & Project Nexus',
    remittance: 'Cross-Border Corridors',
    assets: 'Tokenized Trade Receivables (TReDS)',
    simulation: 'Digital Twin Simulation',
    research: 'Research Baselines & SFE',
    security: 'Threat Model & Zero-Trust',
    audit: 'Tamper-Evident Audit Logs'
  };

  const currentTitle = titles[state.currentView] || 'Operations';

  container.innerHTML = `
    <div class="topbar-left flex items-center gap-3">
      <div class="flex items-center gap-2 cursor-pointer" id="brand-logo-trigger">
        <div class="w-4 h-4 bg-[#ef233c] rounded-xs rotate-45 shadow-[0_0_14px_#ef233c]"></div>
        <span class="font-manrope font-extrabold tracking-tight text-white text-sm">VYOM</span>
      </div>
      <span class="text-zinc-600 font-mono">/</span>
      <span class="topbar-workspace-tag text-xs font-mono text-zinc-300 font-semibold tracking-wide">${currentTitle}</span>
    </div>

    <div class="topbar-right flex items-center gap-3">
      <!-- 1-Click Interactive Demo Scenario Launcher (Signature Shiny CTA) -->
      <div style="position:relative; display:inline-block;">
        <button class="shiny-cta flex items-center gap-2 text-white font-manrope font-bold text-xs" id="btn-demo-scenarios">
          <iconify-icon icon="lucide:zap" class="text-[#ef233c] w-3.5 h-3.5"></iconify-icon>
          <span>⚡ Quick Demo Scenario ▾</span>
        </button>
        <div id="demo-scenarios-menu" style="display:none; position:absolute; top:calc(100% + 8px); right:0; width:290px; background:rgba(10,10,14,0.98); backdrop-filter:blur(24px); border:1px solid rgba(239,35,60,0.3); border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,0.9), 0 0 25px rgba(239,35,60,0.15); z-index:100; padding:6px; animation:fade-in-up 0.2s ease;">
          <div class="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wider px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <span>INJECT REAL-TIME SCENARIO</span>
            <span class="text-[#ef233c]">1-CLICK</span>
          </div>
          <button class="btn-scenario-opt group w-full text-left p-2.5 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20" data-scenario="DIGITAL_ARREST">
            <div class="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
              <span>🚨 Digital Arrest Scam (₹98,000)</span>
            </div>
            <div class="text-[9px] font-mono text-zinc-500 mt-0.5">Coercion active, CBI authority seizure narrative</div>
          </button>
          <button class="btn-scenario-opt group w-full text-left p-2.5 rounded-lg hover:bg-amber-500/10 transition-colors border border-transparent hover:border-amber-500/20" data-scenario="MULE_SYNDICATE">
            <div class="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <span>⚠️ Mule Syndicate Structuring (₹3,50,000)</span>
            </div>
            <div class="text-[9px] font-mono text-zinc-500 mt-0.5">High-value fan-out layering, Quorum required</div>
          </button>
          <button class="btn-scenario-opt group w-full text-left p-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors border border-transparent hover:border-emerald-500/20" data-scenario="STANDARD_GROCERY">
            <div class="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span>✓ Standard Grocery Order (₹1,850)</span>
            </div>
            <div class="text-[9px] font-mono text-zinc-500 mt-0.5">Blinkit order, instant Drunix commit</div>
          </button>
          <button class="btn-scenario-opt group w-full text-left p-2.5 rounded-lg hover:bg-blue-500/10 transition-colors border border-transparent hover:border-blue-500/20" data-scenario="CROSS_BORDER_NEXUS">
            <div class="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
              <span>🌐 Project Nexus Remittance (₹65,000)</span>
            </div>
            <div class="text-[9px] font-mono text-zinc-500 mt-0.5">India UPI ➔ Singapore PayNow atomic clearing</div>
          </button>
        </div>
      </div>

      <!-- Search Trigger -->
      <button class="btn btn-sm flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:border-red-500/30 text-zinc-300" id="btn-topbar-search">
        <iconify-icon icon="lucide:search" class="w-3.5 h-3.5 text-zinc-400"></iconify-icon>
        <span class="text-xs font-mono">Search</span>
        <span class="kbd-badge text-[9px] px-1.5 py-0.2">Ctrl+K</span>
      </button>

      <!-- Keyboard Shortcuts Help -->
      <button class="btn btn-sm px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-full hover:border-white/20 text-zinc-400 hover:text-white" id="btn-shortcuts-help" title="Keyboard Shortcuts">
        <iconify-icon icon="lucide:help-circle" class="w-3.5 h-3.5"></iconify-icon>
      </button>

      <!-- Drunix Consensus Pulse Badge -->
      <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-xs font-mono">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
        </span>
        <span class="text-[#ef233c] font-bold tracking-wider text-[10px]">CONSENSUS LIVE</span>
      </div>

      <!-- Challenge CHL-7007 Alliance Badge -->
      <div class="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono">
        <span class="text-white font-bold">CHL-7007</span>
        <span class="text-zinc-600">•</span>
        <span class="text-red-400">Citi × NPCI Drunix</span>
      </div>
    </div>
  `;

  document.getElementById('brand-logo-trigger')?.addEventListener('click', () => {
    state.setView('overview');
  });

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
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:500px;">
        <div class="modal-header">
          <div class="modal-title flex items-center gap-2">
            <iconify-icon icon="lucide:keyboard" class="text-[#ef233c]"></iconify-icon>
            <span>VYOM Workstation Shortcuts</span>
          </div>
          <button class="btn btn-sm" id="btn-close-shortcuts">✕</button>
        </div>
        <div class="modal-body space-y-2.5 font-mono text-xs">
          <div class="flex justify-between items-center py-1.5 border-b border-white/5">
            <span class="text-zinc-400">Open Command Palette / Search</span>
            <span class="kbd-badge">Ctrl + K / ⌘K</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-white/5">
            <span class="text-zinc-400">Close Drawer / Modals</span>
            <span class="kbd-badge">Esc</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-white/5">
            <span class="text-zinc-400">Trigger Quick Demo Scenarios</span>
            <span class="kbd-badge">S</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-white/5">
            <span class="text-zinc-400">Navigate to Overview</span>
            <span class="kbd-badge">G then O</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-white/5">
            <span class="text-zinc-400">Navigate to Payments Stream</span>
            <span class="kbd-badge">G then P</span>
          </div>
          <div class="flex justify-between items-center py-1.5">
            <span class="text-zinc-400">Show This Shortcuts Modal</span>
            <span class="kbd-badge">?</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-sm btn-primary" id="btn-modal-ok">Dismiss</button>
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
    document.getElementById('btn-modal-ok').onclick = () => {
      modal.style.display = 'none';
    };
  }
  modal.style.display = 'flex';
}
