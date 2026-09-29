/**
 * Tokenized Assets View
 * Matching Section 24 specification.
 */

import { fetchAssets } from '../api/simulation.js';

export async function renderAssets(container) {
  container.innerHTML = `<div style="padding:40px; text-align:center; font-family:var(--font-mono); color:var(--text-dim);">Loading receivables...</div>`;

  try {
    const assets = await fetchAssets();

    container.innerHTML = `
      <div style="max-width: 800px; display:flex; flex-direction:column; gap:16px;">
        <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
          <div class="uppercase-label">INSTITUTIONAL ASSET MANAGEMENT</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">Tokenized Trade Receivables</h1>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          ${assets.map(a => `
            <div style="border:1px solid var(--border); background:var(--surface); padding:14px; border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div style="font-weight:700; color:var(--text);">${a.invoice_number}</div>
                <span class="badge badge-allow">${a.token_status}</span>
              </div>

              <div class="text-meta" style="margin-bottom:8px;">Receivable Asset</div>

              <div class="drawer-keyvalue-row">
                <span class="drawer-key">Face value</span>
                <span class="drawer-val">₹${Number(a.face_value_inr).toLocaleString('en-IN')}</span>
              </div>
              <div class="drawer-keyvalue-row">
                <span class="drawer-key">Issuer</span>
                <span class="drawer-val">${a.original_owner_id}</span>
              </div>
              <div class="drawer-keyvalue-row">
                <span class="drawer-key">Debtor</span>
                <span class="drawer-val">${a.debtor_id}</span>
              </div>
              <div class="drawer-keyvalue-row">
                <span class="drawer-key">Verification</span>
                <span class="drawer-val" style="color:var(--green);">${a.verification_status}</span>
              </div>
              <div class="drawer-keyvalue-row">
                <span class="drawer-key">Owner</span>
                <span class="drawer-val">${a.current_owner_id}</span>
              </div>
              <div class="drawer-keyvalue-row">
                <span class="drawer-key">DRUNIX</span>
                <span class="drawer-val" style="color:var(--blue);">${a.drunix_block_height ? 'COMMITTED #' + a.drunix_block_height : 'COMMITTED'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="padding:20px; color:var(--red); font-family:var(--font-mono);">Asset error: ${err.message}</div>`;
  }
}
