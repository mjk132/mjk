import { useState, useEffect, useRef } from "react";
import { BotConfig, BotCommand, WelcomeConfig, TicketConfig, StaffAppConfig, SecurityConfig, RulesConfig, LeaveResignationConfig } from "../types";
import { 
  Globe, Cpu, Play, Square, Key, Shield, Info, ExternalLink, 
  Trash2, RefreshCw, Server, MessageSquare, AlertCircle, HelpCircle, CheckCircle, Copy, Check, ChevronLeft, ChevronRight, BookOpen,
  Activity, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MJKLogo from "./MJKLogo";

interface LiveHostProps {
  config: BotConfig;
  commands: BotCommand[];
  welcome: WelcomeConfig;
  ticket: TicketConfig;
  staffApp: StaffAppConfig;
  security: SecurityConfig;
  rulesBot: RulesConfig;
  leaveConfig: LeaveResignationConfig;
  suggestion?: any;
  report?: any;
  warning?: any;
  autoResponse?: any;
  giveaway?: any;
  levelConfig?: any;
  reactionRoles?: any;
  voiceStats?: any;
  autoRoles?: any;
  embedFormatter?: any;
  modLogs?: any;
}

interface LiveBotStatus {
  status: "offline" | "logging_in" | "online" | "error";
  error: string | null;
  botUser: {
    tag: string;
    avatar: string;
    guildsCount: number;
    latency: number;
  } | null;
  logs: string[];
}

export default function LiveHost({
  config,
  commands,
  welcome,
  ticket,
  staffApp,
  security,
  rulesBot,
  leaveConfig,
  suggestion,
  report,
  warning,
  autoResponse,
  giveaway,
  levelConfig,
  reactionRoles,
  voiceStats,
  autoRoles,
  embedFormatter,
  modLogs
}: LiveHostProps) {
  const [token, setToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom states matching user guidelines
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const [statusState, setStatusState] = useState<LiveBotStatus>({
    status: "offline",
    error: null,
    botUser: null,
    logs: []
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("discord_bot_token") || "";
    const savedClientId = localStorage.getItem("discord_bot_client_id") || "";
    if (savedToken) setToken(savedToken);
    if (savedClientId) setClientId(savedClientId);

    // Auto-open modal guide if no token has been set yet
    if (!savedToken) {
      setShowGuideModal(true);
    }
  }, []);

  // Poll status from the backend API
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const key = localStorage.getItem("sub_key") || "";
        const response = await fetch(`/api/bot/live-status?subscriptionKey=${encodeURIComponent(key)}`);
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            setStatusState(data);
          }
        }
      } catch (err) {
        // Handle quietly during server restarts
        console.debug("Quietly handled polling error during server boot in LiveHost:", err);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs to bottom within the container without affecting the outer scroll
  useEffect(() => {
    const container = logContainerRef.current;
    if (container) {
      // Check if user is scrolled near the bottom (within 90px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 90;
      if (isNearBottom || container.scrollTop === 0) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [statusState.logs]);

  // Click to Save Helper
  const saveCredentials = (t: string, cid: string) => {
    localStorage.setItem("discord_bot_token", t);
    localStorage.setItem("discord_bot_client_id", cid);
  };

  // Auto-saving credentials effect as typing with neat status feedback
  useEffect(() => {
    if (token || clientId) {
      setSaveStatus("saving");
      const delay = setTimeout(() => {
        saveCredentials(token.trim(), clientId.trim());
        setSaveStatus("saved");
        const idleDelay = setTimeout(() => {
          setSaveStatus("idle");
        }, 1500);
        return () => clearTimeout(idleDelay);
      }, 700);
      return () => clearTimeout(delay);
    }
  }, [token, clientId]);

  const handleStartBot = async () => {
    if (!token.trim()) {
      alert("الرجاء إدخال توكن البوت أولاً في الخطوة 1!");
      setWizardStep(1);
      return;
    }
    if (!clientId.trim()) {
      alert("الرجاء إدخال أيدي البوت (Client ID) أولاً في الخطوة 1!");
      setWizardStep(1);
      return;
    }

    setLoading(true);
    saveCredentials(token.trim(), clientId.trim());

    try {
      const response = await fetch("/api/bot/live-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token.trim(),
            clientId: clientId.trim(),
            subscriptionKey: localStorage.getItem("sub_key") || "",
            config,
            commands,
            welcome,
            ticket,
            staffApp,
            security,
            rulesBot,
            leaveConfig,
            suggestion,
            report,
            warning,
            autoResponse,
            giveaway,
            levelConfig,
            reactionRoles,
            voiceStats,
            autoRoles,
            embedFormatter,
            modLogs
          })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to initiate server host.");
      }

      localStorage.removeItem("mjk_bot_needs_restart");

    } catch (err: any) {
      alert(`خطأ في تشغيل الاستضافة: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async () => {
    setLoading(true);
    try {
      const key = localStorage.getItem("sub_key") || "";
      await fetch("/api/bot/live-stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionKey: key })
      });
    } catch (err) {
      console.error("Stop bot err:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const key = localStorage.getItem("sub_key") || "";
      await fetch("/api/bot/live-clear-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionKey: key })
      });
      setStatusState(prev => ({ ...prev, logs: [] }));
    } catch (err) {
      console.error("Clear logs err:", err);
    }
  };

  // Friendly Arabic Error Translator Helper
  const translateBotError = (err: string | null): string => {
    if (!err) return "";
    const lower = err.toLowerCase();
    if (lower.includes("401") || lower.includes("token") || lower.includes("invalid token") || lower.includes("unauthorized") || lower.includes("incorrect")) {
      return "🔑 الرمز السري للبوت غير صحيح: من الممكن أن يكون التوكن المدخل منتهي الصلاحية أو تم تغيير كلمة مروره. يرجى العودة للخطوة 1، والدخول لبوابة ديسكورد والنقر على 'Reset Token' لنسخ التوكن السري الصحيح بالكامل متبوعاً بلصقه هنا.";
    }
    if (lower.includes("client_id") || lower.includes("application_id") || lower.includes("match")) {
      return "🆔 أيدي العميل (Client ID) غير مطابق: معرف التطبيق المدخل لا يتبع التوكن السري للبوت. تأكد من جلب رقم الـ Application ID الصحيح من حقل OAuth2 في بوابة مطوري ديسكورد.";
    }
    if (lower.includes("intent") || lower.includes("privileged") || lower.includes("disallowed")) {
      return "🛡️ مشكلة بتفعيل خيارات الـ Intents: يمتنع ديسكورد عن بدء تشغيل البوت لتفعيل البنود المتقدمة. اذهب لبوابة مطوري ديسكورد (تبويب Bot ثم الخيارات الثلاث تحت Privileged Gateway Intents: Presence, Server Members, Message Content) وفَعّلها جميعاً ثم أعد التشغيل.";
    }
    return `⚠️ حدث خلاف تقني بالشبكة: ${err}. يرجى التحقق من اتصالك وإعادة تشغيل البث السحابي مرة أخرى.`;
  };

  const handleCopyText = (text: string, type: "token" | "clientId" | "invite") => {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 1500);
    } else if (type === "clientId") {
      setCopiedClientId(true);
      setTimeout(() => setCopiedClientId(false), 1500);
    } else if (type === "invite") {
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 1500);
    }
  };

  const inviteUrl = clientId.trim() 
    ? `https://discord.com/api/oauth2/authorize?client_id=${clientId.trim()}&permissions=8&scope=bot%20applications.commands`
    : "";

  const cpuPercent = statusState.status === "online" ? 32 : 0;
  const ramPercent = statusState.status === "online" ? 58 : 0;
  const uptime = statusState.status === "online" ? "99.9%" : "0.0%";
  const networkIn = statusState.status === "online" ? "1.2" : "0.0";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">MJK Hosting</h2>
              <p className="text-xs text-text-muted">Cloud instance monitoring &amp; control</p>
            </div>
          </div>
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-border-hover text-text-muted hover:text-white rounded-lg text-[11px] font-medium transition cursor-pointer select-none shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Monitoring Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">CPU</span>
            <div className={`p-2 ${statusState.status === "online" ? "bg-primary/10 text-primary" : "bg-border/50 text-text-dim"} rounded-lg`}>
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{cpuPercent}%</p>
          <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${statusState.status === "online" ? "bg-primary/60" : "bg-border"}`} style={{ width: `${cpuPercent}%` }} />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">Memory</span>
            <div className={`p-2 ${statusState.status === "online" ? "bg-success/10 text-success" : "bg-border/50 text-text-dim"} rounded-lg`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{ramPercent}%</p>
          <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${statusState.status === "online" ? "bg-success/60" : "bg-border"}`} style={{ width: `${ramPercent}%` }} />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">Network</span>
            <div className={`p-2 ${statusState.status === "online" ? "bg-accent/10 text-accent" : "bg-border/50 text-text-dim"} rounded-lg`}>
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{networkIn} Mbps</p>
          <p className="text-[10px] text-text-dim mt-0.5">
            {statusState.status === "online" ? `${statusState.botUser?.guildsCount || 0} active guilds` : "Disconnected"}
          </p>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">Uptime</span>
            <div className={`p-2 ${statusState.status === "online" ? "bg-success/10 text-success" : "bg-border/50 text-text-dim"} rounded-lg`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{uptime}</p>
          <p className="text-[10px] text-text-dim mt-0.5">
            {statusState.status === "online" ? "Stable" : "Offline"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: Credentials & Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Credentials Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-white">Setup</span>
              </div>
              <div className="text-[10px] text-text-muted">
                {saveStatus === "saving" && (
                  <span className="text-warning flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-success flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
                {saveStatus === "idle" && (
                  <span>Auto-save</span>
                )}
              </div>
            </div>

            {/* Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-text-muted">Bot Token</label>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {showToken ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyText(token, "token")}
                  className="p-2 border border-border hover:border-border-hover bg-surface rounded-lg text-text-muted hover:text-white cursor-pointer transition shrink-0"
                >
                  {copiedToken ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
                <input
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none text-left"
                  placeholder="Paste bot token..."
                />
              </div>
            </div>

            {/* Client ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted">Client ID</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyText(clientId, "clientId")}
                  className="p-2 border border-border hover:border-border-hover bg-surface rounded-lg text-text-muted hover:text-white cursor-pointer transition shrink-0"
                >
                  {copiedClientId ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none text-left"
                  placeholder="e.g. 120531950..."
                />
              </div>
            </div>

            {/* Start/Stop Button */}
            <div className="pt-1">
              {statusState.status === "online" ? (
                <button
                  type="button"
                  onClick={handleStopBot}
                  disabled={loading}
                  className="w-full bg-danger hover:bg-danger/80 text-white font-medium rounded-lg text-xs py-2.5 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Instance</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartBot}
                  disabled={loading || statusState.status === "logging_in"}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg text-xs py-2.5 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {statusState.status === "logging_in" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Deploy Instance</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg">
              <span className={`w-2 h-2 rounded-full ${
                statusState.status === "online" ? "bg-success" :
                statusState.status === "logging_in" ? "bg-warning animate-pulse" :
                statusState.status === "error" ? "bg-danger" : "bg-text-dim"
              }`} />
              <span className="text-xs text-text-muted">
                {statusState.status === "online" ? `Connected — ${statusState.botUser?.tag || config.name}` :
                 statusState.status === "logging_in" ? "Connecting to Discord..." :
                 statusState.status === "error" ? "Connection error" : "Idle"}
              </span>
            </div>
          </div>

          {/* Invite Link */}
          {statusState.status === "online" && inviteUrl && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-xs text-text-muted">Invite bot to server</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyText(inviteUrl, "invite")}
                    className="p-1.5 border border-border bg-surface hover:border-border-hover text-text-muted rounded-lg cursor-pointer transition"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg text-[11px] flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Logs Console */}
        <div className="lg:col-span-8">
          <div className="flex-1 min-h-[400px] bg-[#080B12] border border-border rounded-xl flex flex-col relative overflow-hidden select-text">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border select-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Console</span>
                <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  statusState.status === "online" ? "bg-success/10 text-success" :
                  statusState.status === "logging_in" ? "bg-warning/10 text-warning" :
                  statusState.status === "error" ? "bg-danger/10 text-danger" : "bg-border/50 text-text-dim"
                }`}>
                  {statusState.status === "online" ? "ONLINE" :
                   statusState.status === "logging_in" ? "CONNECTING" :
                   statusState.status === "error" ? "ERROR" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-text-dim font-mono">{statusState.logs.length} lines</span>
                <button
                  onClick={handleClearLogs}
                  className="p-1 cursor-pointer text-text-dim hover:text-white rounded hover:bg-border/50 transition-colors"
                  title="Clear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-0.5" style={{ minHeight: "340px" }}>
              {statusState.logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-dim space-y-2 select-none">
                  <Terminal className="w-6 h-6 text-border" />
                  <p className="font-mono text-[10px] tracking-widest text-border font-medium">Awaiting logs...</p>
                  <p className="text-[9px] text-text-dim">Deploy your bot instance to see live output</p>
                </div>
              ) : (
                statusState.logs.map((log, index) => {
                  let textClass = "text-text-muted";
                  if (log.includes("[READY]")) textClass = "text-success font-medium";
                  else if (log.includes("[ERROR]")) textClass = "text-danger font-medium";
                  else if (log.includes("[SETUP]")) textClass = "text-primary";
                  else if (log.includes("[EVENT]")) textClass = "text-primary/80";
                  else if (log.includes("[AUTOMOD]")) textClass = "text-warning";
                  else if (log.includes("[COMMAND]")) textClass = "text-white";

                  return (
                    <div key={index} className={`border-l-2 pl-3 py-0.5 hover:bg-card/30 transition-colors ${textClass}`}
                      style={{ borderColor: log.includes("[ERROR]") ? "rgba(239,68,68,0.4)" : log.includes("[READY]") ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.06)" }}>
                      <span className="text-text-dim/50 select-none">{String(index + 1).padStart(3, "0")}</span> {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Error Banner */}
          {statusState.status === "error" && statusState.error && (
            <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-danger">Connection Error</p>
                  <p className="text-xs text-text-muted">{translateBotError(statusState.error)}</p>
                  <details className="mt-1 text-[10px] text-text-dim font-mono cursor-pointer">
                    <summary className="text-xs text-danger/70 hover:underline">Technical details</summary>
                    <pre className="bg-[#080B12] p-2 rounded mt-1 overflow-x-auto select-text text-[10px] leading-tight">{statusState.error}</pre>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuideModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-card border border-border rounded-xl w-full max-w-lg shadow-elevated relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Setup Guide
                </h3>
                <button onClick={() => setShowGuideModal(false)} className="text-xs text-text-dim hover:text-white cursor-pointer">Close</button>
              </div>
              <div className="space-y-4 text-xs text-text-muted leading-relaxed max-h-[400px] overflow-y-auto">
                <div className="bg-surface border border-border p-3 rounded-lg text-xs">
                  Follow these steps to connect your Discord bot to MJK Hosting.
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-white">Go to Discord Developer Portal</p>
                      <p className="mt-0.5">Visit <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary-hover">discord.com/developers/applications</a> and create a new application.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-white">Copy Client ID</p>
                      <p className="mt-0.5">Find your Client ID under the OAuth2 tab.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-white">Create a Bot Token</p>
                      <p className="mt-0.5">Go to the Bot tab, click Reset Token, and copy the new token.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-warning/10 border border-warning/20 text-warning rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">4</span>
                    <div className="bg-warning/5 border border-warning/20 p-2.5 rounded-lg flex-1">
                      <p className="font-medium text-warning">Enable Gateway Intents</p>
                      <p className="mt-0.5">Enable all three Privileged Gateway Intents: Presence, Server Members, and Message Content.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex gap-3">
                <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Developer Portal
                </a>
                <button onClick={() => setShowGuideModal(false)} className="flex-1 py-2 bg-surface border border-border hover:border-border-hover text-text-muted hover:text-white rounded-lg text-xs font-medium transition cursor-pointer">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
