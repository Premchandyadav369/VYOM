/**
 * VYOM Master Application Entry Point
 * Pure Vanilla JavaScript Client - Zero Node / Zero Framework Dependency
 * Connected to Real-Time WebSocket Telemetry Stream
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
import { renderNodes } from './views/nodes.js';
import { renderRules } from './views/rules.js';
import { renderRemittance } from './views/remittance.js';
import { renderAssets } from './views/assets.js';
import { renderCBDCAndNexus } from './views/cbdc_nexus.js';
import { renderChaos } from './views/chaos.js';
import { renderSimulation } from './views/simulation.js';
import { renderResearch } from './views/research.js';
import { renderSecurity } from './views/security.js';

// Global helper for opening payment inspection from any view
window.vyomSelectPayment = window.veraSelectPayment = function(paymentId) {
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
    case 'nodes':
      renderNodes(container);
      break;
    case 'chaos':
      renderChaos(container);
      break;
    case 'rules':
      renderRules(container);
      break;
    case 'cbdc_nexus':
      renderCBDCAndNexus(container);
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

// Live Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'danger' ? 'alert-danger' : 'alert-info'}`;
  toast.innerHTML = `
    <span>${type === 'danger' ? '🚨' : '⚡'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Real-Time WebSocket Connection
function setupWebSocketStream() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = window.location.host.includes(':') ? window.location.host : '127.0.0.1:8000';
  const wsUrl = `${wsProtocol}//${wsHost}/ws/stream`;

  let ws = null;
  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[VERA-WS] Connected to live Drunix telemetry stream');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PAYMENT_INGESTED') {
            const p = msg.data;
            showToast(`New Transaction: ${p.payment_id} (₹${Number(p.amount).toLocaleString('en-IN')}) [${p.decision}]`);
            // Prepend to payments array
            state.payments = [p, ...state.payments.filter(x => x.payment_id !== p.payment_id)];
            if (state.currentView === 'overview' || state.currentView === 'payments') {
              renderCurrentView();
            }
          } else if (msg.type === 'COERCION_ALERT') {
            showToast(`COERCION DETECTED: Digital arrest threat flagged on ${msg.data.payment_id}!`, 'danger');
          } else if (msg.type === 'QUORUM_UPDATE') {
            showToast(`Quorum Updated: Override signature recorded for ${msg.data.payment_id}`);
          } else if (msg.type === 'CHAOS_FAULT_INJECTED') {
            showToast(`Byzantine Fault Injected: ${msg.data.title}`);
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        setTimeout(connect, 4000); // Reconnect loop
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      setTimeout(connect, 5000);
    }
  }

  connect();
}

async function init() {
  const sidebarEl = document.getElementById('app-sidebar');
  const topbarEl = document.getElementById('app-topbar');
  const statusbarEl = document.getElementById('app-statusbar');

  setupCommandPalette();
  setupWebSocketStream();

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
    console.error('Failed to load initial VYOM data:', err);
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

  // Background Telemetry Poller (every 6 seconds as heartbeat fallback)
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
