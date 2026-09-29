import React, { useState, useEffect } from 'react';
import { Blocks, Database, Shield, Server, CheckCircle2, RefreshCw, Hash, Clock, FileText } from 'lucide-react';
import { api } from '../services/api';
import { DrunixBlock, NetworkHealth } from '../types';

interface DrunixExplorerProps {
  navigate: (route: string) => void;
}

export const DrunixExplorer: React.FC<DrunixExplorerProps> = ({ navigate }) => {
  const [network, setNetwork] = useState<NetworkHealth | null>(null);
  const [blocks, setBlocks] = useState<DrunixBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<DrunixBlock | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [net, blks] = await Promise.all([
        api.getNetworkHealth(),
        api.getBlocks(20)
      ]);
      setNetwork(net);
      setBlocks(blks);
      if (blks.length > 0) setSelectedBlock(blks[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#181c28] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white font-mono">Drunix Distributed Ledger Explorer</h2>
            <span className="px-2 py-0.5 rounded bg-[#101928] border border-[#1e345e] text-[#38bdf8] font-mono text-[10px] font-bold">
              {network?.mode === 'REAL' ? 'PRODUCTION NETWORK' : 'CONSORTIUM SIMULATOR'}
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            Permissioned settlement ledger with peer endorsement, stateless validation, and relational StateDB.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161922] border border-[#242b3d] text-xs text-[#9ca3af] hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Network Health Grid (Drunix Core Topology) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-1">
          <div className="text-[10px] text-[#6b7280] font-mono">LEDGER BLOCK HEIGHT</div>
          <div className="text-xl font-bold text-white font-mono">#{network?.block_height || 0}</div>
          <p className="text-[10px] text-[#34d399] font-mono">Immutable cryptographic chain</p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-1">
          <div className="text-[10px] text-[#6b7280] font-mono">TOTAL TRANSACTIONS</div>
          <div className="text-xl font-bold text-white font-mono">{network?.total_transactions || 0}</div>
          <p className="text-[10px] text-[#60a5fa] font-mono">100% policy-governed finality</p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-1">
          <div className="text-[10px] text-[#6b7280] font-mono">TRANSIENT PRIVATE DATA</div>
          <div className="text-xl font-bold text-white font-mono">{network?.transient_private_records || 0}</div>
          <p className="text-[10px] text-[#f59e0b] font-mono">KeyDB zero on-chain leakage</p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-1">
          <div className="text-[10px] text-[#6b7280] font-mono">ORDERER CONSENSUS</div>
          <div className="text-xl font-bold text-white font-mono">Raft Leader</div>
          <p className="text-[10px] text-[#34d399] font-mono">Port 7050 Active</p>
        </div>
      </div>

      {/* Segregated Peer Architecture Status */}
      <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Segregated Peer Topology & Participating Organizations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Organizations */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#6b7280] font-mono uppercase">Membership Service Providers (MSPs)</span>
            <div className="space-y-1.5">
              {network?.organizations.map((org) => (
                <div key={org.msp} className="p-2.5 rounded bg-[#131620] border border-[#202636] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{org.name}</div>
                    <div className="text-[10px] text-[#6b7280] font-mono">{org.msp}</div>
                  </div>
                  <span className="text-[10px] font-mono text-[#60a5fa]">{org.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decoupled Microservices */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#6b7280] font-mono uppercase">Drunix Core Microservices</span>
            <div className="space-y-1.5">
              {network?.components.map((comp) => (
                <div key={comp.name} className="p-2 rounded bg-[#131620] border border-[#202636] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-medium">{comp.name}</span>
                    <span className="text-[10px] text-[#6b7280] font-mono ml-2">Port {comp.port}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    <span>{comp.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block Stream & Detail Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Block List */}
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Recent Blocks
            </h3>
            <span className="text-[10px] font-mono text-[#6b7280]">{blocks.length} blocks</span>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {blocks.map((b) => (
              <div
                key={b.block_number}
                onClick={() => setSelectedBlock(b)}
                className={`p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                  selectedBlock?.block_number === b.block_number
                    ? 'bg-[#1b2234] border-[#3b82f6] text-white'
                    : 'bg-[#11131b] border-[#1d2232] text-[#9ca3af] hover:bg-[#151924]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className="font-bold text-white">Block #{b.block_number}</span>
                  <span className="text-[10px] text-[#60a5fa]">{b.tx_count} tx</span>
                </div>
                <div className="text-[10px] font-mono text-[#6b7280] truncate">
                  Hash: {b.current_block_hash.substring(0, 20)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Block Inspector */}
        <div className="md:col-span-2 p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Block #{selectedBlock?.block_number} Inspection
          </h3>

          {selectedBlock ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#131620] border border-[#202636] space-y-2">
                <div>
                  <span className="text-[#6b7280] block text-[10px]">CURRENT BLOCK HASH</span>
                  <span className="text-[#a5d6ff] break-all">{selectedBlock.current_block_hash}</span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[10px]">PREVIOUS BLOCK HASH</span>
                  <span className="text-[#9ca3af] break-all">{selectedBlock.previous_block_hash}</span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[10px]">MERKLE ROOT</span>
                  <span className="text-[#9ca3af] break-all">{selectedBlock.merkle_root}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded bg-[#131620] border border-[#202636]">
                  <span className="text-[#6b7280] block text-[10px]">ORDERER IDENTITY</span>
                  <span className="text-white text-[11px]">{selectedBlock.orderer_identity}</span>
                </div>
                <div className="p-3 rounded bg-[#131620] border border-[#202636]">
                  <span className="text-[#6b7280] block text-[10px]">TIMESTAMP</span>
                  <span className="text-white text-[11px]">{new Date(selectedBlock.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[#6b7280] block text-[10px] mb-1">TRANSACTIONS IN BLOCK ({selectedBlock.transactions?.length || 0})</span>
                <div className="space-y-2">
                  {selectedBlock.transactions?.map((tx) => (
                    <div key={tx.tx_id} className="p-3 rounded bg-[#11131b] border border-[#1d2232] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#60a5fa]">{tx.tx_id}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#064e3b]/50 text-[#34d399] text-[9px] font-bold">
                          {tx.commit_status}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9ca3af]">Function: <strong className="text-white">{tx.function_name}</strong></div>
                      <div className="text-[10px] text-[#6b7280]">Initiator: {tx.initiator_msp} | Validated by VSCC</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[#6b7280]">Select a block to inspect</div>
          )}
        </div>
      </div>
    </div>
  );
};
