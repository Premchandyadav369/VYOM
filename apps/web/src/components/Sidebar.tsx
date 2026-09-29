import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  Network,
  Blocks,
  FileText,
  Globe2,
  Coins,
  Cpu,
  FlaskConical,
  BarChart3,
  Lock,
  Sliders,
  ChevronRight,
  GitBranch,
  Layers,
  Terminal
} from 'lucide-react';
import LineSidebar from './LineSidebar';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, navigate, onOpenSearch }) => {
  const [sidebarMode, setSidebarMode] = useState<'standard' | 'line'>('standard');

  const menuGroups = [
    {
      label: "OPERATIONS",
      items: [
        { id: "/", label: "Command Center", icon: LayoutDashboard, shortcut: "⌘1" },
        { id: "/payments", label: "Payment Monitor", icon: ShieldAlert, shortcut: "⌘2" },
        { id: "/risk", label: "Risk Intelligence", icon: Sliders, shortcut: "⌘3" },
        { id: "/graph", label: "Trust Graph", icon: Network, shortcut: "⌘4" },
      ]
    },
    {
      label: "DRUNIX INFRASTRUCTURE",
      items: [
        { id: "/drunix", label: "Drunix Explorer", icon: Blocks, shortcut: "⌘5" },
        { id: "/drunix/transactions", label: "Ledger Records", icon: FileText },
      ]
    },
    {
      label: "CHANNELS & ASSETS",
      items: [
        { id: "/remittance", label: "Cross-Border Rail", icon: Globe2 },
        { id: "/assets", label: "Tokenized Assets", icon: Coins },
        { id: "/simulation", label: "Payment Twin", icon: Cpu, badge: "DEMO" },
      ]
    },
    {
      label: "RESEARCH & AUDIT",
      items: [
        { id: "/research", label: "Research Lab", icon: FlaskConical },
        { id: "/analytics", label: "Safety Analytics", icon: BarChart3 },
        { id: "/security", label: "Security & Threats", icon: Lock },
        { id: "/settings", label: "System Config", icon: Sliders },
      ]
    }
  ];

  const allItems = [
    { id: "/", label: "Command Center" },
    { id: "/payments", label: "Payment Monitor" },
    { id: "/risk", label: "Risk Intelligence" },
    { id: "/graph", label: "Trust Graph" },
    { id: "/drunix", label: "Drunix Explorer" },
    { id: "/drunix/transactions", label: "Ledger Records" },
    { id: "/remittance", label: "Cross-Border Rail" },
    { id: "/assets", label: "Tokenized Assets" },
    { id: "/simulation", label: "Payment Twin Demo" },
    { id: "/research", label: "Research Lab" },
    { id: "/analytics", label: "Safety Analytics" },
    { id: "/security", label: "Security & Threats" },
    { id: "/settings", label: "System Config" },
  ];

  const activeIdx = allItems.findIndex(item => item.id === currentRoute);
  const defaultActive = activeIdx !== -1 ? activeIdx : 0;

  return (
    <aside className="w-64 bg-[#08090e]/95 backdrop-blur-md border-r border-[#181c28] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-[#181c28] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#2563eb] flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-tight text-white font-mono">VERA</span>
              <span className="text-[10px] text-[#38bdf8] font-mono font-medium">× DRUNIX</span>
            </div>
            <p className="text-[9px] text-[#6b7280] font-normal leading-none mt-1">Intent Firewall for Payments</p>
          </div>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="px-3 pt-2.5">
        <div className="flex items-center gap-1 bg-[#0e111a] p-1 rounded-md border border-[#1b2030] text-[10px] font-mono">
          <button
            onClick={() => setSidebarMode('standard')}
            className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
              sidebarMode === 'standard'
                ? 'bg-[#181f30] text-[#60a5fa] font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Workspace</span>
          </button>
          <button
            onClick={() => setSidebarMode('line')}
            className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
              sidebarMode === 'line'
                ? 'bg-[#181f30] text-[#60a5fa] font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>Line Rail</span>
          </button>
        </div>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5">
        {sidebarMode === 'standard' ? (
          <div className="space-y-4">
            {menuGroups.map((grp) => (
              <div key={grp.label}>
                <div className="px-2 mb-1 text-[9px] font-semibold text-[#4b5563] tracking-wider font-mono">
                  {grp.label}
                </div>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#161f33] text-white border-l-2 border-[#3b82f6]'
                            : 'text-[#8b949e] hover:text-white hover:bg-[#101420]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#60a5fa]' : 'text-[#6b7280]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-[#93c5fd] font-semibold">
                              {item.badge}
                            </span>
                          )}
                          {item.shortcut && (
                            <span className="text-[9px] font-mono text-[#4b5563]">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2 pl-1 pr-2">
            <LineSidebar
              items={allItems.map(i => i.label)}
              accentColor="#3b82f6"
              textColor="#8b949e"
              markerColor="#2c3346"
              showIndex={true}
              showMarker={true}
              proximityRadius={90}
              maxShift={18}
              falloff="smooth"
              markerLength={24}
              markerGap={6}
              tickScale={0.5}
              scaleTick={true}
              itemGap={11}
              fontSize={0.78}
              smoothing={80}
              defaultActive={defaultActive}
              onItemClick={(index: number) => {
                if (allItems[index]) {
                  navigate(allItems[index].id);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Quick Search Shortcut & Consortium Status */}
      <div className="p-3 border-t border-[#181c28] bg-[#07080c] space-y-2">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0f121d] hover:bg-[#151928] border border-[#1b2133] text-[10px] font-mono text-[#8b949e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#60a5fa]" />
              <span>Command Palette</span>
            </div>
            <kbd className="px-1 py-0.5 rounded bg-[#181d2a] border border-[#262f44] text-[9px] text-[#9ca3af]">
              ⌘K
            </kbd>
          </button>
        )}

        <div className="rounded border border-[#181d2a] p-2 text-[10px] font-mono space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">Consortium Rail</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              ONLINE
            </span>
          </div>
          <div className="text-[#8b949e] text-[9px]">
            NPCI DRUNIX v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
};
