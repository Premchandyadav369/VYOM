import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  FileText,
  Key,
  Database,
  Check,
  Ban,
  Fingerprint,
  Send,
  ExternalLink,
  Copy,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';

interface PaymentInspectorProps {
  paymentId: string;
  navigate: (route: string) => void;
}

export const PaymentInspector: React.FC<PaymentInspectorProps> = ({ paymentId, navigate }) => {
  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'DRUNIX' | 'REASONING'>('SIGNALS');

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const data = await api.getPayment(paymentId);
      setPayment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await api.approvePayment(paymentId);
      await fetchPayment();
    } catch (err) {
      alert('Approval failed: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setActionLoading(true);
      await api.verifyPayment(paymentId);
      await fetchPayment();
    } catch (err) {
      alert('Verification failed: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleHold = async () => {
    try {
      setActionLoading(true);
      await api.holdPayment(paymentId);
      await fetchPayment();
    } catch (err) {
      alert('Hold quarantine failed: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyProof = () => {
    if (!payment) return;
    const proof = JSON.stringify({
      payment_id: payment.payment_id,
      drunix_tx_id: payment.drunix_tx_id,
      drunix_block: payment.drunix_block_number,
      signature: payment.risk_details?.vera_signature
    }, null, 2);
    navigator.clipboard.writeText(proof);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-[#6b7280]">
        Synchronizing state from Drunix distributed ledger...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/payments')}
          className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Payment Monitor</span>
        </button>
        <div className="p-8 text-center text-xs text-[#ef4444] bg-[#0e1017] rounded-lg border border-[#1c202e] font-mono">
          Payment record not found on consortium ledger.
        </div>
      </div>
    );
  }

  const isAllow = payment.decision === 'ALLOW';
  const isVerify = payment.decision === 'VERIFY';
  const isHold = payment.decision === 'HOLD';
  const isSettled = payment.status === 'SETTLED';

  const drunixSteps = [
    { num: "01", name: "PROPOSAL", done: true, sub: "Lite Peer Simulation" },
    { num: "02", name: "ENDORSED", done: true, sub: "Multi-MSP Signatures" },
    { num: "03", name: "ORDERED", done: true, sub: "Raft Consensus Block Cut" },
    { num: "04", name: "VALIDATED", done: true, sub: "Stateless Validation Service" },
    { num: "05", name: "COMMITTED", done: isSettled || isAllow, sub: "SQL Ledger StateDB" },
    { num: "06", name: "SETTLED", done: isSettled, sub: "UPI Finality Reference" },
  ];

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#181c28] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payments')}
            className="p-1.5 rounded-md bg-[#111420] border border-[#1e2336] text-[#9ca3af] hover:text-white transition-colors"
            title="Back to Payments"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-mono">{payment.payment_id}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isAllow
                    ? 'bg-[#064e3b] text-[#34d399]'
                    : isVerify
                    ? 'bg-[#78350f] text-[#fbbf24]'
                    : 'bg-[#7f1d1d] text-[#f87171]'
                }`}
              >
                {payment.decision}
              </span>
              <span className="text-[10px] font-mono text-[#8b949e] px-2 py-0.5 rounded bg-[#101422] border border-[#1a2032]">
                STATUS: {payment.status}
              </span>
            </div>
            <p className="text-[11px] text-[#6b7280] mt-1 font-mono">
              Initiated {payment.created_at ? new Date(payment.created_at).toLocaleString('en-IN') : 'N/A'} | Drunix Block #{payment.drunix_block_number || '1'}
            </p>
          </div>
        </div>

        {/* Action Buttons for SOC Operator Intervention */}
        <div className="flex flex-wrap items-center gap-2">
          {payment.status !== 'SETTLED' && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-md bg-[#064e3b] hover:bg-[#059669] disabled:opacity-50 text-[#34d399] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve (Override)</span>
            </button>
          )}

          {payment.status === 'VERIFY_REQUIRED' && (
            <button
              onClick={handleVerify}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Verifying on Drunix...' : 'Authorize Verification'}</span>
            </button>
          )}

          {payment.status !== 'HOLD' && (
            <button
              onClick={handleHold}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-md bg-[#7f1d1d] hover:bg-[#dc2626] disabled:opacity-50 text-[#f87171] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Quarantine (HOLD)</span>
            </button>
          )}

          <button
            onClick={handleCopyProof}
            className="px-3 py-1.5 rounded-md bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-xs font-mono text-[#c9d1d9] flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{copied ? 'Proof Copied!' : 'Copy DLT Proof'}</span>
          </button>
        </div>
      </div>

      {/* Drunix 6-Phase Lifecycle Stepper */}
      <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-white text-[11px] uppercase tracking-wider">
            Drunix Distributed Ledger State Machine
          </span>
          <span className="text-[#38bdf8]">
            Head Block #{payment.drunix_block_number || '1'} (Committed)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {drunixSteps.map((step) => (
            <div
              key={step.name}
              className={`p-2.5 rounded border text-xs flex flex-col justify-between ${
                step.done
                  ? 'bg-[#101828] border-[#1e345e] text-white'
                  : 'bg-[#0f111a] border-[#181d2a] text-[#4b5563]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-[#38bdf8]">{step.num}</span>
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-[#374151]" />
                )}
              </div>
              <div className="font-bold text-[11px] tracking-tight font-mono">{step.name}</div>
              <div className="text-[9px] text-[#6b7280] font-mono mt-0.5">{step.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#181c28] text-xs font-mono">
        <button
          onClick={() => setActiveTab('SIGNALS')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'SIGNALS'
              ? 'border-[#38bdf8] text-white font-semibold'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          Risk Signals & Intent Vector
        </button>
        <button
          onClick={() => setActiveTab('DRUNIX')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'DRUNIX'
              ? 'border-[#38bdf8] text-white font-semibold'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          On-Chain Drunix State & Proof
        </button>
        <button
          onClick={() => setActiveTab('REASONING')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'REASONING'
              ? 'border-[#38bdf8] text-white font-semibold'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          Explainable AI & Compliance Audit
        </button>
      </div>

      {/* Tab 1: Signals & Intent Vector */}
      {activeTab === 'SIGNALS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Financial & Stated Intent */}
          <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-3.5 font-mono text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Transaction Parameters
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-[#151926]">
                <span className="text-[#6b7280]">Amount</span>
                <span className="text-white font-bold tabular-nums">
                  ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#151926]">
                <span className="text-[#6b7280]">Sender ID</span>
                <span className="text-[#cbd5e1] truncate max-w-[170px]">{payment.sender_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#151926]">
                <span className="text-[#6b7280]">Recipient ID</span>
                <span className="text-[#cbd5e1] truncate max-w-[170px]">{payment.recipient_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#151926]">
                <span className="text-[#6b7280]">Rail Channel</span>
                <span className="text-[#cbd5e1]">UPI 2.0 (IGPS Protected)</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">
                Stated Intent Narrative
              </span>
              <div className="p-2.5 rounded bg-[#101320] border border-[#1a2032] text-xs text-white italic font-sans">
                "{payment.stated_intent || 'Direct transfer without explicit natural language narrative'}"
              </div>
            </div>
          </div>

          {/* Column 2: Multi-Modal Signals */}
          <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-3.5 font-mono text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Multi-Modal Risk Decomposition
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8b949e]">Intent Consistency</span>
                  <span className="text-white font-bold">{((payment.intent_consistency || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#38bdf8]"
                    style={{ width: `${(payment.intent_consistency || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8b949e]">Counterparty Trust</span>
                  <span className="text-white font-bold">{((payment.recipient_trust || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981]"
                    style={{ width: `${(payment.recipient_trust || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8b949e]">Behavior Deviation</span>
                  <span className="text-white font-bold">{((payment.behavior_deviation || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b]"
                    style={{ width: `${(payment.behavior_deviation || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8b949e]">Network / Mule Exposure</span>
                  <span className="text-white font-bold">{((payment.network_risk || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444]"
                    style={{ width: `${(payment.network_risk || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#151926] flex items-center justify-between">
                <span className="text-[#8b949e]">Unified Composite Risk:</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {payment.risk_score?.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Policy Decision & Reason Codes */}
          <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-3.5 font-mono text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Policy Reason Codes
            </h3>

            <div className="space-y-1.5">
              {payment.reason_codes && payment.reason_codes.length > 0 ? (
                payment.reason_codes.map((code) => (
                  <div
                    key={code}
                    className="p-2 rounded bg-[#101320] border border-[#1a2032] text-[11px] text-[#93c5fd]"
                  >
                    • {code}
                  </div>
                ))
              ) : (
                <div className="p-2 rounded bg-[#064e3b]/30 border border-[#059669]/40 text-[11px] text-[#34d399]">
                  ✓ STANDARD_PARAMETRIC_MATCH
                </div>
              )}
            </div>

            {payment.risk_details?.required_action && (
              <div className="p-3 rounded bg-[#261706] border border-[#78350f] text-xs text-[#fcd34d] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Required Verification Action:</span>
                </div>
                <p className="text-[11px]">{payment.risk_details.required_action}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: On-Chain Drunix State */}
      {activeTab === 'DRUNIX' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Drunix Immutable State Record
              </h3>
              <button
                onClick={handleCopyProof}
                className="flex items-center gap-1 text-[11px] font-mono text-[#38bdf8] hover:text-white"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 rounded bg-[#090b12] border border-[#151926] text-xs font-mono text-[#93c5fd] overflow-x-auto leading-relaxed">
              {JSON.stringify(payment.on_chain_drunix_record || payment.state_history, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Plain English Reasoning */}
      {activeTab === 'REASONING' && (
        <div className="p-5 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-4 font-mono">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Explainable AI & Regulatory Compliance Audit
          </h3>

          <div className="p-4 rounded bg-[#101320] border border-[#1a2032] text-xs text-white whitespace-pre-line leading-relaxed font-sans">
            {payment.risk_details?.explanation || 'Payment processed under normal transaction parameters.'}
          </div>

          <div className="p-3.5 rounded bg-[#090b12] border border-[#151926] text-xs text-[#6b7280] space-y-1">
            <div className="text-[10px] uppercase tracking-wider">Cryptographic Decision Signature:</div>
            <div className="text-[#38bdf8] break-all font-mono text-[11px]">
              {payment.risk_details?.vera_signature || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
