import React, { useState, useEffect, useCallback, useRef } from "react";
import { BotConfig, BotCommand, Channel, Member, ServerLog, WelcomeConfig, TicketConfig, StaffAppConfig, SecurityConfig, RulesConfig, LeaveResignationConfig, SuggestionConfig, ReportConfig, WarningConfig, AutoResponseConfig, GiveawayConfig, LevelConfig, ReactionRolesConfig, VoiceStatsConfig, AutoRolesConfig, EmbedFormatterConfig, ModLogsConfig } from "./types";
import {
  Sparkles, Bot, Terminal, Download, Settings, RefreshCw, Layers, ShieldCheck, Globe, Database, Plus, Trash2, Save, Heart, Eye, EyeOff, ExternalLink, LogIn, Server, LayoutDashboard, Cpu, Activity, Bell, Search, ChevronDown, Users, MessageSquare, FileCode, CreditCard, User, LogOut, Menu, X, Clock, CheckCircle, ArrowUpRight, Wifi, HardDrive, Play, Square, Key, HelpCircle, BookOpen, Copy, Check, AlertCircle, ChevronLeft, ChevronRight, Zap, Home, BarChart3, List, Archive, Puzzle, Gift, Vote, Shield, Flag, BookMarked, UserCheck, Calendar, Hash,
} from "lucide-react";
import CommandStudio from "./components/CommandStudio";
import BotDashboard from "./components/BotDashboard";
import CodeExporter from "./components/CodeExporter";
import AdvancedModules from "./components/AdvancedModules";
import LiveHost from "./components/LiveHost";
import MJKLogo from "./components/MJKLogo";
import { motion, AnimatePresence } from "motion/react";

export const SYSTEM_MODULES_LIST = [
    { id: "welcome", label: "👋 بوت الترحيب" },
    { id: "auto-roles", label: "🎖️ الرتب التلقائية" },
    { id: "ticket", label: "🎫 بوت الدعم والتذاكر" },
    { id: "staff", label: "🛡️ بوت التوظيف والإشراف" },
    { id: "security", label: "🛡️ نظام الحماية (Guard)" },
    { id: "auto-responses", label: "💬 الردود التلقائية العبقرية" },
    { id: "embed-formatter", label: "📝 المنشورات والـ Embeds" },
    { id: "suggestions", label: "💡 بوت الاقتراحات" },
    { id: "reports", label: "🚨 الشكاوى والبلاغات" },
    { id: "warnings", label: "🔨 نظام التحذيرات والعقوبات" },
    { id: "mod-logs", label: "📋 نظام السجلات واللوقات" },
    { id: "levels", label: "🏆 نظام مستويات الخبرة" },
    { id: "giveaways", label: "🎁 قيف اواي والفعاليات" },
    { id: "rules-bot", label: "⚖️ بوت القوانين" },
    { id: "leave-resignation", label: "🌴 الإجازات والاستقالات" },
    { id: "reaction-roles", label: "🎭 رتب التفاعل الذاتي" },
    { id: "voice-stats", label: "📊 قنوات الإحصائيات" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(false);

  // Subscription / Activation States
  const [subKey, setSubKey] = useState<string>(() => localStorage.getItem("sub_key") || "");
  const [isSubVerified, setIsSubVerified] = useState<boolean>(false);
  const [subDetails, setSubDetails] = useState<any>(null);
  const [checkingSub, setCheckingSub] = useState<boolean>(true);
  const [showFullKey, setShowFullKey] = useState<boolean>(false);
  
  // Input states
  const [activationInput, setActivationInput] = useState<string>("");
  const [activationError, setActivationError] = useState<string>("");
  const [activationSuccess, setActivationSuccess] = useState<string>("");
  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Admin login states
  const [showAdminTab, setShowAdminTab] = useState<boolean>(false);
  const [adminSessionToken, setAdminSessionToken] = useState<string>(() => localStorage.getItem("admin_session") || "");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminInput, setAdminInput] = useState<string>("");
  const [adminError, setAdminError] = useState<string>("");
  const [isLoggingAdmin, setIsLoggingAdmin] = useState<boolean>(false);

  // Admin management lists
  const [keysList, setKeysList] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<boolean>(false);

  // Key generator states
  const [genCount, setGenCount] = useState<number>(5);
  const [genDuration, setGenDuration] = useState<string>("30 Days");
  const [genNote, setGenNote] = useState<string>("");
  const [genModules, setGenModules] = useState<string[]>(SYSTEM_MODULES_LIST.map(m => m.id));

  // Sidebar navigation state
  const [sidebarView, setSidebarView] = useState<string>('dashboard');

  // Sync sidebar navigation with activeTab
  const navigateTo = (view: string) => {
    setSidebarView(view);
    const tabMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'bot-system': 'bot-system',
      'hosting': 'hosting',
      'servers': 'servers',
      'logs': 'logs',
      'analytics': 'analytics',
      'command-studio': 'command-studio',
      'modules': 'modules',
      'exporter': 'exporter',
      'subscription': 'subscription',
      'settings': 'settings',
      'profile': 'profile',
    };
    if (tabMap[view]) {
      setActiveTab(tabMap[view]);
    }
  };

  // Notifications panel
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Verify subscription on mount
  useEffect(() => {
    async function verifySavedKey() {
      if (!subKey) {
        setCheckingSub(false);
        return;
      }
      try {
        const res = await fetch(`/api/subscription/validate?key=${encodeURIComponent(subKey)}`);
        const data = await res.json();
        if (data.valid) {
          setIsSubVerified(true);
          setSubDetails(data);
        } else {
          // If expired or invalid
          localStorage.removeItem("sub_key");
          setSubKey("");
          setActivationError(data.message || "كود غير صالح");
        }
      } catch (err) {
        console.error("Error verifying license", err);
      } finally {
        setCheckingSub(false);
      }
    }

    verifySavedKey();
  }, [subKey]);

  // If subscription is verified and admin session exists, verify it
  useEffect(() => {
    async function verifyAdminSessionToken() {
      if (!adminSessionToken) return;
      try {
        const res = await fetch("/api/subscription/admin/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken: adminSessionToken })
        });
        const data = await res.json();
        if (data.valid) {
          setIsAdminLoggedIn(true);
          fetchAdminKeys();
        } else {
          localStorage.removeItem("admin_session");
          setAdminSessionToken("");
        }
      } catch (err) {
        console.error(err);
      }
    }
    verifyAdminSessionToken();
  }, [adminSessionToken]);

  const fetchAdminKeys = async () => {
    const token = adminSessionToken;
    if (!token) return;
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/subscription/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: token })
      });
      const data = await res.json();
      if (res.ok) {
        setKeysList(data.keys || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsLoggingAdmin(true);
    try {
      const res = await fetch("/api/subscription/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminLoggedIn(true);
        setAdminSessionToken(data.sessionToken);
        localStorage.setItem("admin_session", data.sessionToken);
        // Refresh with delay to let state write
        setTimeout(() => {
          fetchAdminKeys();
        }, 100);
      } else {
        setAdminError(data.message || "رمز الإدارة غير صحيح!");
      }
    } catch (err) {
      setAdminError("فشل الاتصال بالخادم الرئيسي");
    } finally {
      setIsLoggingAdmin(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError("");
    setActivationSuccess("");
    if (!activationInput.trim()) {
      setActivationError("الرجاء كتابة كود الاشتراك!");
      return;
    }
    setIsActivating(true);
    try {
      // First validate key
      const validateRes = await fetch(`/api/subscription/validate?key=${encodeURIComponent(activationInput.trim())}`);
      const validateData = await validateRes.json();
      
      if (!validateData.valid) {
        setActivationError(validateData.message || "كود التفعيل غير صحيح أو منتهي!");
        setIsActivating(false);
        return;
      }

      // Then activate
      const res = await fetch("/api/subscription/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activationInput.trim(),
          guildId: selectedGuild?.id || null,
          userId: discordUser?.id || null
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setActivationSuccess(data.message);
        setSubKey(data.data.key);
        setSubDetails(data.data);
        setIsSubVerified(true);
        localStorage.setItem("sub_key", data.data.key);

        // بعد التفعيل الناجح → التوجيه التلقائي لتسجيل دخول Discord
        try {
          const discordRes = await fetch("/api/discord/begin-login", { method: "POST" });
          const discordData = await discordRes.json();
          if (discordData.success && discordData.oauthUrl) {
            window.location.href = discordData.oauthUrl;
          }
        } catch (e) {
          console.error("فشل بدء تسجيل دخول Discord", e);
        }
      } else {
        setActivationError(data.message || "خطأ غير متوقع أثناء التفعيل");
      }
    } catch (err) {
      setActivationError("خطأ بالخادم السحابي");
    } finally {
      setIsActivating(false);
    }
  };

  const handleGenerateKeys = async () => {
    const token = adminSessionToken;
    if (!token) return;
    try {
      const res = await fetch("/api/subscription/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: token,
          count: genCount,
          duration: genDuration,
          note: genNote,
          allowedModules: genModules
        })
      });
      if (res.ok) {
        setGenNote("");
        fetchAdminKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKey = async (keyToDelete: string) => {
    const token = adminSessionToken;
    if (!token) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف وإلغاء كود الاشتراك هذا تماماً؟")) return;
    try {
      const res = await fetch("/api/subscription/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: token,
          keyToDelete: keyToDelete
        })
      });
      if (res.ok) {
        fetchAdminKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sub_key");
    setSubKey("");
    setIsSubVerified(false);
    setSubDetails(null);
    setActivationSuccess("");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_session");
    setAdminSessionToken("");
    setIsAdminLoggedIn(false);
    setAdminInput("");
    setKeysList([]);
  };

  // 1. Core Bot Config Profiles State
  const [config, setConfig] = useState<BotConfig>({
    name: "SystemAI",
    avatar: "🤖",
    status: "online",
    customStatus: "Developing amazing things!",
    activityType: "PLAYING",
    activityName: "with code layers",
    prefix: "!",
    embedColor: "#5865F2"
  });

  // 1b. Advanced Modules Preset States
  const [welcome, setWelcome] = useState<WelcomeConfig>({
    enabled: true,
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    avatarEmoji: "👑",
    welcomeTitle: "A Wild {username} Appeared! ✨",
    welcomeMessage: "Welcome {user} to our community server! We are thrilled to have your profile added here. 🚀 Check `#bot-testing` to start.",
    channelId: "chan-1",
    botName: "WelcomeBot 👋",
    botAvatar: "✨",
    dmGreeting: true,
    dmMessage: "🎉 Hey {username}, glad you landed in our server! Be sure to read the rules and introduce yourself."
  });

  const [ticket, setTicket] = useState<TicketConfig>({
    enabled: true,
    panelTitle: "🎫 نظام فتح التذاكر (Support Ticket Portal)",
    panelDescription: "قوانين التذاكر:\n• الاحترام واجب وعدم التهجم في التكت.\n• يمنع النقاش معاً.\n• في حال قمت بفتح تكت أدخل بالموضوع مباشرة.\n• يمنع السب والشتم والإهانة.\n\nملاحظة:\nيجب عليك تعبئة البيانات قبل فتح التذكرة بشكل كامل، وخلاف ذلك يحق للإدارة إغلاق التذكرة مباشرة.",
    buttonLabel: "فتح تذكرة | Open Ticket 📩",
    welcomeMessage: "مرحباً بك في تذكرة الدعم الخاصة بك! سيتواصل معك أحد المسؤولين قريباً.\nلإغلاق التذكرة، اضغط على **إغلاق التذكرة 🔒**",
    botName: "SupportBot 🎫",
    botAvatar: "🛡️",
    showFeedbackOnClose: true,
    ticketCategoryName: "💼 • تذاكر الدعم المفتوحة",
    activeTickets: [],
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fe2?w=1200&auto=format&fit=crop&q=80",
    ticketTypes: [
      {
        id: "type-inquiry",
        name: "استفسار وعام (Inquiries)",
        emoji: "💬",
        description: "للاستفسارات العامة والمساعدة والأسئلة الخاصة بالسيرفر",
        welcomeMessage: "مرحباً بك في تكنك الاستفسارات! يرجى توضيح سؤالك بالتفصيل، وسيجيبك الدعم الفني قريباً.",
        ticketCategoryName: "💬 • استفسارات عامة"
      },
      {
        id: "type-complaint",
        name: "شات شكاوى وبلاغات (Complaints)",
        emoji: "⚠️",
        description: "لتقديم شكوى ضد لاعب أو إبلاغ عن مشكلة فنية أو سلوكية",
        welcomeMessage: "مرحباً بك في تذكرة الشكاوى والبلاغات! يرجى تقديم تفاصيل الشكوى مع الإثباتات لتتم معالجتها سريعاً.",
        ticketCategoryName: "⚠️ • شكاوى وبلاغات"
      }
    ]
  });

  const [staffApp, setStaffApp] = useState<StaffAppConfig>({
    enabled: true,
    questions: [
      "كم عمرك؟ (What is your age?)",
      "لماذا تريد الانضمام لطاقمنا الإداري؟ (Why should we choose you?)",
      "ما هي الخبرات التي تمتلكها في إدارة السيرفرات? (What experiences do you have?)"
    ],
    botName: "RecruiterBot 🛡️",
    botAvatar: "💼",
    autoMessageOnApprove: "🎉 تهانينا {user}! تم قبول طلب انضمامك لطاقم الإدارة بعد المراجعة الشاملة لخبراتك وسيرتك الإدارية المميزة. يرجى التواصل مع الإدارة العليا لترتيب مقابلة الترقية والتدريب الفوري. بالتوفيق لك!",
    autoMessageOnReject: "مرحباً {user}. نشكرك جزيل الشكر على اهتمامك ووقتك في تقديم طلب الإشراف. للأسف، بعد مراجعة دقيقة لطلبك، لم نتمكن من قبول الطلب في الوقت الحالي. ندعوك للمشاركة بنشاط والتقديم مجدداً في المراحل القادمة. أطيب التمنيات!",
    approvedRoleId: "123456789012345678",
    bannerUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80",
    submissions: [
      {
        id: "sub-1",
        username: "DiscordGamer",
        avatar: "🎮",
        answers: [
          { question: "كم عمرك؟ (What is your age?)", answer: "19 years old" },
          { question: "لماذا تريد الانضمام لطاقمنا الإداري? (Why should we choose you?)", answer: "I love helping people and keeping the community friendly and clean!" },
          { question: "ما هي الخبرات التي تمتلكها في إدارة السيرفرات? (What experiences do you have?)", answer: "I moderated two larger gaming servers and know standard discord setups." }
        ],
        status: "pending",
        timestamp: "Today at 07:11 AM"
      }
    ]
  });

  const [rulesBot, setRulesBot] = useState<RulesConfig>({
    enabled: true,
    botName: "LawyerBot 📜",
    botAvatar: "⚖️",
    bannerUrl: "https://images.unsplash.com/photo-1453733190148-c44698c265a8?w=1200&auto=format&fit=crop&q=80",
    categories: [
      {
        id: "cat-general",
        name: "القوانين العامة 📜",
        icon: "🛡️",
        rules: [
          "احترام جميع الأعضاء في السيرفر وعدم الإساءة لأي شخص بالقول أو المنشن.",
          "يمنع منعاً باتاً نشر محتوى خارج عن الذوق العام أو الصور الفاضحة والمخلة بالآداب.",
          "الالتزام بالذوق والحديث الراقي وتجنب الخوض في النزاعات العرقية أو السياسية الطائفية."
        ]
      },
      {
        id: "cat-chat",
        name: "قوانين الدردشة 💬",
        icon: "💬",
        rules: [
          "يمنع السبام أو التكرار العالي للرسائل وتخريب متعة الشات العام.",
          "منشن الإدارة بدون داعي قد يعرضك للعقوبة، استخدم التكت أو تواصل بأدب."
        ]
      },
      {
        id: "cat-staff",
        name: "قوانين الإشراف 👔",
        icon: "👔",
        rules: [
          "يُمنع على المشرف استخدام صلاحيات السجن أو الميوت كأداة شخصية بل لتطبيق القانون فقط.",
          "يجب على كل إداري توثيق جميع الإجراءات في الشات المخصص للوجوهات فوراً.",
          "تحلى بالهدوء التام والامتناع التام عن الرد على حركات الاستفزاز الطفولية."
        ]
      }
    ]
  });

  const [leaveConfig, setLeaveConfig] = useState<LeaveResignationConfig>({
    enabled: true,
    botName: "OfficeBot 📁",
    botAvatar: "📇",
    bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    leaveRoleId: "987654321098765432",
    resignationRemoveRoleIds: "111111111111111111, 222222222222222222",
    requests: [
      {
        id: "req-1",
        username: "DiscordGamer",
        avatar: "🎮",
        type: "leave",
        reason: "أرغب بطلب إجازة قصيرة لمدة 10 أيام ابتداءً من الغد لدواعي الامتحانات الدراسية والمهام الشاقة.",
        status: "pending",
        timestamp: "Today at 08:30 AM"
      }
    ]
  });

  const [security, setSecurity] = useState<SecurityConfig>({
    enabled: true,
    botName: "GuardBot 🛡️",
    botAvatar: "⚡",
    verificationEnabled: true,
    verificationChannelId: "chan-1",
    verificationButtonLabel: "تفعيل الحساب (Verify Profile) ✅",
    verificationSuccessMessage: "تهانينا! لقد رصد نظام الحماية هويتك البشرية وتم منحك رتبة العضو وتفعيل الحساب بنجاح. 🔓",
    spamProtectionEnabled: true,
    maxMessagesPerMinute: 6,
    wordFilterEnabled: true,
    badWordsList: ["كلب", "حمار", "Spam", "scam", "hack", "virus"],
    linkFilterEnabled: true,
    antiRaidEnabled: true,
    logsChannelId: "chan-2",
    securityLevel: "medium",
    bannerUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80"
  });

  const [suggestion, setSuggestion] = useState<SuggestionConfig>({
    enabled: true,
    botName: "SuggestBot 💡",
    botAvatar: "💡",
    channelId: "chan-suggestions",
    autoReact: true,
    anonymous: false,
    bannerUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
    suggestionsList: [
      {
        id: "sug-1",
        username: "papy615",
        avatar: "🎮",
        content: "اقترح إضافة روم خاص للفعاليات والمسابقات الأسبوعية لزيادة تفاعل الأعضاء في السيرفر وتوزيع الجوائز.",
        status: "pending",
        timestamp: "Today at 08:31 AM",
        upvotes: 8,
        downvotes: 1,
        votedUsers: ["m-2", "m-4"]
      }
    ]
  });

  const [report, setReport] = useState<ReportConfig>({
    enabled: true,
    botName: "ReportBot ⚠️",
    botAvatar: "⚠️",
    logsChannelId: "chan-staff-logs",
    bannerUrl: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=1200&auto=format&fit=crop&q=80",
    reportsList: [
      {
        id: "rep-1",
        reporter: "GamerPro",
        reportedUser: "LoungeQueen",
        reason: "إرسال روابط دعوات سيرفرات أخرى في الخاص بدون إذن (سبام دايركت).",
        status: "pending",
        timestamp: "Today at 08:32 AM",
        proof: "https://i.imgur.com/screenshot.png"
      }
    ]
  });

  const [warning, setWarning] = useState<WarningConfig>({
    enabled: true,
    botName: "PunishBot 🔨",
    botAvatar: "🔨",
    maxWarningsBeforeBan: 3,
    bannerUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    warningsList: [
      {
        id: "warn-1",
        username: "LoungeQueen",
        adminName: "Moderator",
        reason: "تخريب في الشات وسبام رسائل متكررة بعد التنبيه الشفهي.",
        timestamp: "Today at 08:28 AM"
      }
    ]
  });

  const [autoResponse, setAutoResponse] = useState<AutoResponseConfig>({
    enabled: true,
    botName: "ResponderBot 💬",
    botAvatar: "🤖",
    responses: [
      {
        id: "ar-1",
        trigger: "السلام عليكم",
        response: "وعليكم السلام ورحمة الله وبركاته يا هلا بك نورت السيرفر! ❤️👋",
        matchType: "contains"
      },
      {
        id: "ar-2",
        trigger: "كيف افعل حسابي",
        response: "أهلاً بك! يمكنك تفعيل حسابك من خلال الذهاب لقناة تفعيل الحساب والضغط على زر التفعيل الأخضر. ✅",
        matchType: "contains"
      }
    ]
  });

  const [giveaway, setGiveaway] = useState<GiveawayConfig>({
    enabled: true,
    botName: "GiveawayBot 🎉",
    botAvatar: "🎁",
    channelId: "chan-giveaways",
    bannerUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80",
    giveawaysList: [
      {
        id: "gw-1",
        prize: "رتبة VIP خاصة + 50,000 كاش 🪙",
        winnerCount: 1,
        durationMinutes: 60,
        status: "active",
        participants: ["papy615", "GamerPro"],
        openedAt: new Date().toLocaleTimeString(),
        endsAt: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString()
      }
    ]
  });

  const [levelConfig, setLevelConfig] = useState<LevelConfig>({
    enabled: false,
    botName: "LevelBot 🏆",
    botAvatar: "⭐",
    xpPerMessage: 15,
    levelUpMessage: "🎉 تهانينا {user}! لقد غادرت للمستوى الفارق {level}! استمر في تفاعلك الرائع! 🚀⭐",
    levelUpChannelId: "chan-general",
    leaderboard: [
      { id: "xp-1", username: "papy615", avatar: "👑", xp: 1250, level: 8 },
      { id: "xp-2", username: "GamerPro", avatar: "🎮", xp: 850, level: 5 },
      { id: "xp-3", username: "LoungeQueen", avatar: "💅", xp: 430, level: 3 }
    ],
    roleRewards: [
      { id: "rr-1", level: 5, roleName: "متفاعل فضي 🥈" },
      { id: "rr-2", level: 10, roleName: "متفاعل ذهبي 🥇" }
    ]
  });

  const [reactionRoles, setReactionRoles] = useState<ReactionRolesConfig>({
    enabled: true,
    botName: "RoleBot 🏷️",
    botAvatar: "🏷️",
    panelTitle: "🎭 نظام اختيار الرتب تلقائياً (Reaction & Button Roles Portal)",
    panelDescription: "فضلاً اضغط على الأزرار أدناه للحصول على الرتب التي تناسب اهتماماتك وتخصص سلفاً:\n\n• 🎮 **رتبة الألعاب** -> لتلقي إشعارات فعاليات الأسطورية.\n• 🔔 **أخبار وتحديثات** -> لمعرفة أخبار السيرفر أولاً بأول.\n• 🎁 **منشن فعاليات** -> لتنبيهك عند حدوث قيف_اواي جديد.",
    channelId: "chan-roles",
    bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    rolesList: [
      { id: "rrole-1", label: "العاب وبثث 🎮", roleName: "العاب وبثث", emoji: "🎮", color: "blue" },
      { id: "rrole-2", label: "إشعار التحديثات 🔔", roleName: "إشعار التحديثات", emoji: "🔔", color: "green" },
      { id: "rrole-3", label: "منشن فعاليات 🎁", roleName: "منشن الفعاليات", emoji: "🎁", color: "yellow" }
    ]
  });

  const [voiceStats, setVoiceStats] = useState<VoiceStatsConfig>({
    enabled: true,
    botName: "StatsBot 📊",
    botAvatar: "📊",
    totalMembersName: "📊 إجمالي الأعضاء: {count}",
    activeMembersName: "🟢 المتصلين: {count}",
    voiceUsersName: "🔊 بالقرية الصوتية: {count}"
  });

  const [autoRoles, setAutoRoles] = useState<AutoRolesConfig>({
    enabled: false,
    botName: "AutoRoles",
    botAvatar: "🎖️",
    rolesList: []
  });

  const [embedFormatter, setEmbedFormatter] = useState<EmbedFormatterConfig>({
    enabled: false,
    botName: "EmbedFormatter",
    botAvatar: "📝",
    title: "",
    description: "",
    color: "#5865F2",
    thumbnail: "",
    image: "",
    footer: "",
    fields: []
  });

  const [modLogs, setModLogs] = useState<ModLogsConfig>({
    enabled: false,
    botName: "ModLogs",
    botAvatar: "📋",
    logChannelId: "",
    logMessageDeletes: true,
    logMessageEdits: true,
    logMemberBans: true,
    logMemberKicks: true,
    logMemberTimeouts: true,
    logRoleChanges: true,
    logChannelChanges: true,
    logMemberJoins: false,
    logMemberLeaves: false,
    logs: []
  });

  // 2. Default Initial Commands
  const [commands, setCommands] = useState<BotCommand[]>([
    {
      id: "cmd-default-1",
      trigger: "/help",
      type: "slash",
      description: "Lists active triggers and commands of SystemAI bot.",
      responseType: "embed",
      responseText: "",
      embedTitle: "SystemAI commands checklist 🤖",
      embedDescription: "You can execute the following custom commands inside this sandbox server:\n\n• **`!ping`** — Check system API roundtrip latencies.\n• **`/ai-chat`** — Commences real-time natural dialogues with my cognitive Gemini subroutines.\n• **`!welcome`** — Plays a beautiful custom embedded greeting illustration.",
      embedColor: "#5865F2",
      embedFooter: "Designed with Discord Bot Builder",
      embedThumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80",
      embedFields: []
    },
    {
      id: "cmd-default-2",
      trigger: "ping",
      type: "prefix",
      description: "Outputs bot latency statistics.",
      responseType: "text",
      responseText: "Pong! 🏓 Active system API latency is **14ms**. Simulated roundtrip complete."
    },
    {
      id: "cmd-default-3",
      trigger: "/ai-chat",
      type: "slash",
      description: "Cognitive AI module powered by Gemini API.",
      responseType: "ai",
      responseText: "Act as a super friendly, helpful computer assistant bot. Speak directly, keep responses funny, and use simple Discord markdown styling occasionally."
    },
    {
      id: "cmd-default-4",
      trigger: "welcome",
      type: "prefix",
      description: "Welcomes a user with a rich embedded layout.",
      responseType: "embed",
      responseText: "",
      embedTitle: "A Wild {username} Appeared! ✨",
      embedDescription: "Welcome {user} to the Server! We are thrilled to have you here.\n\nMake sure to check `#bot-testing` to interact with our integrations, join `🔊 voice-lounge` for voice playbacks, or test more tools.",
      embedColor: "#57F287",
      embedFooter: "Guild Member Count: {memberCount}",
      embedImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
    }
  ]);

  // 3. Simulated Channels Setup
  const [channels, setChannels] = useState<Channel[]>([
    { id: "chan-1", name: "general", type: "text" },
    { id: "chan-2", name: "bot-testing", type: "text" },
    { id: "chan-rules", name: "⚖️-قوانين-السيرفر", type: "text" },
    { id: "chan-hr", name: "✈️-طلبات-الإجازات", type: "text" },
    { id: "chan-staff-logs", name: "📋-تقديمات-الإدارة", type: "text" },
    { id: "chan-suggestions", name: "💡-اقتراحات-الأعضاء", type: "text" },
    { id: "chan-giveaways", name: "🎉-قيف_اواي-ومسابقات", type: "text" },
    { id: "chan-3", name: "music-room", type: "text" },
    { id: "chan-voice", name: "speaker-lounge", type: "voice" }
  ]);

  const [guildRoles, setGuildRoles] = useState<{ id: string; name: string; color: number }[]>([]);

  // 4. Default Mock Server Members
  const [members, setMembers] = useState<Member[]>([
    { 
      id: "m-1", 
      username: "papy615", 
      discriminator: "0001", 
      avatar: "🎮", 
      isBot: false, 
      status: "online", 
      role: "Developer", 
      roleColor: "#3498DB",
      rpJob: "رئيس الشرطة 👮",
      rpCash: 12500,
      rpBank: 45000,
      rpLicense: "Active",
      rpCars: ["أودي R8 🏎️", "فورد موستانج 🏁"],
      rpWarnings: 0
    },
    { 
      id: "m-2", 
      username: "Moderator", 
      discriminator: "1122", 
      avatar: "⚙️", 
      isBot: false, 
      status: "online", 
      role: "Mod Staff", 
      roleColor: "#2ECC71",
      rpJob: "قاضي المحكمة ⚖️",
      rpCash: 8500,
      rpBank: 32000,
      rpLicense: "Active",
      rpCars: ["كاديلاك إسكاليد 🚙"],
      rpWarnings: 0
    },
    { id: "m-3", username: "CoolBot", discriminator: "9999", avatar: "🤖", isBot: true, status: "idle", role: "System Utility", roleColor: "#9B59B6" },
    { 
      id: "m-4", 
      username: "GamerPro", 
      discriminator: "2024", 
      avatar: "👾", 
      isBot: false, 
      status: "offline", 
      role: "Level 10", 
      roleColor: "#E67E22",
      rpJob: "مسعف البلدية 🩺",
      rpCash: 2400,
      rpBank: 8900,
      rpLicense: "Active",
      rpCars: ["إسعاف البلدية 🚑"],
      rpWarnings: 1
    },
    { 
      id: "m-5", 
      username: "LoungeQueen", 
      discriminator: "7777", 
      avatar: "🌸", 
      isBot: false, 
      status: "offline", 
      role: "VIP Active", 
      roleColor: "#E91E63",
      rpJob: "عاطل عن العمل 👤",
      rpCash: 450,
      rpBank: 1200,
      rpLicense: "None",
      rpCars: [],
      rpWarnings: 0
    }
  ]);

  // ==========================================
  // DISCORD OAUTH STATE
  // ==========================================
  const [discordSession, setDiscordSession] = useState<string>(() => localStorage.getItem("discord_oauth_session") || "");
  const [discordUser, setDiscordUser] = useState<any>(null);
  const [discordGuilds, setDiscordGuilds] = useState<any[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<any>(null);
  const [isFetchingGuilds, setIsFetchingGuilds] = useState(false);
  const [showGuildPicker, setShowGuildPicker] = useState(false);
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);
  const [oauthClientId, setOauthClientId] = useState(() => localStorage.getItem("discord_oauth_client_id") || "");
  const [oauthClientSecret, setOauthClientSecret] = useState(() => localStorage.getItem("discord_oauth_client_secret") || "");
  const [oauthBotToken, setOauthBotToken] = useState(() => localStorage.getItem("discord_oauth_bot_token") || "");
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [hasBotToken, setHasBotToken] = useState(false);
  const [savingOAuth, setSavingOAuth] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [channelLoadError, setChannelLoadError] = useState<string>("");
  const [botInviteUrl, setBotInviteUrl] = useState<string>("");
  const guildRestored = useRef(false);
  const isSwitchingGuild = useRef(false);

  // Handle OAuth callback from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("oauth_session");
    const error = params.get("oauth_error");
    if (session) {
      localStorage.setItem("discord_oauth_session", session);
      setDiscordSession(session);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (error) {
      alert(`❌ خطأ في تسجيل الدخول عبر Discord: ${decodeURIComponent(error)}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Check if OAuth credentials are configured on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/discord/setup/status');
        const data = await res.json();
        setOauthConfigured(data.configured);
        setHasBotToken(data.hasBotToken);
      } catch {}
    })();
  }, []);

  const saveOAuthConfig = async () => {
    if (!oauthClientId.trim() || !oauthClientSecret.trim()) {
      alert('يرجى إدخال Client ID و Client Secret');
      return;
    }
    setSavingOAuth(true);
    try {
      const res = await fetch('/api/discord/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: oauthClientId.trim(), clientSecret: oauthClientSecret.trim(), botToken: oauthBotToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("discord_oauth_client_id", oauthClientId.trim());
        localStorage.setItem("discord_oauth_client_secret", oauthClientSecret.trim());
        localStorage.setItem("discord_oauth_bot_token", oauthBotToken.trim());
        setOauthConfigured(true);
        setHasBotToken(!!oauthBotToken.trim());
        setShowOAuthSetup(false);
        alert('✅ تم حفظ بيانات OAuth وبوت بنجاح');
      } else {
        alert(`❌ ${data.error || 'فشل الحفظ'}`);
      }
    } catch {
      alert('❌ فشل الاتصال بالخادم');
    } finally {
      setSavingOAuth(false);
    }
  };

  // Fetch user and guilds on session load
  const fetchDiscordUser = useCallback(async () => {
    if (!discordSession) return;
    setIsFetchingGuilds(true);
    try {
      const meRes = await fetch(`/api/discord/me?session=${encodeURIComponent(discordSession)}`);
      const meData = await meRes.json();
      if (meData.loggedIn) {
        setDiscordUser(meData.user);
        setDiscordGuilds(meData.guilds || []);
      } else {
        localStorage.removeItem("discord_oauth_session");
        setDiscordSession("");
      }
    } catch (err) {
      console.error("Failed to fetch Discord user", err);
    } finally {
      setIsFetchingGuilds(false);
    }
  }, [discordSession]);

  useEffect(() => {
    fetchDiscordUser();
  }, [fetchDiscordUser]);

  // Auto-restore last selected guild after guilds load (one-time only)
  useEffect(() => {
    if (discordGuilds.length > 0 && !guildRestored.current) {
      guildRestored.current = true;
      const savedGuildId = localStorage.getItem('active_guild_id');
      if (savedGuildId) {
        const savedGuild = discordGuilds.find((g: any) => g.id === savedGuildId);
        if (savedGuild) {
          handleSelectGuild(savedGuild);
        }
      }
    }
  }, [discordGuilds]);

  const handleDiscordLogin = async () => {
    if (!oauthConfigured) {
      setShowOAuthSetup(true);
      return;
    }
    try {
      const res = await fetch("/api/discord/begin-login", { method: "POST" });
      const data = await res.json();
      if (data.success && data.oauthUrl) {
        window.location.href = data.oauthUrl;
      } else {
        alert(data.error || 'فشل بدء تسجيل دخول Discord');
      }
    } catch {
      alert('فشل الاتصال بالخادم');
    }
  };

  const handleDiscordLogout = async () => {
    try {
      await fetch("/api/discord/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: discordSession })
      });
    } catch (e) {}
    localStorage.removeItem("discord_oauth_session");
    localStorage.removeItem("active_guild_id");
    setDiscordSession("");
    setDiscordUser(null);
    setDiscordGuilds([]);
    setSelectedGuild(null);
    setShowGuildPicker(false);
    setIsLoadingChannels(false);
    setChannelLoadError("");
    setBotInviteUrl("");
    setGuildRoles([]);
    // Restore sample channels for sandbox mode
    setChannels([
      { id: "chan-1", name: "general", type: "text" },
      { id: "chan-2", name: "bot-testing", type: "text" },
      { id: "chan-rules", name: "⚖️-قوانين-السيرفر", type: "text" },
      { id: "chan-hr", name: "✈️-طلبات-الإجازات", type: "text" },
      { id: "chan-staff-logs", name: "📋-تقديمات-الإدارة", type: "text" },
      { id: "chan-suggestions", name: "💡-اقتراحات-الأعضاء", type: "text" },
      { id: "chan-giveaways", name: "🎉-قيف_اواي-ومسابقات", type: "text" },
      { id: "chan-3", name: "music-room", type: "text" },
      { id: "chan-voice", name: "speaker-lounge", type: "voice" }
    ]);
  };

  // Reset all module states to defaults when switching guilds
  const resetAllModuleStates = () => {
    setWelcome({
      enabled: true,
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      avatarEmoji: "👑",
      welcomeTitle: "A Wild {username} Appeared! ✨",
      welcomeMessage: "Welcome {user} to our community server! We are thrilled to have your profile added here. 🚀 Check `#bot-testing` to start.",
      channelId: "",
      botName: "WelcomeBot 👋",
      botAvatar: "✨",
      dmGreeting: true,
      dmMessage: "🎉 Hey {username}, glad you landed in our server! Be sure to read the rules and introduce yourself."
    });
    setTicket({
      enabled: false, panelTitle: "", panelDescription: "", buttonLabel: "",
      welcomeMessage: "", botName: "SupportBot 🎫", botAvatar: "🛡️",
      showFeedbackOnClose: true, ticketCategoryName: "", activeTickets: [],
      bannerUrl: "", ticketTypes: []
    });
    setStaffApp({
      enabled: false, questions: [], botName: "RecruiterBot 🛡️", botAvatar: "💼",
      autoMessageOnApprove: "", autoMessageOnReject: "", approvedRoleId: "",
      bannerUrl: "", submissions: []
    });
    setRulesBot({
      enabled: false, botName: "LawyerBot 📜", botAvatar: "⚖️",
      bannerUrl: "", categories: []
    });
    setLeaveConfig({
      enabled: false, botName: "OfficeBot 📁", botAvatar: "📇",
      bannerUrl: "", leaveRoleId: "", resignationRemoveRoleIds: "", requests: []
    });
    setSecurity({
      enabled: false, botName: "GuardBot 🛡️", botAvatar: "⚡",
      verificationEnabled: false, verificationChannelId: "",
      verificationButtonLabel: "", verificationSuccessMessage: "",
      spamProtectionEnabled: false, maxMessagesPerMinute: 5,
      wordFilterEnabled: false, badWordsList: [],
      linkFilterEnabled: false, antiRaidEnabled: false,
      logsChannelId: "", securityLevel: "medium", bannerUrl: ""
    });
    setSuggestion({
      enabled: false, botName: "SuggestBot 💡", botAvatar: "💡",
      channelId: "", autoReact: true, anonymous: false,
      bannerUrl: "", suggestionsList: []
    });
    setReport({
      enabled: false, botName: "ReportBot ⚠️", botAvatar: "⚠️",
      logsChannelId: "", bannerUrl: "", reportsList: []
    });
    setWarning({
      enabled: false, botName: "PunishBot 🔨", botAvatar: "🔨",
      maxWarningsBeforeBan: 3, bannerUrl: "", warningsList: []
    });
    setAutoResponse({
      enabled: false, botName: "ResponderBot 💬", botAvatar: "🤖", responses: []
    });
    setGiveaway({
      enabled: false, botName: "GiveawayBot 🎉", botAvatar: "🎁",
      channelId: "", bannerUrl: "", giveawaysList: []
    });
    setLevelConfig({
      enabled: false, botName: "LevelBot 🏆", botAvatar: "⭐",
      xpPerMessage: 15, levelUpMessage: "", levelUpChannelId: "",
      leaderboard: [], roleRewards: []
    });
    setReactionRoles({
      enabled: false, botName: "RoleBot 🏷️", botAvatar: "🏷️",
      panelTitle: "", panelDescription: "", channelId: "",
      bannerUrl: "", rolesList: []
    });
    setVoiceStats({
      enabled: false, botName: "StatsBot 📊", botAvatar: "📊",
      totalMembersName: "", activeMembersName: "", voiceUsersName: ""
    });
    setAutoRoles({ enabled: false, botName: "AutoRoles", botAvatar: "🎖️", rolesList: [] });
    setEmbedFormatter({
      enabled: false, botName: "EmbedFormatter", botAvatar: "📝",
      title: "", description: "", color: "#5865F2",
      thumbnail: "", image: "", footer: "", fields: []
    });
    setModLogs({
      enabled: false, botName: "ModLogs", botAvatar: "📋",
      logChannelId: "", logMessageDeletes: true, logMessageEdits: true,
      logMemberBans: true, logMemberKicks: true, logMemberTimeouts: true,
      logRoleChanges: true, logChannelChanges: true,
      logMemberJoins: false, logMemberLeaves: false, logs: []
    });
    setCommands([]);
  };

  const handleSelectGuild = async (guild: any, e?: React.MouseEvent, forceRefresh = false) => {
    if (e) e.preventDefault();
    setSelectedGuild(guild);
    setShowGuildPicker(false);
    setChannelLoadError("");
    setBotInviteUrl("");
    setIsLoadingChannels(true);
    // Reset all form fields immediately to prevent showing old guild data
    if (!forceRefresh) resetAllModuleStates();
    isSwitchingGuild.current = !forceRefresh;
    if (!forceRefresh) {
      localStorage.setItem('active_guild_id', guild.id);
      setChannels([]);
    }
    handleAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `[SERVER] ${forceRefresh ? 'تحديث' : 'تم اختيار'} السيرفر: ${guild.name} - جاري جلب الرومات...`
    });

    // Fetch guild channels and update the channels state
    try {
      // نرسل توكن البوت الخاص بالمستخدم (من LiveBot) عشان نجيب الرومات
      const userBotToken = localStorage.getItem("discord_bot_token") || "";
      const userClientId = localStorage.getItem("discord_bot_client_id") || "";
      const chRes = await fetch(`/api/discord/guilds/${guild.id}/channels?session=${encodeURIComponent(discordSession)}&botToken=${encodeURIComponent(userBotToken)}&clientId=${encodeURIComponent(userClientId)}&refresh=${forceRefresh ? "true" : "false"}`);
      if (chRes.ok) {
        const chData = await chRes.json();
        const mapped: Channel[] = chData
          .filter((c: any) => c.type === 0 || c.type === 2)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type === 0 ? 'text' : c.type === 2 ? 'voice' : 'text'
          }));
        // Also include categories
        const cats: Channel[] = chData
          .filter((c: any) => c.type === 4)
          .map((c: any) => ({ id: c.id, name: c.name, type: 'text' as const }));
        setChannels([...cats, ...mapped]);
        setChannelLoadError("");
        handleAddLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
          message: `[OK] تم جلب ${mapped.length + cats.length} روم من السيرفر ${guild.name}`
        });

        // Try to load saved config for this guild
        const configRes = await fetch(`/api/discord/guilds/${guild.id}/config?session=${encodeURIComponent(discordSession)}`);
        if (configRes.ok) {
          const savedConfig = await configRes.json();
          if (savedConfig) {
            if (savedConfig.welcome) setWelcome(savedConfig.welcome);
            if (savedConfig.ticket) setTicket(savedConfig.ticket);
            if (savedConfig.staffApp) setStaffApp(savedConfig.staffApp);
            if (savedConfig.security) setSecurity(savedConfig.security);
            if (savedConfig.rulesBot) setRulesBot(savedConfig.rulesBot);
            if (savedConfig.leaveConfig) setLeaveConfig(savedConfig.leaveConfig);
            if (savedConfig.suggestion) setSuggestion(savedConfig.suggestion);
            if (savedConfig.report) setReport(savedConfig.report);
            if (savedConfig.warning) setWarning(savedConfig.warning);
            if (savedConfig.autoResponse) setAutoResponse(savedConfig.autoResponse);
            if (savedConfig.giveaway) setGiveaway(savedConfig.giveaway);
            if (savedConfig.levelConfig) setLevelConfig(savedConfig.levelConfig);
            if (savedConfig.reactionRoles) setReactionRoles(savedConfig.reactionRoles);
            if (savedConfig.voiceStats) setVoiceStats(savedConfig.voiceStats);
            if (savedConfig.autoRoles) setAutoRoles(savedConfig.autoRoles);
            if (savedConfig.embedFormatter) setEmbedFormatter(savedConfig.embedFormatter);
            if (savedConfig.modLogs) setModLogs(savedConfig.modLogs);
            if (savedConfig.commands) setCommands(savedConfig.commands);
            handleAddLog({
              id: crypto.randomUUID(),
              timestamp: new Date().toLocaleTimeString(),
              type: "system",
              message: `[LOAD] تم تحميل الإعدادات المحفوظة للسيرفر ${guild.name}`
            });
          }
        }

        // Fetch guild roles
        try {
          const rolesRes = await fetch(`/api/discord/guilds/${guild.id}/roles?session=${encodeURIComponent(discordSession)}&botToken=${encodeURIComponent(userBotToken)}`);
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            setGuildRoles(rolesData.map((r: any) => ({ id: r.id, name: r.name, color: r.color })).filter((r: any) => r.name !== '@everyone'));
          }
        } catch { /* ignore roles fetch errors */ }

      } else {
        const errData = await chRes.json().catch(() => ({ error: 'فشل جلب الرومات' }));
        setChannelLoadError(errData.error || 'فشل جلب الرومات من السيرفر');
        // isBotAdded: false يعني البوت مو موجود في السيرفر → نعرض زر الإضافة
        setBotInviteUrl(errData.isBotAdded === false ? (errData.botInviteUrl || '') : '');
        setChannels([]);
        handleAddLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
          message: `[ERROR] فشل جلب الرومات: ${errData.error || 'خطأ غير معروف'}`
        });
        setGuildRoles([]);
      }
    } catch (err) {
      console.error("Failed to fetch channels", err);
      setChannelLoadError("تعذر الاتصال بالخادم لجلب الرومات");
      setBotInviteUrl("");
      setChannels([]);
      handleAddLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "system",
        message: `[ERROR] خطأ في جلب الرومات: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
      });
      setGuildRoles([]);
    } finally {
      setIsLoadingChannels(false);
      isSwitchingGuild.current = false;
    }
  };

  // Auto-save config to server when selected guild changes
  useEffect(() => {
    if (!selectedGuild || !discordSession || !discordUser) return;
    // Skip if we are in the middle of switching guilds
    if (isSwitchingGuild.current) return;
    const timeout = setTimeout(async () => {
      try {
        await fetch(`/api/discord/guilds/${selectedGuild.id}/config?session=${encodeURIComponent(discordSession)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config, commands, welcome, ticket, staffApp, security,
            rulesBot, leaveConfig, suggestion, report, warning,
            autoResponse, giveaway, levelConfig, reactionRoles,
            voiceStats, autoRoles, embedFormatter, modLogs
          })
        });
      } catch (e) {}
    }, 3000);
    return () => clearTimeout(timeout);
  }, [selectedGuild, discordSession, discordUser, config, commands, welcome, ticket, staffApp, security, rulesBot, leaveConfig, suggestion, report, warning, autoResponse, giveaway, levelConfig, reactionRoles, voiceStats, autoRoles, embedFormatter, modLogs]);

  // ==========================================
  // SERVER PROFILES STATE ENGINE (localStorage)
  // ==========================================
  interface ServerProfile {
    id: string;
    name: string;
    createdAt: string;
    config: BotConfig;
    welcome: WelcomeConfig;
    ticket: TicketConfig;
    staffApp: StaffAppConfig;
    rulesBot: RulesConfig;
    leaveConfig: LeaveResignationConfig;
    security: SecurityConfig;
    suggestion: SuggestionConfig;
    report: ReportConfig;
    warning: WarningConfig;
    autoResponse: AutoResponseConfig;
    giveaway: GiveawayConfig;
    levelConfig: LevelConfig;
    reactionRoles: ReactionRolesConfig;
    voiceStats: VoiceStatsConfig;
    autoRoles: AutoRolesConfig;
    embedFormatter: EmbedFormatterConfig;
    modLogs: ModLogsConfig;
    commands: BotCommand[];
  }

  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [newProfileName, setNewProfileName] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'idle'>('synced');
  const [lastSaved, setLastSaved] = useState<string>("");
  const [botStatus, setBotStatus] = useState<string>("offline");
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(() => {
    return localStorage.getItem("mjk_bot_needs_restart") === "true";
  });
  const [restartingBot, setRestartingBot] = useState<boolean>(false);

  // Poll live bot status periodically from App.tsx
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const key = localStorage.getItem("sub_key") || "";
        const res = await fetch(`/api/bot/live-status?subscriptionKey=${encodeURIComponent(key)}`);
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setBotStatus(data.status);
          }
        }
      } catch (err) {
        // Handle quietly during server restarts
        console.debug("Quietly handled polling error during server boot:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);
  const [showGuideCenter, setShowGuideCenter] = useState<boolean>(() => {
    return localStorage.getItem("mjk_guide_seen") !== "true";
  });
  const [selectedGuideStep, setSelectedGuideStep] = useState<number>(0);
  const isSimpleMode = false;

  const loadProfileData = (profile: ServerProfile) => {
    if (profile.config) setConfig(profile.config);
    if (profile.welcome) setWelcome(profile.welcome);
    if (profile.ticket) setTicket(profile.ticket);
    if (profile.staffApp) setStaffApp(profile.staffApp);
    if (profile.rulesBot) setRulesBot(profile.rulesBot);
    if (profile.leaveConfig) setLeaveConfig(profile.leaveConfig);
    if (profile.security) setSecurity(profile.security);
    if (profile.suggestion) setSuggestion(profile.suggestion);
    if (profile.report) setReport(profile.report);
    if (profile.warning) setWarning(profile.warning);
    if (profile.autoResponse) setAutoResponse(profile.autoResponse);
    if (profile.giveaway) setGiveaway(profile.giveaway);
    if (profile.levelConfig) setLevelConfig(profile.levelConfig);
    if (profile.reactionRoles) setReactionRoles(profile.reactionRoles);
    if (profile.voiceStats) setVoiceStats(profile.voiceStats);
    if (profile.autoRoles) setAutoRoles(profile.autoRoles);
    if (profile.embedFormatter) setEmbedFormatter(profile.embedFormatter);
    if (profile.modLogs) setModLogs(profile.modLogs);
  };

  useEffect(() => {
    const saved = localStorage.getItem("discord_bot_server_profiles_v1");
    if (saved) {
      try {
        const parsed: ServerProfile[] = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setProfiles(parsed);
          setActiveProfileId(parsed[0].id);
          loadProfileData(parsed[0]);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved server profiles", e);
      }
    }

    // Initialize with default profile
    const defaultId = "prof-default-main";
    const defaultProfile: ServerProfile = {
      id: defaultId,
      name: "السيرفر الرئيسي (البناء الأولي)",
      createdAt: new Date().toLocaleDateString("ar-EG"),
      config,
      welcome,
      ticket,
      staffApp,
      rulesBot,
      leaveConfig,
      security,
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
      modLogs,
      commands
    };
    const initialProfiles = [defaultProfile];
    setProfiles(initialProfiles);
    setActiveProfileId(defaultId);
    localStorage.setItem("discord_bot_server_profiles_v1", JSON.stringify(initialProfiles));
  }, []);

  // ==========================================
  // AUTOSAVE SYNCHRONIZATION SYSTEM
  // ==========================================
  useEffect(() => {
    if (profiles.length === 0 || !activeProfileId) return;

    const currentProfileObj = profiles.find(p => p.id === activeProfileId);
    if (!currentProfileObj) return;

    const updated = profiles.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          config,
          welcome,
          ticket,
          staffApp,
          rulesBot,
          leaveConfig,
          security,
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
          modLogs,
          commands
        };
      }
      return p;
    });

    const hasChanged = JSON.stringify(updated) !== JSON.stringify(profiles);
    if (hasChanged) {
      setSyncStatus('saving');
      
      // If live bot is connected/online, mark that there are unapplied changes on edit
      if (botStatus === 'online' || botStatus === 'logging_in') {
        setHasUnappliedChanges(true);
        localStorage.setItem("mjk_bot_needs_restart", "true");
      }

      const timer = setTimeout(() => {
        setProfiles(updated);
        localStorage.setItem("discord_bot_server_profiles_v1", JSON.stringify(updated));
        setSyncStatus('synced');
        setLastSaved(new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [
    activeProfileId,
    config,
    welcome,
    ticket,
    staffApp,
    rulesBot,
    leaveConfig,
    security,
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
          modLogs,
    commands,
    profiles,
    botStatus
  ]);

  const handleQuickRestartBot = async () => {
    const savedToken = localStorage.getItem("discord_bot_token") || "";
    const savedClientId = localStorage.getItem("discord_bot_client_id") || "";
    const subKey = localStorage.getItem("sub_key") || "";

    if (!savedToken || !savedClientId) {
      alert("الرجاء إدخال توكن وأيدي البوت أولاً في صفحة الاستضافة!");
      setActiveTab("host");
      return;
    }

    setRestartingBot(true);
    try {
      const response = await fetch("/api/bot/live-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: savedToken.trim(),
          clientId: savedClientId.trim(),
          subscriptionKey: subKey.trim(),
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

      if (response.ok) {
        setHasUnappliedChanges(false);
        localStorage.removeItem("mjk_bot_needs_restart");
        handleAddLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
          message: "[SYNC] تم إرسال وتطبيق التغييرات لجميع المودلات على البوت بنجاح دون انقطاع!"
        });
      } else {
        const errData = await response.json();
        alert(`فشل تطبيق التعديلات: ${errData.message || "خلاف تقني"}`);
      }
    } catch (err: any) {
      alert(`خطأ في تطبيق التغييرات: ${err.message}`);
    } finally {
      setRestartingBot(false);
    }
  };

  const handleSwitchProfile = (profileId: string) => {
    const found = profiles.find(p => p.id === profileId);
    if (found) {
      setActiveProfileId(profileId);
      loadProfileData(found);
      handleAddLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "system",
        message: `[PROFILE] تم تحميل بروفايل السيرفر: "${found.name}" بنجاح وتطبيق كامل الإعدادات والإنظمة.`
      });
    }
  };

  const handleSaveActiveProfile = () => {
    const updated = profiles.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          config,
          welcome,
          ticket,
          staffApp,
          rulesBot,
          leaveConfig,
          security,
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
          modLogs,
          commands
        };
      }
      return p;
    });

    localStorage.setItem("discord_bot_server_profiles_v1", JSON.stringify(updated));
    handleAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `[SAVE] تم حفظ وتحديث الإعدادات الحالية لبروفايل: "${profiles.find(p => p.id === activeProfileId)?.name}" بنجاح في ذاكرة المتصفح الفورية.`
    });
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    const newId = crypto.randomUUID();
    const newProfile: ServerProfile = {
      id: newId,
      name: newProfileName,
      createdAt: new Date().toLocaleDateString("ar-EG"),
      config,
      welcome,
      ticket,
      staffApp,
      rulesBot,
      leaveConfig,
      security,
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
      modLogs,
      commands
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfileId(newId);
    setNewProfileName("");
    localStorage.setItem("discord_bot_server_profiles_v1", JSON.stringify(updated));
    handleAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `[CREATE] تم إنشاء بروفايل سيرفر جديد باسم: "${newProfileName}" وتم الانتقال إليه تلقائياً.`
    });
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      handleAddLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "system",
        message: `[WARN] لا يمكن حذف بروفايل السيرفر الأخير النشط. يجب وجود بروفايل واحد على الأقل.`
      });
      return;
    }
    const filtered = profiles.filter(p => p.id !== profileId);
    setProfiles(filtered);
    localStorage.setItem("discord_bot_server_profiles_v1", JSON.stringify(filtered));
    
    if (activeProfileId === profileId) {
      setActiveProfileId(filtered[0].id);
      loadProfileData(filtered[0]);
    }
    handleAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: `[DELETE] تم حذف بروفايل السيرفر المحدد من الذاكرة.`
    });
  };

  // 5. Shared Terminal Execution Logs
  const [logs, setLogs] = useState<ServerLog[]>([
    {
      id: "l-init-1",
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "[BUILD] Initiating Discord Bot Builder VM environment..."
    },
    {
      id: "l-init-2",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `[LOAD] Loaded custom bot configuration for: ${config?.name || "SystemAI"}`
    },
    {
      id: "l-init-3",
      timestamp: new Date().toLocaleTimeString(),
      type: "command",
      message: `[CONFIG] Registered custom command triggers into active memory cache.`
    }
  ]);

  const handleAddLog = (newLog: ServerLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateConfigValue = (key: keyof BotConfig, val: string) => {
    setConfig(prev => {
      const updated = { ...prev, [key]: val };
      handleAddLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "system",
        message: `[UPDATE] Reconfigured profile parameters: [${key}] changed to "${val}"`
      });
      return updated;
    });
  };

  const MiniMJKIcon = ({ className }: { className?: string }) => (
    <div className={`inline-flex items-center justify-center ${className || ""}`} style={{ width: "14px", height: "14px" }}>
      <MJKLogo size={14} />
    </div>
  );

  const tabs = [
    { id: "studio", label: "استوديو الأوامر", icon: Sparkles, sub: "Command Studio" },
    { id: "advanced", label: "System", icon: ShieldCheck, sub: "System" },
    { id: "logs", label: "التشخيص والسجلات", icon: Terminal, sub: "Diagnostics & Logs" },
    { id: "host", label: "الاستضافة والرفع", icon: MiniMJKIcon, sub: "Live Bot Host" },
    ...(subDetails?.duration === "Lifetime" || isAdminLoggedIn
      ? [{ id: "exporter", label: "تصدير الملفات", icon: Download, sub: "Exporter Bundle" }]
      : []
    )
  ];

  useEffect(() => {
    if (activeTab === "exporter" && subDetails?.duration !== "Lifetime" && !isAdminLoggedIn) {
      setActiveTab("studio");
    }
  }, [activeTab, subDetails, isAdminLoggedIn]);


  if (checkingSub) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center font-sans animate-fade-in" style={{ direction: "rtl" }}>
        <RefreshCw className="w-8 h-8 text-indigo-505 animate-spin mb-4" />
        <span className="text-xs text-slate-400 tracking-wider">جاري فحص حالة الترخيص والاستضافة...</span>
      </div>
    );
  }

  if (!isSubVerified) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#06080c] to-[#030406] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-600/30">
        <div className="w-full max-w-md bg-slate-950/65 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

          {!showAdminTab ? (
            // User Activation Form
            <form onSubmit={handleActivateLicense} className="space-y-5 text-right font-sans animate-fade-in" style={{ direction: "rtl" }}>
              <div className="text-center space-y-2 pb-2">
                <div className="flex justify-center mb-4.5 scale-110 drop-shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <MJKLogo size={76} />
                </div>
                <h2 className="text-lg font-extrabold text-white">بوابة تفعيل المنصة الحصرية</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                  هذه المنصة مخصصة للمشتركين ذوي التراخيص الفعالة فقط للوصول إلى استوديو تطوير واستضافة البوت لـ 24 ساعة دون انقطاع.
                </p>
              </div>

              {activationError && (
                <div className="bg-red-500/10 border border-red-500/35 text-red-300 text-[11px] px-3 py-2 rounded-lg text-center">
                  ⚠️ {activationError}
                </div>
              )}

              {activationSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 text-[11px] px-3 py-2 rounded-lg text-center font-bold">
                  ✅ {activationSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400">كود التفعيل / الاشتراك الخاص بك (License Key)</label>
                <input
                  type="text"
                  value={activationInput}
                  onChange={(e) => setActivationInput(e.target.value)}
                  placeholder="مثال: LIC-XXXX-XXXX-XXXX"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-center text-slate-200 tracking-wider focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 uppercase"
                  disabled={isActivating}
                />
              </div>

              <button
                type="submit"
                disabled={isActivating}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                {isActivating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>تأكيد التفعيل والدخول 🔓</span>
                )}
              </button>

              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminTab(true);
                    setAdminError("");
                  }}
                  className="text-slate-400 hover:text-indigo-400 font-medium transition cursor-pointer font-sans"
                >
                  تسجيل دخول الإدارة (Admin Portal)
                </button>
                <span className="text-slate-600 font-mono">v2.5 Private Server</span>
              </div>
            </form>
          ) : (
            // Admin Login Form
            <div className="space-y-5 text-right font-sans animate-fade-in" style={{ direction: "rtl" }}>
              <div className="text-center space-y-2 pb-2">
                <div className="flex justify-center mb-4.5 scale-110 drop-shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <MJKLogo size={76} />
                </div>
                <h2 className="text-lg font-extrabold text-white">Administration Area</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  الوصول إلى سجل التراخيص وتوليد أكواد اشتراكات جديدة لمستخدمي المنصة.
                </p>
              </div>

              {!isAdminLoggedIn ? (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminError && (
                    <div className="bg-red-500/10 border border-red-500/35 text-red-305 text-[11px] px-3 py-2 rounded-lg text-center">
                      ⚠️ {adminError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400">رمز الإدارة (Admin Secret Key)</label>
                    <input
                      type="password"
                      value={adminInput}
                      onChange={(e) => setAdminInput(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-center text-slate-200 focus:border-purple-500 focus:outline-none"
                      disabled={isLoggingAdmin}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingAdmin}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoggingAdmin ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>تسجيل الدخول كمسؤول</span>
                    )}
                  </button>
                </form>
              ) : (
                // Hardened Admin Interface for Subscription Key management
                <div className="space-y-5 animate-fade-in">
                  <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] p-2.5 rounded-lg flex items-center justify-between">
                    <span>بوابة المسؤول نشطة ومصرحة ✅</span>
                    <button
                      onClick={handleAdminLogout}
                      className="text-emerald-400 font-bold hover:underline text-[9px] cursor-pointer"
                    >
                      تسجيل خروج
                    </button>
                  </div>

                  {/* Generate Section */}
                  <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-xl space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-200">توليد أكواد جديدة (License Keys)</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400">الفترة (Duration)</label>
                        <select
                          value={genDuration}
                          onChange={(e) => setGenDuration(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:border-purple-500"
                        >
                          <option value="30 Days">30 يوم (شهر)</option>
                          <option value="90 Days">90 يوم (3 أشهر)</option>
                          <option value="365 Days">365 يوم (سنة كاملة)</option>
                          <option value="Lifetime">مدى الحياة (Lifetime)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400">الكمية لإنشائها</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={genCount}
                          onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 text-center focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">ملاحظة الكود (Note)</label>
                      <input
                        type="text"
                        placeholder="مثال: اشتراك تجريبي لعاصم"
                        value={genNote}
                        onChange={(e) => setGenNote(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Integrated Allowed Modules selection */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] text-slate-400 font-bold">الأنظمة المفعلة في الأكواد الجديدة:</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setGenModules(SYSTEM_MODULES_LIST.map(m => m.id))}
                            className="text-[9px] text-indigo-400 hover:underline cursor-pointer font-bold"
                          >
                            تحديد الكل
                          </button>
                          <span className="text-slate-800 text-[9px] font-bold">|</span>
                          <button
                            type="button"
                            onClick={() => setGenModules([])}
                            className="text-[9px] text-[#E74C3C] hover:underline cursor-pointer font-bold"
                          >
                            إلغاء الكل
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-850 max-h-40 overflow-y-auto">
                        {SYSTEM_MODULES_LIST.map((mod) => {
                          const isChecked = genModules.includes(mod.id);
                          return (
                            <label
                              key={mod.id}
                              className={`flex items-center gap-1.5 p-1.5 rounded border transition cursor-pointer text-[10px] select-none ${
                                isChecked
                                  ? "bg-indigo-500/10 border-indigo-500/35 text-indigo-200"
                                  : "bg-slate-900/40 border-slate-900 text-slate-450 hover:border-slate-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setGenModules(genModules.filter(id => id !== mod.id));
                                  } else {
                                    setGenModules([...genModules, mod.id]);
                                  }
                                }}
                                className="accent-indigo-500 w-3 h-3 cursor-pointer"
                              />
                              <span className="truncate">{mod.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateKeys}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      توليد وحفظ الأكواد ⚡
                    </button>
                  </div>

                  {/* Keys list */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">أكواد الاشتراكات المتواجدة:</span>
                      <button
                        onClick={fetchAdminKeys}
                        className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        {loadingKeys ? 'جاري التحميل...' : 'تحديث الرموز 🔄'}
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-slate-850 rounded-lg divide-y divide-slate-800">
                      {keysList.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-[10px]">
                          لا توجد أكواد مولدة بعد بالمنظومة.
                        </div>
                      ) : (
                        keysList.map((kObj) => (
                          <div key={kObj.key} className="p-2 bg-slate-950/75 space-y-1 text-[11px]">
                            <div className="flex justify-between items-center font-mono">
                              <span className="text-indigo-400 font-bold select-all tracking-wider">{kObj.key}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                                  kObj.status === 'unused' ? 'bg-slate-800 text-slate-400' :
                                  kObj.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                  'bg-red-500/10 text-red-500'
                                }`}>
                                  {kObj.status === 'unused' ? 'غير مستخدم' :
                                   kObj.status === 'active' ? 'نشط' : 'منتهي'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteKey(kObj.key)}
                                  className="text-red-400 hover:text-red-350 transition p-0.5 cursor-pointer"
                                  title="تدمير الكود"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-450 font-sans">
                              <span>المدة: <strong className="text-slate-350">{kObj.duration}</strong></span>
                              {kObj.note && <span className="opacity-75">{kObj.note}</span>}
                            </div>
                            {kObj.allowedModules && (
                              <div className="text-[8.5px] text-indigo-400 font-bold bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10 mt-1 flex flex-col gap-0.5 leading-relaxed font-sans">
                                <div className="flex justify-between items-center">
                                  <span>الأنظمة المسموحة ({kObj.allowedModules.length}):</span>
                                  <span className="text-[7.5px] text-slate-500">
                                    {kObj.allowedModules.length === SYSTEM_MODULES_LIST.length ? "اشتراك كامل" : "اشتراك مخصص"}
                                  </span>
                                </div>
                                <span className="text-slate-400 text-[8px] font-medium line-clamp-1">
                                  {kObj.allowedModules.length === SYSTEM_MODULES_LIST.length 
                                    ? "جميع الأنظمة المتقدمة كاملة" 
                                    : kObj.allowedModules.map((mId: string) => {
                                        const foundMod = SYSTEM_MODULES_LIST.find(sm => sm.id === mId);
                                        return foundMod ? foundMod.label.replace(/👋|🎫|🛡️|💡|🚨|🔨|💬|🎁|⚖|🌴|🏆|🎭|📊/g, '').trim() : mId;
                                      }).join("، ")
                                  }
                                </span>
                              </div>
                            )}
                            {kObj.expiresAt && (
                              <div className="text-[8px] text-slate-500 font-sans mt-0.5">
                                ينتهي في: {kObj.expiresAt === 'lifetime' ? 'لا ينتهي' : new Date(kObj.expiresAt).toLocaleDateString("ar-SA")}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowAdminTab(false)}
                  className="text-slate-400 hover:text-indigo-400 font-medium transition cursor-pointer"
                >
                  الرجوع لتفعيل الكود
                </button>
                <span className="text-slate-500 font-mono">Admin Area v2.5</span>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  const sidebarNavItems = [
    { section: 'MAIN', items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'bot-system', label: 'Bot System', icon: Bot },
      { id: 'hosting', label: 'Hosting', icon: Server },
      { id: 'servers', label: 'Servers', icon: Users },
      { id: 'logs', label: 'Logs', icon: Terminal },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]},
    { section: 'TOOLS', items: [
      { id: 'command-studio', label: 'Command Studio', icon: Puzzle },
      { id: 'modules', label: 'Advanced Modules', icon: Layers },
      ...(isAdminLoggedIn ? [{ id: 'exporter', label: 'Code Exporter', icon: FileCode }] : []),
    ]},
    { section: 'ACCOUNT', items: [
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'profile', label: 'Profile', icon: User },
    ]},
  ];

  const activeGuildName = selectedGuild?.name || '';
  const activeGuildIcon = selectedGuild?.icon
    ? `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png?size=32`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const notifItems = [
    { id: '1', title: 'Bot updated', desc: 'Configuration synced to cloud', time: '2m ago', read: false },
    { id: '2', title: 'New server added', desc: 'Your bot joined a new server', time: '1h ago', read: false },
    { id: '3', title: 'Subscription renewed', desc: 'Premium plan extended', time: '2d ago', read: true },
  ];

  return (
    <div className="flex h-screen bg-[#080B12] text-white overflow-hidden selection:bg-primary/30">

      {/* ========== SIDEBAR ========== */}
      <aside className="w-[260px] bg-[#0B0F1A] border-r border-[rgba(255,255,255,0.06)] flex flex-col flex-shrink-0 select-none">
        
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <MJKLogo size={26} showText={true} />
        </div>

        {/* Platform Status */}
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" style={{ animationDuration: '2s' }} />
            <span className="text-[11px] font-medium text-text-muted">All systems normal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sidebarNavItems.map((section) => (
            <div key={section.section}>
              <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                {section.section}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = sidebarView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-primary/15 text-primary sidebar-item active'
                        : 'text-text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)] sidebar-item'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 sidebar-icon ${isActive ? 'text-primary' : 'text-text-dim'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {discordUser ? discordUser.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{discordUser ? discordUser.username : 'Guest'}</p>
              <p className="text-[10px] text-text-dim truncate">{isSubVerified ? 'Premium' : 'Free'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="h-14 border-b border-[rgba(255,255,255,0.06)] bg-[#080B12] flex items-center px-6 gap-3 flex-shrink-0">
          
          {/* Page Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">
              {sidebarNavItems.flatMap(s => s.items).find(i => i.id === sidebarView)?.label || 'Dashboard'}
            </h1>
            {selectedGuild && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-surface border border-border rounded-md text-[10px] text-text-muted">
                <img src={activeGuildIcon} alt="" className="w-3.5 h-3.5 rounded" onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }} />
                <span className="truncate max-w-[120px]">{activeGuildName}</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-dim min-w-[200px]">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="text-text-dim/50">Search commands, logs...</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-2 text-text-dim hover:text-white hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifItems.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition ${!n.read ? '' : ''}`}>
                        <div className="flex items-start gap-2.5">
                          {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />}
                          <div className={n.read ? 'mr-4' : ''}>
                            <p className="text-xs font-medium text-white">{n.title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{n.desc}</p>
                            <p className="text-[9px] text-text-dim mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-border">
                    <button className="w-full py-1.5 text-[10px] text-text-dim hover:text-text-muted text-center transition cursor-pointer">View all</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Server Selector */}
          {discordUser && discordGuilds.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowGuildPicker(!showGuildPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border hover:border-border-hover text-text-muted hover:text-white rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                <Server className="w-3.5 h-3.5" />
                {selectedGuild ? (
                  <span className="max-w-[80px] truncate">{selectedGuild.name}</span>
                ) : (
                  <span>Select Server</span>
                )}
                <ChevronDown className="w-3 h-3 text-text-dim" />
              </button>
              {showGuildPicker && (
                <div className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-xl p-2 w-72 max-h-72 overflow-y-auto z-40 shadow-elevated">
                  {discordGuilds.map((g: any) => (
                    <button
                      key={g.id}
                      onClick={(e) => { handleSelectGuild(g, e); setShowGuildPicker(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] text-xs transition cursor-pointer"
                    >
                      <img
                        src={g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=32` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt=""
                        className="w-6 h-6 rounded-lg flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                      />
                      <span className="text-white font-medium truncate flex-1">{g.name}</span>
                      <span className="text-text-dim text-[9px]">{g.memberCount?.toLocaleString() || '?'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Profile */}
          {discordUser ? (
            <div className="flex items-center gap-2">
              <img
                src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=32`}
                alt=""
                className="w-6 h-6 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-xs font-medium text-white hidden sm:inline">{discordUser.username}</span>
              <button
                onClick={handleDiscordLogout}
                className="p-1.5 text-text-dim hover:text-white rounded-lg transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleDiscordLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{oauthConfigured ? 'Sign In' : 'Setup OAuth'}</span>
            </button>
          )}
        </header>

        {/* ========== CONTENT AREA ========== */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Real-time Cloud updates notice */}
          {hasUnappliedChanges && (botStatus === 'online' || botStatus === 'logging_in') && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-warning/20 rounded-xl p-4 flex items-center justify-between gap-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-xs font-medium text-white">Unapplied changes detected</p>
                  <p className="text-[10px] text-text-muted">Sync your config to the live bot in Hosting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickRestartBot}
                  disabled={restartingBot}
                  className="shrink-0 px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  {restartingBot ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>{restartingBot ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={() => navigateTo('hosting')}
                  className="shrink-0 px-2.5 py-1.5 text-text-muted hover:text-white rounded-lg text-[10px] font-medium transition cursor-pointer"
                >
                  Open Hosting
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== ACTIVATION / ADMIN / OAUTH SCREENS ==================== */}

          {/* SUBSCRIPTION ACTIVATION */}
          {(!subKey || !isSubVerified) ? (
            <div className="max-w-md mx-auto mt-16 space-y-6 text-center">
              <div className="flex justify-center">
                <MJKLogo size={56} showText={true} />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-white">Welcome to MJK System</h1>
                <p className="text-sm text-text-muted">Activate your license to manage Discord bots.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-right">
                <form onSubmit={handleActivateLicense} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-text-muted">License Key</label>
                    <div className="relative">
                      <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                      <input
                        type="text"
                        value={activationInput}
                        onChange={(e) => setActivationInput(e.target.value)}
                        className="w-full pr-10 pl-3 py-2.5 bg-[#080B12] border border-border rounded-lg text-sm text-white text-right focus:border-primary/50 focus:outline-none"
                        placeholder="Enter your license key"
                      />
                    </div>
                  </div>
                  {activationError && (
                    <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{activationError}</span>
                    </div>
                  )}
                  {activationSuccess && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-success flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{activationSuccess}</span>
                    </div>
                  )}
                  {subKey && !isSubVerified && !checkingSub && (
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-xs text-warning">
                      Saved key is invalid. Enter a new key.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isActivating || checkingSub}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {checkingSub ? 'Verifying...' : isActivating ? 'Activating...' : 'Activate License'}
                  </button>
                </form>
                {!isAdminLoggedIn && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => setShowAdminTab(!showAdminTab)}
                      className="text-xs text-text-dim hover:text-text-muted transition cursor-pointer"
                    >
                      {showAdminTab ? 'Hide' : 'Admin Login'}
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Login */}
              {(isAdminLoggedIn || showAdminTab) && (
                <div className="bg-card border border-border rounded-xl p-6 text-right space-y-4">
                  <h3 className="text-sm font-semibold text-white">Admin Panel</h3>
                  {!isAdminLoggedIn ? (
                    <form onSubmit={handleAdminLogin} className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-text-muted">Admin Code</label>
                        <input
                          type="password"
                          value={adminInput}
                          onChange={(e) => setAdminInput(e.target.value)}
                          className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-sm text-white text-right focus:border-primary/50 focus:outline-none"
                          placeholder="Enter admin code"
                        />
                      </div>
                      {adminError && <p className="text-xs text-danger">{adminError}</p>}
                      <button
                        type="submit"
                        disabled={isLoggingAdmin}
                        className="w-full py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                      >
                        {isLoggingAdmin ? 'Logging in...' : 'Login'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-success flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Logged in as admin
                        </span>
                        <div className="flex gap-2">
                          <button onClick={handleLogout} className="text-xs text-text-dim hover:text-text-muted px-2 py-1 rounded hover:bg-border/50 transition cursor-pointer">Logout Subscription</button>
                          <button onClick={handleAdminLogout} className="text-xs text-danger px-2 py-1 rounded hover:bg-danger/10 transition cursor-pointer">Logout Admin</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-white">Key Management</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-text-dim">Count</label>
                            <input type="number" value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} min={1} max={50} className="w-full px-2 py-1.5 bg-[#080B12] border border-border rounded text-xs text-white" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-text-dim">Duration</label>
                            <select value={genDuration} onChange={(e) => setGenDuration(e.target.value)} className="w-full px-2 py-1.5 bg-[#080B12] border border-border rounded text-xs text-white">
                              <option>7 Days</option><option>15 Days</option><option>30 Days</option><option>60 Days</option><option>90 Days</option><option>Lifetime</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-text-dim">Note</label>
                            <input type="text" value={genNote} onChange={(e) => setGenNote(e.target.value)} className="w-full px-2 py-1.5 bg-[#080B12] border border-border rounded text-xs text-white" placeholder="Optional" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-text-dim">Allowed Modules</label>
                          <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                            {SYSTEM_MODULES_LIST.map(m => (
                              <label key={m.id} className="flex items-center gap-1.5 text-[10px] text-text-muted cursor-pointer">
                                <input type="checkbox" checked={genModules.includes(m.id)} onChange={() => genModules.includes(m.id) ? setGenModules(genModules.filter(x => x !== m.id)) : setGenModules([...genModules, m.id])} className="rounded border-border bg-[#080B12]" />
                                {m.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        <button onClick={handleGenerateKeys} className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg text-xs transition cursor-pointer">Generate Keys</button>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-white">Keys ({keysList.length})</h4>
                        {loadingKeys ? (
                          <p className="text-xs text-text-dim">Loading...</p>
                        ) : keysList.length === 0 ? (
                          <p className="text-xs text-text-dim">No keys.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {keysList.map((k, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-[#080B12] border border-border rounded-lg text-[10px]">
                                <div className="flex items-center gap-2 text-left" style={{ direction: 'ltr' }}>
                                  <span className="font-mono text-text-muted">{k.key || k.code}</span>
                                  <span className="text-text-dim">{k.duration}</span>
                                  {k.usedBy ? <span className="text-primary">Used</span> : <span className="text-success">New</span>}
                                </div>
                                <button onClick={() => handleDeleteKey(k.key || k.code)} className="p-1 text-danger hover:bg-danger/10 rounded cursor-pointer transition"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : showOAuthSetup && isAdminLoggedIn ? (
            <div className="max-w-md mx-auto mt-8">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">Discord OAuth Setup</h2>
                <p className="text-xs text-text-muted">Enter your Discord application credentials.</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">Client ID</label>
                    <input type="text" value={oauthClientId} onChange={(e) => setOauthClientId(e.target.value)} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" placeholder="Client ID" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">Client Secret</label>
                    <input type="password" value={oauthClientSecret} onChange={(e) => setOauthClientSecret(e.target.value)} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" placeholder="Client Secret" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">Bot Token</label>
                    <input type="password" value={oauthBotToken} onChange={(e) => setOauthBotToken(e.target.value)} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono" placeholder="Bot Token (optional)" />
                  </div>
                  <p className="text-xs text-text-dim">Add <span className="text-primary">http://localhost:3000/api/discord/callback</span> in OAuth2 &gt; Redirects.</p>
                  <button onClick={saveOAuthConfig} disabled={savingOAuth} className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer disabled:cursor-not-allowed">
                    {savingOAuth ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== NORMAL DASHBOARD CONTENT ==================== */
            <div className="space-y-6">
            
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[
                      { label: 'Active Servers', value: selectedGuild ? '1' : '0', icon: Server, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Bot Status', value: botStatus === 'online' ? 'Online' : 'Offline', icon: Cpu, color: 'text-success', bg: 'bg-success/10' },
                      { label: 'Commands', value: String(commands.length), icon: Terminal, color: 'text-accent', bg: 'bg-accent/10' },
                      { label: 'Uptime', value: botStatus === 'online' ? '99.9%' : '--', icon: Activity, color: 'text-success', bg: 'bg-success/10' },
                      { label: 'Latency', value: botStatus === 'online' ? '14ms' : '--', icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="metric-card">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">{stat.label}</span>
                            <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-white stat-value">{stat.value}</p>
                          <div className="mt-1 h-1 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${stat.color.replace('text-', 'bg-')}/40`} style={{ width: botStatus === 'online' ? '85%' : '30%' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Main Dashboard */}
                  <BotDashboard logs={logs} setLogs={setLogs} commandsCount={commands.length} />
                </>
              )}

              {/* Hosting Tab */}
              {activeTab === 'hosting' && (
                <LiveHost
                  config={config} commands={commands}
                  welcome={welcome} ticket={ticket} staffApp={staffApp}
                  security={security} rulesBot={rulesBot} leaveConfig={leaveConfig}
                  suggestion={suggestion} report={report} warning={warning}
                  autoResponse={autoResponse} giveaway={giveaway}
                  levelConfig={levelConfig} reactionRoles={reactionRoles} voiceStats={voiceStats}
                  autoRoles={autoRoles} embedFormatter={embedFormatter} modLogs={modLogs}
                />
              )}

              {/* Modules Tab */}
              {activeTab === 'modules' && (
                <AdvancedModules
                  welcome={welcome} setWelcome={setWelcome}
                  ticket={ticket} setTicket={setTicket}
                  staffApp={staffApp} setStaffApp={setStaffApp}
                  security={security} setSecurity={setSecurity}
                  rulesBot={rulesBot} setRulesBot={setRulesBot}
                  leaveConfig={leaveConfig} setLeaveConfig={setLeaveConfig}
                  suggestion={suggestion} setSuggestion={setSuggestion}
                  report={report} setReport={setReport}
                  warning={warning} setWarning={setWarning}
                  autoResponse={autoResponse} setAutoResponse={setAutoResponse}
                  giveaway={giveaway} setGiveaway={setGiveaway}
                  levelConfig={levelConfig} setLevelConfig={setLevelConfig}
                  reactionRoles={reactionRoles} setReactionRoles={setReactionRoles}
                  voiceStats={voiceStats} setVoiceStats={setVoiceStats}
                  autoRoles={autoRoles} setAutoRoles={setAutoRoles}
                  embedFormatter={embedFormatter} setEmbedFormatter={setEmbedFormatter}
                  modLogs={modLogs} setModLogs={setModLogs}
                  guildRoles={guildRoles}
                  selectedGuildId={selectedGuild?.id}
                  discordSession={discordSession}
                  channels={channels} setChannels={setChannels}
                  onAddLog={handleAddLog}
                  members={members} setMembers={setMembers}
                  allowedModules={subDetails?.allowedModules}
                  isAdmin={isAdminLoggedIn}
                  isLoadingChannels={isLoadingChannels}
                  channelLoadError={channelLoadError}
                  botInviteUrl={botInviteUrl}
                  onRetryChannels={() => { if (selectedGuild) handleSelectGuild(selectedGuild, undefined, true); }}
                />
              )}

              {/* Exporter Tab */}
              {activeTab === 'exporter' && isAdminLoggedIn && (
                <CodeExporter
                  config={config} commands={commands}
                  welcome={welcome} ticket={ticket} staffApp={staffApp}
                  security={security} rulesBot={rulesBot} leaveConfig={leaveConfig}
                  suggestion={suggestion} report={report} warning={warning}
                  autoResponse={autoResponse} giveaway={giveaway}
                  levelConfig={levelConfig} reactionRoles={reactionRoles} voiceStats={voiceStats}
                />
              )}

              {/* Bot System Tab */}
              {activeTab === 'bot-system' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Bot Name', value: config.name || 'Unnamed', icon: Bot, color: 'text-primary' },
                      { label: 'Prefix', value: config.prefix || '/', icon: Terminal, color: 'text-accent' },
                      { label: 'Status', value: botStatus === 'online' ? 'Online' : 'Offline', icon: Activity, color: botStatus === 'online' ? 'text-success' : 'text-danger' },
                      { label: 'Servers', value: selectedGuild ? '1 Connected' : '0', icon: Server, color: 'text-primary' },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="metric-card">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">{stat.label}</span>
                            <div className={`p-2 ${stat.color.replace('text', 'bg')}/10 ${stat.color} rounded-lg`}>
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>
                          <p className="text-lg font-bold text-white">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                          <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Bot Configuration</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Name</label>
                        <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Avatar</label>
                        <input type="text" value={config.avatar} onChange={(e) => setConfig({...config, avatar: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Prefix</label>
                        <input type="text" value={config.prefix} onChange={(e) => setConfig({...config, prefix: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Live Logs</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] text-text-dim">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" style={{ animationDuration: '2s' }} />
                        {logs.length} events
                      </span>
                      {logs.length > 0 && (
                        <button onClick={() => setLogs([])} className="px-2 py-1 text-[10px] text-text-dim hover:text-danger transition cursor-pointer rounded hover:bg-danger/10">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    {logs.length === 0 ? (
                      <div className="text-center py-12">
                        <Terminal className="w-10 h-10 text-border mx-auto mb-2" />
                        <p className="text-xs text-text-muted">No logs yet</p>
                        <p className="text-[10px] text-text-dim mt-1">Logs will appear here as events are processed</p>
                      </div>
                    ) : (
                      <div className="bg-[#080B12] border border-border rounded-xl overflow-hidden font-mono">
                        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-[#0A0D14]">
                          <span className="w-2.5 h-2.5 rounded-full bg-danger/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
                          <span className="text-[10px] text-text-dim ml-1">terminal — logs</span>
                        </div>
                        <div className="p-4 max-h-[500px] overflow-y-auto space-y-1">
                          {[...logs].reverse().map((log, i) => (
                            <div key={i} className="flex items-start gap-3 text-[11px] leading-relaxed">
                              <span className="text-text-dim shrink-0 w-8 text-right select-none">{logs.length - i}</span>
                              <span className="text-text-dim shrink-0">{log.timestamp}</span>
                              <span className={`shrink-0 font-semibold ${
                                log.type === 'error' || log.type === 'critical' ? 'text-danger' :
                                log.type === 'warning' ? 'text-warning' :
                                log.type === 'success' ? 'text-success' :
                                'text-primary'
                              }`}>[{log.type.toUpperCase()}]</span>
                              <span className="text-gray-300">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <BotDashboard logs={logs} setLogs={setLogs} commandsCount={commands.length} />
              )}

              {/* Servers Tab */}
              {activeTab === 'servers' && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Connected Server</h3>
                      {selectedGuild && <span className="text-[10px] text-success ml-2">● Connected</span>}
                    </div>
                    {selectedGuild ? (
                      <div className="flex items-center gap-3 p-3 bg-[#080B12] border border-border rounded-xl">
                        {selectedGuild.icon && (
                          <img src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`} alt="" className="w-10 h-10 rounded-lg" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{selectedGuild.name}</p>
                          <p className="text-[10px] text-text-dim">{selectedGuild.memberCount || '?'} members</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="w-10 h-10 text-border mx-auto mb-2" />
                        <p className="text-xs text-text-muted">No server connected</p>
                        <p className="text-[10px] text-text-dim mt-1">Connect via Discord OAuth to manage a server</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Command Studio Tab */}
              {activeTab === 'command-studio' && (
                <>
                  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                          <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Bot Configuration</h3>
                      </div>
                      <span className="text-[9px] text-text-dim uppercase tracking-wider">v{config.prefix}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Name</label>
                        <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Avatar</label>
                        <input type="text" value={config.avatar} onChange={(e) => setConfig({...config, avatar: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none" placeholder="🤖" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Prefix</label>
                        <input type="text" value={config.prefix} onChange={(e) => setConfig({...config, prefix: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Status</label>
                        <select value={config.status} onChange={(e) => setConfig({...config, status: e.target.value as any})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none">
                          <option value="online">Online</option>
                          <option value="idle">Idle</option>
                          <option value="dnd">DND</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Activity</label>
                        <select value={config.activityType} onChange={(e) => setConfig({...config, activityType: e.target.value as any})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none">
                          <option value="PLAYING">Playing</option>
                          <option value="STREAMING">Streaming</option>
                          <option value="LISTENING">Listening</option>
                          <option value="WATCHING">Watching</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Custom Status</label>
                        <input type="text" value={config.customStatus} onChange={(e) => setConfig({...config, customStatus: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Activity Name</label>
                        <input type="text" value={config.activityName} onChange={(e) => setConfig({...config, activityName: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Embed Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={config.embedColor || '#5865F2'} onChange={(e) => setConfig({...config, embedColor: e.target.value})} className="w-8 h-8 bg-transparent border-0 rounded cursor-pointer shrink-0" />
                        <input type="text" value={config.embedColor || '#5865F2'} onChange={(e) => setConfig({...config, embedColor: e.target.value})} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <CommandStudio commands={commands} setCommands={setCommands} prefix={config.prefix} />
                </>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                        <Settings className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Settings</h3>
                    </div>
                    {showOAuthSetup ? (
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-white">Discord OAuth Configuration</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-muted">Client ID</label>
                            <input type="text" value={oauthClientId} onChange={(e) => setOauthClientId(e.target.value)} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-muted">Client Secret</label>
                            <input type="password" value={oauthClientSecret} onChange={(e) => setOauthClientSecret(e.target.value)} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-muted">Bot Token</label>
                            <input type="password" value={oauthBotToken} onChange={(e) => setOauthBotToken(e.target.value)} className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono" placeholder="Optional" />
                          </div>
                          <button onClick={saveOAuthConfig} disabled={savingOAuth} className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition cursor-pointer">
                            {savingOAuth ? 'Saving...' : 'Save Settings'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowOAuthSetup(true)} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs transition cursor-pointer">
                        Configure Discord OAuth
                      </button>
                    )}
                  </div>
                  {/* Admin Section (only visible when admin is logged in) */}
                  {isAdminLoggedIn && (
                    <div className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                            <Shield className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-white">Admin Panel</h3>
                        </div>
                        <button onClick={handleAdminLogout} className="text-xs text-text-dim hover:text-text-muted px-3 py-1.5 rounded-lg hover:bg-border/50 transition cursor-pointer">Logout Admin</button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-text-dim">Count</label>
                            <input type="number" value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} min={1} max={50} className="w-full px-2 py-1.5 bg-[#080B12] border border-border rounded text-xs text-white" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-text-dim">Duration</label>
                            <select value={genDuration} onChange={(e) => setGenDuration(e.target.value)} className="w-full px-2 py-1.5 bg-[#080B12] border border-border rounded text-xs text-white">
                              <option>7 Days</option><option>15 Days</option><option>30 Days</option><option>60 Days</option><option>90 Days</option><option>Lifetime</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-text-dim">Note</label>
                            <input type="text" value={genNote} onChange={(e) => setGenNote(e.target.value)} className="w-full px-2 py-1.5 bg-[#080B12] border border-border rounded text-xs text-white" placeholder="Optional" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-text-dim">Allowed Modules</label>
                          <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                            {SYSTEM_MODULES_LIST.map(m => (
                              <label key={m.id} className="flex items-center gap-1.5 text-[10px] text-text-muted cursor-pointer">
                                <input type="checkbox" checked={genModules.includes(m.id)} onChange={() => genModules.includes(m.id) ? setGenModules(genModules.filter(x => x !== m.id)) : setGenModules([...genModules, m.id])} className="rounded border-border bg-[#080B12]" />
                                {m.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        <button onClick={handleGenerateKeys} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg text-xs transition cursor-pointer">Generate Keys</button>
                      </div>
                      {loadingKeys ? <p className="text-xs text-text-dim mt-4">Loading...</p> : keysList.length > 0 && (
                        <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto">
                          {keysList.map((k, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-[#080B12] border border-border rounded-lg text-[10px]">
                              <div className="flex items-center gap-2 text-left" style={{ direction: 'ltr' }}>
                                <span className="font-mono text-text-muted">{k.key || k.code}</span>
                                <span className="text-text-dim">{k.duration}</span>
                                {k.usedBy ? <span className="text-primary">Used</span> : <span className="text-success">New</span>}
                              </div>
                              <button onClick={() => handleDeleteKey(k.key || k.code)} className="p-1 text-danger hover:bg-danger/10 rounded cursor-pointer transition"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="max-w-lg space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Subscription</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#080B12] border border-border rounded-xl">
                        <div>
                          <p className="text-xs text-text-muted">Status</p>
                          <p className="text-sm font-semibold text-white mt-1">{isSubVerified ? 'Active' : 'Inactive'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${isSubVerified ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {isSubVerified ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      {subKey && (
                        <div className="p-4 bg-[#080B12] border border-border rounded-xl">
                          <p className="text-xs text-text-muted">License Key</p>
                          <p className="text-sm font-mono text-white mt-1 select-all">{subKey}</p>
                        </div>
                      )}
                      {subDetails && (
                        <>
                          <div className="p-4 bg-[#080B12] border border-border rounded-xl">
                            <p className="text-xs text-text-muted">Plan</p>
                            <p className="text-sm font-semibold text-white mt-1">{subDetails.duration || 'Standard'}</p>
                          </div>
                          {subDetails.expiresAt && subDetails.expiresAt !== 'lifetime' && (
                            <SubscriptionCountdown expiresAt={subDetails.expiresAt} />
                          )}
                          {subDetails.expiresAt === 'lifetime' && (
                            <div className="p-4 bg-[#080B12] border border-border rounded-xl">
                              <p className="text-xs text-text-muted">Expiry</p>
                              <p className="text-sm font-semibold text-success mt-1">Lifetime — never expires</p>
                            </div>
                          )}
                        </>
                      )}
                      {!isSubVerified && (
                        <button onClick={handleLogout} className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg text-sm transition cursor-pointer">
                          Enter New License Key
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="max-w-lg space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Profile</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-[#080B12] border border-border rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                          {discordUser ? discordUser.username.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{discordUser ? discordUser.username : 'Guest'}</p>
                          <p className="text-[10px] text-text-dim">{isSubVerified ? 'Premium · Active' : 'Free Tier'}</p>
                        </div>
                      </div>
                      {!discordUser && (
                        <button onClick={() => setShowOAuthSetup(true)} className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg text-sm transition cursor-pointer">
                          Connect Discord Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Server Profiles */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg"><Layers className="w-4 h-4" /></div>
                    <h3 className="text-sm font-semibold text-white">Server Profiles</h3>
                  </div>
                  {profiles.length > 0 && (
                    <button onClick={() => setNewProfileName('')} className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Save Profile
                    </button>
                  )}
                </div>
                {profiles.length === 0 ? (
                  <div className="text-center py-6">
                    <Save className="w-10 h-10 text-border mx-auto mb-2" />
                    <p className="text-xs text-text-muted">No saved profiles</p>
                    <p className="text-[10px] text-text-dim mt-1">Save current config as a reusable profile</p>
                    <div className="mt-4 flex items-center justify-center gap-2 max-w-sm mx-auto">
                      <input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} className="flex-1 px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white text-center" placeholder="Profile name" />
                      <button onClick={handleCreateProfile} disabled={!newProfileName.trim()} className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer disabled:cursor-not-allowed">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {profiles.map((profile) => (
                        <div key={profile.id} className={`p-3 rounded-xl border cursor-pointer transition group ${activeProfileId === profile.id ? 'bg-primary/10 border-primary/30' : 'bg-[#080B12] border-border hover:border-border-hover'}`} onClick={() => loadProfileData(profile)}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-semibold text-white">{profile.name}</p>
                              <p className="text-[9px] text-text-muted mt-0.5">{profile.createdAt}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={(e) => { e.stopPropagation(); loadProfileData(profile); }} className="p-1 text-primary hover:bg-primary/10 rounded transition cursor-pointer" title="Load"><Check className="w-3 h-3" /></button>
                              <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${profile.name}"?`)) setProfiles(profiles.filter(p => p.id !== profile.id)); }} className="p-1 text-danger hover:bg-danger/10 rounded transition cursor-pointer" title="Delete"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[9px] text-text-dim">{profile.commands.length} commands</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} className="flex-1 px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white" placeholder="New profile name" />
                      <button onClick={handleCreateProfile} disabled={!newProfileName.trim()} className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer disabled:cursor-not-allowed"><Plus className="w-3 h-3 inline mr-1" /> Save</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Status */}
              {selectedGuild && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Globe className="w-5 h-5 text-primary" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success" />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-white">Sync Status</h3>
                        <p className="text-[10px] text-text-muted mt-0.5">{selectedGuild.name} — connected</p>
                      </div>
                    </div>
                    <button onClick={(e) => handleSelectGuild(selectedGuild, e, true)} disabled={isLoadingChannels} className="px-3 py-1.5 bg-[#080B12] border border-border hover:border-border-hover text-text-muted hover:text-white rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                      <RefreshCw className={`w-3 h-3 ${isLoadingChannels ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                  {isLoadingChannels && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-text-dim"><RefreshCw className="w-3 h-3 animate-spin" /> Loading channels...</div>
                  )}
                  {channelLoadError && (
                    <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
                      {channelLoadError}
                      {botInviteUrl && <a href={botInviteUrl} target="_blank" rel="noopener noreferrer" className="block mt-1.5 text-primary hover:underline">Add bot to server</a>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SubscriptionCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = timeLeft === 'Expired';

  return (
    <div className="p-4 bg-[#080B12] border border-border rounded-xl">
      <p className="text-xs text-text-muted">Time Remaining</p>
      <p className={`text-lg font-bold mt-1 font-mono ${isExpired ? 'text-danger' : 'text-warning'}`}>
        {timeLeft}
      </p>
      <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
        <CountdownBar expiresAt={expiresAt} />
      </div>
    </div>
  );
}

function CountdownBar({ expiresAt }: { expiresAt: string }) {
  const [pct, setPct] = useState(100);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setPct(0); return; }
      const total = 365 * 24 * 60 * 60 * 1000;
      setPct(Math.min(100, Math.max(0, (diff / total) * 100)));
    };

    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <div className="h-full rounded-full bg-primary/60 transition-all duration-1000" style={{ width: `${pct}%` }} />;
}

