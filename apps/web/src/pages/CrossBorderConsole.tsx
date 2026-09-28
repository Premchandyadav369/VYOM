import React, { useState, useEffect } from 'react';
import { Globe2, ArrowRight, ShieldCheck, DollarSign, Calculator, Send } from 'lucide-react';
import { api } from '../services/api';
import { RemittanceCorridor } from '../types';

export const CrossBorderConsole: React.FC = () => {
  const [corridors, setCorridors] = useState<RemittanceCorridor[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState('IN-SG');
  const [amountInr, setAmountInr] = useState('75000');
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCorridors().then(setCorridors).catch(console.error);
  }, []);

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const res = await api.evaluateRemittance({
        amount_inr: parseFloat(amountInr),
        destination_country: selectedCorridor.split('-')[1],
        corridor: selectedCorridor
      });
      setCalculation(res);
    } catch (err) {
      alert('Error evaluating remittance: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCorridor && amountInr) {
      handleCalculate();
    }
  }, [selectedCorridor]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold tracking-tight text-white">Cross-Border Remittance Console</h2>
        </div>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          International payment corridor routing (India to SG, UAE, UK, US) with FX fee optimization and Drunix compliance finality.
        </p>
      </div>

      {/* Corridors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {corridors.map((c) => {
          const isSelected = selectedCorridor === c.code;
          return (
            <div
              key={c.code}
              onClick={() => setSelectedCorridor(c.code)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#141b2b] border-[#3b82f6]'
                  : 'bg-[#0e1017] border-[#1c202e] hover:bg-[#12151f]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-mono">{c.code}</span>
                <span className="text-[10px] font-mono text-[#60a5fa]">1 INR = {c.base_fx_rate} {c.currency}</span>
              </div>
              <h4 className="text-xs font-medium text-white">{c.name}</h4>
              <div className="mt-2 pt-2 border-t border-[#1c202e] text-[10px] text-[#6b7280] font-mono flex justify-between">
                <span>Settlement: ~{c.avg_settlement_mins} mins</span>
                <span className="text-[#34d399]">Route Risk: {(c.route_risk * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculator & Live Multi-Party Settlement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input */}
        <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            FX Corridor Calculator & Compliance Screening
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#9ca3af] mb-1 font-mono text-[11px]">Remittance Amount (INR)</label>
              <input
                type="number"
                value={amountInr}
                onChange={(e) => setAmountInr(e.target.value)}
                className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            <div>
              <label className="block text-[#9ca3af] mb-1 font-mono text-[11px]">Target Destination Country</label>
              <select
                value={selectedCorridor}
                onChange={(e) => setSelectedCorridor(e.target.value)}
                className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#3b82f6]"
              >
                {corridors.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-2 rounded bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
            >
              {loading ? 'Evaluating Corridor...' : 'Calculate Route & Screening'}
            </button>
          </div>
        </div>

        {/* Right: Calculated Route Details */}
        <div className="p-5 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Corridor Route Details & Drunix Consensus
          </h3>

          {calculation ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#131620] border border-[#202636] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Destination Amount:</span>
                  <span className="text-white font-bold text-sm">
                    {(parseFloat(amountInr) * calculation.fx_rate).toFixed(2)} {calculation.currency_pair?.split('/')[1]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">FX Rate:</span>
                  <span className="text-[#9ca3af]">1 INR = {calculation.fx_rate} {calculation.currency_pair?.split('/')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Estimated Fee:</span>
                  <span className="text-[#9ca3af]">Rs. {calculation.fee_inr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Settlement Latency:</span>
                  <span className="text-[#34d399]">~{calculation.estimated_settlement_mins} minutes</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#131620] border border-[#202636] space-y-1">
                <span className="text-[#6b7280] block text-[10px]">COMPLIANCE SCREENING STATUS</span>
                <span className="text-[#60a5fa] font-bold">{calculation.compliance_status}</span>
                <p className="text-[10px] text-[#6b7280]">
                  Sanctions List & PEP checked via Drunix multi-organization verification.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#6b7280]">
              Click Calculate to view corridor metrics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
