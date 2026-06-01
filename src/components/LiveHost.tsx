import { useState, useEffect, useRef } from "react";
import { BotConfig, BotCommand, WelcomeConfig, TicketConfig, StaffAppConfig, SecurityConfig, RulesConfig, LeaveResignationConfig } from "../types";
import { 
  Globe, Cpu, Play, Square, Key, Shield, Info, ExternalLink, 
  Trash2, RefreshCw, Server, MessageSquare, AlertCircle, HelpCircle, CheckCircle, Copy, Check, ChevronLeft, ChevronRight, BookOpen
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
  voiceStats
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
          voiceStats
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

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner Header with Guide Button */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 select-none relative overflow-hidden" id="livehost-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 text-right w-full" style={{ direction: "rtl" }}>
            <div className="flex items-center gap-3 justify-start">
              <div className="scale-105 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <MJKLogo size={34} />
              </div>
              <h2 className="text-md font-extrabold text-slate-100">
                الاستضافة السحابية المباشرة (MJK Cloud Hosting Engine)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
              شغل بوتك المتكامل بنقرة زر واحدة يعمل على مصلحتك 24 ساعة طوال أيام الأسبوع بكل سلاسة ودون انقطاع. فَعَلنا المعالج الذكي بالأسفل لتلقين البوت التعليمات خطوة بخطوة.
            </p>
          </div>
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer select-none shrink-0"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>عرض دليل المبتدئين 📖</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Setup Wizard (3 STEPS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0d1017] border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 space-y-5">
            
            {/* Save Status & Title */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3" style={{ direction: "rtl" }}>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  ⚡ معالج الضبط السحابي الموحد
                </span>
              </div>
              
              {/* Dynamic Auto-save Feedback Badge */}
              <div className="text-[10px] font-bold">
                {saveStatus === "saving" && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> جاري الحفظ تلقائياً...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-emerald-450 flex items-center gap-1">
                    <Check className="w-3 h-3" /> تم حفظ التغييرات تلقائياً
                  </span>
                )}
                {saveStatus === "idle" && (
                  <span className="text-slate-500">• حفظ تلقائي نشط</span>
                )}
              </div>
            </div>

            {/* Responsive Sequential Step Tracker (Step Indicators) */}
            <div className="flex items-center gap-2 select-none" style={{ direction: "rtl" }}>
              {[
                { step: 1, label: "1. رموز الاتصال 🔑" },
                { step: 2, label: "2. الميزات ⚙️" },
                { step: 3, label: "3. البث المباشر ⚡" }
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => setWizardStep(item.step)}
                  className={`flex-1 py-2 text-center rounded-xl text-[11px] font-bold transition border ${
                    wizardStep === item.step
                      ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow-sm"
                      : "bg-[#06080a] border-slate-900 text-slate-500 hover:text-slate-350"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Wizard Body Conditional Rendering */}
            <div className="min-h-[220px]">
              
              {/* STEP 1: ENTER CODES & TOKENS */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-fade-in text-right" style={{ direction: "rtl" }}>
                  <div className="p-3.5 bg-[#06080a] border border-slate-900 rounded-xl space-y-1">
                    <span className="text-slate-200 text-xs font-bold block">مرحباً بك في مرحلة الربط الأولى! 👋</span>
                    <p className="text-slate-450 text-[10px] leading-relaxed">
                      نحتاج أولاً إلى ربط المنظومة بتطبيق ديسكورد الفريد الخاص بك ليتسنى له التكلم والتفاعل وسماع أوامر لوحتك بشكل حي.
                    </p>
                  </div>

                  {/* Token Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1 cursor-default">
                        <span>رمز توكن البوت السري (Discord Bot Token)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <button 
                        onClick={() => setShowToken(!showToken)}
                        className="text-[10px] text-indigo-400 hover:underline cursor-pointer font-bold"
                      >
                        {showToken ? "إخفاء الرمز" : "إظهار الرمز"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyText(token, "token")}
                        className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer transition select-none shrink-0"
                        title="نسخ التوكن"
                      >
                        {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <input
                        type={showToken ? "text" : "password"}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-left"
                        placeholder="Paste Token here..."
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  {/* Client ID Field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1 cursor-default">
                      <span>أيدي البوت المعرف (Client ID / Application ID)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyText(clientId, "clientId")}
                        className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer transition select-none shrink-0"
                        title="نسخ الأيدي"
                      >
                        {copiedClientId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-left"
                        placeholder="e.g. 120531950..."
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  {/* Flow Trigger */}
                  <button
                    onClick={() => setWizardStep(2)}
                    className="w-full mt-3 flex items-center justify-center gap-1 px-4 py-2 bg-slate-900 border border-indigo-950 hover:bg-slate-850 text-indigo-300 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <span>أكمل الخطوة الثانية لتدشين الميزات ⚙️</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: VERIFY BOT MODULES & ACTIVE SYSTEMS */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fade-in text-right" style={{ direction: "rtl" }}>
                  <div className="p-3 bg-[#06080a] border border-slate-900 rounded-xl">
                    <span className="text-slate-200 text-xs font-bold block">مراجعة ميزات البوت المبرمجة ⚙️</span>
                    <p className="text-slate-450 text-[10px] leading-relaxed mt-0.5">
                      تأكد من تفعيل البوتات الإدارية الذكية التي برمجتها باللوحة قبل بثه حياً في السيرفر.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 font-sans">
                    <div className="p-2 bg-slate-950/50 border border-slate-900 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">👋 الترحيب الفوري</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${welcome.enabled ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"}`}>
                        {welcome.enabled ? "نشط" : "غير مفعّل"}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-950/50 border border-slate-900 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">🎫 بوت التذاكر والدعم</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ticket.enabled ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"}`}>
                        {ticket.enabled ? "نشط" : "غير مفعّل"}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-950/50 border border-slate-900 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">🛡️ التوظيف واستقبال الإدارة</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${staffApp.enabled ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"}`}>
                        {staffApp.enabled ? "نشط" : "غير مفعّل"}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-950/50 border border-slate-900 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">🛡️ نظام الحماية</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${security.enabled ? "bg-[#E74C3C]/20 text-red-400" : "bg-slate-900 text-slate-500"}`}>
                        {security.enabled ? "نشط" : "غير مفعّل"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed text-right font-sans">
                    * يمكنك تمكين أو تعطيل أي ميزة فورا في أي وقت عبر تبويب <strong>الأنظمة الذكية</strong> باللوحة الجانبية لتنعكس التعديلات حية.
                  </p>

                  <div className="flex gap-2 pt-1 select-none">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="flex-1 py-2 bg-[#06080a] border border-slate-900 hover:bg-slate-900 text-slate-400 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      عودة للسابقة
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      className="flex-1 py-2 bg-[#06080a] border border-indigo-950 hover:bg-indigo-950/20 text-indigo-300 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>تشغيل واستضافة ⚡</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: LOBBY & DEPLOY LIVE CONNECTION */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fade-in text-right" style={{ direction: "rtl" }}>
                  <div className="p-3 bg-[#06080a] border border-slate-900 rounded-xl space-y-1">
                    <span className="text-slate-200 text-xs font-bold block">مستعد للبث في خوادمنا 🚀</span>
                    <p className="text-slate-450 text-[10px] leading-relaxed">
                      التوكن مأمن ومحفوظ. هل أنت حائل لبث البوت؟ انقر على زر البث الأخضر بالأسفل لتشغيل البوت بضغطة زر.
                    </p>
                  </div>

                  {/* Run controls here */}
                  <div className="pt-2">
                    {statusState.status === "online" ? (
                      <button
                        type="button"
                        onClick={handleStopBot}
                        disabled={loading}
                        className="w-full bg-red-650 hover:bg-red-750 text-white font-black rounded-xl text-xs py-2.5 flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/10 disabled:opacity-50"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>🛑 إيقاف استضافة البوت | Stop Live Host</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartBot}
                        disabled={loading || statusState.status === "logging_in"}
                        className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-black rounded-xl text-xs py-2.5 flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-500/15 disabled:opacity-50"
                      >
                        {statusState.status === "logging_in" ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>🔄 جاري الاستجابة والاتصال بديسكورد...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white animate-pulse" />
                            <span>⚡ تشغيل وبث البوت الآن حياً</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Navigation back and skip */}
                  <div className="flex gap-2 select-none">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="w-full py-2 bg-[#06080a] border border-slate-900 hover:bg-slate-900 text-slate-400 rounded-lg text-xs font-bold transition cursor-pointer text-center"
                    >
                      مراجعة الميزات
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        
        {/* Right Column: Active Bot Status & Monospace Scrollable Terminal Console */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Active Bot Network Connection Status Card */}
          <div className="bg-[#0d1017] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Profile layout */}
              <div className="flex items-center gap-3 select-none">
                <div className="w-12 h-12 bg-[#06080a] rounded-xl border border-slate-800 flex items-center justify-center text-2xl relative">
                  {statusState.status === "online" && statusState.botUser ? (
                    <img 
                      src={statusState.botUser.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80"} 
                      alt="User avatar" 
                      className="w-full h-full rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>🤖</span>
                  )}
                  {/* Pulse active status dot based on status */}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0d1017] flex items-center justify-center ${
                    statusState.status === "online" ? "bg-emerald-500 animate-pulse" :
                    statusState.status === "logging_in" ? "bg-amber-500 animate-spin border-dashed" :
                    statusState.status === "error" ? "bg-rose-500" : "bg-slate-600"
                  }`} />
                </div>

                <div className="space-y-0.5 text-right md:text-right" style={{ direction: "rtl" }}>
                  <h3 className="text-xs font-bold text-slate-100 font-mono tracking-tight">
                    {statusState.status === "online" && statusState.botUser ? statusState.botUser.tag : config.name}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {statusState.status === "online" ? (
                      <span className="text-emerald-400 font-bold block">🟢 البوت متصل بالخادم ويعمل الآن بنجاح</span>
                    ) : statusState.status === "logging_in" ? (
                      <span className="text-amber-400 font-bold block animate-pulse">🔄 جاري التحقق وتسجيل الدخول...</span>
                    ) : statusState.status === "error" ? (
                      <span className="text-rose-400 font-bold block">❌ فشل تسجيل الدخول للبوت (خطأ في الاتصال)</span>
                    ) : (
                      <span className="block text-slate-400">🔴 الاستضافة متوقفة حالياً (البوت غير نشط)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bot Server Metadata Network Details */}
              <div className="flex items-center gap-4 justify-end select-none">
                <div className="text-center px-4 py-2 bg-[#06080a] border border-slate-900 rounded-xl">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-mono">Servers Joined</span>
                  <span className="text-sm font-extrabold text-slate-200 font-mono">
                    {statusState.status === "online" && statusState.botUser ? statusState.botUser.guildsCount : "-"}
                  </span>
                </div>
                <div className="text-center px-4 py-2 bg-[#06080a] border border-slate-900 rounded-xl">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-mono">Ping Latency</span>
                  <span className="text-sm font-extrabold text-[#6366f1] font-mono">
                    {statusState.status === "online" && statusState.botUser ? `${statusState.botUser.latency}ms` : "-"}
                  </span>
                </div>
              </div>

            </div>

            {/* ERROR BANNER BLOCK (Friendly translated error) */}
            {statusState.status === "error" && statusState.error && (
              <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div className="space-y-1 text-right w-full" style={{ direction: "rtl" }}>
                  <span className="block text-[11px] font-bold uppercase text-red-300">عذراً! تم رصد مشكلة تقنية بالاتصال ولتفاديها:</span>
                  <p className="text-xs text-red-200/90 leading-relaxed font-sans">{translateBotError(statusState.error)}</p>
                  
                  {/* Real log stack for developers to look */}
                  <details className="mt-2 text-[9px] text-red-500/80 font-mono text-left cursor-pointer" style={{ direction: 'ltr' }}>
                    <summary className="text-right text-[10px] text-red-450 hover:underline">عرض الـ Tracer الطبي للأكواد</summary>
                    <div className="bg-slate-950 p-2 rounded mt-1 overflow-x-auto select-text leading-tight">{statusState.error}</div>
                  </details>
                </div>
              </div>
            )}

            {/* Invite button panel if active user client online */}
            {statusState.status === "online" && inviteUrl && (
              <div className="mt-4 p-3.5 bg-indigo-950/25 border border-indigo-900/35 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none" style={{ direction: "rtl" }}>
                <div className="flex items-center gap-2 text-right">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs text-slate-350">
                    البوت يبث خادمنا! يمكنك الآن دعوته لسيرفرك لنصب الأزرار:
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyText(inviteUrl, "invite")}
                    className="p-2 border border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300 rounded-lg cursor-pointer transition select-none"
                    title="نسخ رابط الدعوة"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-black rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-md shadow-indigo-650/10 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>دعوة وإضافة البوت الآن</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* System Console Monitor */}
          <div className="flex-1 min-h-[380px] bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col relative overflow-hidden select-text">
            
            {/* Header toolbar for Console logs */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3 select-none">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  📟 مراقب المعالجة والمحاكاة الفوري (Host Logs Stream)
                </span>
              </div>
              <button
                onClick={handleClearLogs}
                title="مسح الكونسول"
                className="p-1 cursor-pointer text-slate-500 hover:text-slate-350 rounded hover:bg-slate-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrolling logs container area */}
            <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-1.5 pr-2 custom-scrollbar font-mono text-[11px] leading-relaxed max-h-[340px]">
              {statusState.logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-650 space-y-2 select-none py-16">
                  <Cpu className="w-8 h-8 text-slate-800 animate-pulse" />
                  <p className="font-mono text-[10px] tracking-widest text-slate-700 font-medium">WAITING INCOMING TELEMETRIES...</p>
                </div>
              ) : (
                statusState.logs.map((log, index) => {
                  let textClass = "text-slate-300";
                  if (log.includes("[READY]")) textClass = "text-emerald-400 font-bold";
                  else if (log.includes("[ERROR]")) textClass = "text-rose-450 font-bold";
                  else if (log.includes("[SETUP]")) textClass = "text-indigo-400";
                  else if (log.includes("[EVENT]")) textClass = "text-indigo-300";
                  else if (log.includes("[AUTOMOD]")) textClass = "text-amber-400 font-semibold";
                  else if (log.includes("[COMMAND]")) textClass = "text-cyan-400";
                  
                  return (
                     <div key={index} className={`border-l-2 border-slate-900 pl-2 py-0.5 hover:bg-[#0d1017] transition-colors text-left ${textClass}`} style={{ direction: 'ltr' }}>
                       {log}
                     </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ONBOARDING WELCOME MODAL (دليل الربط الترحيبي) */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuideModal(false)}
              className="absolute inset-0 bg-[#06080a]/90 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d1017] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 text-right select-none p-6 space-y-5"
              style={{ direction: "rtl" }}
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-sm font-extrabold text-slate-100 font-sans">
                    📖 دليل الربط السري السريع مع ديسكورد (Discord Application Guide)
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-350 cursor-pointer text-right p-1"
                >
                  [ إغلاق الدليل ✕ ]
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed max-h-[420px] overflow-y-auto pr-1">
                <div className="bg-[#0b0f19] border border-slate-900 p-3.5 rounded-xl text-slate-400">
                  يرشدك هذا الملف المصور لتمرير رموز التوصيل السحرية لتعمل استضافة <strong>منظومة MJK System</strong> معك بأمان وسرية تامة على مدار الساعة مجاناً.
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 bg-indigo-950 border border-indigo-800/40 text-indigo-300 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">١</span>
                    <div>
                      <h4 className="font-bold text-slate-200">الولوج لبوابة مطوري ديسكورد (Discord Application Portal):</h4>
                      <p className="text-slate-400 mt-0.5">
                        توجه إلى الموقع الرسمي لمكتبة ديسكورد للمطورين <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5 hover:text-indigo-300">discord.com/developers/applications <ExternalLink className="w-3 h-3 inline" /></a> ثم انقر على زر <strong>New Application</strong> وقم بتسمية البوت الخاص بك.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 bg-indigo-950 border border-indigo-800/40 text-indigo-300 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">٢</span>
                    <div>
                      <h4 className="font-bold text-slate-200">جلب معرف البوت (Client ID):</h4>
                      <p className="text-slate-450 mt-0.5">
                        اذهب لتبويب <strong>OAuth2</strong> من القائمة الجانبية هناك، وستجد حقل باسم <strong>Client ID</strong>. قم بنسخه فوراً لتضعه بالخانة المخصصة بالخطوة 1 بالمعالج لمطابقة أذونات لوحة تحكمنا.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 bg-indigo-950 border border-indigo-800/40 text-indigo-300 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">٣</span>
                    <div>
                      <h4 className="font-bold text-slate-200">إنشاء وجلب الرمز السري الفوري للبوت (Bot Token):</h4>
                      <p className="text-slate-455 mt-0.5">
                        اذهب لتبويب <strong>Bot</strong> في بوابة المبرمجين، ثم انقر فوق زر <strong>Add Bot</strong> (إن لم تفعل ذلك مسبقاً)، ثم انقر فوق زر <strong>Reset Token</strong> لينشأ الرمز السري. قم بنسخه بالكامل والصقه في المربع بمعالج الضبط.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 bg-indigo-950 border border-indigo-800/40 text-indigo-300 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">٤</span>
                    <div className="bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl">
                      <h4 className="font-bold text-amber-300">خطوة حرجة للتشغيل (Gateway Intents):</h4>
                      <p className="text-slate-400 mt-1 leading-normal">
                        في نفس صفحة <strong>Bot</strong> ببوابة المطورين، انزل لأسفل وافرد قسم <strong>Privileged Gateway Intents</strong>. قم بتفعيل الخيارات الثلاثة بالكامل ليتمكن بوت MJK من التفاعل:
                        <br />
                        • ✅ Presence Intent &nbsp;&nbsp;&nbsp;&nbsp; • ✅ Server Members Intent &nbsp;&nbsp;&nbsp;&nbsp; • ✅ Message Content Intent
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 flex gap-3 select-none">
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-650/10 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>زيارة بوابة مطوري ديسكورد ↗️</span>
                </a>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-2.5 bg-[#06080a] border border-slate-800 hover:border-slate-700 text-slate-250 hover:text-slate-100 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  أغلق الدليل وأكمل معالج الإعداد الآن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
