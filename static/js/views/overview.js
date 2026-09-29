/**
 * Overview View - Red Noir Command Center
 * Features VYOM Defense Engine Hero, Live Threat Heatmap, and Interactive Telemetry.
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

  // Global selector for payments
  window.vyomSelectPayment = window.veraSelectPayment = function(pid) {
    const p = (state.payments || []).find(x => x.payment_id === pid);
    if (p) {
      state.setSelectedPayment(p);
      state.setView('payments');
    }
  };

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
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center gap-2">
          <iconify-icon icon="lucide:radar" class="text-[#ef233c] w-4 h-4"></iconify-icon>
          <span class="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">REGIONAL FRAUD DENSITY & THREAT CORRIDORS</span>
        </div>
        <span class="text-[10px] font-mono text-zinc-500">Live National Cybercrime Threat Mesh</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        ${regions.map(r => `
          <div class="flex justify-between items-center p-3 bg-black/60 rounded-lg border border-white/5 hover:border-red-500/30 transition-all font-mono text-xs">
            <div>
              <div class="font-bold text-white flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full ${r.threat_level === 'CRITICAL' ? 'bg-[#ef233c] animate-ping' : (r.threat_level === 'HIGH' ? 'bg-amber-400' : 'bg-emerald-400')}"></span>
                <span>${r.city}</span>
              </div>
              <div class="text-[9.5px] text-zinc-500">${r.state}</div>
            </div>
            <div>
              <div class="text-[9.5px] text-zinc-500">24h Vol</div>
              <div class="text-zinc-200 font-semibold">₹${(r.volume_24h_inr / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <div class="text-[9.5px] text-zinc-500">Fraud Rate</div>
              <div class="font-bold ${r.threat_level === 'CRITICAL' ? 'text-[#ef233c]' : (r.threat_level === 'HIGH' ? 'text-amber-400' : 'text-emerald-400')}">
                ${r.fraud_rate_pct}%
              </div>
            </div>
            <div>
              <span class="badge ${r.threat_level === 'CRITICAL' ? 'badge-hold' : (r.threat_level === 'HIGH' ? 'badge-verify' : 'badge-allow')}">
                ${r.active_mule_clusters} Rings
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Red Noir Hero Banner -->
      <div class="relative overflow-hidden p-6 md:p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/60 via-black to-black shadow-[0_0_50px_rgba(239,35,60,0.06)] animate-fade-up">
        <div class="absolute -top-24 -right-24 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
            </span>
            <span class="text-xs font-medium text-red-100 font-manrope tracking-wide">
              VYOM 2.0 • INTENT FIREWALL ACTIVE
            </span>
            <iconify-icon icon="lucide:arrow-right" class="text-red-400 w-3 h-3"></iconify-icon>
          </div>

          <h1 class="text-3xl md:text-5xl font-extrabold font-manrope tracking-tight leading-tight mb-3">
            The Intent Firewall for <span class="text-[#ef233c] inline-block relative">Digital Payments</span>
          </h1>

          <p class="text-zinc-400 text-sm md:text-base max-w-3xl leading-relaxed mb-6">
            Autonomous scam defense engine powered by NPCI Drunix Distributed Ledger Technology. 
            Intercepting Digital Arrest coercion, mule syndicates, and authorized push payment fraud in sub-50ms prior to final settlement.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <button class="shiny-cta flex items-center gap-2 text-white font-manrope font-bold text-xs" onclick="document.getElementById('btn-demo-scenarios')?.click()">
              <iconify-icon icon="lucide:zap" class="text-[#ef233c] w-3.5 h-3.5"></iconify-icon>
              <span>Test Live Scam Interception</span>
            </button>
            <button class="btn btn-sm px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs rounded-full border border-white/10" id="hero-btn-payments">
              <iconify-icon icon="lucide:list" class="w-3.5 h-3.5"></iconify-icon>
              <span>Open Payment Stream</span>
            </button>
            <button class="btn btn-sm px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs rounded-full border border-white/10" id="hero-btn-nodes">
              <iconify-icon icon="lucide:server" class="w-3.5 h-3.5"></iconify-icon>
              <span>Consortium Nodes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bento Grid KPI Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-box">
          <div class="stat-label text-emerald-400 flex items-center gap-1.5">
            <iconify-icon icon="lucide:check-circle" class="w-3.5 h-3.5"></iconify-icon>
            <span>ALLOW (COMMITTED)</span>
          </div>
          <div class="stat-val text-emerald-400">${allowedCount.toLocaleString('en-IN')}</div>
          <div class="stat-delta text-emerald-500">Instant UPI settlement</div>
        </div>

        <div class="stat-box">
          <div class="stat-label text-amber-400 flex items-center gap-1.5">
            <iconify-icon icon="lucide:alert-triangle" class="w-3.5 h-3.5"></iconify-icon>
            <span>VERIFY (STEP-UP)</span>
          </div>
          <div class="stat-val text-amber-400">${verifyCount.toLocaleString('en-IN')}</div>
          <div class="stat-delta text-amber-500">Biometric / FIDO2 required</div>
        </div>

        <div class="stat-box">
          <div class="stat-label text-red-400 flex items-center gap-1.5">
            <iconify-icon icon="lucide:shield-ban" class="w-3.5 h-3.5"></iconify-icon>
            <span>HOLD (QUARANTINED)</span>
          </div>
          <div class="stat-val text-red-400">${holdCount.toLocaleString('en-IN')}</div>
          <div class="stat-delta text-red-500">4-Hour Escrow / 2-of-3 Quorum</div>
        </div>

        <div class="stat-box">
          <div class="stat-label text-blue-400 flex items-center gap-1.5">
            <iconify-icon icon="lucide:trending-up" class="w-3.5 h-3.5"></iconify-icon>
            <span>PROTECTED VOLUME</span>
          </div>
          <div class="stat-val text-white">₹${Number(protectedVol).toLocaleString('en-IN')}</div>
          <div class="stat-delta text-zinc-400">Zero consumer fund loss</div>
        </div>
      </div>

      <!-- Regional Threat Density Heatmap Container -->
      <div id="heatmap-container-box" class="p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl">
        <div class="text-xs font-mono text-zinc-500">Loading regional cybercrime telemetry...</div>
      </div>

      <!-- Real-Time Transaction Stream -->
      <div class="p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <iconify-icon icon="lucide:activity" class="text-[#ef233c] w-4 h-4"></iconify-icon>
            <span class="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">REAL-TIME INTENT STREAM</span>
          </div>
          <button class="btn btn-sm text-[10px] text-zinc-400 hover:text-white" id="btn-goto-payments">
            <span>Open Full Triage Workstation</span>
            <iconify-icon icon="lucide:chevron-right" class="w-3 h-3"></iconify-icon>
          </button>
        </div>

        <div class="space-y-1 font-mono text-xs">
          ${pmts.slice(0, 6).map(p => {
            const isAllow = p.decision === 'ALLOW';
            const isVerify = p.decision === 'VERIFY';
            const timeStr = p.created_at ? new Date(p.created_at).toLocaleTimeString('en-IN', { hour12: false }) : '08:42:17';
            return `
              <div class="flex justify-between items-center p-2 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer" onclick="window.vyomSelectPayment('${p.payment_id}')">
                <span class="text-zinc-500 w-16">${timeStr}</span>
                <span class="text-white font-semibold w-24">₹${Number(p.amount).toLocaleString('en-IN')}</span>
                <span class="text-zinc-400 w-28">${p.payment_id}</span>
                <span class="text-zinc-400 flex-1 truncate pr-3">${p.sender_id} ➔ ${p.recipient_id}</span>
                <span class="badge ${isAllow ? 'badge-allow' : (isVerify ? 'badge-verify' : 'badge-hold')}">${p.decision}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Subsystem Consortium Telemetry Grid -->
      <div class="p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl">
        <div class="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
          CONSORTIUM PEER & INFRASTRUCTURE TELEMETRY
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div class="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
            <span class="text-zinc-400">Raft Consensus</span>
            <span class="text-emerald-400 font-bold">● LEADER_SYNC</span>
          </div>
          <div class="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
            <span class="text-zinc-400">Intent NLP</span>
            <span class="text-emerald-400 font-bold">● ZERO_DRIFT</span>
          </div>
          <div class="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
            <span class="text-zinc-400">FIDO2 HSM Mesh</span>
            <span class="text-emerald-400 font-bold">● FIPS_140_L3</span>
          </div>
          <div class="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
            <span class="text-zinc-400">Nexus Settlement</span>
            <span class="text-emerald-400 font-bold">● LIQUID_OK</span>
          </div>
        </div>
      </div>

    </div>
  `;

  document.getElementById('hero-btn-payments')?.addEventListener('click', () => {
    state.setView('payments');
  });

  document.getElementById('hero-btn-nodes')?.addEventListener('click', () => {
    state.setView('nodes');
  });

  document.getElementById('btn-goto-payments')?.addEventListener('click', () => {
    state.setView('payments');
  });

  loadHeatmap();
}
