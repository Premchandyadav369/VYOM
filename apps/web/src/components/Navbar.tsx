import React from 'react';
import {
  Search,
  Database,
  Shield,
  Activity,
  CheckCircle2,
  User,
  Radio,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  blockHeight: number;
  drunixMode: string;
  onOpenSearch: () => void;
  navigate?: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  blockHeight,
  drunixMode,
  onOpenSearch,
  navigate
}) => {
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
      case '/simulation': return 'Payment Twin Simulator';
      case '/research': return 'Scientific Research & Baselines';
      case '/analytics': return 'Safety-Friction Analytics';
      case '/security': return 'Security Center & Threat Model';
      case '/settings': return 'System Configuration';
      default:
        if (currentRoute.startsWith('/payments/')) {
          const pid = currentRoute.replace('/payments/', '');
          return `Payment Inspector [${pid}]`;
        }
        return 'Operations';
    }
  };

  return (
    <header className="h-14 border-b border-[#181c28] bg-[#08090e]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-[#6b7280]">VERA</span>
        <span className="text-[#374151]">/</span>
        <span className="text-[#9ca3af]">payments-channel</span>
        <span className="text-[#374151]">/</span>
        <span className="font-semibold text-white tracking-wide">
          {getRouteTitle()}
        </span>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#111420] hover:bg-[#161a29] border border-[#1e2336] text-[#6b7280] hover:text-[#9ca3af] transition-all text-xs font-mono group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#60a5fa] group-hover:text-white transition-colors" />
            <span className="text-[#8b949e]">Search payment, VPA, block hash, or command...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#181d2a] border border-[#262f44] text-[10px] text-[#9ca3af] font-mono">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Operational Status Telemetry */}
      <div className="flex items-center gap-3 text-xs">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 rounded-md bg-[#111420] border border-[#1e2336] text-[#9ca3af] hover:text-white"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Drunix Network Mode Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[11px] ${
            drunixMode === 'REAL'
              ? 'bg-[#064e3b]/30 border-[#059669]/50 text-[#34d399]'
              : 'bg-[#121624] border-[#1e263d] text-[#93c5fd]'
          }`}
        >
          <Database className="w-3 h-3 text-[#38bdf8]" />
          <span>DRUNIX: <strong className="font-semibold">{drunixMode}</strong></span>
        </div>

        {/* Head Block Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f121d] border border-[#1b2030] font-mono text-[11px] text-[#9ca3af]">
          <span className="text-[#6b7280]">BLOCK:</span>
          <span className="font-bold text-white tabular-nums">#{blockHeight}</span>
        </div>

        {/* Consensus Health Dot */}
        <div className="hidden lg:flex items-center gap-1.5 text-[#10b981] font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="text-[#86efac]">CONSENSUS ACTIVE</span>
        </div>

        {/* Active Operator Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1c2130]">
          <div className="w-6 h-6 rounded-full bg-[#1e2538] border border-[#2b354e] flex items-center justify-center text-white text-[10px] font-mono font-bold">
            OP
          </div>
          <div className="hidden xl:block text-left font-mono">
            <div className="text-[10px] text-white font-medium leading-none">Ops Lead</div>
            <div className="text-[9px] text-[#6b7280] leading-none mt-0.5">Tier-3 SOC</div>
          </div>
        </div>
      </div>
    </header>
  );
};
