/**
 * Sidebar Component - Red Noir Edition
 * Featuring VYOM Branding, Iconify Icons, and Active Consensus Status.
 */

import { state } from '../state.js';

export function renderSidebar(container) {
  const sections = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Overview', icon: 'lucide:layout-dashboard' },
        { id: 'payments', label: 'Payments', icon: 'lucide:credit-card' },
        { id: 'investigation', label: 'Investigations', icon: 'lucide:shield-alert' },
        { id: 'risk', label: 'Risk Scoring', icon: 'lucide:activity' },
        { id: 'graph', label: 'Relationship Graph', icon: 'lucide:network' }
      ]
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { id: 'nodes', label: 'Consortium Nodes', icon: 'lucide:server' },
        { id: 'drunix', label: 'Drunix Explorer', icon: 'lucide:blocks' },
        { id: 'chaos', label: 'Consensus Chaos', icon: 'lucide:flame' },
        { id: 'transactions', label: 'Transactions', icon: 'lucide:receipt' },
        { id: 'rules', label: 'Policy Rules', icon: 'lucide:sliders' }
      ]
    },
    {
      title: 'FINANCE & SETTLEMENT',
      items: [
        { id: 'cbdc_nexus', label: 'CBDC & Project Nexus', icon: 'lucide:coins' },
        { id: 'remittance', label: 'Remittance Corridors', icon: 'lucide:globe' },
        { id: 'assets', label: 'Tokenized Assets (TReDS)', icon: 'lucide:file-text' }
      ]
    },
    {
      title: 'LAB & BENCHMARKS',
      items: [
        { id: 'simulation', label: 'Simulation Lab', icon: 'lucide:cpu' },
        { id: 'research', label: 'Research Baselines', icon: 'lucide:flask-conical' }
      ]
    },
    {
      title: 'SYSTEM & AUDIT',
      items: [
        { id: 'security', label: 'Threat Model', icon: 'lucide:lock' },
        { id: 'audit', label: 'Audit Logs', icon: 'lucide:history' }
      ]
    }
  ];

  let html = `
    <div class="sidebar-header">
      <div class="flex items-center gap-2.5">
        <div class="w-5 h-5 bg-[#ef233c] rounded-xs rotate-45 shadow-[0_0_16px_rgba(239,35,60,0.85)]"></div>
        <span class="text-base font-extrabold tracking-tight font-manrope text-white">VYOM</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-[#ef233c] font-mono font-bold tracking-wider">v2.0</span>
      </div>
      <div class="text-[9px] font-mono text-zinc-500">DLT</div>
    </div>
    <nav class="sidebar-nav">
  `;

  sections.forEach(sec => {
    html += `<div class="nav-section-title">${sec.title}</div>`;
    sec.items.forEach(item => {
      const isActive = state.currentView === item.id;
      html += `
        <button class="nav-link ${isActive ? 'active' : ''}" data-view="${item.id}">
          <iconify-icon icon="${item.icon}"></iconify-icon>
          <span>${item.label}</span>
        </button>
      `;
    });
  });

  html += `
    </nav>
    <div class="p-3 border-t border-white/5 bg-black/60 font-mono text-xs">
      <div class="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 shadow-[0_0_15px_rgba(239,35,60,0.08)]">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-zinc-400 font-bold">NPCI DRUNIX</span>
          <span class="flex items-center gap-1.5 text-[#ef233c] font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ef233c] animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <div class="flex justify-between items-center text-[9px] text-zinc-500 mt-1.5">
          <span>CHL-7007</span>
          <span class="text-red-300 font-semibold">Citi × NPCI</span>
        </div>
        <div class="text-[8.5px] text-zinc-600 mt-1">Raft Consensus • 4 Peers</div>
      </div>
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
