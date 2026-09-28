import React, { useState, useEffect } from 'react';
import { Coins, Plus, FileText, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { TokenizedAsset } from '../types';

export const TokenizedAssets: React.FC = () => {
  const [assets, setAssets] = useState<TokenizedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Asset form
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-9921');
  const [faceValue, setFaceValue] = useState('150000');
  const [discountedValue, setDiscountedValue] = useState('144500');
  const [debtor, setDebtor] = useState('ENTERPRISE_CORP_C');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await api.getAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleTokenize = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.tokenizeAsset({
        invoice_number: invoiceNumber,
        face_value_inr: parseFloat(faceValue),
        discounted_value_inr: parseFloat(discountedValue),
        original_owner_id: 'MERCH_0011',
        debtor_id: debtor,
        due_date: dueDate
      });
      setShowModal(false);
      await fetchAssets();
    } catch (err) {
      alert('Tokenization failed: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#3b82f6]" />
            <h2 className="text-xl font-bold tracking-tight text-white">Tokenized Receivable Assets (RWA)</h2>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Permissioned tokenization of invoice receivables with VERA pre-transfer risk clearance and Drunix immutable ownership records.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tokenize Receivable</span>
        </button>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((a) => (
          <div key={a.asset_id} className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6b7280] font-mono">INVOICE RECEIVABLE</span>
                <h4 className="text-sm font-bold text-white font-mono">{a.invoice_number}</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#064e3b]/60 text-[#34d399] font-mono text-[10px] font-bold">
                VERIFIED ASSET
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">FACE VALUE</span>
                <span className="text-white font-bold">Rs. {a.face_value_inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">DISCOUNTED VALUE</span>
                <span className="text-[#60a5fa] font-bold">Rs. {a.discounted_value_inr?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono text-[#9ca3af]">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Current Owner:</span>
                <span className="text-white">{a.current_owner_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Debtor Corporation:</span>
                <span className="text-white">{a.debtor_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Settlement Due:</span>
                <span className="text-white">{a.due_date}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1c202e] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#6b7280]">Drunix TxID:</span>
              <span className="text-[#60a5fa] truncate max-w-[200px]">{a.drunix_tx_id || 'COMMITTED'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tokenize Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0e1017] border border-[#242b3d] rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c202e] pb-3">
              <h3 className="text-sm font-bold text-white">Tokenize New Invoice Receivable</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6b7280] hover:text-white font-mono text-xs">✕</button>
            </div>

            <form onSubmit={handleTokenize} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#9ca3af] mb-1 text-[11px]">Invoice Reference #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#9ca3af] mb-1 text-[11px]">Face Value (INR)</label>
                  <input
                    type="number"
                    value={faceValue}
                    onChange={(e) => setFaceValue(e.target.value)}
                    className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white focus:outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#9ca3af] mb-1 text-[11px]">Discounted Value</label>
                  <input
                    type="number"
                    value={discountedValue}
                    onChange={(e) => setDiscountedValue(e.target.value)}
                    className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white focus:outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9ca3af] mb-1 text-[11px]">Debtor Corporate Entity</label>
                <input
                  type="text"
                  value={debtor}
                  onChange={(e) => setDebtor(e.target.value)}
                  className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] mb-1 text-[11px]">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1c202e]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-[#161922] text-[#9ca3af]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-[#2563eb] text-white font-bold"
                >
                  {submitting ? 'Tokenizing...' : 'Tokenize on Drunix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
