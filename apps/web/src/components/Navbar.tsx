import React from 'react';
import { Shield, Activity, Database, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  blockHeight: number;
  drunixMode: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, blockHeight, drunixMode }) => {
  const getRouteTitle = () => {
    switch (currentRoute) {
      case '/': return 'Command Center';
      case '/payments': return 'Payment Monitor';
      case '/risk': return 'Risk Intelligence';
      case '/graph': return 'Trust Graph Explorer';
      case '/drunix': return 'Drunix Blockchain Explorer';
      case '/drunix/transactions': return 'Ledger Transactions';
      case '/remittance': return 'Cross-Border Remittance Console';
      case '/assets': return 'Tokenized Receivable Assets';
      case '/simulation': return 'VERA Payment Twin (Interactive Demo)';
      case '/research': return 'Scientific Research & Baselines Lab';
      case '/analytics': return 'Safety-Friction Analytics';
      case '/security': return 'Security Center & Threat Model';
      case '/settings': return 'System Configuration';
      default:
        if (currentRoute.startsWith('/payments/')) return 'Payment Inspector';
        return 'VERA Ecosystem';
    }
  };

  return (
    <header className="h-16 border-b border-[#1a1d27] bg-[#0c0d12]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white tracking-tight">{getRouteTitle()}</h1>
        <span className="text-[#374151]">/</span>
        <span className="text-xs font-mono text-[#6b7280]">payments-channel</span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {/* Mode Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] ${
          drunixMode === 'REAL'
            ? 'bg-[#064e3b]/40 border-[#059669]/60 text-[#34d399]'
            : 'bg-[#1e2433] border-[#2b354f] text-[#93c5fd]'
        }`}>
          <Database className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span>DRUNIX: <strong className="font-semibold">{drunixMode}</strong></span>
        </div>

        {/* Block Height Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#11131a] border border-[#1e2230] font-mono text-[11px] text-[#9ca3af]">
          <span>BLOCK HEIGHT:</span>
          <span className="font-bold text-white">#{blockHeight}</span>
        </div>

        {/* Peer Status */}
        <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          <span>CONSENSUS ACTIVE</span>
        </div>
      </div>
    </header>
  );
};
