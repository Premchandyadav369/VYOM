import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
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
    <div className="flex bg-[#08090d] text-[#e6edf3] min-h-screen">
      <Sidebar currentRoute={currentRoute} navigate={navigate} />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar currentRoute={currentRoute} blockHeight={blockHeight} drunixMode={drunixMode} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};
