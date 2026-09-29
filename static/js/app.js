/**
 * VERA Master Application Entry Point
 * Pure Vanilla JavaScript Client - Zero Node / Zero Framework Dependency
 */

import { state } from './state.js';
import { fetchPayments, fetchOverview } from './api/payments.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { renderStatusBar } from './components/status-bar.js';
import { setupCommandPalette, openPalette } from './components/command-palette.js';

import { renderOverview } from './views/overview.js';
import { renderPayments } from './views/payments.js';
import { renderInvestigation } from './views/investigation.js';
import { renderRisk } from './views/risk.js';
import { renderGraph } from './views/graph.js';
import { renderDrunix } from './views/drunix.js';
import { renderRules } from './views/rules.js';
import { renderRemittance } from './views/remittance.js';
import { renderAssets } from './views/assets.js';
import { renderSimulation } from './views/simulation.js';
import { renderResearch } from './views/research.js';
import { renderSecurity } from './views/security.js';

// Global helper for opening payment inspection from any view
window.veraSelectPayment = function(paymentId) {
  const p = state.payments.find(x => x.payment_id === paymentId);
  if (p) {
    state.setSelectedPayment(p);
    state.setView('payments');
  }
};

function renderCurrentView() {
  const container = document.getElementById('view-container');
  if (!container) return;

  switch (state.currentView) {
    case 'overview':
      renderOverview(container);
      break;
    case 'payments':
      renderPayments(container);
      break;
    case 'investigation':
      renderInvestigation(container);
      break;
    case 'risk':
      renderRisk(container);
      break;
    case 'graph':
      renderGraph(container);
      break;
    case 'drunix':
    case 'transactions':
      renderDrunix(container);
      break;
    case 'rules':
      renderRules(container);
      break;
    case 'remittance':
      renderRemittance(container);
      break;
    case 'assets':
      renderAssets(container);
      break;
    case 'simulation':
      renderSimulation(container);
      break;
    case 'research':
      renderResearch(container);
      break;
    case 'security':
    case 'audit':
      renderSecurity(container);
      break;
    default:
      renderOverview(container);
  }
}

async function init() {
  // Setup Shell Containers
  const sidebarEl = document.getElementById('app-sidebar');
  const topbarEl = document.getElementById('app-topbar');
  const statusbarEl = document.getElementById('app-statusbar');

  setupCommandPalette();

  // Load initial backend telemetry
  try {
    const [pmts, ov] = await Promise.all([
      fetchPayments(40),
      fetchOverview()
    ]);
    state.payments = pmts;
    state.overview = ov;

    if (state.selectedPaymentId) {
      const match = pmts.find(p => p.payment_id === state.selectedPaymentId);
      if (match) state.selectedPayment = match;
    }
  } catch (err) {
    console.error('Failed to load initial VERA data:', err);
  }

  // Render Shell
  if (sidebarEl) renderSidebar(sidebarEl);
  if (topbarEl) renderTopbar(topbarEl, openPalette);
  if (statusbarEl) renderStatusBar(statusbarEl);

  renderCurrentView();

  // State Subscription to re-render views on change
  state.subscribe(() => {
    if (sidebarEl) renderSidebar(sidebarEl);
    if (topbarEl) renderTopbar(topbarEl, openPalette);
    if (statusbarEl) renderStatusBar(statusbarEl);
    renderCurrentView();
  });

  // Background Telemetry Poller (every 6 seconds)
  setInterval(async () => {
    try {
      const [pmts, ov] = await Promise.all([
        fetchPayments(40),
        fetchOverview()
      ]);
      state.payments = pmts;
      state.overview = ov;
      if (statusbarEl) renderStatusBar(statusbarEl);
    } catch (e) {}
  }, 6000);

  // Status clock tick (every second)
  setInterval(() => {
    const clock = document.getElementById('status-clock');
    if (clock) {
      clock.textContent = `${new Date().toLocaleTimeString('en-IN', { hour12: false })} IST`;
    }
  }, 1000);
}

window.addEventListener('DOMContentLoaded', init);
