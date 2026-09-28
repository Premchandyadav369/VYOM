import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, ShieldX, Globe2, Coins, ArrowRight, RefreshCw, Cpu, Check } from 'lucide-react';
import { api } from '../services/api';

export const PaymentTwin: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('NORMAL_PAYMENT');
  const [executionResult, setExecutionResult] = useState<any>(null);

  const scenarios = [
    {
      id: 'NORMAL_PAYMENT',
      title: 'Scene 1: Normal Payment',
      desc: 'User pays Rs. 1,500 to trusted regular restaurant. High intent consistency, low risk, immediate ALLOW and Drunix settlement.',
      icon: CheckCircle2,
      badge: 'LOW RISK'
    },
    {
      id: 'SOCIAL_ENGINEERING_SCAM',
      title: 'Scene 2: Social Engineering Scam',
      desc: 'Victim coerced into paying Rs. 50,000 to urgent investment scam. Coercive intent NLP + mule proximity triggers HOLD. Drunix halts settlement.',
      icon: ShieldX,
      badge: 'HIGH RISK'
    },
    {
      id: 'INTENT_MISMATCH',
      title: 'Scene 3: Intent Mismatch',
      desc: 'Stated: "Rs. 5,000 for groceries". Reality: Rs. 50,000 to personal account. Triggers targeted VERIFY; unverified settlement blocked.',
      icon: AlertTriangle,
      badge: 'MEDIUM RISK'
    },
    {
      id: 'CROSS_BORDER_REMITTANCE',
      title: 'Scene 4: Cross-Border Remittance',
      desc: 'Remittance to Singapore (IN-SG). Evaluates FX rate, LRS compliance, and multi-party coordination on Drunix.',
      icon: Globe2,
      badge: 'MULTI-PARTY'
    },
    {
      id: 'TOKENIZED_RECEIVABLE',
      title: 'Scene 5: Tokenized Receivable',
      desc: 'Tokenizes Rs. 100,000 invoice receivable and executes verified transfer of ownership on Drunix distributed ledger.',
      icon: Coins,
      badge: 'RWA ASSET'
    }
  ];

  const handleRun = async () => {
    try {
      setRunning(true);
      setExecutionResult(null);
      const res = await api.runScenario(selectedScenario);
      setExecutionResult(res);
    } catch (err) {
      alert('Error running simulation: ' + String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold tracking-tight text-white">VERA Payment Twin (Live Interactive Demo)</h2>
        </div>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          Live simulation environment demonstrating VERA probabilistic intelligence governing Drunix deterministic state transitions.
        </p>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => { setSelectedScenario(sc.id); setExecutionResult(null); }}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#141b2b] border-[#3b82f6] shadow-sm'
                  : 'bg-[#0e1017] border-[#1c202e] hover:bg-[#12151f]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#3b82f6]' : 'text-[#6b7280]'}`} />
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    sc.badge === 'HIGH RISK' ? 'bg-[#7f1d1d]/60 text-[#f87171]' :
                    sc.badge === 'MEDIUM RISK' ? 'bg-[#78350f]/60 text-[#fcd34d]' :
                    'bg-[#064e3b]/60 text-[#34d399]'
                  }`}>
                    {sc.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{sc.title}</h4>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed">{sc.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1c202e] text-[10px] font-mono text-[#60a5fa] flex items-center justify-between">
                <span>Select Scenario</span>
                {isSelected && <span className="font-bold">ACTIVE</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Trigger Banner */}
      <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-[#6b7280]">ACTIVE DEMO SELECTION:</span>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {scenarios.find(s => s.id === selectedScenario)?.title}
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-sm transition-colors"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulating Execution...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>RUN LIVE DEMO SCENARIO</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Results View */}
      {executionResult && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1c202e] pb-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Scenario Execution Outcome
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                executionResult.decision === 'ALLOW' ? 'bg-[#064e3b] text-[#34d399]' :
                executionResult.decision === 'VERIFY' ? 'bg-[#78350f] text-[#fcd34d]' :
                'bg-[#7f1d1d] text-[#f87171]'
              }`}>
                DECISION: {executionResult.decision} | STATUS: {executionResult.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">PAYMENT ID</span>
                <span className="text-white font-bold">{executionResult.payment_id}</span>
              </div>
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">TRANSACTION AMOUNT</span>
                <span className="text-white font-bold">Rs. {executionResult.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">RISK SCORE</span>
                <span className="text-[#fcd34d] font-bold">{executionResult.risk_score?.toFixed(3)}</span>
              </div>
              <div className="p-2.5 rounded bg-[#131620] border border-[#202636]">
                <span className="text-[#6b7280] block text-[10px]">BLOCKCHAIN ENFORCEMENT</span>
                <span className="text-[#34d399] font-bold">
                  {executionResult.transition_blocked_by_blockchain || executionResult.unverified_commit_blocked ? 'SETTLEMENT HALTED' : 'COMMITTED'}
                </span>
              </div>
            </div>

            {/* Explanation box */}
            {executionResult.explanation && (
              <div className="p-3.5 rounded bg-[#131620] border border-[#202636] text-xs text-white whitespace-pre-line leading-relaxed">
                {executionResult.explanation}
              </div>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              End-to-End Execution Trace
            </h3>

            <div className="space-y-2">
              {executionResult.timeline?.map((item: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded bg-[#131620] border border-[#202636] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1e2433] text-[#60a5fa] text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-white font-bold">{item.step}</span>
                    {item.detail && <span className="text-[#9ca3af] text-[11px]">- {item.detail}</span>}
                  </div>
                  {item.block && (
                    <span className="text-[10px] text-[#60a5fa]">Block #{item.block}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
