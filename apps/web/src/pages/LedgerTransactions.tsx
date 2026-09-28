import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Shield, RefreshCw, Key, Code2 } from 'lucide-react';
import { api } from '../services/api';
import { DrunixTransaction } from '../types';

export const LedgerTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<DrunixTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<DrunixTransaction | null>(null);

  const fetchTxs = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions(30);
      setTransactions(data);
      if (data.length > 0) setSelectedTx(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Drunix Ledger Transactions</h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Cryptographic Read/Write sets, multi-organization MSP endorsements, and Stateless Validation Service records.
          </p>
        </div>
        <button
          onClick={fetchTxs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161922] border border-[#242b3d] text-xs text-[#9ca3af] hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transaction Feed */}
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Committed Transactions
            </h3>
            <span className="text-[10px] font-mono text-[#6b7280]">{transactions.length} txs</span>
          </div>

          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.tx_id}
                onClick={() => setSelectedTx(tx)}
                className={`p-3 rounded border text-xs cursor-pointer transition-colors ${
                  selectedTx?.tx_id === tx.tx_id
                    ? 'bg-[#1b2234] border-[#3b82f6] text-white'
                    : 'bg-[#11131b] border-[#1d2232] text-[#9ca3af] hover:bg-[#151924]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className="font-bold text-[#60a5fa] truncate max-w-[170px]">{tx.tx_id}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#064e3b]/50 text-[#34d399] font-bold">
                    Block #{tx.block_number}
                  </span>
                </div>
                <div className="text-[11px] text-white font-medium">{tx.function_name}</div>
                <div className="text-[10px] font-mono text-[#6b7280] mt-0.5">MSP: {tx.initiator_msp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Transaction Inspector */}
        <div className="md:col-span-2 p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c202e] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Transaction Inspector: {selectedTx?.tx_id}
              </h3>
              <span className="text-[10px] text-[#6b7280] font-mono">Channel: {selectedTx?.channel_id} | Chaincode: {selectedTx?.chaincode_name}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#064e3b]/60 text-[#34d399] text-[10px] font-mono font-bold">
              VSCC: {selectedTx?.stateless_validation_status}
            </span>
          </div>

          {selectedTx ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-[#131620] border border-[#202636]">
                  <span className="text-[#6b7280] block text-[10px]">FUNCTION INVOKED</span>
                  <span className="text-white font-bold">{selectedTx.function_name}</span>
                </div>
                <div className="p-3 rounded bg-[#131620] border border-[#202636]">
                  <span className="text-[#6b7280] block text-[10px]">INITIATING MSP</span>
                  <span className="text-white">{selectedTx.initiator_msp}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#131620] border border-[#202636] space-y-1">
                <span className="text-[#6b7280] block text-[10px]">PROPOSAL HASH</span>
                <span className="text-[#a5d6ff] break-all">{selectedTx.proposal_hash}</span>
              </div>

              {/* Endorsements */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">Multi-Organization Endorsement Signatures</span>
                <div className="space-y-1.5">
                  {selectedTx.endorsements?.map((e, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-[#11131b] border border-[#1d2232] flex items-center justify-between">
                      <div>
                        <span className="text-[#60a5fa] font-bold">{e.msp_id}</span>
                        <span className="text-[#6b7280] ml-2 text-[10px]">({e.endorser_peer})</span>
                      </div>
                      <span className="text-[#9ca3af] text-[10px] truncate max-w-[200px]">{e.signature.substring(0, 24)}...</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Read / Write Set */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">Read-Write Set (RW Set) for MVCC Validation</span>
                <pre className="p-3.5 rounded bg-[#090a0f] border border-[#171b26] text-[11px] text-[#34d399] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedTx.rw_set, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#6b7280]">Select a transaction to inspect</div>
          )}
        </div>
      </div>
    </div>
  );
};
