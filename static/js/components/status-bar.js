/**
 * Status Bar Component
 * Persistent tiny status strip matching Section 25 & 26.
 */

import { state } from '../state.js';

export function renderStatusBar(container) {
  const lastPayment = state.payments && state.payments.length > 0 ? state.payments[0] : null;
  const lastEventText = lastPayment
    ? `${lastPayment.payment_id} → ${lastPayment.decision}`
    : 'No recent events';

  const modeText = state.isLiveFeed ? 'LIVE STREAM' : 'SIMULATION';

  container.innerHTML = `
    <div class="status-items">
      <div class="status-item">
        <span class="connection-dot"></span>
        <span>PAYMENT API</span>
      </div>
      <span class="text-dim">|</span>
      <div class="status-item">
        <span class="connection-dot"></span>
        <span>RISK ENGINE</span>
      </div>
      <span class="text-dim">|</span>
      <div class="status-item">
        <span class="connection-dot"></span>
        <span>DRUNIX</span>
      </div>
      <span class="text-dim">|</span>
      <div class="status-item">
        <span class="connection-dot" style="background-color:${state.isLiveFeed ? 'var(--green)' : 'var(--amber)'};"></span>
        <span>${modeText}</span>
      </div>
    </div>

    <div style="display:flex; align-items:center; gap:12px;">
      <div>
        <span class="text-dim">Last event:</span>
        <span style="color:var(--text); font-weight:600; margin-left:4px;">${lastEventText}</span>
      </div>
      <span class="text-dim">|</span>
      <div id="status-clock" class="tabular-nums" style="color:var(--text-muted);">
        ${new Date().toLocaleTimeString('en-IN', { hour12: false })} IST
      </div>
    </div>
  `;
}
