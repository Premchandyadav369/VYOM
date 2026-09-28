import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  FileText,
  Key,
  Database,
  Check,
  Send,
  ExternalLink
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
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DRUNIX' | 'REASONING'>('OVERVIEW');

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

  const handleVerify = async () => {
    try {
      setVerifying(true);
      await api.verifyPayment(paymentId);
      await fetchPayment();
    } catch (err) {
      alert('Verification failed: ' + String(err));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono text-[#6b7280]">
        Loading payment state from Drunix ledger...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/payments')}
          className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Payments</span>
        </button>
        <div className="p-8 text-center text-xs text-[#ef4444] bg-[#0e1017] rounded-lg border border-[#1c202e]">
          Payment record not found.
        </div>
      </div>
    );
  }

  const isAllow = payment.decision === 'ALLOW';
  const isVerify = payment.decision === 'VERIFY';
  const isHold = payment.decision === 'HOLD';
  const isSettled = payment.status === 'SETTLED';

  const drunixSteps = [
    { name: "PROPOSAL", done: true, sub: "Lite Peer Simulation" },
    { name: "ENDORSED", done: true, sub: "Multi-MSP Signatures" },
    { name: "ORDERED", done: true, sub: "Raft Consensus Block Cut" },
    { name: "VALIDATED", done: true, sub: "Stateless Validation Service" },
    { name: "COMMITTED", done: isSettled || isAllow, sub: "SQL Ledger StateDB" },
    { name: "SETTLED", done: isSettled, sub: "UPI Finality Reference" },
  ];

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payments')}
            className="p-1.5 rounded-md bg-[#161922] border border-[#242b3d] text-[#9ca3af] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">{payment.payment_id}</h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isAllow
                    ? 'bg-[#064e3b]/50 text-[#34d399] border border-[#059669]/40'
                    : isVerify
                    ? 'bg-[#78350f]/50 text-[#fcd34d] border border-[#d97706]/40'
                    : 'bg-[#7f1d1d]/50 text-[#f87171] border border-[#dc2626]/40'
                }`}
              >
                {payment.decision}
              </span>
              <span className="text-[10px] font-mono text-[#6b7280]">STATUS: {payment.status}</span>
            </div>
            <p className="text-[11px] text-[#6b7280] mt-0.5">
              Initiated {payment.created_at ? new Date(payment.created_at).toLocaleString() : ''}
            </p>
          </div>
        </div>

        {payment.status === 'VERIFY_REQUIRED' && (
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8]"
          >
            <Check className="w-4 h-4" />
            <span>{verifying ? 'Verifying on Drunix...' : 'Complete Secondary Verification'}</span>
          </button>
        )}
      </div>

      {/* Drunix 6-Phase Lifecycle Stepper */}
      <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white font-mono text-[11px] uppercase tracking-wider">
            Drunix Distributed Ledger State Machine
          </span>
          <span className="font-mono text-[11px] text-[#60a5fa]">
            Block #{payment.drunix_block_number || '1'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {drunixSteps.map((step, idx) => (
            <div
              key={step.name}
              className={`p-2.5 rounded border text-xs flex flex-col justify-between ${
                step.done
                  ? 'bg-[#101928] border-[#1e3a8a] text-white'
                  : 'bg-[#0f1118] border-[#1a1d27] text-[#4b5563]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-[#374151]" />
                )}
              </div>
              <div className="font-bold text-[11px] tracking-tight">{step.name}</div>
              <div className="text-[9px] text-[#6b7280] font-mono mt-0.5">{step.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1c202e] text-xs font-mono">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'border-[#3b82f6] text-white'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          Risk Signals & Intent
        </button>
        <button
          onClick={() => setActiveTab('DRUNIX')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'DRUNIX'
              ? 'border-[#3b82f6] text-white'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          On-Chain Drunix State
        </button>
        <button
          onClick={() => setActiveTab('REASONING')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'REASONING'
              ? 'border-[#3b82f6] text-white'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          Audit & Plain English Rationale
        </button>
      </div>

      {/* Tab 1: Overview & Signals */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Financial & Stated Intent */}
          <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Transaction Details
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#171b26]">
                <span className="text-[#6b7280]">Amount</span>
                <span className="text-white font-bold">
                  Rs. {payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171b26]">
                <span className="text-[#6b7280]">Sender ID</span>
                <span className="text-[#9ca3af]">{payment.sender_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171b26]">
                <span className="text-[#6b7280]">Recipient ID</span>
                <span className="text-[#9ca3af]">{payment.recipient_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#171b26]">
                <span className="text-[#6b7280]">Rail Channel</span>
                <span className="text-[#9ca3af]">UPI 2.0</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-[#6b7280] font-mono block mb-1">Stated Intent (Natural Language)</span>
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636] text-xs text-white italic">
                "{payment.stated_intent || 'No explicit intent specified'}"
              </div>
            </div>
          </div>

          {/* Column 2: Multi-Modal Signals */}
          <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              VERA Risk Multi-Modal Decomposition
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-[#9ca3af]">Intent Consistency</span>
                  <span className="text-white font-bold">{((payment.intent_consistency || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171b26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b82f6]"
                    style={{ width: `${(payment.intent_consistency || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-[#9ca3af]">Counterparty Trust</span>
                  <span className="text-white font-bold">{((payment.recipient_trust || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171b26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981]"
                    style={{ width: `${(payment.recipient_trust || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-[#9ca3af]">Behavior Deviation</span>
                  <span className="text-white font-bold">{((payment.behavior_deviation || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171b26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b]"
                    style={{ width: `${(payment.behavior_deviation || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-[#9ca3af]">Network / Mule Risk</span>
                  <span className="text-white font-bold">{((payment.network_risk || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171b26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444]"
                    style={{ width: `${(payment.network_risk || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#171b26] flex items-center justify-between font-mono">
                <span className="text-xs text-[#9ca3af]">Unified Composite Risk</span>
                <span className="text-sm font-bold text-white">
                  {payment.risk_score?.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Policy Decision & Reason Codes */}
          <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Policy Reason Codes
            </h3>

            <div className="space-y-1.5">
              {payment.reason_codes && payment.reason_codes.length > 0 ? (
                payment.reason_codes.map((code) => (
                  <div
                    key={code}
                    className="p-2 rounded bg-[#131620] border border-[#202636] text-[11px] font-mono text-[#93c5fd]"
                  >
                    • {code}
                  </div>
                ))
              ) : (
                <div className="p-2 rounded bg-[#131620] border border-[#202636] text-[11px] font-mono text-[#34d399]">
                  ✓ STANDARD_PARAMETRIC_MATCH
                </div>
              )}
            </div>

            {payment.risk_details?.required_action && (
              <div className="p-3 rounded bg-[#2a1708] border border-[#78350f] text-xs text-[#fcd34d] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
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
          <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Drunix Immutable State Record
            </h3>
            <pre className="p-4 rounded bg-[#090a0f] border border-[#171b26] text-xs font-mono text-[#a5d6ff] overflow-x-auto">
              {JSON.stringify(payment.on_chain_drunix_record || payment.state_history, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Plain English Reasoning */}
      {activeTab === 'REASONING' && (
        <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Human-Readable Explanation & Compliance Audit
          </h3>

          <div className="p-4 rounded bg-[#131620] border border-[#202636] text-xs text-white whitespace-pre-line leading-relaxed font-sans">
            {payment.risk_details?.explanation || 'Payment processed under normal transaction parameters.'}
          </div>

          <div className="p-3 rounded bg-[#090a0f] border border-[#171b26] text-xs font-mono text-[#6b7280] space-y-1">
            <div>Cryptographic Decision Signature:</div>
            <div className="text-[#60a5fa] break-all">{payment.risk_details?.vera_signature || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
