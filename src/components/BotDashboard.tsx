import { useState, useEffect } from "react";
import { ServerLog } from "../types";
import { Terminal, RefreshCw, Activity, Cpu, Database, Sparkles, AlertCircle } from "lucide-react";

interface BotDashboardProps {
  logs: ServerLog[];
  setLogs: (logs: ServerLog[]) => void;
  commandsCount: number;
}

export default function BotDashboard({ logs, setLogs, commandsCount }: BotDashboardProps) {
  const [cpu, setCpu] = useState(2.4);
  const [ram, setRam] = useState(48.2);
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => {
        const delta = (Math.random() - 0.5) * 1.5;
        const next = prev + delta;
        return next < 0.5 ? 0.5 : next > 12 ? 12 : parseFloat(next.toFixed(1));
      });
      setRam(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        const next = Math.max(45, Math.min(65, prev + delta));
        return parseFloat(next.toFixed(1));
      });
      setLatency(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 4);
        const next = Math.max(8, Math.min(32, prev + delta));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    setLogs([{
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "Console buffer cleared."
    }]);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "command": return "text-accent";
      case "automod": return "text-warning";
      case "voice": return "text-success";
      case "system": return "text-primary";
      case "info":
      default: return "text-text-muted";
    }
  };

  return (
    <div className="space-y-6" id="bot-dashboard">

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">API Latency</span>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono">{latency}</span>
            <span className="text-[10px] text-text-dim font-mono">ms</span>
          </div>
          <p className="text-[11px] text-success font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Connection excellent
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">CPU Engine Load</span>
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{cpu}%</p>
          <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <div className="h-full bg-accent/60 rounded-full transition-all duration-500" style={{ width: `${(cpu / 15) * 100}%` }} />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">Memory Usage</span>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono">{ram}</span>
            <span className="text-[10px] text-text-dim font-mono">MB</span>
          </div>
          <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${(ram / 120) * 100}%` }} />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">Triggers Built</span>
            <div className="p-2 bg-success/10 text-success rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{commandsCount}</p>
          <p className="text-[11px] text-text-muted mt-1">Ready to deploy</p>
        </div>

      </div>

      {/* Terminal Console */}
      <div className="bg-card border border-border rounded-xl flex flex-col h-[500px]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2.5 font-mono">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-white uppercase tracking-wide">Console</span>
          </div>
          <button
            onClick={handleClearLogs}
            className="px-3 py-1.5 bg-surface border border-border text-text-muted hover:text-white hover:border-border-hover rounded-lg text-[11px] font-medium transition flex items-center gap-1.5"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 bg-[#080B12] rounded-b-xl p-4 font-mono text-xs overflow-y-auto leading-relaxed space-y-2">
          {logs.length === 0 ? (
            <p className="text-text-dim italic">No log output yet.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 px-1 hover:bg-[rgba(255,255,255,0.02)] py-0.5 rounded transition">
                <span className="text-text-dim/50 select-none shrink-0 font-light">[{log.timestamp}]</span>
                <span className={`uppercase font-bold shrink-0 tracking-wider text-[10px] ${getLogColor(log.type)}`}>
                  [{log.type}]
                </span>
                <span className={`font-mono text-text-muted ${getLogColor(log.type)} break-all`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 border-t border-border text-[11px] text-text-dim">
          <AlertCircle className="w-3 h-3" />
          <span>Live Discord gateway event pipeline</span>
        </div>
      </div>

    </div>
  );
}
