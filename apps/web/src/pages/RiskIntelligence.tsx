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
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold tracking-tight text-white">Risk Intelligence & Fusion Tuning</h2>
        </div>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          Configurable multi-modal fusion weights balancing Intent NLP, Behavioral Deviations, Recipient Trust, and Network Exposure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sliders Box */}
        <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c202e] pb-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Signal Family Weight Allocation
            </h3>
            <span className={`text-xs font-mono font-bold ${total === 100 ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
              Total: {total}%
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#9ca3af]">Intent Mismatch (NLP)</span>
                <span className="text-white font-bold">{wIntent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wIntent}
                onChange={(e) => setWIntent(parseInt(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#9ca3af]">Behavioral Anomaly (Isolation Forest)</span>
                <span className="text-white font-bold">{wBehavior}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wBehavior}
                onChange={(e) => setWBehavior(parseInt(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#9ca3af]">Counterparty Trust (Graph History)</span>
                <span className="text-white font-bold">{wRecipient}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wRecipient}
                onChange={(e) => setWRecipient(parseInt(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#9ca3af]">Network & Mule Cluster Proximity</span>
                <span className="text-white font-bold">{wNetwork}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wNetwork}
                onChange={(e) => setWNetwork(parseInt(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#9ca3af]">Context, Device & Geolocation</span>
                <span className="text-white font-bold">{wContext}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wContext}
                onChange={(e) => setWContext(parseInt(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>
          </div>
        </div>

        {/* Explainability / Formula Box */}
        <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Interpretable Mathematical Projection
          </h3>

          <div className="p-4 rounded bg-[#131620] border border-[#202636] font-mono text-xs text-[#a5d6ff] space-y-2">
            <div>Risk(T) =</div>
            <div className="pl-4 text-white">
              {(wIntent / 100).toFixed(2)} * (1 - IntentConsistency)
            </div>
            <div className="pl-4 text-white">
              + {(wBehavior / 100).toFixed(2)} * BehaviorDeviation
            </div>
            <div className="pl-4 text-white">
              + {(wRecipient / 100).toFixed(2)} * (1 - RecipientTrust)
            </div>
            <div className="pl-4 text-white">
              + {(wNetwork / 100).toFixed(2)} * NetworkRisk
            </div>
            <div className="pl-4 text-white">
              + {(wContext / 100).toFixed(2)} * ContextRisk
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#131620] border border-[#202636] space-y-1.5 text-xs">
            <span className="font-bold text-white block">Non-Linear Coercion Synergy:</span>
            <p className="text-[11px] text-[#9ca3af] leading-relaxed">
              When both Intent Mismatch and Mule Network indicators exceed 0.65 simultaneously,
              a non-linear synergy multiplier (+35%) amplifies composite risk to trigger mandatory Drunix HOLD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
