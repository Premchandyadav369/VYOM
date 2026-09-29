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
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';
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
import { LivePaymentModal } from './components/LivePaymentModal';
import { CSVImportModal } from './components/CSVImportModal';
import { PolicyRulesModal } from './components/PolicyRulesModal';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [blockHeight, setBlockHeight] = useState<number>(1);
  const [drunixMode, setDrunixMode] = useState<string>('SIMULATOR');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Global modals triggered from command palette or top-level actions
  const [showLiveModal, setShowLiveModal] = useState<boolean>(false);
  const [showCSVModal, setShowCSVModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

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
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcuts (⌘K, ⌘1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Quick numbers ⌘1 through ⌘5 for instant view switching
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        if (e.key === '1') { e.preventDefault(); navigate('/'); }
        else if (e.key === '2') { e.preventDefault(); navigate('/payments'); }
        else if (e.key === '3') { e.preventDefault(); navigate('/risk'); }
        else if (e.key === '4') { e.preventDefault(); navigate('/graph'); }
        else if (e.key === '5') { e.preventDefault(); navigate('/drunix'); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="relative flex bg-[#07080d] text-[#e6edf3] min-h-screen overflow-x-hidden font-sans">
      {/* Very subtle ambient dark graphite glow */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 overflow-hidden">
        <SoftAurora
          speed={0.15}
          scale={2.2}
          brightness={0.25}
          color1="#0a1020"
          color2="#111c38"
          noiseFrequency={1.6}
          noiseAmplitude={0.5}
          bandHeight={0.6}
          bandSpread={1.5}
          octaveDecay={0.1}
          enableMouseInteraction={false}
          mouseInfluence={0.05}
        />
      </div>

      {/* Main Enterprise Operations Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        navigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Workspace Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 relative z-10">
        <Navbar
          currentRoute={currentRoute}
          blockHeight={blockHeight}
          drunixMode={drunixMode}
          onOpenSearch={() => setIsSearchOpen(true)}
          navigate={navigate}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-24">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Persistent Operations Telemetry Status Bar */}
      <StatusBar blockHeight={blockHeight} drunixMode={drunixMode} />

      {/* Floating Quick Navigation Dock */}
      <div className="fixed bottom-9 left-64 right-0 flex justify-center pointer-events-none z-40">
        <div className="pointer-events-auto">
          <Dock
            items={dockNavItems}
            panelHeight={48}
            baseItemSize={36}
            magnification={48}
            distance={100}
          />
        </div>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        navigate={navigate}
        onOpenLivePayment={() => setShowLiveModal(true)}
        onOpenCSVImport={() => setShowCSVModal(true)}
        onOpenPolicyRules={() => setShowRulesModal(true)}
      />

      {/* Global Action Modals */}
      <LivePaymentModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onPaymentCreated={() => {
          api.getNetworkHealth().then(net => setBlockHeight(net.block_height)).catch(() => {});
        }}
      />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImportComplete={() => {
          api.getNetworkHealth().then(net => setBlockHeight(net.block_height)).catch(() => {});
        }}
      />

      <PolicyRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
};
