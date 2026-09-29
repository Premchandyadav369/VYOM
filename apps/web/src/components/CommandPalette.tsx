import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  ShieldAlert,
  Sliders,
  Network,
  Blocks,
  FileText,
  Globe2,
  Coins,
  Cpu,
  FlaskConical,
  BarChart3,
  Lock,
  ArrowRight,
  Plus,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CornerDownLeft,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
  onOpenLivePayment?: () => void;
  onOpenCSVImport?: () => void;
  onOpenPolicyRules?: () => void;
}

interface PaletteItem {
  id: string;
  category: 'NAVIGATION' | 'ACTION' | 'PAYMENT';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  navigate,
  onOpenLivePayment,
  onOpenCSVImport,
  onOpenPolicyRules
}) => {
  const [query, setQuery] = useState('');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      api.getPayments(30)
        .then(setPayments)
        .catch(() => {});
    }
  }, [isOpen]);

  // Static Navigation items
  const navigationItems: PaletteItem[] = [
    {
      id: 'nav-home',
      category: 'NAVIGATION',
      title: 'Command Center',
      subtitle: 'Consortium overview, real-time KPI metrics, active pipeline',
      badge: '⌘1',
      icon: <LayoutDashboard className="w-4 h-4 text-[#38bdf8]" />,
      action: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-payments',
      category: 'NAVIGATION',
      title: 'Payment Monitor',
      subtitle: 'Real-time intent-governed transaction monitoring & triage',
      badge: '⌘2',
      icon: <ShieldAlert className="w-4 h-4 text-[#60a5fa]" />,
      action: () => { navigate('/payments'); onClose(); }
    },
    {
      id: 'nav-risk',
      category: 'NAVIGATION',
      title: 'Risk Intelligence',
      subtitle: 'Multi-modal fusion weights tuning & explainable projections',
      badge: '⌘3',
      icon: <Sliders className="w-4 h-4 text-[#a855f7]" />,
      action: () => { navigate('/risk'); onClose(); }
    },
    {
      id: 'nav-graph',
      category: 'NAVIGATION',
      title: 'Trust Graph Explorer',
      subtitle: 'Topology clustering, synthetic mule injection & centrality',
      badge: '⌘4',
      icon: <Network className="w-4 h-4 text-[#ec4899]" />,
      action: () => { navigate('/graph'); onClose(); }
    },
    {
      id: 'nav-drunix',
      category: 'NAVIGATION',
      title: 'Drunix Blockchain Explorer',
      subtitle: 'Cryptographic block viewer, Raft consensus telemetry & ledger proofs',
      badge: '⌘5',
      icon: <Blocks className="w-4 h-4 text-[#34d399]" />,
      action: () => { navigate('/drunix'); onClose(); }
    },
    {
      id: 'nav-ledger',
      category: 'NAVIGATION',
      title: 'Ledger Transactions',
      subtitle: 'Granular on-chain transactions, read-write sets & endorsements',
      icon: <FileText className="w-4 h-4 text-[#94a3b8]" />,
      action: () => { navigate('/drunix/transactions'); onClose(); }
    },
    {
      id: 'nav-remittance',
      category: 'NAVIGATION',
      title: 'Cross-Border Remittance Console',
      subtitle: 'UPI-PayNow, UAE-India & US-India corridors with dual-rail FX',
      icon: <Globe2 className="w-4 h-4 text-[#06b6d4]" />,
      action: () => { navigate('/remittance'); onClose(); }
    },
    {
      id: 'nav-assets',
      category: 'NAVIGATION',
      title: 'Tokenized Receivable Assets',
      subtitle: 'Commercial paper & invoice tokenization backed by DLT state',
      icon: <Coins className="w-4 h-4 text-[#f59e0b]" />,
      action: () => { navigate('/assets'); onClose(); }
    },
    {
      id: 'nav-sim',
      category: 'NAVIGATION',
      title: 'Payment Twin Simulator',
      subtitle: 'Interactive live scenario testbed for fraud & coercion testing',
      badge: 'DEMO',
      icon: <Cpu className="w-4 h-4 text-[#10b981]" />,
      action: () => { navigate('/simulation'); onClose(); }
    },
    {
      id: 'nav-research',
      category: 'NAVIGATION',
      title: 'Scientific Research Lab',
      subtitle: 'Baseline benchmarks, ablation matrices & scientific hypotheses',
      icon: <FlaskConical className="w-4 h-4 text-[#f43f5e]" />,
      action: () => { navigate('/research'); onClose(); }
    },
    {
      id: 'nav-analytics',
      category: 'NAVIGATION',
      title: 'Safety-Friction Analytics',
      subtitle: 'Pareto frontier trade-offs, intervention accuracy & SFE scores',
      icon: <BarChart3 className="w-4 h-4 text-[#6366f1]" />,
      action: () => { navigate('/analytics'); onClose(); }
    },
    {
      id: 'nav-security',
      category: 'NAVIGATION',
      title: 'Security Center & Threat Model',
      subtitle: 'Mule ring defense, MITM tamper protection & compliance audit logs',
      icon: <Lock className="w-4 h-4 text-[#fbbf24]" />,
      action: () => { navigate('/security'); onClose(); }
    }
  ];

  // Actions
  const actionItems: PaletteItem[] = [
    {
      id: 'act-new-payment',
      category: 'ACTION',
      title: 'Initiate New Intent Payment',
      subtitle: 'Create a transaction with natural-language intent narrative',
      icon: <Plus className="w-4 h-4 text-[#38bdf8]" />,
      action: () => {
        onClose();
        if (onOpenLivePayment) onOpenLivePayment();
      }
    },
    {
      id: 'act-csv-import',
      category: 'ACTION',
      title: 'Import Bank Statement (CSV / BYOD)',
      subtitle: 'Batch import statement transactions for instant VERA risk audit',
      icon: <UploadCloud className="w-4 h-4 text-[#34d399]" />,
      action: () => {
        onClose();
        if (onOpenCSVImport) onOpenCSVImport();
      }
    },
    {
      id: 'act-policy-rules',
      category: 'ACTION',
      title: 'Inspect Dynamic Policy Rules',
      subtitle: 'View and toggle consortium compliance and risk thresholds',
      icon: <Sliders className="w-4 h-4 text-[#a855f7]" />,
      action: () => {
        onClose();
        if (onOpenPolicyRules) onOpenPolicyRules();
      }
    }
  ];

  // Payment search items
  const paymentItems: PaletteItem[] = payments.map(p => {
    const isAllow = p.decision === 'ALLOW';
    const isVerify = p.decision === 'VERIFY';
    return {
      id: `pmt-${p.payment_id}`,
      category: 'PAYMENT' as const,
      title: `${p.payment_id} — ₹${Number(p.amount).toLocaleString('en-IN')}`,
      subtitle: `${p.sender_id} ➔ ${p.recipient_id} | ${p.stated_intent || 'No narrative'}`,
      badge: p.decision,
      badgeColor: isAllow ? 'bg-[#064e3b] text-[#34d399]' : (isVerify ? 'bg-[#78350f] text-[#fbbf24]' : 'bg-[#7f1d1d] text-[#f87171]'),
      icon: isAllow ? (
        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
      ) : (isVerify ? (
        <Flame className="w-4 h-4 text-[#f59e0b]" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
      )),
      action: () => {
        navigate(`/payments/${p.payment_id}`);
        onClose();
      }
    };
  });

  // Combine and filter
  const allItems = [...actionItems, ...navigationItems, ...paymentItems];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q)
      )
    : allItems;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#0c0e17] border border-[#1e2336] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1b2030] bg-[#101322]">
          <Search className="w-4 h-4 text-[#60a5fa] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, route, payment ID, or VPA address..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b7280] focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelectedIndex(0); }}
              className="text-[#6b7280] hover:text-white text-xs font-mono"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#6b7280] bg-[#181d2c] border border-[#273047] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-[#151926]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#6b7280]">
              No commands, payments, or routes found matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#192238] border border-[#2b3a5c]'
                      : 'hover:bg-[#121624] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-[#121522] border border-[#1e2336] flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate font-mono">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              item.badgeColor || 'bg-[#1e2436] text-[#93c5fd]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-[#8b949e] truncate font-sans mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono text-[#4b5563] uppercase">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#60a5fa]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2 bg-[#090b12] border-t border-[#181d2a] flex items-center justify-between text-[10px] font-mono text-[#6b7280]">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-[#151926] rounded border border-[#222a3d] text-white">↑↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 bg-[#151926] rounded border border-[#222a3d] text-white">↵</kbd> select</span>
            <span><kbd className="px-1 py-0.5 bg-[#151926] rounded border border-[#222a3d] text-white">esc</kbd> close</span>
          </div>
          <span>VERA Operational Command</span>
        </div>
      </div>
    </div>
  );
};
