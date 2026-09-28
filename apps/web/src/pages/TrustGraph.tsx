import React, { useState } from 'react';
import { Network, ShieldAlert, User, Store, AlertOctagon, CheckCircle2, Search } from 'lucide-react';

export const TrustGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>({
    id: 'REC_00010',
    name: 'Mule Layering Hub #10',
    type: 'MULE_HUB',
    trustScore: 0.12,
    centrality: 0.88,
    degree: 28,
    clusterScore: 0.95,
    status: 'FLAGGED_MULE_COMMUNITY'
  });

  const sampleNodes = [
    { id: 'USR_00012', label: 'User #12 (Aarav)', type: 'USER', trust: 0.92, risk: 'LOW', x: 120, y: 150 },
    { id: 'MERCH_0001', label: 'Swiggy Foods', type: 'MERCHANT', trust: 0.98, risk: 'LOW', x: 300, y: 90 },
    { id: 'REC_00160', label: 'Arjun (Friend)', type: 'RECIPIENT', trust: 0.88, risk: 'LOW', x: 280, y: 220 },
    { id: 'REC_00010', label: 'Mule Hub #10', type: 'MULE_HUB', trust: 0.12, risk: 'HIGH', x: 480, y: 180 },
    { id: 'REC_00011', label: 'Mule Layer #1', type: 'MULE_SUB', trust: 0.10, risk: 'HIGH', x: 620, y: 120 },
    { id: 'REC_00012', label: 'Mule Layer #2', type: 'MULE_SUB', trust: 0.08, risk: 'HIGH', x: 640, y: 240 },
    { id: 'DEV_00012', label: 'Device iPhone-15', type: 'DEVICE', trust: 0.95, risk: 'LOW', x: 80, y: 260 },
  ];

  const sampleEdges = [
    { from: 'USR_00012', to: 'MERCH_0001', label: 'PAID (14 tx)', type: 'NORMAL' },
    { from: 'USR_00012', to: 'REC_00160', label: 'PAID (4 tx)', type: 'NORMAL' },
    { from: 'USR_00012', to: 'DEV_00012', label: 'USES', type: 'NORMAL' },
    { from: 'REC_00160', to: 'REC_00010', label: 'FAN-IN (Suspicious)', type: 'SUSPICIOUS' },
    { from: 'REC_00010', to: 'REC_00011', label: 'TRANSFERRED (Rapid)', type: 'MULE' },
    { from: 'REC_00010', to: 'REC_00012', label: 'TRANSFERRED (Rapid)', type: 'MULE' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#3b82f6]" />
            <h2 className="text-xl font-bold tracking-tight text-white">Recipient Relationship & Trust Graph</h2>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Multi-relational graph topology tracking counterparty trust, betweenness centrality, and mule cluster proximity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Interactive Canvas View */}
        <div className="md:col-span-2 p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Ego-Network Visualization
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#34d399]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                Trusted Entity
              </span>
              <span className="flex items-center gap-1 text-[#f87171]">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                Mule Network Cluster
              </span>
            </div>
          </div>

          {/* SVG Graph Visualizer */}
          <div className="h-[420px] rounded-lg bg-[#090a0f] border border-[#171b26] relative overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full">
              {/* Edges */}
              <line x1="120" y1="150" x2="300" y2="90" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="120" y1="150" x2="280" y2="220" stroke="#2563eb" strokeWidth="2" />
              <line x1="120" y1="150" x2="80" y2="260" stroke="#4b5563" strokeWidth="1.5" />
              <line x1="280" y1="220" x2="480" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="480" y1="180" x2="620" y2="120" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="480" y1="180" x2="640" y2="240" stroke="#ef4444" strokeWidth="2.5" />

              {/* Edge labels */}
              <text x="360" y="190" fill="#f59e0b" fontSize="10" fontFamily="monospace">Unusual Fan-In</text>
              <text x="530" y="140" fill="#ef4444" fontSize="10" fontFamily="monospace">Rapid Pass-Through</text>

              {/* Nodes */}
              {sampleNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                const isHighRisk = n.risk === 'HIGH';
                return (
                  <g
                    key={n.id}
                    onClick={() => setSelectedNode({
                      id: n.id,
                      name: n.label,
                      type: n.type,
                      trustScore: n.trust,
                      centrality: isHighRisk ? 0.88 : 0.24,
                      degree: isHighRisk ? 28 : 4,
                      clusterScore: isHighRisk ? 0.95 : 0.05,
                      status: isHighRisk ? 'FLAGGED_MULE_COMMUNITY' : 'VERIFIED_TRUSTED'
                    })}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isSelected ? "18" : "14"}
                      fill={isHighRisk ? "#7f1d1d" : "#1e3a8a"}
                      stroke={isSelected ? "#60a5fa" : (isHighRisk ? "#ef4444" : "#3b82f6")}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                    <text
                      x={n.x}
                      y={n.y + 26}
                      fill="#e6edf3"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Inspection Panel */}
        <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Node Intelligence Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#131620] border border-[#202636] space-y-1.5">
                <span className="text-[10px] text-[#6b7280]">SELECTED ENTITY</span>
                <div className="text-sm font-bold text-white">{selectedNode.name}</div>
                <div className="text-[10px] text-[#60a5fa]">{selectedNode.id} ({selectedNode.type})</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                  <span className="text-[#6b7280] block text-[10px]">TRUST SCORE</span>
                  <span className="text-white font-bold">{((selectedNode.trustScore || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                  <span className="text-[#6b7280] block text-[10px]">DEGREE CENTRALITY</span>
                  <span className="text-[#60a5fa] font-bold">{selectedNode.centrality}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">MULE CLUSTER PROXIMITY</span>
                <span className={`font-bold ${selectedNode.clusterScore > 0.5 ? 'text-[#f87171]' : 'text-[#34d399]'}`}>
                  {((selectedNode.clusterScore || 0) * 100).toFixed(0)}% PROXIMITY
                </span>
              </div>

              <div className="p-3 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">COMMUNITY STATUS</span>
                <span className={`text-[11px] font-bold ${selectedNode.status.includes('FLAGGED') ? 'text-[#f87171]' : 'text-[#34d399]'}`}>
                  {selectedNode.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#6b7280]">Click a node to inspect</div>
          )}
        </div>
      </div>
    </div>
  );
};
