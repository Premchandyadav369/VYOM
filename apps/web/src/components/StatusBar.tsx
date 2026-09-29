import React, { useState, useEffect } from 'react';
import { Database, Shield, Activity, Cpu, Server, Clock, Zap } from 'lucide-react';

interface StatusBarProps {
  blockHeight: number;
  drunixMode: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ blockHeight, drunixMode }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [latency, setLatency] = useState<number>(28);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.toUTCString().replace('GMT', 'UTC').split(' ').slice(1, 5).join(' ');
      const istTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
      setTimeStr(`${istTime} IST (${utcTime})`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Minor simulated jitter in reported consensus latency
    const pingInterval = setInterval(() => {
      setLatency(Math.floor(24 + Math.random() * 8));
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
    };
  }, []);

  return (
    <footer className="fixed bottom-0 left-64 right-0 h-7 bg-[#07080c]/95 border-t border-[#171a26] px-4 flex items-center justify-between text-[10px] font-mono text-[#6b7280] select-none z-30 backdrop-blur-md">
      {/* Left: Core Infrastructure Health */}
      <div className="flex items-center gap-4">
        {/* Consensus Status */}
        <div className="flex items-center gap-1.5 text-[#10b981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="font-semibold text-white">DRUNIX:</span>
          <span className="text-[#34d399]">{drunixMode === 'REAL' ? 'MAINNET FABRIC' : 'CONSORTIUM SIMULATOR'}</span>
        </div>

        <span className="text-[#242938]">|</span>

        {/* Head Block */}
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-[#38bdf8]" />
          <span>HEAD BLOCK:</span>
          <span className="font-bold text-white tabular-nums">#{blockHeight}</span>
        </div>

        <span className="text-[#242938] hidden sm:inline">|</span>

        {/* StateDB */}
        <div className="hidden sm:flex items-center gap-1">
          <Server className="w-3 h-3 text-[#a855f7]" />
          <span>STATE DB:</span>
          <span className="text-[#cbd5e1]">SQLite ACID</span>
        </div>

        <span className="text-[#242938] hidden md:inline">|</span>

        {/* AI Intent Engine */}
        <div className="hidden md:flex items-center gap-1">
          <Cpu className="w-3 h-3 text-[#60a5fa]" />
          <span>INTENT ENGINE:</span>
          <span className="text-[#93c5fd]">Dual-Track v1.4</span>
        </div>
      </div>

      {/* Right: Latency & Clock */}
      <div className="flex items-center gap-4">
        {/* Latency */}
        <div className="flex items-center gap-1 text-[#9ca3af]">
          <Zap className="w-3 h-3 text-[#f59e0b]" />
          <span>P99:</span>
          <span className="text-white tabular-nums font-semibold">{latency}ms</span>
        </div>

        <span className="text-[#242938]">|</span>

        {/* Clock */}
        <div className="flex items-center gap-1.5 text-[#9ca3af] tabular-nums">
          <Clock className="w-3 h-3 text-[#6b7280]" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  );
};
