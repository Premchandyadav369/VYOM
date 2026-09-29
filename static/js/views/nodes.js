/**
 * Drunix Multi-Node Consortium Topology & Peer Network Explorer
 */

import { state } from '../state.js';

export function renderNodes(container) {
  async function loadData() {
    try {
      const res = await fetch('/drunix/nodes');
      const data = await res.json();
      renderUI(data);
    } catch (e) {
      container.innerHTML = `<div class="text-meta" style="color:var(--red);">Failed to load consortium node telemetry: ${e.message}</div>`;
    }
  }

  function renderUI(data) {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
        <div>
          <div class="uppercase-label">DISTRIBUTED LEDGER INFRASTRUCTURE</div>
          <h1 class="text-h1 mono" style="margin-top:2px;">Consortium Node Topology & HSM Mesh</h1>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge badge-allow">RAFT CONSENSUS HEALTHY</span>
        </div>
      </div>

      <!-- Network Overview Cards -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:14px;">
        <div style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-sm);">
          <div class="text-meta">ORDERER QUORUM</div>
          <div style="font-size:16px; font-weight:700; color:var(--text); margin-top:2px;">3 / 3 Raft Nodes</div>
          <div class="text-meta" style="color:var(--green); font-size:9.5px; margin-top:2px;">● 100% Byzantine Fault Tolerance</div>
        </div>
        <div style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-sm);">
          <div class="text-meta">VALIDATING PEERS</div>
          <div style="font-size:16px; font-weight:700; color:var(--text); margin-top:2px;">${data.peers.length} Bank Peers</div>
          <div class="text-meta" style="color:var(--blue); font-size:9.5px; margin-top:2px;">Stateless Gossip Mesh Active</div>
        </div>
        <div style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-sm);">
          <div class="text-meta">NETWORK CHANNEL</div>
          <div style="font-size:16px; font-weight:700; color:var(--text); margin-top:2px;">${data.channel_id}</div>
          <div class="text-meta" style="color:var(--text-muted); font-size:9.5px; margin-top:2px;">Protocol: ISO 20022 DLT</div>
        </div>
        <div style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-sm);">
          <div class="text-meta">CONSENSUS LATENCY</div>
          <div style="font-size:16px; font-weight:700; color:var(--green); margin-top:2px;">1.6 ms</div>
          <div class="text-meta" style="color:var(--green); font-size:9.5px; margin-top:2px;">P99 MVCC Commit</div>
        </div>
      </div>

      <!-- Raft Orderer Nodes Table -->
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; margin-bottom:14px;">
        <div style="font-weight:700; color:var(--text); font-size:12px; margin-bottom:8px;">
          RAFT ORDERING SERVICE CLUSTER (ETCDRAFT)
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>NODE IDENTIFIER</th>
              <th>ROLE</th>
              <th>PORT</th>
              <th>TLS 1.3 CIPHER</th>
              <th>X.509 CERTIFICATE SHA-256</th>
              <th>RAFT TERM</th>
              <th>UPTIME</th>
              <th>HEALTH</th>
            </tr>
          </thead>
          <tbody>
            ${data.orderers.map(o => `
              <tr>
                <td class="font-mono text-bold" style="color:var(--blue);">${o.node_id}</td>
                <td><span class="badge ${o.role === 'RAFT_LEADER' ? 'badge-allow' : 'badge-neutral'}">${o.role}</span></td>
                <td class="font-mono text-meta">${o.port}</td>
                <td class="font-mono text-meta" style="font-size:9.5px;">${o.tls_cipher}</td>
                <td class="font-mono text-meta" style="font-size:9.5px; color:#a8cdff;">${o.cert_fingerprint}</td>
                <td class="font-mono">${o.raft_term}</td>
                <td class="font-mono" style="color:var(--green);">${o.uptime_percentage}%</td>
                <td><span class="badge badge-allow">${o.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Consortium Bank Peer Nodes Table -->
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px;">
        <div style="font-weight:700; color:var(--text); font-size:12px; margin-bottom:8px;">
          CONSORTIUM VALIDATING & OBSERVER PEER NODES
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>PEER DOMAIN</th>
              <th>MEMBERSHIP MSP</th>
              <th>NODE ROLE</th>
              <th>LEDGER BLOCK HEIGHT</th>
              <th>ENDORSEMENT POLICY</th>
              <th>COMMIT LATENCY</th>
              <th>GOSSIP PEERS</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${data.peers.map(p => `
              <tr>
                <td class="font-mono text-bold" style="color:var(--text);">${p.peer_id}</td>
                <td><span class="badge badge-neutral font-mono">${p.msp_id}</span></td>
                <td class="text-meta">${p.role}</td>
                <td class="num font-mono text-bold" style="color:var(--blue);">#${p.ledger_height}</td>
                <td class="font-mono text-meta">${p.stateless_validation_policy}</td>
                <td class="num font-mono" style="color:var(--green);">${p.mvcc_latency_ms} ms</td>
                <td class="num font-mono">${p.gossip_neighbors} active</td>
                <td><span class="badge badge-allow">${p.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  loadData();
}
