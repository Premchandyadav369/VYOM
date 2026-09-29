/**
 * Topbar Component
 * Minimal top bar matching Section 11 specification.
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
    transactions: 'Ledger Transactions',
    rules: 'Policy Rules',
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
      <button class="btn btn-sm" id="btn-topbar-search" style="padding:2px 8px;">
        <span>Search</span>
        <span class="kbd-badge" style="font-size:9px; margin-left:4px;">Ctrl+K</span>
      </button>

      <span style="display:flex; align-items:center; gap:4px; font-size:11px;">
        <span class="connection-dot"></span>
        <span style="color:var(--green); font-weight:600;">Connected</span>
      </span>

      <span class="badge badge-verify" style="cursor:pointer;" title="2 unresolved suspicious cases">
        Alerts 2
      </span>

      <span class="text-meta" style="color:var(--text-dim);">
        Operator: Tier-3 SOC
      </span>
    </div>
  `;

  document.getElementById('btn-topbar-search')?.addEventListener('click', onOpenSearch);
}
