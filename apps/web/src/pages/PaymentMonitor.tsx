import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  ExternalLink,
  ChevronRight,
  X,
  Check,
  Ban,
  Clock,
  Fingerprint,
  Database,
  ArrowUpRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';
import { LivePaymentModal } from '../components/LivePaymentModal';
import { CSVImportModal } from '../components/CSVImportModal';

interface PaymentMonitorProps {
  navigate: (route: string) => void;
}

export const PaymentMonitor: React.FC<PaymentMonitorProps> = ({ navigate }) => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Selected payment for Slide-over Triage Drawer
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPayments(60);
      setPayments(data);
      setFilteredPayments(data);

      // Refresh selected payment if open
      if (selectedPayment) {
        const updated = data.find(p => p.payment_id === selectedPayment.payment_id);
        if (updated) setSelectedPayment(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let res = payments;
    if (statusFilter !== 'ALL') {
      res = res.filter(p => p.decision === statusFilter || p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(p =>
        p.payment_id.toLowerCase().includes(q) ||
        p.sender_id.toLowerCase().includes(q) ||
        p.recipient_id.toLowerCase().includes(q) ||
        (p.stated_intent && p.stated_intent.toLowerCase().includes(q))
      );
    }
    setFilteredPayments(res);
  }, [search, statusFilter, payments]);

  // Operational Actions in Triage Drawer
  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await api.approvePayment(id);
      await fetchPayments();
    } catch (e) {
      alert('Approval error: ' + String(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setActionLoading(true);
      await api.verifyPayment(id);
      await fetchPayments();
    } catch (e) {
      alert('Verification error: ' + String(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleHold = async (id: string) => {
    try {
      setActionLoading(true);
      await api.holdPayment(id);
      await fetchPayments();
    } catch (e) {
      alert('Hold error: ' + String(e));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#181c28] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-mono">
              Live Payment Monitor
            </h1>
            <span className="text-xs font-mono text-[#6b7280]">
              ({filteredPayments.length} of {payments.length} Records)
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            High-throughput intent verification and instant security intervention across consortium nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-[#c9d1d9] text-xs font-mono transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Import Statement</span>
          </button>
          <button
            onClick={() => setShowLiveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-mono font-semibold hover:bg-[#1d4ed8] shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Payment</span>
          </button>
          <button
            onClick={fetchPayments}
            className="p-1.5 rounded-md bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-[#8b949e] hover:text-white transition-colors"
            title="Refresh Ledger Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-lg bg-[#0c0e17] border border-[#1a1f2e]">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#101320] px-3 py-1.5 rounded-md border border-[#1a2032]">
          <Search className="w-3.5 h-3.5 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by Payment ID, Sender, Beneficiary, or Narrative..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-[#6b7280] focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-[#6b7280] text-[10px] mr-1">FILTER:</span>
          {['ALL', 'ALLOW', 'VERIFY', 'HOLD', 'SETTLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#182136] text-[#38bdf8] border border-[#223354]'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#121622]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Split Screen when Triage Drawer is Active */}
      <div className="flex gap-4 items-start">
        {/* Payments Table */}
        <div className={`rounded-lg bg-[#0c0e17] border border-[#1a1f2e] overflow-hidden transition-all duration-200 ${
          selectedPayment ? 'flex-1 min-w-0' : 'w-full'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f121d] border-b border-[#181d2c] text-[#8b949e] font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3.5">Payment ID</th>
                  <th className="py-2.5 px-3.5">Sender ➔ Recipient</th>
                  <th className="py-2.5 px-3.5">Amount</th>
                  <th className="py-2.5 px-3.5">Stated Narrative</th>
                  <th className="py-2.5 px-3.5">Policy Verdict</th>
                  <th className="py-2.5 px-3.5">Intent Score</th>
                  <th className="py-2.5 px-3.5">Recipient Trust</th>
                  <th className="py-2.5 px-3.5">Drunix Block</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151926] font-mono text-[11px]">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#6b7280]">
                      {loading ? 'Querying Drunix ledger state...' : 'No payments found matching filter criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const isAllow = p.decision === 'ALLOW';
                    const isVerify = p.decision === 'VERIFY';
                    const isSelected = selectedPayment?.payment_id === p.payment_id;

                    return (
                      <tr
                        key={p.payment_id}
                        onClick={() => setSelectedPayment(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#182136] text-white border-l-2 border-[#38bdf8]'
                            : 'hover:bg-[#101422]'
                        }`}
                      >
                        <td className="py-2.5 px-3.5 font-bold text-white whitespace-nowrap">
                          {p.payment_id}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="text-white truncate max-w-[130px]">{p.sender_id}</div>
                          <div className="text-[#8b949e] text-[10px] truncate max-w-[130px]">↳ {p.recipient_id}</div>
                        </td>
                        <td className="py-2.5 px-3.5 text-white font-bold tabular-nums whitespace-nowrap">
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3.5 text-[#cbd5e1] truncate max-w-[180px]">
                          {p.stated_intent || 'Direct transfer without narrative'}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isAllow
                              ? 'bg-[#064e3b] text-[#34d399]'
                              : (isVerify ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]')
                          }`}>
                            {p.decision}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className={`font-bold tabular-nums ${
                            p.intent_consistency < 0.4
                              ? 'text-[#ef4444]'
                              : (p.intent_consistency < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                          }`}>
                            {((p.intent_consistency || 0) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className={`font-bold tabular-nums ${
                            p.recipient_trust < 0.3
                              ? 'text-[#ef4444]'
                              : (p.recipient_trust < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                          }`}>
                            {((p.recipient_trust || 0) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-[#93c5fd] whitespace-nowrap">
                          #{p.drunix_block_number || 1}
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/payments/${p.payment_id}`);
                            }}
                            className="p-1 rounded hover:bg-[#1a2134] text-[#8b949e] hover:text-[#38bdf8] transition-colors"
                            title="Open Full Inspector"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Triage Detail Drawer (Palantir/Linear style slide-in panel) */}
        {selectedPayment && (
          <div className="w-96 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] p-4 space-y-4 shrink-0 font-mono text-xs animate-fadeIn">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[#181d2c] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{selectedPayment.payment_id}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                    selectedPayment.decision === 'ALLOW'
                      ? 'bg-[#064e3b] text-[#34d399]'
                      : (selectedPayment.decision === 'VERIFY' ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]')
                  }`}>
                    {selectedPayment.decision}
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] mt-0.5">
                  STATUS: {selectedPayment.status} | Block #{selectedPayment.drunix_block_number || 1}
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded hover:bg-[#151926] text-[#6b7280] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded bg-[#0f121d] border border-[#181d2c] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#6b7280]">Amount:</span>
                <span className="text-white font-bold text-sm tabular-nums">
                  ₹{Number(selectedPayment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6b7280]">Sender:</span>
                <span className="text-[#cbd5e1] truncate max-w-[180px]">{selectedPayment.sender_id}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6b7280]">Recipient:</span>
                <span className="text-[#cbd5e1] truncate max-w-[180px]">{selectedPayment.recipient_id}</span>
              </div>
            </div>

            {/* Stated Intent Narrative */}
            <div>
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">
                Stated Intent Narrative
              </span>
              <div className="p-2.5 rounded bg-[#101320] border border-[#1a2032] text-[11px] text-white italic">
                "{selectedPayment.stated_intent || 'No natural language narrative recorded'}"
              </div>
            </div>

            {/* Risk Decomposition Progress Bars */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block">
                Signal Decomposition
              </span>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#8b949e]">Intent Consistency</span>
                  <span className="text-white font-bold">
                    {((selectedPayment.intent_consistency || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#38bdf8]"
                    style={{ width: `${(selectedPayment.intent_consistency || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#8b949e]">Counterparty Trust</span>
                  <span className="text-white font-bold">
                    {((selectedPayment.recipient_trust || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981]"
                    style={{ width: `${(selectedPayment.recipient_trust || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#8b949e]">Unified Composite Risk</span>
                  <span className="text-white font-bold tabular-nums">
                    {(selectedPayment.risk_score || 0).toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#151926] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (selectedPayment.risk_score || 0) > 0.65
                        ? 'bg-[#ef4444]'
                        : ((selectedPayment.risk_score || 0) > 0.35 ? 'bg-[#f59e0b]' : 'bg-[#10b981]')
                    }`}
                    style={{ width: `${Math.min(100, (selectedPayment.risk_score || 0) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Policy Reason Codes */}
            {selectedPayment.reason_codes && selectedPayment.reason_codes.length > 0 && (
              <div>
                <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">
                  Triggered Codes
                </span>
                <div className="space-y-1">
                  {selectedPayment.reason_codes.map((rc) => (
                    <div
                      key={rc}
                      className="px-2 py-1 rounded bg-[#101320] border border-[#1a2032] text-[10px] text-[#93c5fd]"
                    >
                      • {rc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operational Action Buttons */}
            <div className="pt-2 border-t border-[#181d2c] space-y-2">
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block">
                SOC Analyst Intervention
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleApprove(selectedPayment.payment_id)}
                  disabled={actionLoading || selectedPayment.status === 'SETTLED'}
                  className="px-2.5 py-1.5 rounded bg-[#064e3b] hover:bg-[#059669] disabled:opacity-50 text-[#34d399] font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Approve (Override)</span>
                </button>

                <button
                  onClick={() => handleHold(selectedPayment.payment_id)}
                  disabled={actionLoading || selectedPayment.status === 'HOLD'}
                  className="px-2.5 py-1.5 rounded bg-[#7f1d1d] hover:bg-[#dc2626] disabled:opacity-50 text-[#f87171] font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Ban className="w-3 h-3" />
                  <span>Hold & Quarantine</span>
                </button>
              </div>

              {selectedPayment.status === 'VERIFY_REQUIRED' && (
                <button
                  onClick={() => handleVerify(selectedPayment.payment_id)}
                  disabled={actionLoading}
                  className="w-full px-2.5 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Fingerprint className="w-3 h-3" />
                  <span>Authorize Biometric Intent Verification</span>
                </button>
              )}

              <button
                onClick={() => navigate(`/payments/${selectedPayment.payment_id}`)}
                className="w-full px-2.5 py-1.5 rounded bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-[#93c5fd] font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
              >
                <span>Open Full Deep Inspector</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LivePaymentModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onPaymentCreated={fetchPayments}
      />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImportComplete={fetchPayments}
      />
    </div>
  );
};
