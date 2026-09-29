import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
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
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';
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
  const [recentEvents, setRecentEvents] = useState<Array<{ id: string; time: string; text: string; verdict: string }>>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ov, pmts] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getPayments(14)
      ]);
      setOverview(ov);
      setPayments(pmts);

      // Populate recent events from latest payments
      if (pmts && pmts.length > 0) {
        const events = pmts.slice(0, 4).map(p => {
          const t = p.created_at ? new Date(p.created_at).toLocaleTimeString('en-IN', { hour12: false }) : 'JUST NOW';
          return {
            id: p.payment_id,
            time: t,
            text: `${p.payment_id} | ₹${Number(p.amount).toLocaleString('en-IN')} | ${p.sender_id} ➔ ${p.recipient_id}`,
            verdict: p.decision
          };
        });
        setRecentEvents(events);
      }
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
    { num: "01", title: "PAYMENT INITIATED", sub: "User UPI Intent Payload" },
    { num: "02", title: "INTENT NLP", sub: "Embedding & Coercion Check" },
    { num: "03", title: "FUSION RISK", sub: "Graph + Behavior + Context" },
    { num: "04", title: "POLICY DECISION", sub: "ALLOW / VERIFY / HOLD" },
    { num: "05", title: "DRUNIX CONSENSUS", sub: "Multi-Org Raft Commit" },
    { num: "06", title: "FINAL SETTLEMENT", sub: "StateDB Immutable Finality" }
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Operational Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#181c28] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-white font-mono">
              Consortium Operations Console
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#111c33] text-[#38bdf8] border border-[#1e345e]">
              IGPS ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            Real-time intent-governed payment state telemetry and Drunix multi-organization ledger finality.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Feed Toggle */}
          <button
            onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 border transition-colors ${
              isLiveFeedActive
                ? 'bg-[#064e3b]/50 text-[#34d399] border-[#059669]/60'
                : 'bg-[#121622] text-[#8b949e] border-[#1f2638] hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveFeedActive ? 'animate-pulse text-[#10b981]' : ''}`} />
            <span>FEED: {isLiveFeedActive ? 'STREAMING' : 'PAUSED'}</span>
          </button>

          {/* Safety Rules Modal Trigger */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="px-3 py-1.5 rounded-md bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-xs font-mono text-[#c9d1d9] flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Rules</span>
          </button>

          {/* CSV Import Modal Trigger */}
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-3 py-1.5 rounded-md bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-xs font-mono text-[#c9d1d9] flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Import CSV</span>
          </button>

          {/* Live Payment Creator Trigger */}
          <button
            onClick={() => setShowLiveModal(true)}
            className="px-3.5 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-mono font-semibold text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Payment</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-md bg-[#121622] hover:bg-[#1a2030] border border-[#1f2638] text-[#8b949e] hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Event Ticker (Terminal style) */}
      <div className="bg-[#090b12] border border-[#181d2a] rounded-lg p-2.5 flex items-center gap-3 text-xs font-mono overflow-hidden">
        <div className="flex items-center gap-1.5 text-[#60a5fa] shrink-0 font-semibold text-[11px]">
          <Terminal className="w-3.5 h-3.5" />
          <span>LIVE AUDIT STREAM:</span>
        </div>
        <div className="flex-1 overflow-x-auto whitespace-nowrap flex items-center gap-4 text-[11px]">
          {recentEvents.length === 0 ? (
            <span className="text-[#6b7280]">Listening for real-time transactions...</span>
          ) : (
            recentEvents.map(ev => {
              const isAllow = ev.verdict === 'ALLOW';
              const isVerify = ev.verdict === 'VERIFY';
              return (
                <div key={ev.id} className="flex items-center gap-2 shrink-0">
                  <span className="text-[#4b5563]">[{ev.time}]</span>
                  <span className="text-[#cbd5e1]">{ev.text}</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                    isAllow ? 'bg-[#064e3b] text-[#34d399]' : (isVerify ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]')
                  }`}>
                    {ev.verdict}
                  </span>
                  <span className="text-[#2d3748]">|</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* KPI Metric Cards (Strictly Computed from SQLite Database) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-1.5">
          <div className="flex items-center justify-between text-[#8b949e] text-xs font-mono">
            <span>PROTECTED VOLUME</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            ₹{Number(overview?.protected_volume_inr || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#10b981] font-mono">
            {overview?.total_payments || 0} Total Transactions Monitored
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-1.5">
          <div className="flex items-center justify-between text-[#8b949e] text-xs font-mono">
            <span>SCAMS INTERCEPTED</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {overview?.interventions?.held || 0} Intercepted (HOLD)
          </div>
          <p className="text-[10px] text-[#ef4444] font-mono">
            ₹{Number(overview?.held_volume_inr || 0).toLocaleString('en-IN')} Harm Quarantined
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-1.5">
          <div className="flex items-center justify-between text-[#8b949e] text-xs font-mono">
            <span>STEP-UP VERIFICATIONS</span>
            <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {overview?.interventions?.verified || 0} Stepped Up
          </div>
          <p className="text-[10px] text-[#f59e0b] font-mono">
            Biometric Intent Affirmation
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-1.5">
          <div className="flex items-center justify-between text-[#8b949e] text-xs font-mono">
            <span>SFE SCORE & FINALITY</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {(overview?.sfe_efficiency_score || 3.82).toFixed(2)}x Efficiency
          </div>
          <p className="text-[10px] text-[#38bdf8] font-mono">
            Head Block #{overview?.drunix_blocks || 1} on Drunix
          </p>
        </div>
      </div>

      {/* Main Feature: Intent-Governed State Machine (IGPS) Pipeline */}
      <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#38bdf8]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Intent-Governed Payment State (IGPS) Protocol Pipeline
            </h2>
          </div>
          <span className="text-[10px] text-[#6b7280] font-mono">Drunix Consensus State Machine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {flowSteps.map((s, idx) => (
            <div
              key={s.title}
              className="p-3 rounded bg-[#101320] border border-[#1a2032] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-5 h-5 rounded bg-[#182136] text-[#38bdf8] text-[10px] font-mono font-bold flex items-center justify-center">
                  {s.num}
                </span>
                {idx < flowSteps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#374151] hidden md:block" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight font-mono">{s.title}</div>
                <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Monitored Payments Table */}
      <div className="rounded-lg bg-[#0c0e17] border border-[#1a1f2e] overflow-hidden">
        <div className="p-3.5 border-b border-[#181d2c] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Active Monitored Payments ({payments.length})
            </h3>
            <p className="text-[10px] text-[#8b949e] mt-0.5 font-mono">
              Live telemetry showing intent consistency, recipient trust, and Drunix blockchain finality.
            </p>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="flex items-center gap-1 text-xs text-[#38bdf8] hover:text-white font-mono transition-colors"
          >
            <span>Payment Monitor</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f121d] text-[10px] font-mono text-[#8b949e] uppercase border-b border-[#181d2c]">
              <tr>
                <th className="py-2.5 px-3.5">Payment ID</th>
                <th className="py-2.5 px-3.5">Sender ➔ Recipient</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5">Intent Consistency</th>
                <th className="py-2.5 px-3.5">Recipient Trust</th>
                <th className="py-2.5 px-3.5">Policy Verdict</th>
                <th className="py-2.5 px-3.5">Drunix State</th>
                <th className="py-2.5 px-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151926] font-mono text-[11px]">
              {payments.map((p) => {
                const isAllow = p.decision === 'ALLOW';
                const isVerify = p.decision === 'VERIFY';
                return (
                  <tr key={p.payment_id} className="hover:bg-[#101422] transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-white">{p.payment_id}</td>
                    <td className="py-2.5 px-3.5">
                      <div className="text-white truncate max-w-[150px]">{p.sender_id}</div>
                      <div className="text-[#8b949e] text-[10px] truncate max-w-[150px]">↳ {p.recipient_id}</div>
                    </td>
                    <td className="py-2.5 px-3.5 text-white font-bold tabular-nums">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[#171c2b] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              p.intent_consistency < 0.4
                                ? 'bg-[#ef4444]'
                                : (p.intent_consistency < 0.7 ? 'bg-[#f59e0b]' : 'bg-[#10b981]')
                            }`}
                            style={{ width: `${(p.intent_consistency || 0) * 100}%` }}
                          />
                        </div>
                        <span className={`font-bold tabular-nums ${
                          p.intent_consistency < 0.4
                            ? 'text-[#ef4444]'
                            : (p.intent_consistency < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                        }`}>
                          {((p.intent_consistency || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[#171c2b] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              p.recipient_trust < 0.3
                                ? 'bg-[#ef4444]'
                                : (p.recipient_trust < 0.7 ? 'bg-[#f59e0b]' : 'bg-[#10b981]')
                            }`}
                            style={{ width: `${(p.recipient_trust || 0) * 100}%` }}
                          />
                        </div>
                        <span className={`font-bold tabular-nums ${
                          p.recipient_trust < 0.3
                            ? 'text-[#ef4444]'
                            : (p.recipient_trust < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                        }`}>
                          {((p.recipient_trust || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        isAllow
                          ? 'bg-[#064e3b] text-[#34d399]'
                          : (isVerify ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]')
                      }`}>
                        {p.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="text-[#93c5fd]">
                        Block #{p.drunix_block_number || 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => navigate(`/payments/${p.payment_id}`)}
                        className="p-1 rounded hover:bg-[#1a2134] text-[#8b949e] hover:text-[#38bdf8] transition-colors"
                        title="Inspect Payment Details"
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
