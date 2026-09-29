/**
 * Overview View
 * Matching Section 05 specification.
 */

import { state } from '../state.js';

export function renderOverview(container) {
  const ov = state.overview || {};
  const pmts = state.payments || [];

  const allowedCount = ov.interventions?.allowed ?? (pmts.filter(p => p.decision === 'ALLOW').length);
  const verifyCount = ov.interventions?.verified ?? (pmts.filter(p => p.decision === 'VERIFY').length);
  const holdCount = ov.interventions?.held ?? (pmts.filter(p => p.decision === 'HOLD').length);
  const totalCount = ov.total_payments ?? pmts.length;

  const nowTime = new Date().toLocaleTimeString('en-IN', { hour12: false });

  container.innerHTML = `
    <div style="max-width: 900px; display: flex; flex-direction: column; gap: 20px;">
      <!-- Title & Time -->
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div>
          <div class="uppercase-label">OPERATIONS</div>
          <h1 class="text-h1" style="margin-top: 2px;">PAYMENT OPERATIONS</h1>
        </div>
        <div class="text-meta">
          <span>${totalCount.toLocaleString('en-IN')} payments</span>
          <span style="margin: 0 8px;">·</span>
          <span class="tabular-nums">${nowTime}</span>
        </div>
      </div>

      <!-- Decision Stats Box Strip -->
      <div style="display: flex; gap: 10px;">
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--green);">ALLOW</div>
          <div class="stat-box-value" style="color:var(--green);">${allowedCount.toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--amber);">VERIFY</div>
          <div class="stat-box-value" style="color:var(--amber);">${verifyCount.toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--red);">HOLD</div>
          <div class="stat-box-value" style="color:var(--red);">${holdCount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <!-- Recent Payment Activity -->
      <div style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
          <div class="uppercase-label">RECENT PAYMENT ACTIVITY</div>
          <button class="btn btn-sm" id="btn-goto-payments" style="font-size:10px;">View all ➔</button>
        </div>

        <div style="display:flex; flex-direction:column;">
          ${pmts.slice(0, 8).map(p => {
            const isAllow = p.decision === 'ALLOW';
            const isVerify = p.decision === 'VERIFY';
            const timeStr = p.created_at ? new Date(p.created_at).toLocaleTimeString('en-IN', { hour12: false }) : '08:42:17';
            return `
              <div class="mono" style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid var(--border-subtle); cursor:pointer;" onclick="window.veraSelectPayment('${p.payment_id}')">
                <span class="text-meta" style="width:70px;">${timeStr}</span>
                <span style="width:100px; color:var(--text); font-weight:600;">₹${Number(p.amount).toLocaleString('en-IN')}</span>
                <span style="color:var(--text-secondary); width:130px;">${p.payment_id}</span>
                <span class="text-meta" style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:10px;">${p.sender_id} ➔ ${p.recipient_id}</span>
                <span class="badge ${isAllow ? 'badge-allow' : (isVerify ? 'badge-verify' : 'badge-hold')}">${p.decision}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- System Status -->
      <div style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 14px;">
        <div class="uppercase-label" style="margin-bottom: 10px;">SYSTEM STATUS</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-family: var(--font-mono); font-size: 11px;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Risk Engine</span>
            <span style="color:var(--green);">●</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Drunix DLT</span>
            <span style="color:var(--green);">●</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Payment API</span>
            <span style="color:var(--green);">●</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Event Stream</span>
            <span style="color:var(--green);">●</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-goto-payments')?.addEventListener('click', () => {
    state.setView('payments');
  });
}
