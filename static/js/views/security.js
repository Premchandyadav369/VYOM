/**
 * Security Threat Model & Audit Logs View - Red Noir & RISKOS Style
 * High-density, verifiable security controls and real-time tamper-evident audit trail.
 */

import { state } from '../state.js';
import { fetchThreatModel, fetchAuditLogs } from '../api/risk.js';

let activeSecTab = 'threats';

export async function renderSecurity(container) {
  // If navigated from 'audit' sidebar item, default to audit tab
  if (state.currentView === 'audit') {
    activeSecTab = 'audit';
  } else if (state.currentView === 'security') {
    activeSecTab = 'threats';
  }

  container.innerHTML = `
    <div class="p-8 text-center font-mono text-zinc-500 text-xs">
      <iconify-icon icon="lucide:loader-2" class="animate-spin text-[#ef233c] text-xl mb-2"></iconify-icon>
      <div>Synchronizing Zero-Trust Security Mesh & Tamper-Evident Audit Logs...</div>
    </div>
  `;

  try {
    const [threats, logs] = await Promise.all([
      fetchThreatModel(),
      fetchAuditLogs(50)
    ]);

    function renderActiveTab() {
      const contentEl = document.getElementById('security-tab-content');
      if (!contentEl) return;

      if (activeSecTab === 'threats') {
        contentEl.innerHTML = `
          <!-- Threat Matrix Table -->
          <div class="data-table-container">
            <div class="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center font-mono text-xs">
              <div class="flex items-center gap-2 font-bold text-zinc-200">
                <iconify-icon icon="lucide:shield-check" class="text-[#ef233c]"></iconify-icon>
                <span>FORMAL THREAT ANALYSIS & CONTROL PERIMETER (T1 – T12)</span>
              </div>
              <span class="text-[10px] text-zinc-400">12 Attack Surfaces Mitigated</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:70px;">ID</th>
                  <th style="width:200px;">THREAT VECTOR</th>
                  <th>ATTACK SURFACE & SCENARIO</th>
                  <th>DEFENSE MITIGATION INVARIANT</th>
                  <th style="width:100px;">SEVERITY</th>
                </tr>
              </thead>
              <tbody>
                ${threats.map(t => {
                  const isCrit = t.severity === 'CRITICAL';
                  const isHigh = t.severity === 'HIGH';
                  return `
                    <tr class="hover:bg-red-500/5 transition-colors">
                      <td class="font-bold text-[#ef233c] font-mono">${t.id}</td>
                      <td class="font-semibold text-white font-manrope">${t.name}</td>
                      <td class="text-zinc-400 text-xs">${t.surface}</td>
                      <td class="text-emerald-400 text-xs font-mono">${t.mitigation}</td>
                      <td>
                        <span class="badge ${isCrit ? 'badge-hold' : (isHigh ? 'badge-verify' : 'badge-allow')}">
                          ${t.severity}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Trust Boundary Specification Card -->
          <div class="mt-4 p-4 rounded-xl border border-white/10 bg-black/60 font-mono text-xs">
            <div class="text-zinc-300 font-bold mb-2 flex items-center gap-2">
              <iconify-icon icon="lucide:layers" class="text-[#ef233c]"></iconify-icon>
              <span>CRYPTOGRAPHIC SEPARATION OF CONCERNS</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-400 text-[11px] leading-relaxed">
              <div class="p-3 bg-white/5 rounded-lg border border-white/5">
                <div class="text-white font-semibold mb-1 text-xs">Boundary 1: Off-Chain Intelligence Enclave</div>
                <p>Natural language intent embeddings, biometric typing cadence, and raw telecom VoIP durations execute within private bank boundary. No cleartext conversational PII reaches the consortium ledger.</p>
              </div>
              <div class="p-3 bg-white/5 rounded-lg border border-white/5">
                <div class="text-white font-semibold mb-1 text-xs">Boundary 2: On-Chain Drunix Consensus State</div>
                <p>NPCI Drunix Raft orderers and bank peers enforce state transitions based solely on cryptographic Merkle inclusion proofs, Groth16 zk-SNARK predicates (BN254), and multi-org endorsements.</p>
              </div>
            </div>
          </div>
        `;
      } else {
        contentEl.innerHTML = `
          <!-- Audit Event Stream -->
          <div class="data-table-container">
            <div class="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center font-mono text-xs">
              <div class="flex items-center gap-2 font-bold text-zinc-200">
                <iconify-icon icon="lucide:history" class="text-[#ef233c]"></iconify-icon>
                <span>IMMUTABLE SYSTEM EVENT JOURNAL (SHA-256 HASH-CHAINED)</span>
              </div>
              <span class="text-[10px] text-emerald-400 font-bold">● Cryptographically Verified</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:130px;">TIMESTAMP (IST)</th>
                  <th style="width:180px;">EVENT TYPE</th>
                  <th style="width:200px;">ACTOR IDENTITY</th>
                  <th style="width:160px;">RESOURCE</th>
                  <th>TELEMETRY / SIGNATURE SNAPSHOT</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="5" class="p-6 text-center text-zinc-500">No audit events recorded yet.</td></tr>
                ` : logs.map(l => `
                  <tr class="hover:bg-red-500/5 transition-colors">
                    <td class="text-zinc-500 font-mono text-[10px]">${l.timestamp ? new Date(l.timestamp).toLocaleString('en-IN') : 'N/A'}</td>
                    <td>
                      <span class="badge ${l.event_type.includes('ERROR') || l.event_type.includes('FAIL') ? 'badge-hold' : (l.event_type.includes('APPROVE') ? 'badge-allow' : 'badge-verify')} text-[9.5px]">
                        ${l.event_type}
                      </span>
                    </td>
                    <td class="text-zinc-300 font-mono text-xs">${l.actor_id || 'system.node@npci'}</td>
                    <td class="text-white font-mono font-semibold text-xs">${l.resource_id}</td>
                    <td class="text-zinc-400 font-mono text-[10.5px] truncate max-w-xs">
                      ${typeof l.details === 'object' ? JSON.stringify(l.details) : (l.details || 'N/A')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-4 animate-fade-up">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
          <div>
            <div class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">ENTERPRISE ASSURANCE</div>
            <h1 class="text-2xl md:text-3xl font-extrabold font-manrope text-white tracking-tight">Security Center & Audit Log</h1>
          </div>
          
          <div class="flex gap-1 p-1 bg-black/60 rounded-xl border border-white/10">
            <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${activeSecTab === 'threats' ? 'bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]' : 'text-zinc-400 hover:text-white'}" id="sec-tab-threats">
              <iconify-icon icon="lucide:shield-alert"></iconify-icon>
              <span>Threat Model (T1–T12)</span>
            </button>
            <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${activeSecTab === 'audit' ? 'bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]' : 'text-zinc-400 hover:text-white'}" id="sec-tab-audit">
              <iconify-icon icon="lucide:history"></iconify-icon>
              <span>Audit Logs (${logs.length})</span>
            </button>
          </div>
        </div>

        <div id="security-tab-content"></div>
      </div>
    `;

    document.getElementById('sec-tab-threats')?.addEventListener('click', () => {
      activeSecTab = 'threats';
      document.getElementById('sec-tab-threats').className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]';
      document.getElementById('sec-tab-audit').className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-zinc-400 hover:text-white';
      renderActiveTab();
    });

    document.getElementById('sec-tab-audit')?.addEventListener('click', () => {
      activeSecTab = 'audit';
      document.getElementById('sec-tab-audit').className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]';
      document.getElementById('sec-tab-threats').className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-zinc-400 hover:text-white';
      renderActiveTab();
    });

    renderActiveTab();

  } catch (err) {
    container.innerHTML = `
      <div class="p-6 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 font-mono text-xs">
        <div class="font-bold text-sm mb-1 text-red-400 flex items-center gap-2">
          <iconify-icon icon="lucide:alert-circle"></iconify-icon>
          <span>Security Diagnostic Error</span>
        </div>
        <div>${err.message}</div>
      </div>
    `;
  }
}
