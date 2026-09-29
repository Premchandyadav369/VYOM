/**
 * Dedicated Investigation Workstation
 * Matching Section 15 specification.
 */

import { state } from '../state.js';

export function renderInvestigation(container) {
  const p = state.selectedPayment || (state.payments && state.payments.length > 0 ? state.payments[0] : null);

  if (!p) {
    container.innerHTML = `
      <div style="padding:40px; text-align:center; color:var(--text-dim); font-family:var(--font-mono);">
        No payment selected for investigation. Select a payment from the monitor to begin forensic review.
      </div>
    `;
    return;
  }

  const riskVal = p.risk_score != null ? p.risk_score.toFixed(3) : '0.150';
  const consistencyPct = p.intent_consistency != null ? (p.intent_consistency * 100).toFixed(0) : '85';
  const recipientTrust = p.recipient_trust != null ? (p.recipient_trust * 100).toFixed(0) : '75';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
      <div>
        <div class="uppercase-label">INCIDENT INVESTIGATION</div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
          <h1 class="text-h1 mono">${p.payment_id}</h1>
          <span class="badge ${p.decision === 'ALLOW' ? 'badge-allow' : (p.decision === 'VERIFY' ? 'badge-verify' : 'badge-hold')}">
            ${p.decision}
          </span>
          <span class="text-meta">Block #${p.drunix_block_number || 1}</span>
        </div>
      </div>
      <div class="text-meta">
        Case Status: ${p.status}
      </div>
    </div>

    <!-- 3-Column Forensic Layout -->
    <div class="investigation-grid">
      <!-- Left Column: Payment Details & Entities -->
      <div class="investigation-pane">
        <div class="drawer-section-title">TRANSACTION ATTRIBUTES</div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Amount</span>
          <span class="drawer-val">₹${Number(p.amount).toLocaleString('en-IN')}</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Sender VPA</span>
          <span class="drawer-val">${p.sender_id}</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Beneficiary</span>
          <span class="drawer-val">${p.recipient_id}</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Channel</span>
          <span class="drawer-val">UPI 2.0</span>
        </div>

        <hr style="border:none; border-top:1px solid var(--border);" />

        <div class="drawer-section-title">STATED NARRATIVE</div>
        <div class="intent-box">
          "${p.stated_intent || 'Direct transfer without user narrative'}"
        </div>

        <hr style="border:none; border-top:1px solid var(--border);" />

        <div class="drawer-section-title">CONNECTED ENTITIES</div>
        <div style="font-family:var(--font-mono); font-size:10px; color:var(--text-secondary); line-height:1.6;">
          <div>• Device: DEV_ANDROID_14 (Mumbai)</div>
          <div>• IP: 103.21.244.18 (Clean ISP)</div>
          <div>• Velocity: 1 tx / 48 hrs</div>
        </div>
      </div>

      <!-- Center Column: Relationship Tree Diagram -->
      <div class="investigation-pane" style="padding:0; overflow:hidden;">
        <div style="padding:10px 12px; border-bottom:1px solid var(--border); background:var(--surface-2); display:flex; justify-content:space-between; align-items:center;">
          <span class="drawer-section-title" style="margin:0;">ENTITY TOPOLOGY DIAGRAM</span>
          <span class="text-meta">1-Hop Counterparty Subgraph</span>
        </div>

        <div style="flex:1; padding:20px; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:var(--font-mono); font-size:11px;">
          <!-- SVG Graph -->
          <svg width="340" height="240" viewBox="0 0 340 240" style="overflow:visible;">
            <!-- Links -->
            <line x1="70" y1="120" x2="170" y2="60" stroke="var(--border-strong)" stroke-width="1.5" />
            <line x1="170" y1="60" x2="270" y2="60" stroke="var(--border-strong)" stroke-width="1.5" />
            <line x1="170" y1="60" x2="270" y2="150" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="70" y1="120" x2="70" y2="190" stroke="var(--border-strong)" stroke-width="1.5" />

            <!-- User Node -->
            <rect x="20" y="100" width="100" height="36" rx="2" fill="var(--surface-2)" stroke="var(--blue)" stroke-width="1" />
            <text x="70" y="122" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">SENDER</text>

            <!-- Payment Node -->
            <rect x="120" y="42" width="100" height="36" rx="2" fill="var(--surface-3)" stroke="var(--border-strong)" stroke-width="1" />
            <text x="170" y="64" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="600">₹${Number(p.amount).toLocaleString('en-IN')}</text>

            <!-- Beneficiary Node -->
            <rect x="220" y="42" width="100" height="36" rx="2" fill="var(--surface-2)" stroke="var(--green)" stroke-width="1" />
            <text x="270" y="64" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">BENEFICIARY</text>

            <!-- Mule/Mismatched Node -->
            <rect x="220" y="132" width="100" height="36" rx="2" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1" />
            <text x="270" y="154" text-anchor="middle" fill="var(--amber)" font-size="10" font-weight="600">MULE NODE</text>

            <!-- Device Node -->
            <rect x="20" y="172" width="100" height="36" rx="2" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1" />
            <text x="70" y="194" text-anchor="middle" fill="var(--text-muted)" font-size="10">DEVICE</text>
          </svg>
        </div>

        <div style="padding:10px 12px; border-top:1px solid var(--border); font-family:var(--font-mono); font-size:10px; color:var(--text-muted);">
          <span>Node Assessment: Single direct sender connection. Beneficiary account age: 14 days.</span>
        </div>
      </div>

      <!-- Right Column: Risk Analysis & Decision -->
      <div class="investigation-pane">
        <div class="drawer-section-title">RISK ANALYSIS SUMMARY</div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Unified Risk</span>
          <span class="drawer-val">${riskVal}</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Intent Consistency</span>
          <span class="drawer-val">${consistencyPct}%</span>
        </div>
        <div class="drawer-keyvalue-row">
          <span class="drawer-key">Recipient Trust</span>
          <span class="drawer-val">${recipientTrust}%</span>
        </div>

        <hr style="border:none; border-top:1px solid var(--border);" />

        <div class="drawer-section-title">EVALUATION SUMMARY</div>
        <p class="text-meta" style="color:var(--text-secondary); line-height:1.5;">
          ${p.risk_details?.explanation || 'Payment processed under normal parameters. No high-risk mule ring association.'}
        </p>

        <hr style="border:none; border-top:1px solid var(--border);" />

        <div class="drawer-section-title">CRYPTOGRAPHIC ATTESTATION</div>
        <div class="text-meta" style="word-break:break-all; font-size:9px; color:var(--text-dim);">
          ${p.risk_details?.vyom_signature || p.risk_details?.vera_signature || 'SIG_ECDSA_SHA256_VYOM_D481C9A'}
        </div>
      </div>
    </div>
  `;
}
