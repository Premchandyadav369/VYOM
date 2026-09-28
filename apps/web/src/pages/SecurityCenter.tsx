import React, { useState, useEffect } from 'react';
import { Lock, Shield, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const SecurityCenter: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const threatMatrix = [
    { id: 'T1', name: 'Social Engineering Scams', surface: 'Deceptive user intent', mitigation: 'Intent Engine NLP & Coercion scoring' },
    { id: 'T2', name: 'Account Takeover (ATO)', surface: 'Compromised sessions', mitigation: 'Isolation Forest velocity & off-hours anomaly' },
    { id: 'T3', name: 'Recipient Spoofing', surface: 'Look-alike VPAs', mitigation: 'Verified merchant graph registry & novelty check' },
    { id: 'T4', name: 'Mule Networks', surface: 'Rapid pass-through', mitigation: 'Betweenness centrality & mule cluster proximity' },
    { id: 'T5', name: 'Model Manipulation', surface: 'Adversarial intent text', mitigation: 'Multi-modal fusion (intent + behavior + graph)' },
    { id: 'T6', name: 'API Replay Attacks', surface: 'Stolen payload reuse', mitigation: 'Cryptographic nonces & timestamp skew window' },
    { id: 'T7', name: 'Ledger State Tampering', surface: 'History manipulation', mitigation: 'Raft consensus & Merkle root proof' },
    { id: 'T8', name: 'Unauthorized Transition', surface: 'Rogue bank node', mitigation: 'Stateless Validation Service multi-MSP check' },
    { id: 'T9', name: 'Compromised VERA Node', surface: 'Malicious risk scores', mitigation: 'Cryptographic HMAC decision attestation' },
    { id: 'T10', name: 'Malicious Insider', surface: 'Local DB edits', mitigation: 'DLT shared truth vs local query cache' },
    { id: 'T11', name: 'Data Leakage / PII', surface: 'Sensitive details on-chain', mitigation: 'KeyDB transient store & zero-knowledge hashes' },
    { id: 'T12', name: 'Denial of Service', surface: 'Traffic flooding', mitigation: 'Stateless Validation horizontal scaling' },
  ];

  useEffect(() => {
    api.getAuditLogs(15).then(setAuditLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold tracking-tight text-white">Security Center & Threat Model (T1 – T12)</h2>
        </div>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          Perimeter defense, threat mitigation matrix, cryptographic verification, and tamper-evident audit logs.
        </p>
      </div>

      {/* Threat Matrix */}
      <div className="rounded-lg bg-[#0e1017] border border-[#1c202e] overflow-hidden">
        <div className="p-4 border-b border-[#1c202e]">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Threat Defense Architecture
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#11131b] border-b border-[#1c202e] text-[#6b7280] text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Threat ID</th>
                <th className="py-2.5 px-4 font-sans">Threat Vector</th>
                <th className="py-2.5 px-4">Attack Surface</th>
                <th className="py-2.5 px-4 font-sans">Engineering Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] text-[#e6edf3]">
              {threatMatrix.map((t) => (
                <tr key={t.id} className="hover:bg-[#12151f]">
                  <td className="py-2.5 px-4 font-bold text-[#60a5fa]">{t.id}</td>
                  <td className="py-2.5 px-4 font-sans text-white font-medium">{t.name}</td>
                  <td className="py-2.5 px-4 text-[#9ca3af]">{t.surface}</td>
                  <td className="py-2.5 px-4 font-sans text-[#34d399]">{t.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="rounded-lg bg-[#0e1017] border border-[#1c202e] overflow-hidden">
        <div className="p-4 border-b border-[#1c202e]">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Tamper-Evident Security Audit Logs
          </h3>
        </div>

        <div className="divide-y divide-[#171b26] max-h-60 overflow-y-auto font-mono text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-[#6b7280]">No security incidents logged.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.log_id} className="p-3 flex items-center justify-between hover:bg-[#12151f]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                  <span className="text-white font-bold">{log.event_type}</span>
                  <span className="text-[#6b7280]">Target: {log.resource_id}</span>
                </div>
                <div className="text-[10px] text-[#9ca3af]">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
