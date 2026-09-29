/**
 * Overview View
 * Upgraded with Regional Threat Density Heatmap and Protected Volume Metrics.
 */

import { state } from '../state.js';

export function renderOverview(container) {
  const ov = state.overview || {};
  const pmts = state.payments || [];

  const allowedCount = ov.interventions?.allowed ?? (pmts.filter(p => p.decision === 'ALLOW').length);
  const verifyCount = ov.interventions?.verified ?? (pmts.filter(p => p.decision === 'VERIFY').length);
  const holdCount = ov.interventions?.held ?? (pmts.filter(p => p.decision === 'HOLD').length);
  const totalCount = ov.total_payments ?? pmts.length;
  const protectedVol = ov.protected_volume_inr ?? pmts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const nowTime = new Date().toLocaleTimeString('en-IN', { hour12: false });

  async function loadHeatmap() {
    try {
      const res = await fetch('/analytics/threat-heatmap');
      const regions = await res.json();
      renderHeatmapUI(regions);
    } catch (e) {}
  }

  function renderHeatmapUI(regions) {
    const el = document.getElementById('heatmap-container-box');
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
        <div class="uppercase-label">REGIONAL FRAUD DENSITY & THREAT CORRIDORS (INDIA)</div>
        <span class="text-meta">Live National Cybercrime Threat Mesh</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${regions.map(r => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border); font-family:var(--font-mono); font-size:11px;">
            <div style="width:180px;">
              <div style="font-weight:700; color:var(--text);">${r.city}</div>
              <div class="text-meta" style="font-size:9.5px;">${r.state}</div>
            </div>
            <div style="width:140px;">
              <span class="text-meta">Volume:</span>
              <span style="color:var(--text); font-weight:600;">₹${(r.volume_24h_inr / 1000000).toFixed(1)}M</span>
            </div>
            <div style="width:140px;">
              <span class="text-meta">Fraud Rate:</span>
              <span style="color:${r.threat_level === 'CRITICAL' ? 'var(--red)' : (r.threat_level === 'HIGH' ? 'var(--amber)' : 'var(--green)')}; font-weight:700;">
                ${r.fraud_rate_pct}%
              </span>
            </div>
            <div style="width:140px; text-align:right;">
              <span class="badge ${r.threat_level === 'CRITICAL' ? 'badge-hold' : (r.threat_level === 'HIGH' ? 'badge-verify' : 'badge-allow')}">
                ${r.active_mule_clusters} Mule Rings
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div style="max-width: 960px; display: flex; flex-direction: column; gap: 16px;">
      <!-- Title & Time -->
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div>
          <div class="uppercase-label">OPERATIONS COMMAND</div>
          <h1 class="text-h1" style="margin-top: 2px;">PAYMENT OPERATIONS & THREAT MONITOR</h1>
        </div>
        <div class="text-meta">
          <span>${totalCount.toLocaleString('en-IN')} payments</span>
          <span style="margin: 0 8px;">·</span>
          <span>Protected: <strong style="color:var(--green);">₹${Number(protectedVol).toLocaleString('en-IN')}</strong></span>
          <span style="margin: 0 8px;">·</span>
          <span class="tabular-nums">${nowTime} IST</span>
        </div>
      </div>

      <!-- Decision Stats Box Strip -->
      <div style="display: flex; gap: 10px;">
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--green);">ALLOW (COMMITTED)</div>
          <div class="stat-box-value" style="color:var(--green);">${allowedCount.toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--amber);">VERIFY (STEP-UP)</div>
          <div class="stat-box-value" style="color:var(--amber);">${verifyCount.toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--red);">HOLD (QUARANTINED)</div>
          <div class="stat-box-value" style="color:var(--red);">${holdCount.toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-box" style="flex:1;">
          <div class="stat-box-label" style="color:var(--blue);">SFE INDEX</div>
          <div class="stat-box-value" style="color:var(--blue);">${ov.sfe_efficiency_score || '4.80'}</div>
        </div>
      </div>

      <!-- Regional Threat Density Heatmap Container -->
      <div id="heatmap-container-box" style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 14px;">
        <div class="text-meta">Loading regional threat heatmap data...</div>
      </div>

      <!-- Recent Payment Activity -->
      <div style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
          <div class="uppercase-label">REAL-TIME TRANSACTION STREAM</div>
          <button class="btn btn-sm" id="btn-goto-payments" style="font-size:10px;">Full Workstation ➔</button>
        </div>

        <div style="display:flex; flex-direction:column;">
          ${pmts.slice(0, 6).map(p => {
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

      <!-- Subsystem Telemetry Indicators -->
      <div style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 14px;">
        <div class="uppercase-label" style="margin-bottom: 10px;">CONSORTIUM SUBSYSTEM TELEMETRY</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-family: var(--font-mono); font-size: 11px;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Raft Consensus</span>
            <span style="color:var(--green); font-weight:700;">● LEADER_SYNC</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Intent Engine</span>
            <span style="color:var(--green); font-weight:700;">● ZERO_DRIFT</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>HSM Mesh</span>
            <span style="color:var(--green); font-weight:700;">● FIPS_140_L3</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span>Nexus Rail</span>
            <span style="color:var(--green); font-weight:700;">● LIQUID_OK</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-goto-payments')?.addEventListener('click', () => {
    state.setView('payments');
  });

  loadHeatmap();
}
