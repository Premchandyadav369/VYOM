import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  ShieldAlert,
  User,
  Store,
  AlertOctagon,
  CheckCircle2,
  Search,
  Plus,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk_tier: string;
  is_mule: boolean;
  trust_score: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  volume: number;
}

export const TrustGraph: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Zoom and pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Injection form state
  const [showInjectDrawer, setShowInjectDrawer] = useState<boolean>(false);
  const [injectSource, setInjectSource] = useState<string>('usr.new@okhdfcbank');
  const [injectTarget, setInjectTarget] = useState<string>('mule.escrow.hub@ybl');
  const [injectAmount, setInjectAmount] = useState<number>(75000);
  const [injectIsMule, setInjectIsMule] = useState<boolean>(true);
  const [injecting, setInjecting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const data = await api.getFullGraph();
      const rawNodes = data.nodes || [];
      const rawLinks = data.links || [];

      // Compute initial circular/grid layout for nodes
      const radius = 220;
      const centerX = 380;
      const centerY = 260;
      const total = rawNodes.length;

      const positionedNodes: GraphNode[] = rawNodes.map((n: any, idx: number) => {
        const angle = (idx / total) * 2 * Math.PI;
        const dist = n.is_mule ? radius * 1.15 : (n.type === 'merchant' ? radius * 0.45 : radius * 0.85);
        return {
          ...n,
          x: centerX + dist * Math.cos(angle) + (Math.random() * 30 - 15),
          y: centerY + dist * Math.sin(angle) + (Math.random() * 30 - 15)
        };
      });

      setNodes(positionedNodes);
      setLinks(rawLinks);

      if (positionedNodes.length > 0 && !selectedNode) {
        inspectNode(positionedNodes.find(n => n.is_mule) || positionedNodes[0]);
      }
    } catch (err) {
      console.error('Failed to load trust graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const inspectNode = async (node: GraphNode) => {
    setSelectedNode(node);
    try {
      const profile = await api.getRecipientProfile(node.id);
      setSelectedNode((prev: any) => ({ ...prev, profile }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setInjecting(true);
    try {
      await api.injectGraphNode({
        source_id: injectSource,
        target_id: injectTarget,
        amount: injectAmount,
        is_mule: injectIsMule,
        label: injectIsMule ? "Flagged Mule Hub" : "Verified Recipient"
      });
      setShowInjectDrawer(false);
      await fetchGraphData();
    } catch (err) {
      console.error("Injection failed:", err);
    } finally {
      setInjecting(false);
    }
  };

  const filteredNodes = nodes.filter(n =>
    n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#3b82f6]" />
            <h2 className="text-xl font-bold tracking-tight text-white">Dynamic Recipient Trust & Mule Graph</h2>
          </div>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Real-time NetworkX graph topology with PageRank centrality, mule community clustering, and live injection sandbox.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowInjectDrawer(true)}
            className="px-3 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inject Node / Edge Sandbox</span>
          </button>
          <button
            onClick={fetchGraphData}
            disabled={loading}
            className="p-2 rounded-md bg-[#131622] hover:bg-[#1c2134] border border-[#22283a] text-[#8b949e] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Interactive SVG Canvas */}
        <div className="md:col-span-8 p-4 rounded-xl bg-[#0c0e17] border border-[#1e2336] flex flex-col justify-between relative overflow-hidden">
          {/* Canvas Controls Toolbar */}
          <div className="flex items-center justify-between mb-3 z-10">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#6b7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search VPA or node..."
                  className="pl-8 pr-3 py-1 rounded bg-[#131622] border border-[#22283a] text-xs text-white focus:outline-none focus:border-[#3b82f6] w-48 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#34d399]">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  Trusted Entity
                </span>
                <span className="flex items-center gap-1 text-[#60a5fa]">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  Regular Peer
                </span>
                <span className="flex items-center gap-1 text-[#f87171]">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  Mule Hub
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#131622] p-0.5 rounded border border-[#22283a]">
                <button
                  onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
                  className="p-1 text-[#8b949e] hover:text-white hover:bg-[#1a1f2e] rounded"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
                  className="p-1 text-[#8b949e] hover:text-white hover:bg-[#1a1f2e] rounded"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="p-1 text-[#8b949e] hover:text-white hover:bg-[#1a1f2e] rounded"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SVG Viewport */}
          <div
            ref={containerRef}
            className="w-full h-[520px] bg-[#090b12] rounded-lg border border-[#171b29] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={e => {
              if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
                setIsPanning(true);
                setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              }
            }}
            onMouseMove={e => {
              if (isPanning) {
                setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
              }
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
          >
            <svg className="w-full h-full">
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Render Links */}
                {links.map((link, idx) => {
                  const src = nodes.find(n => n.id === link.source);
                  const tgt = nodes.find(n => n.id === link.target);
                  if (!src || !tgt || src.x === undefined || tgt.x === undefined) return null;

                  const isMuleLink = src.is_mule || tgt.is_mule;
                  return (
                    <line
                      key={idx}
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isMuleLink ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.25)"}
                      strokeWidth={isMuleLink ? 1.8 : 1}
                      strokeDasharray={isMuleLink ? "4 3" : undefined}
                    />
                  );
                })}

                {/* Render Nodes */}
                {filteredNodes.map(node => {
                  if (node.x === undefined || node.y === undefined) return null;
                  const isSelected = selectedNode?.id === node.id;
                  const isMule = node.is_mule;
                  const fillColor = isMule ? '#ef4444' : (node.trust_score > 0.8 ? '#10b981' : '#3b82f6');

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => inspectNode(node)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse halo for active / mule */}
                      <circle
                        r={isMule ? 18 : 14}
                        fill={fillColor}
                        opacity={isMule ? 0.25 : 0.15}
                        className={isMule ? "animate-ping" : ""}
                      />
                      <circle
                        r={isSelected ? 14 : (isMule ? 11 : 9)}
                        fill="#0c0e17"
                        stroke={fillColor}
                        strokeWidth={isSelected ? 2.5 : 1.8}
                      />
                      <text
                        dy={24}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-[#9ca3af] group-hover:fill-white font-medium"
                      >
                        {node.id.split('@')[0]}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                <RefreshCw className="w-6 h-6 text-[#3b82f6] animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="md:col-span-4 p-5 rounded-xl bg-[#0c0e17] border border-[#1e2336] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Entity Inspector
              </span>
              {selectedNode && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  selectedNode.is_mule
                    ? 'bg-[#7f1d1d] text-[#f87171]'
                    : (selectedNode.trust_score > 0.8 ? 'bg-[#064e3b] text-[#34d399]' : 'bg-[#1e2538] text-[#93c5fd]')
                }`}>
                  {selectedNode.is_mule ? 'SUSPECT MULE HUB' : 'VERIFIED ENTITY'}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-bold text-white font-mono break-all">{selectedNode.id}</div>
                  <div className="text-xs text-[#8b949e] mt-0.5">{selectedNode.label || "Registered Network Node"}</div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-[#111422] border border-[#1e2336]">
                    <div className="text-[10px] font-mono text-[#8b949e]">TRUST SCORE</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">
                      {((selectedNode.trust_score || 0.5) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111422] border border-[#1e2336]">
                    <div className="text-[10px] font-mono text-[#8b949e]">BETWEENNESS</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">
                      {selectedNode.profile?.degree_velocity || 12} deg/hr
                    </div>
                  </div>
                </div>

                {/* Detailed Telemetry */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-[#191d2b]">
                    <span className="text-[#8b949e]">Mule Probability:</span>
                    <span className={`font-bold ${selectedNode.is_mule ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                      {selectedNode.is_mule ? '94.2% (Flagged Cluster)' : '4.1% (Safe)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#191d2b]">
                    <span className="text-[#8b949e]">Fan-In / Fan-Out Velocity:</span>
                    <span className="text-white font-bold">
                      {selectedNode.is_mule ? 'High Rapid Dispersal' : 'Normal Equilibrium'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#191d2b]">
                    <span className="text-[#8b949e]">Historical Association:</span>
                    <span className="text-[#c9d1d9]">
                      {selectedNode.is_mule ? 'Linked to Mule Syndicate #4' : 'Legitimate UPI Merchant / Peer'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#6b7280]">
                Select any node on the graph canvas to inspect its multi-relational risk telemetry.
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-[#101322] border border-[#1e2336] text-[11px] text-[#8b949e] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
            <span>
              Graph distances reflect multi-hop money flow velocity. Mule nodes dynamically quarantine adjacent peers on the Drunix consensus layer.
            </span>
          </div>
        </div>
      </div>

      {/* Node / Mule Edge Injection Modal */}
      {showInjectDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0e17] border border-[#1e2336] rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#3b82f6]" />
                <span>Inject Node / Edge Sandbox</span>
              </h3>
              <button onClick={() => setShowInjectDrawer(false)} className="text-[#8b949e] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInjectNode} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">SOURCE SENDER VPA</label>
                <input
                  type="text"
                  value={injectSource}
                  onChange={e => setInjectSource(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#131622] border border-[#22283a] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">TARGET BENEFICIARY VPA</label>
                <input
                  type="text"
                  value={injectTarget}
                  onChange={e => setInjectTarget(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#131622] border border-[#22283a] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">FLOW AMOUNT (₹)</label>
                <input
                  type="number"
                  value={injectAmount}
                  onChange={e => setInjectAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-[#131622] border border-[#22283a] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#111422] border border-[#1e2336]">
                <span className="text-xs text-white">Flag as Known Mule Account</span>
                <input
                  type="checkbox"
                  checked={injectIsMule}
                  onChange={e => setInjectIsMule(e.target.checked)}
                  className="w-4 h-4 accent-[#ef4444]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInjectDrawer(false)}
                  className="px-3 py-1.5 rounded bg-[#161a28] text-xs text-[#8b949e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={injecting}
                  className="px-4 py-1.5 rounded bg-[#2563eb] text-xs text-white font-semibold flex items-center gap-1.5"
                >
                  {injecting ? "Injecting..." : "Inject to Live Graph"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
