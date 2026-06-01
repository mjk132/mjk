import { useState, useEffect } from "react";
import { ServerLog } from "../types";
import { Terminal, RefreshCw, Cpu, Activity, Database, AlertCircle, Sparkles } from "lucide-react";

interface BotDashboardProps {
  logs: ServerLog[];
  setLogs: (logs: ServerLog[]) => void;
  commandsCount: number;
}

export default function BotDashboard({ logs, setLogs, commandsCount }: BotDashboardProps) {
  // Mock CPU, Ram, latency states for graphic outputs
  const [cpu, setCpu] = useState(2.4);
  const [ram, setRam] = useState(48.2);
  const [latency, setLatency] = useState(14);
  const [activeSocketCount, setActiveSocketCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      // Dynamic mild fluctuation of stats
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
    setLogs([
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        message: "🧹 Terminal console buffer cleared out by developer."
      }
    ]);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "command": return "text-purple-400";
      case "automod": return "text-yellow-400";
      case "voice": return "text-[#43b581]";
      case "system": return "text-blue-400";
      case "info":
      default: return "text-slate-400";
    }
  };

  return (
    <div className="space-y-6" id="bot-dashboard">
      
      {/* Top statistics cards matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Latency meter */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">API Latency</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">{latency}</span>
              <span className="text-[10px] text-slate-500 font-mono">ms</span>
            </div>
            <span className="text-[11px] text-emerald-500/80 font-medium font-sans flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Connection excellent
            </span>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* CPU usage load */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">CPU Engine Load</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-400 font-mono">{cpu}%</span>
            </div>
            {/* simple micro bar meter */}
            <div className="w-28 h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1.5 border border-slate-800">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(cpu / 15) * 100}%` }} />
            </div>
          </div>
          <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* RAM footprint */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Memory Usage</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-400 font-mono">{ram}</span>
              <span className="text-[10px] text-slate-500 font-mono">MB</span>
            </div>
            {/* simple micro bar meter */}
            <div className="w-28 h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1.5 border border-slate-800">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(ram / 120) * 100}%` }} />
            </div>
          </div>
          <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-indigo-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Registered triggers */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Triggers Built</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-400 font-mono">{commandsCount}</span>
              <span className="text-[10px] text-slate-500 font-sans">active</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Ready to deploy online</span>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-900/50 rounded-xl text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Terminal panel layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[500px]">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850">
          <div className="flex items-center gap-2.5 font-mono">
            <Terminal className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Developer Trace Console</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold font-sans transition-all flex items-center gap-1.5"
            >
              Clear Buffer
            </button>
          </div>
        </div>

        {/* Scroll stream viewport */}
        <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-y-auto leading-relaxed border border-slate-850/80 custom-scrollbar space-y-2">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">No log outputs have streamed into this terminal segment yet.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-1 hover:bg-slate-900/40 py-0.5 rounded transition">
                <span className="text-slate-500 select-none shrink-0 font-light">[{log.timestamp}]</span>
                <span className={`uppercase font-bold shrink-0 tracking-wider text-[10px] ${
                  log.type === 'command' ? 'text-purple-400' :
                  log.type === 'automod' ? 'text-yellow-500' :
                  log.type === 'voice' ? 'text-emerald-500' : 
                  log.type === 'system' ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  [{log.type}]
                </span>
                <span className={`font-mono text-slate-300 ${getLogColor(log.type)} break-all`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Log diagnostics info bar */}
        <div className="mt-3.5 flex items-center gap-2 text-[11px] text-slate-500 font-sans">
          <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
          <span>سجل المعالجة المباشرة للأوامر والعمليات المتصلة ببوابة ديسكورد (Discord Gateway Payload Pipeline) بشكل فوري وآمن.</span>
        </div>

      </div>

    </div>
  );
}
