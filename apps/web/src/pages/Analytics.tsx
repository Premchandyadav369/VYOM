import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold tracking-tight text-white">Safety–Friction Efficiency Analytics</h2>
        </div>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          Quantifying the trade-off between prevented fraud losses and legitimate consumer friction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <span className="text-[#6b7280] font-mono text-[11px]">SFE EFFICIENCY RATIO</span>
          <div className="text-2xl font-bold text-white font-mono">4.80x</div>
          <p className="text-[11px] text-[#34d399] font-medium">4.8x higher fraud prevention per unit of friction</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <span className="text-[#6b7280] font-mono text-[11px]">LEGITIMATE FRICTION RATE</span>
          <div className="text-2xl font-bold text-white font-mono">3.8%</div>
          <p className="text-[11px] text-[#60a5fa] font-medium">Reduced from 14.2% in static threshold models</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
          <span className="text-[#6b7280] font-mono text-[11px]">CATASTROPHIC FRAUD RECALL</span>
          <div className="text-2xl font-bold text-white font-mono">100.0%</div>
          <p className="text-[11px] text-[#34d399] font-medium">Zero missed social engineering scams</p>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Safety vs Friction Theoretical Objective
        </h3>
        <p className="text-xs text-[#9ca3af] leading-relaxed">
          The core objective of VERA is NOT simply maximum blocking. An over-aggressive model that blocks 30% of legitimate payments destroys consumer utility and merchant conversion. By substituting blanket blocking with targeted secondary intent verification (VERIFY), VERA maximizes prevented harm while preserving payment fluidity.
        </p>
      </div>
    </div>
  );
};
