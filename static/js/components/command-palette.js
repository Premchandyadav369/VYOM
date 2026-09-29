/**
 * Command Search Palette (Ctrl + K)
 * Matching Section 12 specification.
 */

import { state } from '../state.js';

export function setupCommandPalette() {
  let modalEl = document.getElementById('cmd-palette-overlay');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'cmd-palette-overlay';
    modalEl.className = 'cmd-overlay';
    modalEl.style.display = 'none';
    modalEl.innerHTML = `
      <div class="cmd-modal">
        <input type="text" id="cmd-search-input" class="cmd-input" placeholder="Search payment ID, VPA, block, or view..." autocomplete="off" />
        <div id="cmd-search-results" class="cmd-results"></div>
        <div style="padding:6px 12px; background:var(--surface-2); border-top:1px solid var(--border); font-family:var(--font-mono); font-size:10px; color:var(--text-dim); display:flex; justify-content:space-between;">
          <span>Esc to close</span>
          <span class="text-[#ef233c] font-bold">VYOM Command Terminal</span>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closePalette();
    });

    const input = document.getElementById('cmd-search-input');
    input.addEventListener('input', () => updateResults(input.value));
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePalette();
    }
    if (e.key === 'Escape') {
      closePalette();
    }
  });
}

export function openPalette() {
  const modal = document.getElementById('cmd-palette-overlay');
  if (!modal) return;
  modal.style.display = 'flex';
  const input = document.getElementById('cmd-search-input');
  input.value = '';
  input.focus();
  updateResults('');
}

export function closePalette() {
  const modal = document.getElementById('cmd-palette-overlay');
  if (modal) modal.style.display = 'none';
}

function togglePalette() {
  const modal = document.getElementById('cmd-palette-overlay');
  if (modal && modal.style.display === 'flex') {
    closePalette();
  } else {
    openPalette();
  }
}

function updateResults(query) {
  const resultsContainer = document.getElementById('cmd-search-results');
  if (!resultsContainer) return;
  const q = query.trim().toLowerCase();

  const views = [
    { type: 'View', title: 'Overview', desc: 'Payment operations & system status', id: 'overview' },
    { type: 'View', title: 'Payments', desc: 'Real-time transaction monitor', id: 'payments' },
    { type: 'View', title: 'Investigation', desc: 'Deep forensic workstation', id: 'investigation' },
    { type: 'View', title: 'Risk', desc: 'Risk scoring & model weights', id: 'risk' },
    { type: 'View', title: 'Graph', desc: 'Counterparty relationship network', id: 'graph' },
    { type: 'View', title: 'Drunix', desc: 'Blockchain ledger explorer', id: 'drunix' },
    { type: 'View', title: 'CBDC & Nexus', desc: 'Programmable e-Rupee & Multilateral Clearing', id: 'cbdc_nexus' },
    { type: 'View', title: 'Consensus Chaos', desc: 'Drunix Byzantine fault injection lab', id: 'chaos' },
    { type: 'View', title: 'Simulation', desc: 'Digital twin fraud testbed', id: 'simulation' },
    { type: 'View', title: 'Research', desc: 'Empirical benchmark experiments', id: 'research' },
    { type: 'View', title: 'Remittance', desc: 'Cross-border payment corridors', id: 'remittance' }
  ];

  let matches = [];

  // Filter views
  views.forEach(v => {
    if (!q || v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q)) {
      matches.push({
        label: v.title,
        meta: v.desc,
        tag: 'NAV',
        action: () => {
          state.setView(v.id);
          closePalette();
        }
      });
    }
  });

  // Filter payments
  if (state.payments) {
    state.payments.slice(0, 20).forEach(p => {
      if (
        !q ||
        p.payment_id.toLowerCase().includes(q) ||
        p.sender_id.toLowerCase().includes(q) ||
        p.recipient_id.toLowerCase().includes(q) ||
        (p.stated_intent && p.stated_intent.toLowerCase().includes(q))
      ) {
        matches.push({
          label: `${p.payment_id} — ₹${Number(p.amount).toLocaleString('en-IN')}`,
          meta: `${p.sender_id} ➔ ${p.recipient_id} | ${p.decision}`,
          tag: p.decision,
          action: () => {
            state.setSelectedPayment(p);
            state.setView('payments');
            closePalette();
          }
        });
      }
    });
  }

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-family:var(--font-mono); font-size:11px;">No records or actions match "${query}".</div>`;
    return;
  }

  resultsContainer.innerHTML = matches.map((m, idx) => `
    <div class="cmd-result-row" data-index="${idx}">
      <div>
        <div style="font-weight:600; color:var(--text);">${m.label}</div>
        <div class="text-meta" style="color:var(--text-dim); margin-top:2px;">${m.meta}</div>
      </div>
      <span class="badge ${m.tag === 'ALLOW' ? 'badge-allow' : (m.tag === 'VERIFY' ? 'badge-verify' : (m.tag === 'HOLD' ? 'badge-hold' : 'badge-neutral'))}">
        ${m.tag}
      </span>
    </div>
  `).join('');

  resultsContainer.querySelectorAll('.cmd-result-row').forEach((el, i) => {
    el.addEventListener('click', () => {
      matches[i].action();
    });
  });
}
