/**
 * Payment Investigation Drawer
 * Matching Section 14 specification.
 */

import { state } from '../state.js';
import { approvePayment, holdPayment, verifyPayment, fetchPayments, fetchOverview } from '../api/payments.js';

export function renderInvestigationDrawer(payment, onClose) {
  if (!payment) return '';

  const isAllow = payment.decision === 'ALLOW';
  const isVerify = payment.decision === 'VERIFY';
  const badgeClass = isAllow ? 'badge-allow' : (isVerify ? 'badge-verify' : 'badge-hold');

  const intentConsistency = payment.intent_consistency != null ? (payment.intent_consistency * 100).toFixed(0) : '0';
  const behaviorDev = payment.behavior_deviation != null ? payment.behavior_deviation.toFixed(2) : '0.15';
  const recipientTrust = payment.recipient_trust != null ? payment.recipient_trust.toFixed(2) : '0.50';
  const contextRisk = payment.context_risk != null ? payment.context_risk.toFixed(2) : '0.20';
  const intentMismatch = (1 - (payment.intent_consistency || 0)).toFixed(2);

  const reasons = payment.reason_codes && payment.reason_codes.length > 0
    ? payment.reason_codes
    : ['PARAMETRIC_EVALUATION'];

  return `
    <aside class="investigation-drawer">
      <div class="drawer-header">
        <div>
          <div style="font-size:13px; font-weight:700; color:var(--text);">${payment.payment_id}</div>
          <div class="text-meta" style="margin-top:2px;">
            ${payment.created_at ? new Date(payment.created_at).toLocaleTimeString('en-IN') : '09:41:22'}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge ${badgeClass}">${payment.decision}</span>
          <button class="btn btn-sm" id="btn-close-drawer" style="padding:1px 5px;">✕</button>
        </div>
      </div>

      <div style="font-size:16px; font-weight:700; color:var(--text); font-variant-numeric:tabular-nums;">
        ₹${Number(payment.amount).toLocaleString('en-IN')}
      </div>

      <!-- Parties -->
      <div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">USER</span>
          <span class="drawer-val">${payment.sender_id}</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">RECIPIENT</span>
          <span class="drawer-val">${payment.recipient_id}</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">TIME</span>
          <span class="drawer-val">${payment.created_at ? new Date(payment.created_at).toLocaleTimeString('en-IN') : '09:41:22'}</span>
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--border);" />

      <!-- Intent -->
      <div>
        <div class="drawer-section-title">INTENT</div>
        <div class="intent-box">
          "${payment.stated_intent || 'No narrative submitted'}"
        </div>
        <div class="drawer-keyvalue-row" style="margin-top:6px;">
          <span class="drawer-key">Consistency</span>
          <span class="drawer-val">${intentConsistency}%</span>
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--border);" />

      <!-- Risk Decomposition -->
      <div>
        <div class="drawer-section-title">RISK COMPONENTS</div>
        <div class="risk-breakdown-row">
          <span class="risk-breakdown-label">Intent mismatch</span>
          <div class="risk-breakdown-bar">
            <div class="risk-breakdown-fill" style="width:${intentMismatch * 100}%; background:var(--blue);"></div>
          </div>
          <span class="risk-breakdown-num">${intentMismatch}</span>
        </div>
        <div class="risk-breakdown-row">
          <span class="risk-breakdown-label">Behavior anomaly</span>
          <div class="risk-breakdown-bar">
            <div class="risk-breakdown-fill" style="width:${behaviorDev * 100}%; background:var(--amber);"></div>
          </div>
          <span class="risk-breakdown-num">${behaviorDev}</span>
        </div>
        <div class="risk-breakdown-row">
          <span class="risk-breakdown-label">Recipient risk</span>
          <div class="risk-breakdown-bar">
            <div class="risk-breakdown-fill" style="width:${(1 - recipientTrust) * 100}%; background:var(--green);"></div>
          </div>
          <span class="risk-breakdown-num">${(1 - recipientTrust).toFixed(2)}</span>
        </div>
        <div class="risk-breakdown-row">
          <span class="risk-breakdown-label">Context risk</span>
          <div class="risk-breakdown-bar">
            <div class="risk-breakdown-fill" style="width:${contextRisk * 100}%; background:var(--text-dim);"></div>
          </div>
          <span class="risk-breakdown-num">${contextRisk}</span>
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--border);" />

      <!-- Reasons -->
      <div>
        <div class="drawer-section-title">REASONS</div>
        <div style="display:flex; flex-direction:column; gap:3px;">
          ${reasons.map(r => `
            <div style="font-family:var(--font-mono); font-size:10px; color:var(--text-secondary);">
              • ${r}
            </div>
          `).join('')}
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--border);" />

      <!-- Drunix Ledger Progression -->
      <div>
        <div class="drawer-section-title">DRUNIX LEDGER STATE</div>
        <div class="drunix-stepper">
          <div class="drunix-stepper-item done">PROPOSAL</div>
          <div class="drunix-stepper-item done">ENDORSED</div>
          <div class="drunix-stepper-item done">ORDERED</div>
          <div class="drunix-stepper-item done">VALIDATED</div>
          <div class="drunix-stepper-item ${payment.status === 'SETTLED' ? 'done' : ''}">COMMITTED</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="margin-top:6px; display:flex; flex-direction:column; gap:5px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <button class="btn btn-allow" id="drawer-btn-approve">Approve (Override)</button>
          <button class="btn btn-hold" id="drawer-btn-hold">Quarantine (Hold)</button>
        </div>
        ${payment.status === 'VERIFY_REQUIRED' ? `
          <button class="btn btn-primary" id="drawer-btn-verify">Authorize Biometric Step-Up</button>
        ` : ''}
      </div>
    </aside>
  `;
}

export function bindDrawerEvents(container, payment, onActionComplete) {
  document.getElementById('btn-close-drawer')?.addEventListener('click', () => {
    state.setSelectedPayment(null);
  });

  document.getElementById('drawer-btn-approve')?.addEventListener('click', async () => {
    try {
      await approvePayment(payment.payment_id);
      const [pmts, ov] = await Promise.all([fetchPayments(40), fetchOverview()]);
      state.payments = pmts;
      state.overview = ov;
      const updated = pmts.find(p => p.payment_id === payment.payment_id);
      state.setSelectedPayment(updated || null);
      if (onActionComplete) onActionComplete();
    } catch (e) {
      alert(e.message);
    }
  });

  document.getElementById('drawer-btn-hold')?.addEventListener('click', async () => {
    try {
      await holdPayment(payment.payment_id);
      const [pmts, ov] = await Promise.all([fetchPayments(40), fetchOverview()]);
      state.payments = pmts;
      state.overview = ov;
      const updated = pmts.find(p => p.payment_id === payment.payment_id);
      state.setSelectedPayment(updated || null);
      if (onActionComplete) onActionComplete();
    } catch (e) {
      alert(e.message);
    }
  });

  document.getElementById('drawer-btn-verify')?.addEventListener('click', async () => {
    try {
      await verifyPayment(payment.payment_id);
      const [pmts, ov] = await Promise.all([fetchPayments(40), fetchOverview()]);
      state.payments = pmts;
      state.overview = ov;
      const updated = pmts.find(p => p.payment_id === payment.payment_id);
      state.setSelectedPayment(updated || null);
      if (onActionComplete) onActionComplete();
    } catch (e) {
      alert(e.message);
    }
  });
}
