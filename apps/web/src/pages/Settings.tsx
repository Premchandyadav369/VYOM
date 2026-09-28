import React, { useState } from 'react';
import { Sliders, Database, Shield, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const [drunixMode, setDrunixMode] = useState('SIMULATOR');
  const [allowThresh, setAllowThresh] = useState('0.35');
  const [verifyThresh, setVerifyThresh] = useState('0.70');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold tracking-tight text-white">System Configuration</h2>
        </div>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          Consortium DLT parameters, policy risk boundaries, and cryptographic service keys.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-4">
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            NPCI Drunix Network Mode
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={drunixMode === 'SIMULATOR'}
                onChange={() => setDrunixMode('SIMULATOR')}
                className="accent-[#3b82f6]"
              />
              <span className="text-white">MODE B: High-Fidelity Drunix Simulator (Active)</span>
            </label>
            <p className="text-[11px] text-[#6b7280] pl-5">
              Faithfully reproduces the 5-phase Fabric v2.5 / Drunix lifecycle on local machine without external Docker daemons.
            </p>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="radio"
                name="mode"
                checked={drunixMode === 'REAL'}
                onChange={() => setDrunixMode('REAL')}
                className="accent-[#3b82f6]"
              />
              <span className="text-white">MODE A: Real Drunix Network Cluster</span>
            </label>
            <p className="text-[11px] text-[#6b7280] pl-5">
              Connects to running Docker/Podman Drunix network via gRPC ports 7051 (LP) and 7050 (Orderer).
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1c202e] space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Adaptive Policy Decision Thresholds
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="block text-[#9ca3af] mb-1">Max Risk for ALLOW</label>
              <input
                type="number"
                step="0.01"
                value={allowThresh}
                onChange={(e) => setAllowThresh(e.target.value)}
                className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[#9ca3af] mb-1">Max Risk for VERIFY</label>
              <input
                type="number"
                step="0.01"
                value={verifyThresh}
                onChange={(e) => setVerifyThresh(e.target.value)}
                className="w-full bg-[#131620] border border-[#202636] rounded px-3 py-1.5 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
          {saved && <span className="text-xs text-[#34d399] font-mono">✓ Settings saved successfully</span>}
        </div>
      </form>
    </div>
  );
};
