/**
 * CBDC Programmable e-Rupee & Project Nexus Multilateral Rail View
 */

import { state } from '../state.js';

export function renderCBDCAndNexus(container) {
  let activeTab = 'cbdc';

  async function loadData() {
    try {
      const [tokensRes, nexusRes] = await Promise.all([
        fetch('/cbdc/tokens'),
        fetch('/nexus/status')
      ]);
      const tokens = await tokensRes.json();
      const nexus = await nexusRes.json();
      renderUI(tokens, nexus);
    } catch (e) {
      container.innerHTML = `<div class="text-meta" style="color:var(--red);">Error loading CBDC/Nexus data: ${e.message}</div>`;
    }
  }

  function renderUI(tokens, nexus) {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
        <div>
          <div class="uppercase-label">SOVEREIGN DIGITAL RAILS</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">CBDC e-Rupee & Project Nexus</h1>
        </div>
        <div class="tabs-header">
          <button class="tab-btn ${activeTab === 'cbdc' ? 'active' : ''}" id="tab-btn-cbdc">Programmable e-Rupee</button>
          <button class="tab-btn ${activeTab === 'nexus' ? 'active' : ''}" id="tab-btn-nexus">Project Nexus Multilateral</button>
        </div>
      </div>

      <div id="cbdc-nexus-content">
        ${activeTab === 'cbdc' ? renderCBDCSection(tokens) : renderNexusSection(nexus)}
      </div>
    `;

    document.getElementById('tab-btn-cbdc').onclick = () => {
      activeTab = 'cbdc';
      loadData();
    };
    document.getElementById('tab-btn-nexus').onclick = () => {
      activeTab = 'nexus';
      loadData();
    };

    if (activeTab === 'cbdc') attachCBDCHandlers(loadData);
    if (activeTab === 'nexus') attachNexusHandlers(loadData);
  }

  loadData();
}

function renderCBDCSection(tokens) {
  return `
    <div style="display:grid; grid-template-columns: 360px 1fr; gap:16px;">
      <!-- Minter & Test Console -->
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; display:flex; flex-direction:column; gap:12px;">
        <div style="font-weight:700; color:var(--text); font-size:12px;">MINT PROGRAMMABLE TOKEN (RBI e-INR)</div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Beneficiary ID</label>
          <input type="text" id="mint-beneficiary" class="input" value="farmer.ramesh@sbi" />
        </div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Denomination (e-INR)</label>
          <input type="number" id="mint-amount" class="input" value="15000" />
        </div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Purpose Smart Contract</label>
          <select id="mint-purpose" class="input">
            <option value="AGRI_FERTILIZER_SUBSIDY">PM-KISAN Fertilizer Subsidy (MCC: 5169, 5261)</option>
            <option value="HEALTHCARE_AYUSHMAN_BENEFIT">Ayushman Bharat Hospital Voucher (MCC: 8011, 8062)</option>
            <option value="EDUCATION_SCHOLARSHIP_GRANT">National Merit Tuition Voucher (MCC: 8211, 8220)</option>
            <option value="MSME_RAW_MATERIAL_ESCROW">TReDS Supplier Invoicing Escrow (MCC: 5045, 5085)</option>
          </select>
        </div>

        <button class="btn btn-primary" id="btn-mint-token" style="justify-content:center; padding:8px;">
          Mint & Anchor on Drunix
        </button>
        <div id="mint-feedback" class="text-meta" style="min-height:14px;"></div>

        <hr style="border:none; border-top:1px solid var(--border); margin:4px 0;" />

        <div style="font-weight:700; color:var(--text); font-size:12px;">TEST PURPOSE-BOUND REDEMPTION</div>
        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Token ID to Test</label>
          <input type="text" id="redeem-token-id" class="input" placeholder="e.g. CBDC-AGRI-006749" value="${tokens.length > 0 ? tokens[0].token_id : ''}" />
        </div>
        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Merchant Category Code (MCC)</label>
          <input type="text" id="redeem-mcc" class="input" placeholder="5169 (Fertilizer) or 5812 (Restaurant)" value="5812" />
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary" id="btn-test-unauth-mcc" style="flex:1;">Test Unauth MCC</button>
          <button class="btn btn-allow" id="btn-test-auth-mcc" style="flex:1;">Test Auth MCC</button>
        </div>
        <div id="redeem-feedback" class="text-meta" style="min-height:14px;"></div>
      </div>

      <!-- Active Tokens Table -->
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; overflow-x:auto;">
        <div style="font-weight:700; color:var(--text); font-size:12px; margin-bottom:10px;">
          ACTIVE PROGRAMMABLE e-RUPEE VOUCHERS (${tokens.length})
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>TOKEN ID</th>
              <th>BENEFICIARY</th>
              <th>PURPOSE</th>
              <th>BALANCE</th>
              <th>ALLOWED MCCS</th>
              <th>STATUS</th>
              <th>DRUNIX TX</th>
            </tr>
          </thead>
          <tbody>
            ${tokens.map(t => `
              <tr>
                <td class="font-mono text-bold" style="color:var(--blue);">${t.token_id}</td>
                <td class="font-mono">${t.beneficiary_id}</td>
                <td><span class="badge badge-neutral">${t.purpose_code}</span></td>
                <td class="num font-mono">₹${Number(t.denomination_e_inr).toLocaleString('en-IN')}</td>
                <td class="font-mono text-meta">${(t.allowed_mcc_list || []).join(', ')}</td>
                <td><span class="badge ${t.status === 'ACTIVE' ? 'badge-allow' : 'badge-neutral'}">${t.status}</span></td>
                <td class="font-mono text-meta">${(t.drunix_tx_id || '').slice(0, 14)}...</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderNexusSection(nexus) {
  const corridors = Object.keys(nexus);
  return `
    <div style="display:grid; grid-template-columns: 380px 1fr; gap:16px;">
      <!-- Nexus Simulator Console -->
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; display:flex; flex-direction:column; gap:12px;">
        <div style="font-weight:700; color:var(--text); font-size:12px;">PROJECT NEXUS MULTILATERAL SETTLEMENT</div>
        <div class="text-meta" style="line-height:1.4;">
          Instant bilateral cross-border clearing between India (UPI/e-INR) and ASEAN/Middle-East fast payment systems with real-time Nostro balancing.
        </div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Clearing Corridor</label>
          <select id="nexus-corridor" class="input">
            <option value="IN-SG">India UPI ➔ Singapore PayNow (MAS)</option>
            <option value="IN-UAE">India UPI ➔ UAE Jaywan / Aani (CBUAE)</option>
            <option value="IN-TH">India UPI ➔ Thailand PromptPay (BOT)</option>
          </select>
        </div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Remit Amount (INR)</label>
          <input type="number" id="nexus-amount" class="input" value="45000" />
        </div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Sender Handle (IN)</label>
          <input type="text" id="nexus-sender" class="input" value="aditya.singh@icici" />
        </div>

        <div>
          <label class="text-meta" style="display:block; margin-bottom:4px;">Recipient Handle</label>
          <input type="text" id="nexus-recipient" class="input" value="tan.weishen@dbs" />
        </div>

        <button class="btn btn-allow" id="btn-nexus-clear" style="justify-content:center; padding:8px;">
          Execute Instant Settlement (<2s)
        </button>
        <div id="nexus-feedback" class="text-meta" style="min-height:14px;"></div>
      </div>

      <!-- Live Corridors & Liquidity Meters -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px;">
          <div style="font-weight:700; color:var(--text); font-size:12px; margin-bottom:10px;">
            NOSTRO / VOSTRO LIQUIDITY RAILS
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${corridors.map(c => {
              const r = nexus[c];
              return `
                <div style="background:var(--surface-2); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div>
                      <span class="font-mono text-bold" style="color:var(--text);">${c}</span>
                      <span class="text-meta" style="margin-left:6px;">${r.source_rail} ➔ ${r.dest_rail}</span>
                    </div>
                    <span class="badge badge-allow">ACTIVE</span>
                  </div>
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">FX Pair & Rate</span>
                    <span class="drawer-val font-mono">${r.fx_pair} = ${r.fx_rate}</span>
                  </div>
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">Nostro Account</span>
                    <span class="drawer-val font-mono">${r.nostro_account}</span>
                  </div>
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">Vostro Available Balance</span>
                    <span class="drawer-val font-mono" style="color:var(--green); font-weight:700;">
                      ${r.dest_currency || 'SGD'} ${Number(r.vostro_balance).toLocaleString()}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachCBDCHandlers(loadData) {
  const btnMint = document.getElementById('btn-mint-token');
  if (btnMint) {
    btnMint.onclick = async () => {
      const fb = document.getElementById('mint-feedback');
      fb.textContent = 'Minting programmable token on Drunix...';
      try {
        const beneficiary = document.getElementById('mint-beneficiary').value;
        const amount = parseFloat(document.getElementById('mint-amount').value);
        const purpose = document.getElementById('mint-purpose').value;

        const res = await fetch('/cbdc/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiary_id: beneficiary, amount_e_inr: amount, purpose_code: purpose })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Minting failed');
        fb.textContent = `✓ Minted ${data.token_id} anchored on Drunix!`;
        loadData();
      } catch (err) {
        fb.textContent = `✕ Error: ${err.message}`;
      }
    };
  }

  const btnUnauth = document.getElementById('btn-test-unauth-mcc');
  if (btnUnauth) {
    btnUnauth.onclick = async () => {
      const fb = document.getElementById('redeem-feedback');
      const tokenId = document.getElementById('redeem-token-id').value;
      fb.textContent = 'Attempting redemption at unauthorized MCC 5812 (Restaurant)...';
      try {
        const res = await fetch('/cbdc/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_id: tokenId, merchant_id: 'hotel@hdfc', merchant_mcc: '5812', amount: 2500 })
        });
        const data = await res.json();
        if (data.success === false) {
          fb.innerHTML = `<span style="color:var(--red);">✓ Drunix Reverted: ${data.rejection_code} (Merchant category rejected)</span>`;
        } else {
          fb.textContent = `Redeemed: ${data.status}`;
          loadData();
        }
      } catch (e) {
        fb.textContent = `✕ Error: ${e.message}`;
      }
    };
  }

  const btnAuth = document.getElementById('btn-test-auth-mcc');
  if (btnAuth) {
    btnAuth.onclick = async () => {
      const fb = document.getElementById('redeem-feedback');
      const tokenId = document.getElementById('redeem-token-id').value;
      fb.textContent = 'Attempting redemption at authorized MCC 5169 (Fertilizer)...';
      try {
        const res = await fetch('/cbdc/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_id: tokenId, merchant_id: 'krishi_kendra@sbi', merchant_mcc: '5169', amount: 3500 })
        });
        const data = await res.json();
        if (data.success === true) {
          fb.innerHTML = `<span style="color:var(--green);">✓ Settlement Approved: ₹3,500 redeemed. Remaining: ₹${data.remaining_balance}</span>`;
          loadData();
        } else {
          fb.textContent = `Rejection: ${data.error}`;
        }
      } catch (e) {
        fb.textContent = `✕ Error: ${e.message}`;
      }
    };
  }
}

function attachNexusHandlers(loadData) {
  const btnClear = document.getElementById('btn-nexus-clear');
  if (btnClear) {
    btnClear.onclick = async () => {
      const fb = document.getElementById('nexus-feedback');
      fb.textContent = 'Routing multilateral clearing via Project Nexus...';
      try {
        const corridor = document.getElementById('nexus-corridor').value;
        const amount = parseFloat(document.getElementById('nexus-amount').value);
        const sender = document.getElementById('nexus-sender').value;
        const recipient = document.getElementById('nexus-recipient').value;

        const res = await fetch('/nexus/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ corridor, source_amount_inr: amount, sender_id: sender, recipient_id: recipient })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Clearing failed');
        fb.innerHTML = `<span style="color:var(--green);">✓ Settled in ${data.settlement_time_seconds}s: ${data.dest_currency} ${data.dest_amount} credited via ${data.nostro_account}</span>`;
        loadData();
      } catch (e) {
        fb.textContent = `✕ Clearing Error: ${e.message}`;
      }
    };
  }
}
