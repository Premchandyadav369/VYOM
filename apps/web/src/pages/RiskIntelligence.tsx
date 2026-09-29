import React, { useState } from 'react';
import { Sliders, Cpu, Activity, ShieldCheck, Zap } from 'lucide-react';

export const RiskIntelligence: React.FC = () => {
  const [wIntent, setWIntent] = useState(28);
  const [wBehavior, setWBehavior] = useState(22);
  const [wRecipient, setWRecipient] = useState(20);
  const [wNetwork, setWNetwork] = useState(15);
  const [wContext, setWContext] = useState(15);

  const total = wIntent + wBehavior + wRecipient + wNetwork + wContext;

  return (
    <div className="space-y-6">
      <div className="border-b border-[#181c28] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-lg font-bold tracking-tight text-white font-mono">Risk Scoring Model & Feature Weights</h2>
        </div>
        <p className="text-xs text-[#8b949e] mt-1 font-mono">
          Adjustable risk weights across intent analysis, spending patterns, recipient trust, and mule account networks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sliders Box */}
        <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-4">
          <div className="flex items-center justify-between border-b border-[#181d2c] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Signal Weight Allocation
            </h3>
            <span className={`text-xs font-mono font-bold ${total === 100 ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
              Total: {total}% {total !== 100 && '(Must equal 100%)'}
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8b949e]">Payment Intent Mismatch</span>
                <span className="text-white font-bold">{wIntent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wIntent}
                onChange={(e) => setWIntent(parseInt(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8b949e]">Behavioral Outlier (Amount & Velocity)</span>
                <span className="text-white font-bold">{wBehavior}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wBehavior}
                onChange={(e) => setWBehavior(parseInt(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8b949e]">Beneficiary Trust & History</span>
                <span className="text-white font-bold">{wRecipient}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wRecipient}
                onChange={(e) => setWRecipient(parseInt(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8b949e]">Mule Account Cluster Proximity</span>
                <span className="text-white font-bold">{wNetwork}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wNetwork}
                onChange={(e) => setWNetwork(parseInt(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8b949e]">Device & Geolocation Risk</span>
                <span className="text-white font-bold">{wContext}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wContext}
                onChange={(e) => setWContext(parseInt(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
            </div>
          </div>
        </div>

        {/* Explainability / Formula Box */}
        <div className="p-4 rounded-lg bg-[#0c0e17] border border-[#1a1f2e] space-y-4 font-mono">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Risk Formula Calculation
          </h3>

          <div className="p-3.5 rounded bg-[#101320] border border-[#1a2032] text-xs text-[#93c5fd] space-y-1.5">
            <div className="text-[#cbd5e1] font-bold">Transaction Risk Score (R) =</div>
            <div className="pl-4 text-white">
              {(wIntent / 100).toFixed(2)} × (1 - IntentConsistency)
            </div>
            <div className="pl-4 text-white">
              + {(wBehavior / 100).toFixed(2)} × BehaviorDeviation
            </div>
            <div className="pl-4 text-white">
              + {(wRecipient / 100).toFixed(2)} × (1 - RecipientTrust)
            </div>
            <div className="pl-4 text-white">
              + {(wNetwork / 100).toFixed(2)} × MuleRisk
            </div>
            <div className="pl-4 text-white">
              + {(wContext / 100).toFixed(2)} × ContextRisk
            </div>
          </div>

          <div className="p-3 rounded bg-[#101320] border border-[#1a2032] space-y-1 text-xs font-sans">
            <span className="font-bold text-white block font-mono text-[11px]">Dual-Indicator Quarantine Rule:</span>
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              If both the Intent Mismatch and Mule Network indicators exceed 0.65 on a single transaction,
              the policy engine applies a 1.35x escalation multiplier, triggering an automatic HOLD to quarantine funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
