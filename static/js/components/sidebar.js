/**
 * Sidebar Component
 * Permanent left navigation matching Section 10 specification.
 */

import { state } from '../state.js';

export function renderSidebar(container) {
  const sections = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Overview' },
        { id: 'payments', label: 'Payments' },
        { id: 'investigation', label: 'Investigations' },
        { id: 'risk', label: 'Risk' },
        { id: 'graph', label: 'Graph' }
      ]
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { id: 'nodes', label: 'Consortium Nodes' },
        { id: 'drunix', label: 'Drunix' },
        { id: 'chaos', label: 'Consensus Chaos' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'rules', label: 'Policy Rules' }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'cbdc_nexus', label: 'CBDC & Nexus' },
        { id: 'remittance', label: 'Remittance' },
        { id: 'assets', label: 'Assets' }
      ]
    },
    {
      title: 'LAB',
      items: [
        { id: 'simulation', label: 'Simulation' },
        { id: 'research', label: 'Research' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'security', label: 'Security' },
        { id: 'audit', label: 'Audit Logs' }
      ]
    }
  ];

  let html = `
    <div class="sidebar-header">
      <div class="brand-text">VERA</div>
      <span class="text-meta">v1.4</span>
    </div>
    <nav class="sidebar-nav">
  `;

  sections.forEach(sec => {
    html += `<div class="nav-section-title">${sec.title}</div>`;
    sec.items.forEach(item => {
      const isActive = state.currentView === item.id;
      html += `
        <button class="nav-link ${isActive ? 'active' : ''}" data-view="${item.id}">
          <span>${item.label}</span>
        </button>
      `;
    });
  });

  html += `
    </nav>
    <div style="padding: 10px 12px; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>NPCI DRUNIX</span>
        <span style="color:var(--green); font-weight:700;">● ACTIVE</span>
      </div>
      <div style="color:var(--text-muted); font-size:9px; margin-top:3px; display:flex; justify-content:space-between;">
        <span>CHL-7007</span>
        <span style="color:var(--blue);">Citi × NPCI</span>
      </div>
      <div style="color:var(--text-muted); font-size:8.5px; margin-top:2px;">Raft Consensus • 4 Peers</div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      state.setView(view);
    });
  });
}
