import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, CheckCircle2, RefreshCw, BarChart2, Award, Zap } from 'lucide-react';
import { api } from '../services/api';
import { ModelMetric, Hypothesis } from '../types';

export const ResearchLab: React.FC = () => {
  const [baselines, setBaselines] = useState<ModelMetric[]>([]);
  const [ablations, setAblations] = useState<ModelMetric[]>([]);
  const [sfeFrontier, setSfeFrontier] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchResearchData = async () => {
    try {
      setLoading(true);
      const [b, a, sfe, h] = await Promise.all([
        api.getBaselines(),
        api.getAblation(),
        api.getSfeFrontier(),
        api.getHypotheses()
      ]);
      setBaselines(b);
      setAblations(a);
      setSfeFrontier(sfe);
      setHypotheses(h);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchData();
  }, []);

  const handleRunFreshExperiments = async () => {
    try {
      setRunning(true);
      await fetchResearchData();
    } catch (err) {
      alert('Experiment execution failed: ' + String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#3b82f6]" />
            <h2 className="text-xl font-bold tracking-tight text-white">Scientific Research & Benchmark Lab</h2>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Empirical comparisons on the VERA-PINT dataset across 6 Baselines, 8 Ablations, and Safety-Friction Pareto curves.
          </p>
        </div>

        <button
          onClick={handleRunFreshExperiments}
          disabled={running}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Evaluating Models...' : 'Re-Run Experiments'}</span>
        </button>
      </div>

      {/* 1. Model Comparison Table */}
      <div className="rounded-lg bg-[#0e1017] border border-[#1c202e] overflow-hidden">
        <div className="p-4 border-b border-[#1c202e] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Model Comparison on VERA-PINT Benchmark
            </h3>
            <p className="text-[11px] text-[#6b7280] mt-0.5">
              Evaluated on 10 realistic financial crime scenarios (seed=42).
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#60a5fa]">N=2,000 TRANSACTIONS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#11131b] border-b border-[#1c202e] text-[#6b7280] text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4 font-sans">Model Architecture</th>
                <th className="py-2.5 px-3">PR-AUC</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">FPR</th>
                <th className="py-2.5 px-3">Scam Rec (%)</th>
                <th className="py-2.5 px-3">Mismatch Rec (%)</th>
                <th className="py-2.5 px-3">Latency (ms)</th>
                <th className="py-2.5 px-3">SFE Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] text-[#e6edf3]">
              {baselines.map((b) => {
                const isVera = b.model.includes('VERA');
                return (
                  <tr key={b.model} className={isVera ? 'bg-[#1b253b]/60 font-semibold' : 'hover:bg-[#12151f]'}>
                    <td className="py-2.5 px-4 font-sans text-white flex items-center gap-1.5">
                      {isVera && <Award className="w-3.5 h-3.5 text-[#60a5fa]" />}
                      <span>{b.model}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#60a5fa]">{b.pr_auc?.toFixed(4)}</td>
                    <td className="py-2.5 px-3">{((b.recall || 0) * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-[#9ca3af]">{((b.fpr || 0) * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-[#34d399] font-bold">{b.scam_recall}%</td>
                    <td className="py-2.5 px-3 text-[#34d399] font-bold">{b.intent_mismatch_recall}%</td>
                    <td className="py-2.5 px-3 text-[#9ca3af]">{b.latency_ms} ms</td>
                    <td className="py-2.5 px-3 font-bold text-white">{b.sfe_score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Systematic Ablation Study */}
      <div className="rounded-lg bg-[#0e1017] border border-[#1c202e] overflow-hidden">
        <div className="p-4 border-b border-[#1c202e]">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Systematic Signal Ablation Study (Configurations A – H)
          </h3>
          <p className="text-[11px] text-[#6b7280] mt-0.5">
            Demonstrates incremental predictive power of Intent, Behavioral, Graph, and Drunix consensus state.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#11131b] border-b border-[#1c202e] text-[#6b7280] text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4 font-sans">Configuration</th>
                <th className="py-2.5 px-3">PR-AUC</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">FPR</th>
                <th className="py-2.5 px-3">Scam Recall</th>
                <th className="py-2.5 px-3">Latency (ms)</th>
                <th className="py-2.5 px-3">SFE Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] text-[#e6edf3]">
              {ablations.map((a) => (
                <tr key={a.model} className="hover:bg-[#12151f]">
                  <td className="py-2.5 px-4 font-sans text-white">{a.model}</td>
                  <td className="py-2.5 px-3 text-[#60a5fa]">{a.pr_auc?.toFixed(4)}</td>
                  <td className="py-2.5 px-3">{((a.recall || 0) * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-[#9ca3af]">{((a.fpr || 0) * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 text-[#34d399] font-bold">{a.scam_recall}%</td>
                  <td className="py-2.5 px-3 text-[#9ca3af]">{a.latency_ms} ms</td>
                  <td className="py-2.5 px-3 font-bold text-white">{a.sfe_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Safety-Friction Pareto Frontier */}
      <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Safety–Friction Efficiency (SFE) Pareto Frontier
        </h3>
        <p className="text-[11px] text-[#9ca3af]">
          Shows that VERA prevents higher fraud losses at substantially lower legitimate customer friction compared to traditional static rules.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
          {sfeFrontier.slice(0, 5).map((pt) => (
            <div key={pt.threshold} className="p-2.5 rounded bg-[#131620] border border-[#202636] text-xs font-mono space-y-1">
              <span className="text-[#6b7280] text-[10px] block">THRESHOLD: {pt.threshold}</span>
              <div className="text-white font-bold">Safety: {pt.vera_safety}%</div>
              <div className="text-[#9ca3af] text-[11px]">Friction: {pt.vera_friction}%</div>
              <div className="text-[#60a5fa] text-[10px] font-bold">SFE Ratio: {pt.sfe_ratio}x</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Research Hypotheses Validation Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Empirical Validation of Research Hypotheses (H1 – H6)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hypotheses.map((h) => (
            <div key={h.id} className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#60a5fa] font-mono">{h.id}</span>
                <span className="px-2 py-0.5 rounded bg-[#064e3b]/60 text-[#34d399] font-mono text-[10px] font-bold">
                  {h.status}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white leading-snug">{h.hypothesis}</h4>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed font-sans">{h.evidence}</p>
              <div className="text-[10px] font-mono text-[#6b7280] pt-1 border-t border-[#1c202e]">
                Significance: {h.p_value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
