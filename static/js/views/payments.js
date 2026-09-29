/**
 * Payments View & Split Triage
 * Upgraded with Batch Statement CSV Ingestion Modal and Keyboard Shortcuts.
 */

import { state } from '../state.js';
import { renderInvestigationDrawer, attachInvestigationDrawerHandlers } from '../components/drawer.js';
import { fetchPayments } from '../api/payments.js';

export function renderPayments(container) {
  let pmts = state.payments || [];

  // Filter by status if set
  if (state.filterStatus && state.filterStatus !== 'ALL') {
    pmts = pmts.filter(p => p.decision === state.filterStatus);
  }

  // Filter by search query if set
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    pmts = pmts.filter(p =>
      p.payment_id.toLowerCase().includes(q) ||
      p.sender_id.toLowerCase().includes(q) ||
      p.recipient_id.toLowerCase().includes(q) ||
      (p.stated_intent && p.stated_intent.toLowerCase().includes(q))
    );
  }

  const selected = state.selectedPayment;

  container.innerHTML = `
    <!-- Top Filter & Tool Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input type="text" id="payments-filter-input" class="input" placeholder="Filter by ID, VPA, narrative..." value="${state.searchQuery}" style="width:260px;" />
        <div style="display:flex; gap:4px;">
          ${['ALL', 'ALLOW', 'VERIFY', 'HOLD'].map(st => `
            <button class="btn btn-sm ${state.filterStatus === st ? 'btn-primary' : ''}" data-filter="${st}">
              ${st}
            </button>
          `).join('')}
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-sm" id="btn-open-statement-modal" style="font-weight:600;">
          📁 Ingest Statement CSV
        </button>
        <span class="text-meta">
          ${pmts.length} records shown
        </span>
      </div>
    </div>

    <!-- Split Screen: Table on Left, Drawer on Right -->
    <div class="workspace-split">
      <div class="workspace-table-pane">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable">TIME</th>
                <th class="sortable">PAYMENT</th>
                <th class="sortable">AMOUNT</th>
                <th class="sortable">RECIPIENT</th>
                <th class="sortable">RISK</th>
                <th>DECISION</th>
              </tr>
            </thead>
            <tbody>
              ${pmts.length === 0 ? `
                <tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-dim);">No payments match this filter.</td></tr>
              ` : pmts.map((p, idx) => {
                const isSelected = selected && selected.payment_id === p.payment_id;
                const timeStr = p.created_at ? new Date(p.created_at).toLocaleTimeString('en-IN', { hour12: false }) : '09:41:22';
                const riskVal = p.risk_score != null ? p.risk_score.toFixed(2) : '0.15';
                const isAllow = p.decision === 'ALLOW';
                const isVerify = p.decision === 'VERIFY';
                return `
                  <tr class="${isSelected ? 'row-selected' : ''}" data-pid="${p.payment_id}" data-idx="${idx}" style="cursor:pointer;">
                    <td class="text-meta">${timeStr}</td>
                    <td class="strong">${p.payment_id}</td>
                    <td class="strong">₹${Number(p.amount).toLocaleString('en-IN')}</td>
                    <td>${p.recipient_id}</td>
                    <td>
                      <div class="table-risk-bar">
                        <div class="bar-track">
                          <div class="bar-fill" style="width:${riskVal * 100}%; background-color:${isAllow ? 'var(--green)' : (isVerify ? 'var(--amber)' : 'var(--red)')};"></div>
                        </div>
                        <span class="num">${riskVal}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${isAllow ? 'badge-allow' : (isVerify ? 'badge-verify' : 'badge-hold')}">
                        ${p.decision}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Drawer Pane -->
      <div class="workspace-drawer-pane" id="payment-drawer-container">
        ${selected ? renderInvestigationDrawer(selected, () => {
          state.setSelectedPayment(null);
          renderPayments(container);
        }) : `
          <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-dim); padding:24px; text-align:center;">
            <div style="font-size:24px; margin-bottom:8px;">🔍</div>
            <div style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);">Select a payment row to inspect multi-tab forensics</div>
            <div class="text-meta" style="margin-top:4px;">ISO 20022 XML, Merkle proofs, telecom coercion, and FIU SAR reports.</div>
          </div>
        `}
      </div>
    </div>

    <!-- Batch Statement Import Modal -->
    <div id="statement-modal-overlay" class="cmd-overlay" style="display:none;">
      <div class="cmd-modal" style="width:640px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <div>
            <div style="font-weight:700; color:var(--text); font-size:13px;">BATCH STATEMENT CSV INGESTION</div>
            <div class="text-meta">Bulk multi-modal intent evaluation & Drunix ledger anchorage</div>
          </div>
          <button class="btn btn-sm" id="btn-close-statement-modal">✕</button>
        </div>

        <div style="margin-bottom:8px; display:flex; gap:6px;">
          <button class="btn btn-secondary text-xs" id="btn-load-sample-legit">Load Clean Batch</button>
          <button class="btn btn-secondary text-xs" id="btn-load-sample-mule">Load Mule Syndicate Batch</button>
        </div>

        <textarea id="statement-csv-textarea" class="code-box" style="width:100%; height:160px; font-size:10px; margin-bottom:10px;" placeholder="sender_id,recipient_id,amount,stated_intent,category"></textarea>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span id="statement-import-feedback" class="text-meta" style="min-height:14px;"></span>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary" id="btn-cancel-statement">Cancel</button>
            <button class="btn btn-primary" id="btn-submit-statement">Process & Anchor to Drunix</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Table Row Click Handlers
  container.querySelectorAll('tbody tr[data-pid]').forEach(row => {
    row.addEventListener('click', () => {
      const pid = row.dataset.pid;
      const found = state.payments.find(p => p.payment_id === pid);
      if (found) {
        state.setSelectedPayment(found);
        renderPayments(container);
      }
    });
  });

  // Attach Filter Search Input
  const filterInput = document.getElementById('payments-filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      state.setFilterQuery(e.target.value);
      renderPayments(container);
    });
  }

  // Attach Filter Buttons (ALL, ALLOW, VERIFY, HOLD)
  container.querySelectorAll('button[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setFilterStatus(btn.dataset.filter);
      renderPayments(container);
    });
  });

  // Attach Drawer Action Handlers if a payment is selected
  if (selected) {
    attachInvestigationDrawerHandlers(selected, async () => {
      const updated = await fetchPayments(40);
      state.payments = updated;
      const refreshedSelected = updated.find(p => p.payment_id === selected.payment_id);
      state.setSelectedPayment(refreshedSelected || null);
      renderPayments(container);
    }, () => {
      state.setSelectedPayment(null);
      renderPayments(container);
    });
  }

  // Statement Ingestion Modal Handlers
  const modal = document.getElementById('statement-modal-overlay');
  const btnOpen = document.getElementById('btn-open-statement-modal');
  const btnClose = document.getElementById('btn-close-statement-modal');
  const btnCancel = document.getElementById('btn-cancel-statement');
  const btnSubmit = document.getElementById('btn-submit-statement');
  const textarea = document.getElementById('statement-csv-textarea');
  const feedback = document.getElementById('statement-import-feedback');

  if (btnOpen && modal) {
    btnOpen.onclick = () => {
      modal.style.display = 'flex';
      feedback.textContent = '';
      if (!textarea.value) {
        textarea.value = `sender_id,recipient_id,amount,stated_intent,category
rohit.sharma@okaxis,blinkit@axisbank,1450,Weekly grocery supplies,merchant_order
ananya.sen@sbi,tatapower@icici,2840,Electricity bill payment,utility_bill
vijay.mallya@pnb,swiggy@hdfc,680,Lunch food order,merchant_order`;
      }
    };

    const closeModal = () => modal.style.display = 'none';
    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    document.getElementById('btn-load-sample-legit')?.addEventListener('click', () => {
      textarea.value = `sender_id,recipient_id,amount,stated_intent,category
arun.patel@icici,apollopharmacy@hdfc,3200,Prescription medicines,healthcare
deepa.nair@axis,zerodha@hdfc,15000,Monthly mutual fund SIP,investment
suresh.kumar@sbi,airtel@axis,999,Broadband internet monthly bill,utility_bill`;
    });

    document.getElementById('btn-load-sample-mule')?.addEventListener('click', () => {
      textarea.value = `sender_id,recipient_id,amount,stated_intent,category
victim.senior@sbi,customs.clearance.hold@scam,48000,Urgent customs parcel fine,customs_fine
mule.hub.layer1@ybl,crypto_p2p_desk@upi,125000,Emergency loan transfer,p2p_transfer
unknown.user@paytm,mewat.cashout@scam,85000,Official court settlement fee,legal_settlement`;
    });

    if (btnSubmit) {
      btnSubmit.onclick = async () => {
        feedback.textContent = 'Batch evaluating intent & anchoring to Drunix...';
        try {
          const res = await fetch('/statements/upload-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv_content: textarea.value })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Import failed');

          feedback.innerHTML = `<span style="color:var(--green);">✓ Ingested ${data.total_parsed} transactions (₹${data.total_volume_inr.toLocaleString()}). Allowed: ${data.summary.allowed}, Held: ${data.summary.held}</span>`;

          const updated = await fetchPayments(50);
          state.payments = updated;
          setTimeout(() => {
            closeModal();
            renderPayments(container);
          }, 1200);
        } catch (err) {
          feedback.textContent = `✕ Error: ${err.message}`;
        }
      };
    }
  }
}
