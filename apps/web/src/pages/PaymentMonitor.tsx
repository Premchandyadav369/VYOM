import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  ExternalLink,
  Sliders,
  ChevronRight
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

  // Modals state
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPayments(60);
      setPayments(data);
      setFilteredPayments(data);
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Payment Monitor</h2>
          <p className="text-xs text-[#8b949e] mt-0.5 font-mono">
            Real-time intent-governed transaction monitoring across participating financial institutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161a29] hover:bg-[#1e243a] border border-[#23293e] text-[#c9d1d9] text-xs font-medium transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Import Statement (CSV)</span>
          </button>
          <button
            onClick={() => setShowLiveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Intent Payment</span>
          </button>
          <button
            onClick={fetchPayments}
            className="p-1.5 rounded-md bg-[#131622] hover:bg-[#1c2134] border border-[#22283a] text-[#8b949e] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#0c0e17] border border-[#1e2336]">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#111422] px-3 py-1.5 rounded-md border border-[#1e2336]">
          <Search className="w-3.5 h-3.5 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by Payment ID, Sender, Recipient, or Intent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-[#6b7280] focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#6b7280] text-[11px] mr-1">FILTER:</span>
          {['ALL', 'ALLOW', 'VERIFY', 'HOLD', 'SETTLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#1b2236] text-[#60a5fa] border border-[#26324d]'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#131622]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl bg-[#0c0e17] border border-[#1e2336] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#101322] border-b border-[#1b2030] text-[#8b949e] font-mono text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-4">Payment ID</th>
              <th className="py-2.5 px-4">Sender / Recipient</th>
              <th className="py-2.5 px-4">Amount (INR)</th>
              <th className="py-2.5 px-4">Stated Narrative</th>
              <th className="py-2.5 px-4">Policy Decision</th>
              <th className="py-2.5 px-4">Intent Score</th>
              <th className="py-2.5 px-4">Recipient Trust</th>
              <th className="py-2.5 px-4">Risk Class</th>
              <th className="py-2.5 px-4">Drunix Block</th>
              <th className="py-2.5 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161a29] font-mono text-[11px]">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#6b7280]">
                  {loading ? 'Loading payment records...' : 'No payments found matching criteria.'}
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                const isAllow = p.decision === 'ALLOW';
                const isVerify = p.decision === 'VERIFY';
                return (
                  <tr key={p.payment_id} className="hover:bg-[#111422] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.payment_id}</td>
                    <td className="py-3 px-4">
                      <div className="text-white truncate max-w-[140px]">{p.sender_id}</div>
                      <div className="text-[#8b949e] text-[10px] truncate max-w-[140px]">↳ {p.recipient_id}</div>
                    </td>
                    <td className="py-3 px-4 text-white font-bold tabular-nums">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-[#c9d1d9] truncate max-w-[220px]">
                      {p.stated_intent || 'Direct transfer without narrative'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        isAllow
                          ? 'bg-[#064e3b] text-[#34d399]'
                          : (isVerify ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]')
                      }`}>
                        {p.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold tabular-nums ${
                        p.intent_consistency < 0.4
                          ? 'text-[#ef4444]'
                          : (p.intent_consistency < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                      }`}>
                        {(p.intent_consistency * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold tabular-nums ${
                        p.recipient_trust < 0.3
                          ? 'text-[#ef4444]'
                          : (p.recipient_trust < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                      }`}>
                        {(p.recipient_trust * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#9ca3af]">{p.risk_class || 'NORMAL'}</span>
                    </td>
                    <td className="py-3 px-4 text-[#93c5fd]">
                      #{p.drunix_block_number || 1}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/payments/${p.payment_id}`)}
                        className="p-1 rounded hover:bg-[#1e2438] text-[#8b949e] hover:text-[#60a5fa] transition-colors"
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
