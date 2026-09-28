import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowRight,
  PhoneCall,
  Cast,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import GradientText from './GradientText';

interface LivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated: () => void;
}

const PRESETS = [
  {
    title: "Customs Courier Scam",
    desc: "Impersonating airport customs demanding payment to clear seized package",
    sender: "rahul.sharma@okhdfcbank",
    recipient: "customs-clearance-dept@ybl",
    amount: 48500,
    category: "courier_customs_fine",
    intent: "Urgent fee payment demanded by customs officer to release international courier parcel and avoid immediate FIR",
    isCallActive: true,
    isScreenSharing: false,
    threatLevel: "CRITICAL"
  },
  {
    title: "Digital Arrest (CBI/Police)",
    desc: "Coerced into transferring funds during high-pressure fake police video interrogation",
    sender: "priya.nair@icici",
    recipient: "mule-escrow-reserve@paytm",
    amount: 150000,
    category: "legal_security_deposit",
    intent: "Official verification deposit to CBI anti-narcotics division to secure provisional clearance from digital arrest",
    isCallActive: true,
    isScreenSharing: true,
    threatLevel: "CRITICAL"
  },
  {
    title: "Electricity Disconnection Phishing",
    desc: "Fake SMS warning power cutoff tonight unless immediate arrears paid",
    sender: "amit.kumar@sbi",
    recipient: "bses-quick-support@okaxis",
    amount: 12450,
    category: "utility_bill",
    intent: "Immediate settlement of electricity bill arrears to prevent power disconnect at 9 PM tonight",
    isCallActive: false,
    isScreenSharing: false,
    threatLevel: "HIGH"
  },
  {
    title: "Verified Merchant (Blinkit Grocery)",
    desc: "Normal routine e-commerce grocery purchase",
    sender: "rahul.sharma@okhdfcbank",
    recipient: "blinkit-commerce@axisbank",
    amount: 680,
    category: "groceries",
    intent: "Payment for morning fresh vegetables and dairy grocery order #BK-99120",
    isCallActive: false,
    isScreenSharing: false,
    threatLevel: "SAFE"
  },
  {
    title: "Monthly Apartment Rent",
    desc: "Established regular transfer to verified landlord",
    sender: "priya.nair@icici",
    recipient: "landlord.rajesh@hdfcbank",
    amount: 28000,
    category: "rent",
    intent: "Monthly house rent for October 2026 for flat 402 Palm Heights",
    isCallActive: false,
    isScreenSharing: false,
    threatLevel: "SAFE"
  }
];

const COERCIVE_KEYWORDS = [
  "customs", "police", "arrest", "cbi", "narcotics", "urgent", "fir", "fine",
  "disconnect", "officer", "warrant", "seized", "freeze", "immediately", "court",
  "tax penalty", "clearance"
];

export const LivePaymentModal: React.FC<LivePaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentCreated
}) => {
  const [senderId, setSenderId] = useState("user.test@okhdfcbank");
  const [recipientId, setRecipientId] = useState("customs-clearance-dept@ybl");
  const [amount, setAmount] = useState<number>(45000);
  const [category, setCategory] = useState("p2p_transfer");
  const [statedIntent, setStatedIntent] = useState(
    "Urgent fine payment demanded by customs officer to release international parcel and avoid police FIR"
  );
  const [isCallActive, setIsCallActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Real-time analysis state
  const [liveIntentScore, setLiveIntentScore] = useState<number | null>(null);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Real-time keyword scanning
  useEffect(() => {
    const lower = statedIntent.toLowerCase();
    const matches = COERCIVE_KEYWORDS.filter(kw => lower.includes(kw));
    setDetectedKeywords(matches);

    const timer = setTimeout(() => {
      if (statedIntent.trim().length > 5) {
        setAnalyzing(true);
        api.analyzeIntent({
          stated_intent: statedIntent,
          amount: amount,
          recipient_name: recipientId,
          category: category
        })
          .then(res => {
            setLiveIntentScore(res.intent_consistency);
          })
          .catch(() => {})
          .finally(() => setAnalyzing(false));
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [statedIntent, amount, recipientId, category]);

  const loadPreset = (p: typeof PRESETS[0]) => {
    setSenderId(p.sender);
    setRecipientId(p.recipient);
    setAmount(p.amount);
    setCategory(p.category);
    setStatedIntent(p.intent);
    setIsCallActive(p.isCallActive);
    setIsScreenSharing(p.isScreenSharing);
    setExecutionResult(null);
    setExecutionStep(0);
  };

  const handleExecutePayment = async () => {
    setExecuting(true);
    setExecutionResult(null);
    setExecutionStep(1);

    try {
      await new Promise(r => setTimeout(r, 450));
      setExecutionStep(2);

      await new Promise(r => setTimeout(r, 450));
      setExecutionStep(3);

      await new Promise(r => setTimeout(r, 400));
      setExecutionStep(4);

      const res = await api.createPayment({
        sender_id: senderId,
        recipient_id: recipientId,
        amount: Number(amount),
        stated_intent: statedIntent,
        category: category,
        device_id: isScreenSharing ? "DEV_SUSPECT_MIRROR_01" : "DEV_ANDROID_PIXEL",
        location: isCallActive ? "Call Active (Unknown Remote CID)" : "Mumbai, IN"
      });

      setExecutionStep(5);
      setExecutionResult(res);
      onPaymentCreated();
    } catch (err: any) {
      console.error(err);
      alert("Error dispatching payment: " + (err.message || "Network error"));
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c0e17] border border-[#1e2336] rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b2030] flex items-center justify-between bg-[#0e111c]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 border border-[#3b82f6]/40 flex items-center justify-center text-[#60a5fa]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Interactive Live Intent Terminal</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e2538] text-[#93c5fd] border border-[#2b354f]">
                  LIVE IGPS PIPELINE
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Execute real transactions against the multi-modal intent engine and mine Drunix ledger blocks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#1a1f2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Strip */}
        <div className="px-6 py-2.5 bg-[#101322] border-b border-[#1b2030] overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider shrink-0 mr-1">
            Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap bg-[#161a29] hover:bg-[#1f263d] text-[#c9d1d9] border border-[#23293d] transition-colors flex items-center gap-1.5"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                p.threatLevel === 'CRITICAL' ? 'bg-[#ef4444]' : (p.threatLevel === 'HIGH' ? 'bg-[#f59e0b]' : 'bg-[#10b981]')
              }`} />
              <span>{p.title}</span>
            </button>
          ))}
        </div>

        {/* Body Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Form: Inputs */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">
                  SENDER UPI VPA
                </label>
                <input
                  type="text"
                  value={senderId}
                  onChange={e => setSenderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#131622] border border-[#22283a] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">
                  RECIPIENT BENEFICIARY VPA
                </label>
                <input
                  type="text"
                  value={recipientId}
                  onChange={e => setRecipientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#131622] border border-[#22283a] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">
                  AMOUNT (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-[#6b7280] font-mono">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-md bg-[#131622] border border-[#22283a] text-xs text-white font-mono font-bold focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8b949e] mb-1">
                  STATED CATEGORY
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#131622] border border-[#22283a] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            {/* Natural Language Intent Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-[#8b949e] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#60a5fa]" />
                  <span>NATURAL LANGUAGE STATED INTENT</span>
                </label>
                {analyzing && <span className="text-[10px] text-[#60a5fa] animate-pulse">Analyzing embeddings...</span>}
              </div>
              <textarea
                rows={3}
                value={statedIntent}
                onChange={e => setStatedIntent(e.target.value)}
                placeholder="Describe what the payment is for or paste suspicious message..."
                className="w-full px-3 py-2.5 rounded-md bg-[#131622] border border-[#22283a] text-xs text-white focus:outline-none focus:border-[#3b82f6] leading-relaxed"
              />
              {detectedKeywords.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#ef4444] font-semibold font-mono">COERCION TOKENS:</span>
                  {detectedKeywords.map(kw => (
                    <span
                      key={kw}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hardware / Context Telemetry Toggles */}
            <div className="p-3 rounded-lg bg-[#111420] border border-[#1e2336] space-y-2">
              <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">
                Context Signals
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#c9d1d9]">
                  <PhoneCall className={`w-3.5 h-3.5 ${isCallActive ? 'text-[#f59e0b]' : 'text-[#6b7280]'}`} />
                  <span>Active Voice Call with Unknown Caller</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCallActive(!isCallActive)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    isCallActive ? 'bg-[#f59e0b]' : 'bg-[#222738]'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      isCallActive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#c9d1d9]">
                  <Cast className={`w-3.5 h-3.5 ${isScreenSharing ? 'text-[#ef4444]' : 'text-[#6b7280]'}`} />
                  <span>Screen Mirroring / Remote Desktop (AnyDesk / TeamViewer)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    isScreenSharing ? 'bg-[#ef4444]' : 'bg-[#222738]'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      isScreenSharing ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Execution Trigger */}
            <button
              onClick={handleExecutePayment}
              disabled={executing || !statedIntent.trim()}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] disabled:opacity-50 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all"
            >
              {executing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Drunix IGPS Consensus...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Intent-Governed Payment</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Live Pipeline & Drunix State Output */}
          <div className="md:col-span-5 bg-[#101322] border border-[#1b2030] rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1b2030] pb-2 mb-3">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live IGPS Telemetry
                </span>
                <span className="text-[10px] font-mono text-[#10b981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  DRUNIX READY
                </span>
              </div>

              {/* Real-time gauge */}
              <div className="p-3 rounded-md bg-[#141829] border border-[#22293e] mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Live Intent Consistency:</span>
                  <span className={`font-mono font-bold ${
                    (liveIntentScore ?? 1) < 0.4 ? 'text-[#ef4444]' : ((liveIntentScore ?? 1) < 0.7 ? 'text-[#f59e0b]' : 'text-[#10b981]')
                  }`}>
                    {liveIntentScore !== null ? `${(liveIntentScore * 100).toFixed(1)}%` : '--'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1f263d] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (liveIntentScore ?? 1) < 0.4 ? 'bg-[#ef4444]' : ((liveIntentScore ?? 1) < 0.7 ? 'bg-[#f59e0b]' : 'bg-[#10b981]')
                    }`}
                    style={{ width: `${(liveIntentScore ?? 0.8) * 100}%` }}
                  />
                </div>
              </div>

              {/* Execution Progress Steps */}
              <div className="space-y-2">
                {[
                  { id: 1, label: "Intent NLP & Named Entity Resolution" },
                  { id: 2, label: "Graph Ego-Network & Mule Closeness" },
                  { id: 3, label: "Behavioral & Context Risk Fusion" },
                  { id: 4, label: "Drunix Multi-Org Consensus Endorsement" },
                  { id: 5, label: "Policy Verdict & Ledger Finality" }
                ].map(step => {
                  const isDone = executionStep >= step.id;
                  const isCurrent = executionStep === step.id && executing;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2.5 text-xs p-2 rounded transition-colors ${
                        isDone ? 'bg-[#131929] text-[#60a5fa]' : 'text-[#4b5563]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#374151] shrink-0" />
                      )}
                      <span className={`text-[11px] font-mono ${isDone ? 'text-white' : ''}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution Result Box */}
            {executionResult && (
              <div className="mt-4 p-3 rounded-lg border bg-[#0d101a] space-y-2 border-[#1e2538]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8b949e]">POLICY VERDICT:</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    executionResult.decision === 'ALLOW'
                      ? 'bg-[#064e3b] text-[#34d399]'
                      : (executionResult.decision === 'VERIFY'
                          ? 'bg-[#78350f] text-[#fbbf24]'
                          : 'bg-[#7f1d1d] text-[#f87171]')
                  }`}>
                    {executionResult.decision}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#c9d1d9] space-y-1">
                  <div>Payment ID: <strong className="text-white">{executionResult.payment_id}</strong></div>
                  <div>Drunix Block: <strong className="text-[#60a5fa]">#{executionResult.drunix_block_number}</strong></div>
                  <div className="truncate text-[#6b7280]">Tx Hash: {executionResult.drunix_tx_id}</div>
                </div>
                {executionResult.explanation && (
                  <p className="text-[10px] text-[#9ca3af] bg-[#121624] p-2 rounded border border-[#1c2234] leading-relaxed">
                    {executionResult.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
