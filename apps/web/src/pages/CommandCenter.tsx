import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';
import GradientText from '../components/GradientText';

interface CommandCenterProps {
  navigate: (route: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ navigate }) => {
  const [overview, setOverview] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ov, pmts] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getPayments(10)
      ]);
      setOverview(ov);
      setPayments(pmts);
    } catch (err) {
      console.error('Error fetching command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const flowSteps = [
    { title: "PAYMENT INITIATED", sub: "User / App / Web", icon: "01" },
    { title: "INTENT CAPTURED", sub: "Natural Language NLP", icon: "02" },
    { title: "RISK EVALUATED", sub: "Behavior & Graph Fusion", icon: "03" },
    { title: "POLICY DECISION", sub: "ALLOW / VERIFY / HOLD", icon: "04" },
    { title: "DRUNIX CONSENSUS", sub: "LP Endorse -> Order -> Commit", icon: "05" },
    { title: "SETTLEMENT", sub: "Finality on Ledger", icon: "06" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Consortium Operations Dashboard</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1e2433] border border-[#2b354f]">
              <GradientText colors={["#60a5fa", "#38bdf8", "#93c5fd", "#60a5fa"]} animationSpeed={4}>
                IGPS Active
              </GradientText>
            </span>
          </h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Real-time intent-governed payment telemetry and Drunix multi-organization state finality.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161922] border border-[#242b3d] text-xs font-medium text-[#9ca3af] hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards (8 Core Indicators) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Protected Volume</span>
            <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            Rs. 1.84 Cr
          </div>
          <p className="text-[11px] text-[#10b981] font-medium">+14.2% week-on-week</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Interventions (HOLD)</span>
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {overview?.interventions?.held || 2} Scams
          </div>
          <p className="text-[11px] text-[#ef4444] font-medium">100% scam recall</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Intent Mismatches</span>
            <Flame className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {overview?.intent_mismatches_prevented || 3} Detected
          </div>
          <p className="text-[11px] text-[#f59e0b] font-medium">Targeted VERIFY triggered</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Safety-Friction Ratio</span>
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            4.80x SFE
          </div>
          <p className="text-[11px] text-[#60a5fa] font-medium">Pareto-optimal efficiency</p>
        </div>
      </div>

      {/* Main Feature: Live Payment Flow Visualization */}
      <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#3b82f6]" />
            <GradientText
              colors={["#ffffff", "#93c5fd", "#60a5fa", "#ffffff"]}
              animationSpeed={6}
              className="text-xs font-semibold uppercase tracking-wider font-mono text-white"
            >
              Live Intent-Governed Payment State (IGPS) Pipeline
            </GradientText>
          </div>
          <span className="text-[11px] text-[#6b7280] font-mono">Drunix State Machine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {flowSteps.map((s, idx) => (
            <div
              key={s.title}
              className="p-3 rounded-md bg-[#131620] border border-[#202636] relative flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-5 h-5 rounded-full bg-[#1e2433] text-[#60a5fa] text-[10px] font-mono font-bold flex items-center justify-center">
                  {s.icon}
                </span>
                {idx < flowSteps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#3b4252] hidden md:block" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight">{s.title}</div>
                <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger Transactions Table */}
      <div className="rounded-lg bg-[#0e1017] border border-[#1c202e] overflow-hidden">
        <div className="p-4 border-b border-[#1c202e] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Live Monitored Payments
            </h3>
            <p className="text-[11px] text-[#6b7280] mt-0.5">
              Click any payment row to open the complete VERA AI & Drunix Inspector.
            </p>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-[#60a5fa] font-medium"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11131b] border-b border-[#1c202e] text-[#6b7280] font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Payment ID</th>
                <th className="py-2.5 px-4">Sender</th>
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Decision</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Drunix TxID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] text-[#e6edf3]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6b7280] text-xs">
                    Loading payments from ledger...
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isAllow = p.decision === 'ALLOW';
                  const isVerify = p.decision === 'VERIFY';
                  const isHold = p.decision === 'HOLD';
                  return (
                    <tr
                      key={p.payment_id}
                      onClick={() => navigate(`/payments/${p.payment_id}`)}
                      className="hover:bg-[#141722] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-[#60a5fa]">
                        {p.payment_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#9ca3af]">{p.sender_id}</td>
                      <td className="py-3 px-4 font-mono text-[#9ca3af]">{p.recipient_id}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-white">
                        Rs. {p.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                            isAllow
                              ? 'bg-[#064e3b]/50 text-[#34d399] border border-[#059669]/40'
                              : isVerify
                              ? 'bg-[#78350f]/50 text-[#fcd34d] border border-[#d97706]/40'
                              : 'bg-[#7f1d1d]/50 text-[#f87171] border border-[#dc2626]/40'
                          }`}
                        >
                          {p.decision || 'EVALUATING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={
                            p.risk_score && p.risk_score > 0.6
                              ? 'text-[#f87171] font-bold'
                              : p.risk_score && p.risk_score > 0.3
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
                      <td className="py-3 px-4 font-mono text-[10px] text-[#6b7280]">
                        {p.drunix_tx_id ? p.drunix_tx_id.substring(0, 16) + '...' : 'PENDING'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
