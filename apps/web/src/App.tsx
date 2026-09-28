import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Network,
  Blocks,
  Cpu,
  Globe2,
  FlaskConical
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import SoftAurora from './components/SoftAurora';
import Dock from './components/Dock';
import { CommandCenter } from './pages/CommandCenter';
import { PaymentMonitor } from './pages/PaymentMonitor';
import { PaymentInspector } from './pages/PaymentInspector';
import { DrunixExplorer } from './pages/DrunixExplorer';
import { LedgerTransactions } from './pages/LedgerTransactions';
import { CrossBorderConsole } from './pages/CrossBorderConsole';
import { TokenizedAssets } from './pages/TokenizedAssets';
import { PaymentTwin } from './pages/PaymentTwin';
import { ResearchLab } from './pages/ResearchLab';
import { Analytics } from './pages/Analytics';
import { SecurityCenter } from './pages/SecurityCenter';
import { Settings } from './pages/Settings';
import { TrustGraph } from './pages/TrustGraph';
import { RiskIntelligence } from './pages/RiskIntelligence';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [blockHeight, setBlockHeight] = useState<number>(1);
  const [drunixMode, setDrunixMode] = useState<string>('SIMULATOR');

  useEffect(() => {
    api.getNetworkHealth()
      .then((net) => {
        setBlockHeight(net.block_height);
        setDrunixMode(net.mode);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      api.getNetworkHealth()
        .then((net) => {
          setBlockHeight(net.block_height);
          setDrunixMode(net.mode);
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dockNavItems = [
    {
      icon: <LayoutDashboard className="w-4 h-4 text-[#60a5fa]" />,
      label: "Command Center",
      onClick: () => navigate("/")
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />,
      label: "Payment Monitor",
      onClick: () => navigate("/payments")
    },
    {
      icon: <Network className="w-4 h-4 text-[#a855f7]" />,
      label: "Trust Graph",
      onClick: () => navigate("/graph")
    },
    {
      icon: <Blocks className="w-4 h-4 text-[#38bdf8]" />,
      label: "Drunix Explorer",
      onClick: () => navigate("/drunix")
    },
    {
      icon: <Cpu className="w-4 h-4 text-[#10b981]" />,
      label: "Payment Twin (Demo)",
      onClick: () => navigate("/simulation")
    },
    {
      icon: <Globe2 className="w-4 h-4 text-[#06b6d4]" />,
      label: "Cross-Border Rail",
      onClick: () => navigate("/remittance")
    },
    {
      icon: <FlaskConical className="w-4 h-4 text-[#ec4899]" />,
      label: "Research Lab",
      onClick: () => navigate("/research")
    }
  ];

  const renderCurrentPage = () => {
    if (currentRoute === '/') {
      return <CommandCenter navigate={navigate} />;
    }
    if (currentRoute === '/payments') {
      return <PaymentMonitor navigate={navigate} />;
    }
    if (currentRoute.startsWith('/payments/')) {
      const pid = currentRoute.replace('/payments/', '');
      return <PaymentInspector paymentId={pid} navigate={navigate} />;
    }
    if (currentRoute === '/risk') {
      return <RiskIntelligence />;
    }
    if (currentRoute === '/graph') {
      return <TrustGraph />;
    }
    if (currentRoute === '/drunix') {
      return <DrunixExplorer navigate={navigate} />;
    }
    if (currentRoute === '/drunix/transactions') {
      return <LedgerTransactions />;
    }
    if (currentRoute === '/remittance') {
      return <CrossBorderConsole />;
    }
    if (currentRoute === '/assets') {
      return <TokenizedAssets />;
    }
    if (currentRoute === '/simulation') {
      return <PaymentTwin />;
    }
    if (currentRoute === '/research') {
      return <ResearchLab />;
    }
    if (currentRoute === '/analytics') {
      return <Analytics />;
    }
    if (currentRoute === '/security') {
      return <SecurityCenter />;
    }
    if (currentRoute === '/settings') {
      return <Settings />;
    }
    return <CommandCenter navigate={navigate} />;
  };

  return (
    <div className="relative flex bg-[#08090d] text-[#e6edf3] min-h-screen overflow-x-hidden">
      {/* Ambient WebGL Soft Aurora Background (Subtle Deep Glow) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <SoftAurora
          speed={0.22}
          scale={2.0}
          brightness={0.35}
          color1="#0f172a"
          color2="#1e3a8a"
          noiseFrequency={1.8}
          noiseAmplitude={0.7}
          bandHeight={0.65}
          bandSpread={1.4}
          octaveDecay={0.1}
          enableMouseInteraction={true}
          mouseInfluence={0.12}
        />
      </div>

      {/* Main Sidebar */}
      <Sidebar currentRoute={currentRoute} navigate={navigate} />

      {/* Workspace Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 relative z-10">
        <Navbar currentRoute={currentRoute} blockHeight={blockHeight} drunixMode={drunixMode} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto pb-28">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Floating Quick Action Dock */}
      <div className="fixed bottom-3 left-64 right-0 flex justify-center pointer-events-none z-40">
        <div className="pointer-events-auto">
          <Dock
            items={dockNavItems}
            panelHeight={52}
            baseItemSize={38}
            magnification={52}
            distance={110}
          />
        </div>
      </div>
    </div>
  );
};
