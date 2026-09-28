import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';

interface PaymentMonitorProps {
  navigate: (route: string) => void;
}

export const PaymentMonitor: React.FC<PaymentMonitorProps> = ({ navigate }) => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state for new payment
  const [newAmount, setNewAmount] = useState('25000');
  const [newRecipient, setNewRecipient] = useState('REC_00099');
  const [newIntent, setNewIntent] = useState('Paying Rs 5,000 for groceries');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPayments(50);
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

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createPayment({
        sender_id: 'USR_00088',
        recipient_id: newRecipient,
        amount: parseFloat(newAmount),
        stated_intent: newIntent,
        category: 'p2p_transfer'
      });
      setShowModal(false);
      await fetchPayments();
      navigate(`/payments/${res.payment_id}`);
    } catch (err) {
      alert('Failed to create payment: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Payment Monitor</h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Real-time intent-governed transaction monitoring across participating financial institutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Payment</span>
          </button>
          <button
            onClick={fetchPayments}
            className="p-1.5 rounded-md bg-[#161922] border border-[#242b3d] text-[#9ca3af] hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0e1017] border border-[#1c202e]">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#131620] px-3 py-1.5 rounded-md border border-[#202636]">
          <Search className="w-3.5 h-3.5 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by Payment ID, Sender, Recipient, or Intent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-[#6b7280] focus:outline-none w-full"
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
                  ? 'bg-[#1e2433] text-[#60a5fa] border border-[#2b354f]'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131620]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-lg bg-[#0e1017] border border-[#1c202e] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#11131b] border-b border-[#1c202e] text-[#6b7280] font-mono text-[10px] uppercase">
            <tr>
              <th className="py-3 px-4">Payment ID</th>
              <th className="py-3 px-4">Sender / Recipient</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4">Intent Consistency</th>
              <th className="py-3 px-4">Recipient Trust</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Block #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171b26] text-[#e6edf3]">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#6b7280]">
                  No matching payments found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr
                  key={p.payment_id}
                  onClick={() => navigate(`/payments/${p.payment_id}`)}
                  className="hover:bg-[#141722] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-[#60a5fa]">
                    {p.payment_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-white">{p.sender_id}</div>
                    <div className="text-[#6b7280]">→ {p.recipient_id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    Rs. {p.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        p.decision === 'ALLOW'
                          ? 'bg-[#064e3b]/50 text-[#34d399] border border-[#059669]/40'
                          : p.decision === 'VERIFY'
                          ? 'bg-[#78350f]/50 text-[#fcd34d] border border-[#d97706]/40'
                          : 'bg-[#7f1d1d]/50 text-[#f87171] border border-[#dc2626]/40'
                      }`}
                    >
                      {p.decision || 'EVALUATING'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3b82f6]"
                          style={{ width: `${(p.intent_consistency || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] text-[#9ca3af]">
                        {((p.intent_consistency || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#9ca3af]">
                    {((p.recipient_trust || 0) * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={
                        (p.risk_score || 0) > 0.6
                          ? 'text-[#f87171] font-bold'
                          : (p.risk_score || 0) > 0.3
                          ? 'text-[#fcd34d]'
                          : 'text-[#34d399]'
                      }
                    >
                      {p.risk_score?.toFixed(3) || '0.000'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#9ca3af]">
                    {p.status}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#6b7280]">
                    #{p.drunix_block_number || '0'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0e1017] border border-[#242b3d] rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c202e] pb-3">
              <h3 className="text-sm font-bold text-white">Initiate Payment with Stated Intent</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#6b7280] hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#9ca3af] mb-1 font-mono text-[11px]">Recipient ID / VPA</label>
                <input
                  type="text"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] mb-1 font-mono text-[11px]">Amount (INR)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] mb-1 font-mono text-[11px]">
                  Stated Payment Intent (NLP Analyzed)
                </label>
                <textarea
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value)}
                  rows={3}
                  className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white focus:outline-none focus:border-[#3b82f6]"
                  placeholder="e.g. Paying Rs 5,000 for groceries to Rahul"
                  required
                ></textarea>
                <p className="text-[10px] text-[#6b7280] mt-1">
                  Tip: Try testing a mismatch (e.g., stated Rs 5,000 vs actual Rs 50,000) to observe VERA trigger VERIFY.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1c202e]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-[#161922] text-[#9ca3af] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-[#2563eb] text-white font-semibold hover:bg-[#1d4ed8]"
                >
                  {submitting ? 'Processing...' : 'Submit to VERA & Drunix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
