import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  RefreshCw,
  Plus,
  Play
} from 'lucide-react';
import { api } from '../services/api';

interface PolicyRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyRulesModal: React.FC<PolicyRulesModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Test sandbox state
  const [testText, setTestText] = useState("CBI officer calling regarding customs courier parcel arrest warrant");
  const [testAmount, setTestAmount] = useState<number>(35000);
  const [testVerdict, setTestVerdict] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await api.getPolicyRules();
      setRules(data);
    } catch (err) {
      console.error("Failed to fetch rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  const handleToggle = async (ruleId: string) => {
    try {
      setTogglingId(ruleId);
      const res = await api.togglePolicyRule(ruleId);
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: res.enabled } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const runRuleTest = () => {
    const lower = testText.toLowerCase();
    const hasPoliceKeywords = ["police", "customs", "cbi", "arrest", "narcotics"].some(k => lower.includes(k));
    const isRule1Enabled = rules.find(r => r.id === "RULE-01")?.enabled;

    if (isRule1Enabled && hasPoliceKeywords && testAmount > 10000) {
      setTestVerdict("TRIGGERED: RULE-01 (HOLD - 4-Hour Time Lock & Co-Signer Intercept)");
    } else if (testAmount > 100000) {
      setTestVerdict("TRIGGERED: High Value Verification (VERIFY - Biometric Confirmation)");
    } else {
      setTestVerdict("PASSED: No active intercept rule triggered (ALLOW - Direct Settlement)");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c0e17] border border-[#1e2336] rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b2030] flex items-center justify-between bg-[#0e111c]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#a855f7]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Intent Policy & Safety Rules Sandbox
              </h3>
              <p className="text-xs text-[#8b949e]">
                Configure real-time threshold rules enforced on-chain by VERA and Drunix DLT
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Active Governance Rules ({rules.length})
              </span>
              <button
                onClick={fetchRules}
                className="text-[11px] font-mono text-[#60a5fa] flex items-center gap-1 hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border transition-all ${
                    rule.enabled
                      ? 'bg-[#101322] border-[#22293e]'
                      : 'bg-[#0d0f18] border-[#181c28] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{rule.id}</span>
                        <span className="text-xs font-semibold text-[#e2e8f0]">{rule.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          rule.severity === 'CRITICAL'
                            ? 'bg-[#7f1d1d] text-[#f87171]'
                            : 'bg-[#78350f] text-[#fbbf24]'
                        }`}>
                          {rule.severity}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          rule.action === 'HOLD'
                            ? 'bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/40'
                            : 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40'
                        }`}>
                          ACTION: {rule.action}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(rule.id)}
                      disabled={togglingId === rule.id}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        rule.enabled ? 'bg-[#3b82f6]' : 'bg-[#222738]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Tester Box */}
          <div className="p-4 rounded-lg bg-[#111422] border border-[#1d2334] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Test Live Rule Engine Against Narrative</span>
              </span>
              <span className="text-[10px] font-mono text-[#8b949e]">Rule Simulator Sandbox</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8">
                <input
                  type="text"
                  value={testText}
                  onChange={e => setTestText(e.target.value)}
                  placeholder="Enter stated intent narrative to test..."
                  className="w-full px-3 py-2 rounded-md bg-[#141828] border border-[#232b40] text-xs text-white focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  value={testAmount}
                  onChange={e => setTestAmount(Number(e.target.value))}
                  placeholder="Amount ₹"
                  className="w-full px-3 py-2 rounded-md bg-[#141828] border border-[#232b40] text-xs text-white font-mono focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={runRuleTest}
                  className="w-full py-2 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Evaluate</span>
                </button>
              </div>
            </div>

            {testVerdict && (
              <div className={`p-3 rounded-md text-xs font-mono flex items-center gap-2 ${
                testVerdict.startsWith('TRIGGERED: RULE-01')
                  ? 'bg-[#7f1d1d]/30 text-[#f87171] border border-[#7f1d1d]'
                  : (testVerdict.startsWith('TRIGGERED')
                      ? 'bg-[#78350f]/30 text-[#fbbf24] border border-[#78350f]'
                      : 'bg-[#064e3b]/30 text-[#34d399] border border-[#064e3b]')
              }`}>
                <Shield className="w-4 h-4 shrink-0" />
                <span>{testVerdict}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
