/**
 * Cross-Border Remittance View
 * Matching Section 23 specification.
 */

import { evaluateRemittance } from '../api/simulation.js';

export function renderRemittance(container) {
  let remitState = {
    corridor: 'INDIA → UAE',
    send: 250000,
    receive: 'AED 10,950',
    fx: '22.83',
    fee: '₹320',
    recipient: 'VERIFIED',
    risk: 'LOW',
    route: 'BANK A → PARTNER B',
    state: 'READY'
  };

  function renderCard() {
    container.innerHTML = `
      <div style="max-width: 600px; display:flex; flex-direction:column; gap:16px;">
        <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
          <div class="uppercase-label">BILATERAL PAYMENT CORRIDORS</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">Cross-Border Remittance Rail</h1>
        </div>

        <div style="border:1px solid var(--border); background:var(--surface); padding:16px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="drawer-section-title" style="margin:0;">REMITTANCE CLEARING SUMMARY</div>
            <span class="badge badge-allow">${remitState.state}</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">CORRIDOR</span>
              <span class="drawer-val" style="color:var(--text);">${remitState.corridor}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">SEND</span>
              <span class="drawer-val" style="color:var(--text);">₹${Number(remitState.send).toLocaleString('en-IN')}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">RECEIVE</span>
              <span class="drawer-val" style="color:var(--green); font-weight:700;">${remitState.receive}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">FX RATE</span>
              <span class="drawer-val">${remitState.fx}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">CLEARING FEE</span>
              <span class="drawer-val">${remitState.fee}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">RECIPIENT</span>
              <span class="drawer-val" style="color:var(--green);">${remitState.recipient}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">RISK ASSESSMENT</span>
              <span class="drawer-val" style="color:var(--green);">${remitState.risk}</span>
            </div>
            <div class="drawer-keyvalue-row">
              <span class="drawer-key">SETTLEMENT ROUTE</span>
              <span class="drawer-val" style="color:var(--text-secondary);">${remitState.route}</span>
            </div>
          </div>

          <hr style="border:none; border-top:1px solid var(--border); margin:14px 0;" />

          <!-- Interactive Inputs -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label class="text-meta" style="display:block; margin-bottom:4px;">Send Amount (INR)</label>
              <input type="number" id="remit-input-amount" class="input" value="${remitState.send}" />
            </div>
            <div>
              <label class="text-meta" style="display:block; margin-bottom:4px;">Target Corridor</label>
              <select id="remit-input-corridor" class="input">
                <option value="AE">India → UAE (AED)</option>
                <option value="SG">India → Singapore (SGD / PayNow)</option>
                <option value="US">India → United States (USD)</option>
              </select>
            </div>
          </div>

          <div style="margin-top:12px;">
            <button class="btn btn-primary" id="btn-calc-remit" style="width:100%; justify-content:center; padding:7px 0;">
              Execute Bilateral Compliance & FX Check
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-calc-remit')?.addEventListener('click', async () => {
      const amt = parseFloat(document.getElementById('remit-input-amount')?.value || '250000');
      const cor = document.getElementById('remit-input-corridor')?.value;

      try {
        const res = await evaluateRemittance({ amount_inr: amt, destination_country: cor });
        if (cor === 'SG') {
          remitState = {
            corridor: 'INDIA → SINGAPORE (PayNow)',
            send: amt,
            receive: `SGD ${(amt / 62.45).toFixed(2)}`,
            fx: '62.45',
            fee: '₹180',
            recipient: 'VERIFIED',
            risk: 'LOW',
            route: 'UPI → NETS / PAYNOW (Drunix Anchor)',
            state: 'CLEARED'
          };
        } else {
          remitState = {
            corridor: 'INDIA → UAE',
            send: amt,
            receive: `AED ${(amt / 22.83).toFixed(2)}`,
            fx: '22.83',
            fee: '₹320',
            recipient: 'VERIFIED',
            risk: 'LOW',
            route: 'BANK A → PARTNER B',
            state: 'CLEARED'
          };
        }
        renderCard();
      } catch (e) {
        alert(e.message);
      }
    });
  }

  renderCard();
}
