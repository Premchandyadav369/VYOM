/**
 * Payments View & Split Triage
 * Matching Section 13 & 14 specification.
 */

import { state } from '../state.js';
import { renderInvestigationDrawer, bindDrawerEvents } from '../components/drawer.js';

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
    <!-- Top Filter Bar -->
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
      <div class="text-meta">
        ${pmts.length} records shown
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
              ` : pmts.map(p => {
                const isSelected = selected && selected.payment_id === p.payment_id;
                const timeStr = p.created_at ? new Date(p.created_at).toLocaleTimeString('en-IN', { hour12: false }) : '09:41:22';
                const riskVal = p.risk_score != null ? p.risk_score.toFixed(2) : '0.15';
                const isAllow = p.decision === 'ALLOW';
                const isVerify = p.decision === 'VERIFY';
                return `
                  <tr class="${isSelected ? 'row-selected' : ''}" data-pid="${p.payment_id}" style="cursor:pointer;">
                    <td class="text-meta">${timeStr}</td>
                    <td class="strong">${p.payment_id}</td>
                    <td class="strong">₹${Number(p.amount).toLocaleString('en-IN')}</td>
                    <td>${p.recipient_id}</td>
                    <td>
                      <div class="table-risk-bar">
                        <div class="bar-track">
                          <div class="bar-fill" style="width:${Math.min(100, riskVal * 100)}%; background-color:${riskVal > 0.65 ? 'var(--red)' : (riskVal > 0.35 ? 'var(--amber)' : 'var(--green)')};"></div>
                        </div>
                        <span>${riskVal}</span>
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

      <!-- Right Drawer -->
      <div id="drawer-slot">
        ${selected ? renderInvestigationDrawer(selected) : ''}
      </div>
    </div>
  `;

  // Bind row clicks
  container.querySelectorAll('tbody tr[data-pid]').forEach(row => {
    row.addEventListener('click', () => {
      const pid = row.dataset.pid;
      const found = state.payments.find(p => p.payment_id === pid);
      if (found) {
        state.setSelectedPayment(found);
      }
    });
  });

  // Bind filter buttons
  container.querySelectorAll('button[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filterStatus = btn.dataset.filter;
      renderPayments(container);
    });
  });

  // Bind search input
  const searchInput = document.getElementById('payments-filter-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderPayments(container);
    });
  }

  // Bind drawer events if open
  if (selected) {
    bindDrawerEvents(container, selected, () => {
      renderPayments(container);
    });
  }
}
