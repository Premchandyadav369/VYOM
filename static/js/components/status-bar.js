/**
 * Status Bar Component - Red Noir Edition
 */

import { state } from '../state.js';

export function renderStatusBar(container) {
  const lastPayment = state.payments && state.payments.length > 0 ? state.payments[0] : null;
  const lastEventText = lastPayment
    ? `${lastPayment.payment_id} → ${lastPayment.decision}`
    : 'Consensus Synchronized';

  const modeText = state.isLiveFeed ? 'LIVE STREAM' : 'SIMULATION';

  container.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
        <span class="text-zinc-400 font-mono text-[10px]">INTENT FIREWALL</span>
      </div>
      <span class="text-zinc-700">|</span>
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-[#ef233c] shadow-[0_0_8px_#ef233c]"></span>
        <span class="text-zinc-400 font-mono text-[10px]">DRUNIX RAFT (4 PEERS)</span>
      </div>
      <span class="text-zinc-700">|</span>
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full ${state.isLiveFeed ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
        <span class="text-zinc-400 font-mono text-[10px]">${modeText}</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="text-zinc-500 text-[10px]">Telemetry:</span>
        <span class="text-zinc-200 font-semibold text-[10px] font-mono">${lastEventText}</span>
      </div>
      <span class="text-zinc-700">|</span>
      <div id="status-clock" class="text-zinc-400 font-mono text-[10px]">
        ${new Date().toLocaleTimeString('en-IN', { hour12: false })} IST
      </div>
    </div>
  `;
}
