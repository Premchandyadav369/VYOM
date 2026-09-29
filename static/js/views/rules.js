/**
 * Policy Rules View
 */

import { fetchPolicyRules, togglePolicyRule } from '../api/risk.js';

export async function renderRules(container) {
  container.innerHTML = `<div style="padding:40px; text-align:center; font-family:var(--font-mono); color:var(--text-dim);">Loading consortium policy rules...</div>`;

  try {
    const rules = await fetchPolicyRules();

    function renderList() {
      container.innerHTML = `
        <div style="max-width: 900px; display:flex; flex-direction:column; gap:16px;">
          <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
            <div class="uppercase-label">CONSORTIUM POLICY RULES</div>
            <h1 class="text-h1 mono" style="margin-top:2px;">Deterministic Policy Execution Rules</h1>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>RULE ID</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>TRIGGER CONDITION</th>
                  <th>ACTION</th>
                  <th>STATUS</th>
                  <th style="text-align:right;">TOGGLE</th>
                </tr>
              </thead>
              <tbody>
                ${rules.map(r => `
                  <tr>
                    <td class="strong">${r.rule_id}</td>
                    <td class="strong">${r.name}</td>
                    <td class="text-meta">${r.category}</td>
                    <td style="color:var(--blue);">${r.condition}</td>
                    <td>
                      <span class="badge ${r.action === 'ALLOW' ? 'badge-allow' : (r.action === 'VERIFY' ? 'badge-verify' : 'badge-hold')}">
                        ${r.action}
                      </span>
                    </td>
                    <td>
                      <span style="color:${r.enabled ? 'var(--green)' : 'var(--text-dim)'}; font-weight:600;">
                        ${r.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <button class="btn btn-sm" data-toggle-rule="${r.rule_id}">
                        ${r.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.querySelectorAll('button[data-toggle-rule]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rid = btn.dataset.toggleRule;
          await togglePolicyRule(rid);
          const updated = await fetchPolicyRules();
          rules.length = 0;
          rules.push(...updated);
          renderList();
        });
      });
    }

    renderList();
  } catch (err) {
    container.innerHTML = `<div style="padding:20px; color:var(--red); font-family:var(--font-mono);">Policy error: ${err.message}</div>`;
  }
}
