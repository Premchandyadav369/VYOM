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
  Layers
} from 'lucide-react';
import LineSidebar from './LineSidebar';
import GradientText from './GradientText';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, navigate }) => {
  const [sidebarMode, setSidebarMode] = useState<'standard' | 'line'>('standard');

  const menuGroups = [
    {
      label: "OPERATIONS",
      items: [
        { id: "/", label: "Command Center", icon: LayoutDashboard },
        { id: "/payments", label: "Payment Monitor", icon: ShieldAlert },
        { id: "/risk", label: "Risk Intelligence", icon: Sliders },
        { id: "/graph", label: "Trust Graph", icon: Network },
      ]
    },
    {
      label: "DRUNIX DLT",
      items: [
        { id: "/drunix", label: "Drunix Explorer", icon: Blocks },
        { id: "/drunix/transactions", label: "Ledger Transactions", icon: FileText },
      ]
    },
    {
      label: "CHANNELS & ASSETS",
      items: [
        { id: "/remittance", label: "Cross-Border Console", icon: Globe2 },
        { id: "/assets", label: "Tokenized Assets", icon: Coins },
        { id: "/simulation", label: "Payment Twin", icon: Cpu, badge: "DEMO" },
      ]
    },
    {
      label: "RESEARCH & AUDIT",
      items: [
        { id: "/research", label: "Research Lab", icon: FlaskConical },
        { id: "/analytics", label: "Analytics & SFE", icon: BarChart3 },
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
    <aside className="w-64 bg-[#0c0d12]/95 backdrop-blur-md border-r border-[#1a1d27] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#1a1d27] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#2563eb] flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <GradientText
                colors={["#ffffff", "#93c5fd", "#3b82f6", "#ffffff"]}
                animationSpeed={5}
                className="font-semibold tracking-tight text-sm text-white"
              >
                VERA
              </GradientText>
              <span className="text-[10px] text-[#60a5fa] font-mono font-medium">x DRUNIX</span>
            </div>
            <p className="text-[10px] text-[#6b7280] font-normal leading-none mt-0.5">Intent Firewall for Payments</p>
          </div>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-1 bg-[#11131c] p-1 rounded-md border border-[#1d2232] text-[10px] font-mono">
          <button
            onClick={() => setSidebarMode('standard')}
            className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
              sidebarMode === 'standard'
                ? 'bg-[#1e2435] text-[#60a5fa] font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Categorized</span>
          </button>
          <button
            onClick={() => setSidebarMode('line')}
            className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
              sidebarMode === 'line'
                ? 'bg-[#1e2435] text-[#60a5fa] font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>Line Rail</span>
          </button>
        </div>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {sidebarMode === 'standard' ? (
          <div className="space-y-5">
            {menuGroups.map((grp) => (
              <div key={grp.label}>
                <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-[#4b5563] tracking-wider font-mono">
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
                            ? 'bg-[#1e2433] text-[#60a5fa]'
                            : 'text-[#9ca3af] hover:text-white hover:bg-[#131620]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3b82f6]' : 'text-[#6b7280]'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1e3a8a] text-[#93c5fd] font-semibold">
                            {item.badge}
                          </span>
                        )}
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

      {/* Consortium Status Card */}
      <div className="p-3 border-t border-[#1a1d27] bg-[#090a0f]">
        <div className="rounded-md border border-[#1e2230] p-2.5 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9ca3af]">Consortium Rail</span>
            <span className="flex items-center gap-1 text-[#10b981] font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              LIVE
            </span>
          </div>
          <div className="text-[10px] text-[#6b7280] font-mono">
            NPCI DRUNIX v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
};
