/**
 * Security & Audit Logs View
 */

import { fetchThreatModel, fetchAuditLogs } from '../api/risk.js';

export async function renderSecurity(container) {
  container.innerHTML = `<div style="padding:40px; text-align:center; font-family:var(--font-mono); color:var(--text-dim);">Loading security model and audit events...</div>`;

  try {
    const [threats, logs] = await Promise.all([
      fetchThreatModel(),
      fetchAuditLogs(20)
    ]);

    container.innerHTML = `
      <div style="max-width: 900px; display:flex; flex-direction:column; gap:16px;">
        <div style="border-bottom:1px solid var(--border); padding-bottom:8px;">
          <div class="uppercase-label">INCIDENT SURVEILLANCE & CONTROLS</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">Security Threat Model (T1 – T12)</h1>
        </div>

        <!-- Threat Matrix Table -->
        <div class="data-table-container">
          <div style="padding:8px 10px; background:var(--surface-2); border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:10px; font-weight:600; color:var(--text-muted);">
            THREAT MITIGATION CONTROLS
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>THREAT VECTOR</th>
                <th>ATTACK SURFACE</th>
                <th>DEFENSE MITIGATION</th>
              </tr>
            </thead>
            <tbody>
              ${threats.map(t => `
                <tr>
                  <td class="strong" style="color:var(--blue);">${t.id}</td>
                  <td class="strong">${t.name}</td>
                  <td>${t.surface}</td>
                  <td style="color:var(--green);">${t.mitigation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Audit Event Stream -->
        <div class="data-table-container">
          <div style="padding:8px 10px; background:var(--surface-2); border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:10px; font-weight:600; color:var(--text-muted);">
            TAMPER-EVIDENT AUDIT EVENTS
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>EVENT TYPE</th>
                <th>ACTOR</th>
                <th>RESOURCE</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td class="text-meta">${l.timestamp ? new Date(l.timestamp).toLocaleTimeString('en-IN') : 'N/A'}</td>
                  <td class="strong">${l.event_type}</td>
                  <td>${l.actor_id || 'SYSTEM'}</td>
                  <td class="mono">${l.resource_id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="padding:20px; color:var(--red); font-family:var(--font-mono);">Security error: ${err.message}</div>`;
  }
}
