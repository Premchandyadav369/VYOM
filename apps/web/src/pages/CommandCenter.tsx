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
  ChevronRight,
  Plus,
  UploadCloud,
  Sliders,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';
import GradientText from '../components/GradientText';
import { LivePaymentModal } from '../components/LivePaymentModal';
import { CSVImportModal } from '../components/CSVImportModal';
import { PolicyRulesModal } from '../components/PolicyRulesModal';

interface CommandCenterProps {
  navigate: (route: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ navigate }) => {
  const [overview, setOverview] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Live simulation ticker state
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ov, pmts] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getPayments(12)
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
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Live UPI stream ticker simulation
  useEffect(() => {
    if (!isLiveFeedActive) return;

    const streamInterval = setInterval(async () => {
      const demoSenders = ["rohit.sharma@okaxis", "meera.iyer@sbi", "deepak.verma@okhdfcbank", "neha.patel@icici"];
      const demoRecipients = ["blinkit@axisbank", "zomato@hdfcbank", "swiggy@icici", "delhi-customs-hold@ybl"];
      const demoIntents = [
        "Daily grocery items purchase from local store",
        "Dinner meal delivery order from restaurant",
        "Monthly broadband fiber internet recharge",
        "Urgent customs clearance fee for courier package"
      ];
      const rIdx = Math.floor(Math.random() * demoSenders.length);
      const isScam = rIdx === 3;

      try {
        await api.createPayment({
          sender_id: demoSenders[rIdx],
          recipient_id: demoRecipients[rIdx],
          amount: isScam ? 42000 : Math.floor(Math.random() * 800) + 150,
          stated_intent: demoIntents[rIdx],
          category: isScam ? "courier_customs_fine" : "merchant_order"
        });
        fetchData();
      } catch (e) {
        console.error("Live feed simulation error:", e);
      }
    }, 7000);

    return () => clearInterval(streamInterval);
  }, [isLiveFeedActive]);

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
      {/* Top Header Banner & Work Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Consortium Operations Dashboard</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1e2433] border border-[#2b354f]">
              <GradientText colors={["#60a5fa", "#38bdf8", "#93c5fd", "#60a5fa"]} animationSpeed={4}>
                IGPS Active
              </GradientText>
            </span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Real-time intent-governed payment state telemetry and Drunix multi-organization ledger finality.
          </p>
        </div>

        {/* Action Buttons: Live Payment, CSV Statement Import, Rules, Live Feed */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Feed Toggle */}
          <button
            onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 border transition-colors ${
              isLiveFeedActive
                ? 'bg-[#064e3b]/50 text-[#34d399] border-[#059669]/60'
                : 'bg-[#141724] text-[#8b949e] border-[#22283a] hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveFeedActive ? 'animate-pulse text-[#10b981]' : ''}`} />
            <span>Feed: {isLiveFeedActive ? 'STREAMING' : 'PAUSED'}</span>
          </button>

          {/* Safety Rules Modal Trigger */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="px-3 py-1.5 rounded-md bg-[#161a29] hover:bg-[#1e243b] border border-[#23293e] text-xs font-medium text-[#c9d1d9] flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Safety Rules</span>
          </button>

          {/* CSV Import Modal Trigger */}
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-3 py-1.5 rounded-md bg-[#161a29] hover:bg-[#1e243b] border border-[#23293e] text-xs font-medium text-[#c9d1d9] flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Import Statement</span>
          </button>

          {/* Live Payment Creator Trigger */}
          <button
            onClick={() => setShowLiveModal(true)}
            className="px-3.5 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Intent Payment</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-md bg-[#131622] hover:bg-[#1c2134] border border-[#22283a] text-[#8b949e] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards (Computed Dynamically from SQLite Database) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1e2336] space-y-2">
          <div className="flex items-center justify-between text-[#8b949e] text-xs">
            <span>Total Protected Volume</span>
            <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            ₹{Number(overview?.protected_volume_inr || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#10b981] font-medium font-mono">
            {overview?.total_payments || 0} Total Transactions
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1e2336] space-y-2">
          <div className="flex items-center justify-between text-[#8b949e] text-xs">
            <span>Scams Intercepted (HOLD)</span>
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {overview?.interventions?.held || 0} Intercepted
          </div>
          <p className="text-[11px] text-[#ef4444] font-medium font-mono">
            ₹{Number(overview?.held_volume_inr || 0).toLocaleString('en-IN')} Harm Quarantined
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1e2336] space-y-2">
          <div className="flex items-center justify-between text-[#8b949e] text-xs">
            <span>Coercion Verifications</span>
            <Flame className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {overview?.interventions?.verified || 0} Step-Up Auth
          </div>
          <p className="text-[11px] text-[#f59e0b] font-medium font-mono">
            Biometric Intent Confirmation
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1e2336] space-y-2">
          <div className="flex items-center justify-between text-[#8b949e] text-xs">
            <span>Safety-Friction Efficiency</span>
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {(overview?.sfe_efficiency_score || 3.8).toFixed(2)}x SFE
          </div>
          <p className="text-[11px] text-[#60a5fa] font-medium font-mono">
            Block #{overview?.drunix_blocks || 1} on Drunix
          </p>
        </div>
      </div>

      {/* Main Feature: Live Payment Flow Visualization */}
      <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1e2336] space-y-4">
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
          <span className="text-[11px] text-[#6b7280] font-mono">Drunix Consensus State Machine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {flowSteps.map((s, idx) => (
            <div
              key={s.title}
              className="p-3 rounded-lg bg-[#111422] border border-[#1e2336] relative flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-5 h-5 rounded-full bg-[#1b2236] text-[#60a5fa] text-[10px] font-mono font-bold flex items-center justify-center">
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
      <div className="rounded-xl bg-[#0c0e17] border border-[#1e2336] overflow-hidden">
        <div className="p-4 border-b border-[#1b2030] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Live Monitored Payments ({payments.length})
            </h3>
            <p className="text-[11px] text-[#8b949e] mt-0.5 font-mono">
              Live telemetry showing intent consistency, mule trust scores, and Drunix blockchain finality.
            </p>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="flex items-center gap-1 text-xs text-[#60a5fa] hover:text-white font-medium transition-colors"
          >
            <span>View All Payments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101322] text-[10px] font-mono text-[#8b949e] uppercase border-b border-[#1b2030]">
              <tr>
                <th className="py-2.5 px-4">Payment ID</th>
                <th className="py-2.5 px-4">Sender / Beneficiary</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Intent Consistency</th>
                <th className="py-2.5 px-4">Recipient Trust</th>
                <th className="py-2.5 px-4">Policy Verdict</th>
                <th className="py-2.5 px-4">Drunix State</th>
                <th className="py-2.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161a29] font-mono text-[11px]">
              {payments.map((p) => {
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
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        isAllow
                          ? 'bg-[#064e3b] text-[#34d399]'
                          : (isVerify ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]')
                      }`}>
                        {p.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#93c5fd]">
                        Block #{p.drunix_block_number || 1}
                      </span>
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modals */}
      <LivePaymentModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onPaymentCreated={fetchData}
      />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImportComplete={fetchData}
      />

      <PolicyRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
};
