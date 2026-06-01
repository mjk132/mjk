import React, { useState, useEffect, useCallback, useRef } from "react";
import { BotConfig, BotCommand, Channel, Member, ServerLog, WelcomeConfig, TicketConfig, StaffAppConfig, SecurityConfig, RulesConfig, LeaveResignationConfig, SuggestionConfig, ReportConfig, WarningConfig, AutoResponseConfig, GiveawayConfig, LevelConfig, ReactionRolesConfig, VoiceStatsConfig, AutoRolesConfig, EmbedFormatterConfig, StaffManagementConfig, ModLogsConfig } from "./types";
import { Sparkles, Bot, Terminal, Download, Settings, RefreshCw, Layers, ShieldCheck, Globe, Database, Plus, Trash2, Save, Heart, Eye, EyeOff, ExternalLink, LogIn, Server } from "lucide-react";
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
    { id: "staff-management", label: "👥 إدارة طاقم العمل" },
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
  const [adminCode, setAdminCode] = useState<string>(() => localStorage.getItem("admin_code") || "");
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

  // If subscription is verified and admin password exists, pre-log admin
  useEffect(() => {
    async function verifyAdminCode() {
      if (!adminCode) return;
      try {
        const res = await fetch("/api/subscription/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: adminCode })
        });
        const data = await res.json();
        if (data.success) {
          setIsAdminLoggedIn(true);
          fetchAdminKeys();
        } else {
          localStorage.removeItem("admin_code");
          setAdminCode("");
        }
      } catch (err) {
        console.error(err);
      }
    }
    verifyAdminCode();
  }, [adminCode]);

  const fetchAdminKeys = async () => {
    const code = adminCode || adminInput;
    if (!code) return;
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/subscription/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminCode: code })
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
        setAdminCode(adminInput);
        localStorage.setItem("admin_code", adminInput);
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
    const code = adminCode || adminInput;
    if (!code) return;
    try {
      const res = await fetch("/api/subscription/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminCode: code,
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
    const code = adminCode || adminInput;
    if (!code) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف وإلغاء كود الاشتراك هذا تماماً؟")) return;
    try {
      const res = await fetch("/api/subscription/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminCode: code,
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
    localStorage.removeItem("admin_code");
    setAdminCode("");
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

  const [staffManagement, setStaffManagement] = useState<StaffManagementConfig>({
    enabled: false,
    botName: "StaffManager",
    botAvatar: "👥",
    members: [],
    rulesCategories: [],
    leaveRequests: []
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
    setStaffManagement({
      enabled: false, botName: "StaffManager", botAvatar: "👥",
      members: [], rulesCategories: [], leaveRequests: []
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

  const handleSelectGuild = async (guild: any, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSelectedGuild(guild);
    setShowGuildPicker(false);
    setChannelLoadError("");
    setBotInviteUrl("");
    setIsLoadingChannels(true);
    // Reset all form fields immediately to prevent showing old guild data
    resetAllModuleStates();
    isSwitchingGuild.current = true;
    localStorage.setItem('active_guild_id', guild.id);
    // Clear sample channels immediately - will show loading state
    setChannels([]);
    handleAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🌐 تم اختيار السيرفر: ${guild.name} (${guild.id}) - جاري جلب الرومات...`
    });

    // Fetch guild channels and update the channels state
    try {
      // نرسل توكن البوت الخاص بالمستخدم (من LiveBot) عشان نجيب الرومات
      const userBotToken = localStorage.getItem("discord_bot_token") || "";
      const userClientId = localStorage.getItem("discord_bot_client_id") || "";
      const chRes = await fetch(`/api/discord/guilds/${guild.id}/channels?session=${encodeURIComponent(discordSession)}&botToken=${encodeURIComponent(userBotToken)}&clientId=${encodeURIComponent(userClientId)}`);
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
          message: `✅ تم جلب ${mapped.length + cats.length} روم من السيرفر ${guild.name}`
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
            if (savedConfig.staffManagement) setStaffManagement(savedConfig.staffManagement);
            if (savedConfig.modLogs) setModLogs(savedConfig.modLogs);
            if (savedConfig.commands) setCommands(savedConfig.commands);
            handleAddLog({
              id: crypto.randomUUID(),
              timestamp: new Date().toLocaleTimeString(),
              type: "system",
              message: `📂 تم تحميل الإعدادات المحفوظة للسيرفر ${guild.name}`
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
          message: `❌ فشل جلب الرومات: ${errData.error || 'خطأ غير معروف'}`
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
        message: `❌ خطأ في جلب الرومات: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
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
            voiceStats, autoRoles, embedFormatter, staffManagement, modLogs
          })
        });
      } catch (e) {}
    }, 3000);
    return () => clearTimeout(timeout);
  }, [selectedGuild, discordSession, discordUser, config, commands, welcome, ticket, staffApp, security, rulesBot, leaveConfig, suggestion, report, warning, autoResponse, giveaway, levelConfig, reactionRoles, voiceStats, autoRoles, embedFormatter, staffManagement, modLogs]);

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
    staffManagement: StaffManagementConfig;
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
    if (profile.staffManagement) setStaffManagement(profile.staffManagement);
    if (profile.modLogs) setModLogs(profile.modLogs);
    if (profile.commands) setCommands(profile.commands);
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
      staffManagement,
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
          staffManagement,
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
    staffManagement,
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
          staffManagement,
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
          message: "⚡ [تحديث سحابي فوري] تم إرسال وتطبيق التغييرات لجميع المودلات على البوت بنجاح دون انقطاع!"
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
        message: `📁 تم تحميل بروفايل السيرفر: "${found.name}" بنجاح وتطبيق كامل الإعدادات والإنظمة.`
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
          staffManagement,
          modLogs,
          commands
        };
      }
      return p;
    });
    setProfiles(updated);
    localStorage.setItem("discord_bot_server_profiles_v1", JSON.stringify(updated));
    const active = updated.find(p => p.id === activeProfileId);
    handleAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `💾 تم حفظ وتحديث الإعدادات الحالية لبروفايل: "${active?.name}" بنجاح في ذاكرة المتصفح الفورية.`
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
      staffManagement,
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
      message: `✨ تم إنشاء بروفايل سيرفر جديد باسم: "${newProfileName}" وتم الانتقال إليه تلقائياً.`
    });
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      handleAddLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "system",
        message: `⚠️ لا يمكن حذف بروفايل السيرفر الأخير النشط. يجب وجود بروفايل واحد على الأقل.`
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
      message: `🗑️ تم حذف بروفايل السيرفر المحدد من الذاكرة.`
    });
  };

  // 5. Shared Terminal Execution Logs
  const [logs, setLogs] = useState<ServerLog[]>([
    {
      id: "l-init-1",
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "🚀 Initiating Discord Bot Builder VM environment..."
    },
    {
      id: "l-init-2",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `✅ Loaded custom bot configuration for: ${config?.name || "SystemAI"}`
    },
    {
      id: "l-init-3",
      timestamp: new Date().toLocaleTimeString(),
      type: "command",
      message: `⚙️ Registered custom command triggers into active memory cache.`
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
        message: `🔄 Reconfigured profile parameters: [${key}] changed to "${val}"`
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

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0d12] to-[#040507] text-slate-100 flex flex-col selection:bg-indigo-600/30">
      
      {/* Upper Navigation Row Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/45 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4 font-sans">
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between xl:justify-start w-full xl:w-auto">
            <div className="flex items-center gap-4">
              <MJKLogo size={46} showText={true} />
              <div className="h-7 w-[1.5px] bg-[#1e293b]/60 hidden sm:block" />
              <div className="text-right sm:text-left hidden sm:flex flex-col justify-center">
                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <span className="bg-cyan-550/15 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider font-mono shadow-[0_0_10px_rgba(34,211,238,0.15)]">v2.5 Studio</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold tracking-wide">منصة تصميم وبرمجة بوتات الديسكورد الذكية</p>
              </div>
            </div>

            {/* Discord OAuth Login / Server Selector */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-800/50 p-2 rounded-xl text-right" style={{ direction: "rtl" }}>
              {!discordUser ? (
                <button
                  onClick={handleDiscordLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-black rounded-lg transition cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{oauthConfigured ? 'تسجيل الدخول عبر ديسكورد ➔' : 'إعداد Discord OAuth'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <img
                      src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=32`}
                      alt=""
                      className="w-5 h-5 rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="font-bold truncate max-w-[80px]">{discordUser.username}</span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowGuildPicker(!showGuildPicker)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[10px] font-black rounded-lg transition cursor-pointer"
                    >
                      <Server className="w-3 h-3" />
                      <span>{selectedGuild ? selectedGuild.name : 'اختر سيرفر'}</span>
                    </button>

                    {showGuildPicker && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                        <div className="p-2 text-[10px] text-slate-400 border-b border-slate-800 font-bold text-center">
                          سيرفراتك (اختر سيرفراً لتطبيق الإعدادات)
                        </div>
                        {discordGuilds.length === 0 ? (
                          <div className="p-3 text-center text-[10px] text-slate-500">
                            {isFetchingGuilds ? 'جاري التحميل...' : 'لا توجد سيرفرات متاحة'}
                          </div>
                        ) : (
                          discordGuilds.map((g: any) => (
                            <button
                              key={g.id}
                              onClick={() => handleSelectGuild(g)}
                              className={`w-full text-right px-3 py-2 text-[11px] flex items-center gap-2 hover:bg-slate-800 transition cursor-pointer border-b border-slate-800/50 ${
                                selectedGuild?.id === g.id ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300'
                              }`}
                            >
                              {g.icon ? (
                                <img
                                  src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=32`}
                                  alt=""
                                  className="w-5 h-5 rounded-full"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px]">#</div>
                              )}
                              <span className="truncate">{g.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {isLoadingChannels && (
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      جلب الرومات...
                    </span>
                  )}

                  {channelLoadError && !botInviteUrl && (
                    <span className="text-[10px] text-red-400 max-w-[160px] truncate" title={channelLoadError}>
                      ⚠️ {channelLoadError}
                    </span>
                  )}
                  {channelLoadError && botInviteUrl && (
                    <a
                      href={botInviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[10px] font-black rounded-lg transition cursor-pointer whitespace-nowrap"
                    >
                      ➕ إضافة البوت
                    </a>
                  )}

                  {!hasBotToken && discordUser && !isLoadingChannels && (
                    <span className="text-[10px] text-yellow-400 max-w-[160px] truncate" title="لازم تحط Bot Token عشان تشوف الرومات">
                      ⚠️ Bot Token ناقص
                    </span>
                  )}

                  <button
                    onClick={handleDiscordLogout}
                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg transition cursor-pointer"
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>

            {/* Premium Active Subscription details inline */}
            {isSubVerified && subDetails && (
              <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-800/50 p-2 rounded-xl text-right" style={{ direction: "rtl" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:block"></div>
                <div className="flex flex-col text-right">
                  <div className="text-[10px] font-black text-slate-300 flex items-center gap-1">
                    <span>الاشتراك:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      subDetails.duration === "Lifetime"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-sm"
                        : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    }`}>
                      {subDetails.duration === "Lifetime" ? "مدى الحياة ✨" : subDetails.duration}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 select-none">
                    <span>كود:</span>
                    <span className="font-bold tracking-wider select-text text-slate-400">
                      {showFullKey 
                        ? subDetails.key 
                        : (subDetails.key.length > 10 
                            ? `${subDetails.key.slice(0, 5)}••••${subDetails.key.slice(-5)}` 
                            : "••••••••"
                          )
                      }
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFullKey(!showFullKey)}
                      className="p-1 hover:text-indigo-400 transition text-slate-550 cursor-pointer"
                      title={showFullKey ? "إخفاء الكود الحساس" : "إظهار الكود الحساس"}
                    >
                      {showFullKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {isAdminLoggedIn && (
                  <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] px-1 py-0.5 rounded font-black sm:inline hidden">
                    التحكم بالإدارة نشط ⚙️
                  </span>
                )}

                <div className="flex gap-1 mr-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem("mjk_guide_seen");
                      setShowGuideCenter(true);
                    }}
                    className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-lg transition cursor-pointer"
                    title="إظهار مرشد تشغيل البوت التفاعلي مجدداً"
                  >
                    💡 دليل الاستخدام
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("هل تريد تسجيل الخروج والذهاب لبوابة الإدارة (Admin Area)؟\n(ملاحظة: يمكنك إدخال الكود الخاص بك مجدداً لاحقاً لتسجيل الدخول)")) {
                        handleLogout();
                        setTimeout(() => {
                          setShowAdminTab(true);
                        }, 50);
                      }
                    }}
                    className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[10px] font-black rounded-lg transition cursor-pointer"
                  >
                    بوابة الإدارة ⚙️
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg transition cursor-pointer"
                    title="تسجيل خروج من هذا الترخيص"
                  >
                    تبديل الحساب 🚪
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/65 p-1.5 border border-slate-800/80 rounded-2xl w-full xl:w-auto overflow-x-auto">

            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 lg:flex-none flex flex-col items-center justify-center px-4.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer min-w-[100px] lg:min-w-[125px] ${
                    isSelected ? "text-white" : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="navThemeIndicator"
                      className="absolute inset-0 bg-indigo-600 rounded-xl -z-0 focus:outline-none"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex flex-col items-center text-center gap-0.5">
                    <span className="flex items-center gap-1.5 font-black">
                      <TabIcon className="w-3.5 h-3.5" />
                      {tab.label}
                    </span>
                    <span className="text-[9px] opacity-65 font-mono font-medium tracking-normal block">{tab.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 space-y-7">

        {/* Real-time Cloud updates notice */}
        {hasUnappliedChanges && (botStatus === 'online' || botStatus === 'logging_in') && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-slate-900/90 border border-amber-500/30 rounded-2xl p-4.5 px-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-right"
            dir="rtl"
          >
            <div className="flex items-start gap-3.5">
              <span className="p-2 sm:p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 text-lg flex-shrink-0 mt-0.5">
                ⚠️
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-200">
                  لديك تعديلات جديدة لم يتم تفعيلها على البوت بعد!
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  قمت بتعديل البنرات أو النصوص في الأقسام المتنوعة. لتفعيل هذه التحديثات فوراً وبثها حية في سيرفر ديسكورد، اضغط على الزر أدناه لتطبيق التغييرات لجميع الأقسام دون انقطاع.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setHasUnappliedChanges(false);
                  localStorage.removeItem("mjk_bot_needs_restart");
                }}
                className="text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-xl transition cursor-pointer font-bold"
              >
                تجاهل مؤقتاً
              </button>
              <button
                type="button"
                disabled={restartingBot}
                onClick={handleQuickRestartBot}
                className="bg-amber-500 hover:bg-amber-650 active:scale-95 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer flex items-center gap-1.5"
              >
                {restartingBot ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري التحديث الدقيق...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ تحديث وبث التعديلات حياً</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
        
        {/* ========================================== */}
        {/* SERVER CONFIGURATION PROFILES BOARD (REQ 4) */}
        {/* ========================================== */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0e121a] to-[#0a0d14] border border-indigo-500/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden" dir="rtl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/60 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-right">
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2 justify-start">
                  <span>بروفايلات وإعدادات السيرفرات المتعددة</span>
                  <span className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[9px] px-2 py-0.5 rounded-full font-bold">تخزين فوري</span>
                </h3>
                <p className="text-xs text-slate-400">يمكنك حفظ وتهيئة إعدادات رسائل وأنظمة مخصصة لكل سيرفر والتنقل بينها فورياً دون فقدان بياناتك!</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/40 rounded-xl px-4 py-2.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${syncStatus === 'saving' ? 'bg-indigo-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${syncStatus === 'saving' ? 'bg-indigo-550' : 'bg-green-500'}`}></span>
              </span>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-slate-200">
                  {syncStatus === 'saving' ? 'جاري مزامنة التغييرات...' : 'المزامنة التلقائية نشطة ⚡'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {lastSaved ? `تم التحديث تلقائياً: ${lastSaved}` : 'جميع الإعدادات والأنظمة محفوظة بلحظتها'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 leading-relaxed">
            
            {/* Right side: Switcher Dropdown and Info */}
            <div className="lg:col-span-5 space-y-3.5">
              <label className="block text-xs font-black text-slate-300">📁 الملف النشط حالياً (Active Server Config Profile)</label>
              
              <div className="flex items-stretch gap-2">
                <select
                  value={activeProfileId}
                  onChange={(e) => handleSwitchProfile(e.target.value)}
                  className="flex-1 bg-slate-950/75 border border-slate-800/80 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#121620]">
                      {p.name} {p.id === "prof-default-main" ? "(الافتراضي)" : ""}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleDeleteProfile(activeProfileId)}
                  title="حذف هذا السيرفر"
                  className="px-3 bg-red-505/10 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all hover:text-red-300 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-950/45 border border-slate-850/60 rounded-xl p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  الملف النشط حالياً يحفظ كلاً من: <strong className="text-slate-300">أوامر البوت، رسائل الترحيب، لوحات التذاكر، إعدادات الحماية والبث المباشر والقوانين</strong>. عند تنقلك، سيتم تبديل المحاكي والكود المتولد فورياً لهذا السيرفر!
                </span>
              </div>
            </div>

            {/* Left side: Create New Profile Form */}
            <div className="lg:col-span-7 bg-slate-950/35 border border-slate-850/80 rounded-xl p-4.5 space-y-3.5">
              <label className="block text-xs font-black text-slate-300">✨ إنشاء وحفظ بروفايل سيرفر جديد (New Profile Template)</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: سيرفر الألعاب الرئيسي، سيرفر طاقم الإدارة..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/65 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 ml-0.5 text-indigo-400" />
                  <span>إنشاء وحفظ</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-5 gap-y-1">
                <span>تاريخ التخزين: {new Date().toLocaleDateString("ar-EG")}</span>
                <span>•</span>
                <span>يقوم بنسخ الإعدادات الحالية للبدء فورياً</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================== */}
        {/* INTERACTIVE GUIDE ONBOARDING CENTER */}
        {/* ========================================== */}
        {showGuideCenter && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900/90 border border-indigo-505/20 border-indigo-500/25 rounded-2xl p-5 shadow-2xl relative overflow-hidden" 
            dir="rtl"
          >
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3.5 mb-4.5 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-500/10">💡</span>
                <div className="space-y-0.5 text-right">
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 justify-start flex-row-reverse">
                    <span>مرشد الإعداد الفوري والتشغيل التفاعلي (Interactive Setup Companion)</span>
                    <span className="bg-emerald-500/15 border border-emerald-555/30 text-emerald-300 text-[9.5px] px-2 py-0.5 rounded-full font-black animate-pulse">مساعد ذكي</span>
                  </h3>
                  <p className="text-[11px] text-slate-450">دليلك البسيط والمسار المتكامل خطوة بخطوة لبرمجة وإطلاق بوتك الخاص في الديسكورد بكل سهولة.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowGuideCenter(false);
                  localStorage.setItem("mjk_guide_seen", "true");
                }}
                className="text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900 transition-all text-xs font-bold bg-[#141923] p-1.5 px-3 rounded-lg border border-slate-800 cursor-pointer self-end sm:self-auto"
              >
                فهمت الشرح، إغلاق المرشد نهائياً ×
              </button>
            </div>

            {/* Horizontal 5-Step Milestones Tracker */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-5">
              {[
                { step: 0, icon: "🔑", num: "الخطوة ١", title: "كود الترخيص" },
                { step: 1, icon: "🤖", num: "الخطوة ٢", title: "تعديل الهوية" },
                { step: 2, icon: "🛡️", num: "الخطوة ٣", title: "تفعيل الأنظمة" },
                { step: 3, icon: "⚡", num: "الخطوة ٤", title: "استضافة البوت" },
                { step: 4, icon: "💬", num: "الخطوة ٥", title: "البث بديسكورد" },
              ].map((stepObj) => {
                const isSelected = selectedGuideStep === stepObj.step;
                // Determine step status
                let statusBadge = "قيد الانتظار";
                let statusColor = "border-slate-800 bg-slate-950/40 text-slate-500";
                
                if (stepObj.step === 0) {
                  statusBadge = "نشط ومفعل ✅";
                  statusColor = "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
                } else if (stepObj.step === 1) {
                  const changed = config.name !== "SystemAI" || config.prefix !== "!";
                  statusBadge = changed ? "تم التعديل ✅" : "اضبط الهوية ⚙️";
                  statusColor = changed ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-indigo-500/20 bg-indigo-550/5 text-indigo-300";
                } else if (stepObj.step === 2) {
                  const anyActive = welcome.enabled || ticket.enabled || rulesBot.enabled || staffApp.enabled || suggestion?.enabled;
                  statusBadge = anyActive ? "نشطة ومجهزة ✅" : "قيد الإعداد";
                  statusColor = anyActive ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-slate-800 bg-slate-900 text-slate-400";
                } else if (stepObj.step === 3) {
                  statusBadge = "ربط التوكن 🌐";
                  statusColor = "border-slate-800 bg-slate-900 text-slate-400";
                } else {
                  statusBadge = "البث المباشر";
                  statusColor = "border-slate-800 bg-slate-900 text-slate-400";
                }

                return (
                  <button
                    key={stepObj.step}
                    type="button"
                    onClick={() => setSelectedGuideStep(stepObj.step)}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative ${
                      isSelected 
                        ? "border-indigo-650 bg-gradient-to-br from-indigo-950/20 to-slate-900/10 ring-1 ring-indigo-500/30" 
                        : "border-slate-850 bg-slate-950/50 hover:bg-slate-900 hover:border-slate-800"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-base select-none">{stepObj.icon}</span>
                      <span className="text-[10px] font-black text-slate-400">{stepObj.num}</span>
                    </div>
                    <div className="text-xs font-black text-slate-100 mt-1 select-none text-right">{stepObj.title}</div>
                    <div className="text-right">
                      <span className={`inline-block text-[8.5px] px-1.5 py-0.5 rounded-full font-black mt-2 ${statusColor}`}>
                        {statusBadge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Step Deep Dive Details */}
            <div className="bg-slate-950/90 border border-slate-850 p-4.5 rounded-xl space-y-3.5 leading-relaxed relative min-h-[140px] flex flex-col justify-between">
              
              {selectedGuideStep === 0 && (
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 justify-end">
                    <span>الخطوة ١: رخصة السيرفر وترخيص الاستوديو الذكي 🔑</span>
                  </h4>
                  <p className="text-xs text-slate-350">
                    أهلاً بك يا باحث البرمجة! الترخيص الخاص بك نشط بنجاح حالياً في المنصة. تم فحص وتأمين بيئة السحابة البرمجية الخاصة بك، وتم تفعيل كافة أنظمة اللوحات المتقدمة المخصصة للتحكم بذكاء.
                  </p>
                  <p className="text-xs text-slate-450">
                    تم تخزين إعدادات بروفايلك تلقائياً وسحابة المنصة تحفظها من أجلك. يمكنك الآن الانتقال مباشرة للبدء في تشغيل وصهر بوتك.
                  </p>
                </div>
              )}

              {selectedGuideStep === 1 && (
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 justify-end">
                     <span>الخطوة ٢: تعديل وضبط هوية البوت وتواجد السيرفر 👤</span>
                  </h4>
                  <p className="text-xs text-slate-350">
                    اضبط مظهر بوت المساعد الخاص بك! يمكنك تفصيل الاسم الفريد، وحالة التواجد (متصل 🟢، مشغول 🔴، خارج الخدمة 🟡)، ونوع النشاط الذي يمارسه البوت (أمثلة: تلعب لعبة معينة أو تستمع لأغنية ما).
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsConfigExpanded(true);
                        setTimeout(() => {
                          document.getElementById("bot-config-anchor")?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>تفتيت لفتح نافذة إعدادات الهوية 🤖</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedGuideStep === 2 && (
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 justify-end">
                    <span>الخطوة ٣: تفعيل وتكامل برمجيات الأنظمة المتقدمة 🛡️</span>
                  </h4>
                  <p className="text-xs text-slate-350">
                    المنصة تحتوي على 14 نظاماً متقدماً يعملون باتصال فوري داخل بوت واحد! يمكنك تفعيل وإعداد كل نظام ليناسب طراز سيرفرك:
                  </p>
                  <p className="text-[11px] text-slate-450 leading-relaxed bg-[#10141e]/50 p-2.5 border border-slate-900 rounded-lg">
                    • 🎫 نظام الدعم والتذاكر بالتصنيفات • 🛡️ نظام التقديم والتوظيف الإداري والفرز • ⚖️ بوت القوانين مع معاينة وتفاعلات القائمة • 💡 لوحة وتفاعلات استقبال الاقتراحات • 🌴 ونظام إجازات الاستقالات والمستويات المتقدمة وغيرها!
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("advanced");
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="bg-[#1e1f22] hover:bg-[#2b2d31] hover:text-white text-indigo-300 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                    >
                      <span>انتقل فوراً لتبويب الأنظمة المتقدمة 🛡️</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedGuideStep === 3 && (
                <div className="space-y-2 text-right font-sans">
                  <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 justify-end">
                    <span>الخطوة ٤: إشعال شفرة البوت والتشغيل في الاستضافة السحابية ⚡</span>
                  </h4>
                  <p className="text-xs text-slate-350">
                    لجعل البوت متاحاً على مدار الساعة (24/7) مجاناً، سنقوم بجلبه للعمل مباشرة من استديو الاستضافة:
                  </p>
                  <ol className="text-[11px] text-slate-450 list-decimal list-inside pr-1 space-y-1.5 text-right font-sans">
                    <li>أولاً، اذهب إلى <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">صفحة مطوري الديسكورد (Discord Developer Application) <ExternalLink className="w-2.5 h-2.5" /></a> وأنشئ تطبيقاً جديداً من خيار <strong>New Application</strong>.</li>
                    <li>من قائمة <strong>Bot</strong> في اليسار، انزل لأسفل واضغط على زر <strong>Reset Token</strong> ثم انسخ الكود السري (Token). كما لا تنسى تفعيل خيار <strong>Message Content Intent</strong>.</li>
                    <li>اذهب لتبويب <strong className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setActiveTab("host")}>الاستضافة والرفع</strong> باللوحة وضعه مع معرف البوت (Client ID)، ثم اضغط تشغيل لمشاهدة سجلات الاتصال الفورية!</li>
                  </ol>
                  <div className="flex items-center gap-2 pt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("host");
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <span>دخول لوحة الاستضافة السريعة 🌐</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedGuideStep === 4 && (
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-black text-purple-400 flex items-center gap-1.5 justify-end">
                    <span>الخطوة ٥: بث وطباعة لوحات الأنظمة التفاعلية داخل قناة ديسكورد 💬</span>
                  </h4>
                  <p className="text-xs text-slate-350">
                    بمجرد أن يصبح بوتك <span className="text-emerald-400 font-bold">متصلاً بالإنترنت (Online)</span>، يمكنك توليد الأزرار والبطاقات الجاهزة داخل ديسكورد!
                  </p>
                  <p className="text-[11px] text-slate-450">
                    ادخل إلى سيرفرك واكتب إحدى الأوامر السلاش التالية (والتأكد من إرسالها) ليقوم البوت بطباعة اللوحة التفاعلية الأنيقة في تلك القناة:
                  </p>
                  
                  {/* Commands copyable grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-[#0a0d12]/90 p-3 rounded-lg border border-slate-900 font-sans">
                    {[
                      { cmd: "/setup-rules", title: "لوحة تفعيل بوت القوانين" },
                      { cmd: "/setup-suggestions", title: "لوحة وتفاعل الاقتراحات السريعة" },
                      { cmd: "/setup-tickets", title: "لوحة بطاقات وعام الدعم الفني" },
                      { cmd: "/setup-staff", title: "لوحة نموذج التقديم للإشراف" },
                      { cmd: "/setup-verify", title: "لوحة حماية السيرفر والتحقق البشري" },
                      { cmd: "/setup-hr", title: "لوحة إدارة الإجازات والاستقالات" },
                    ].map((c) => (
                      <div key={c.cmd} className="bg-slate-950/70 p-2 rounded border border-slate-900 flex justify-between items-center gap-1 relative text-right">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(c.cmd);
                            alert(`تم نسخ الأمر: ${c.cmd}`);
                          }}
                          className="bg-purple-900/40 hover:bg-purple-900 text-[8px] font-bold px-1.5 py-1 rounded text-purple-200 transition cursor-pointer self-center"
                        >
                          نسخ 📋
                        </button>
                        <div className="text-right">
                          <code className="text-purple-400 font-mono text-[9.5px] font-bold block">{c.cmd}</code>
                          <span className="text-[8.5px] text-slate-500 block leading-tight">{c.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress footer inside the companion */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10.5px]">
                <div className="text-slate-500 select-none">
                  الخطوة <span className="font-bold text-slate-350">{selectedGuideStep + 1}</span> من <span className="font-mono">٥</span>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    type="button"
                    disabled={selectedGuideStep === 0}
                    onClick={() => setSelectedGuideStep(prev => prev - 1)}
                    className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded cursor-pointer font-bold border border-slate-850"
                  >
                    السابق
                  </button>
                  {selectedGuideStep === 4 ? (
                    <button 
                      type="button"
                      onClick={() => {
                        setShowGuideCenter(false);
                        localStorage.setItem("mjk_guide_seen", "true");
                      }}
                      className="p-1 px-3 bg-emerald-600 hover:bg-emerald-555 text-white rounded cursor-pointer font-black shadow-lg shadow-emerald-600/10"
                    >
                      فهمت الدليل بالكامل، ابدأ الآن! 🎉
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setSelectedGuideStep(prev => prev + 1)}
                      className="p-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-550/20 text-indigo-300 disabled:opacity-40 rounded cursor-pointer font-bold border border-indigo-500/10"
                    >
                      التالي
                    </button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* UPPER COLLAPSIBLE DRAWER: GLOBAL BOT PRESENCE SETTINGS PARAMETERS */}
        <div id="bot-config-anchor" className="bg-slate-900/80 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 shadow-2xl select-none transition-all duration-300">
          
          {/* Header always visible to trigger expand/collapse toggle */}
          <div 
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Settings className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
              <div className="space-y-0.5 text-right" style={{ direction: "rtl" }}>
                <span className="block font-black text-sm text-slate-200">🤖 إعدادات الهوية الأساسية والعملية (Bot Profile & Presence)</span>
                <span className="text-[10px] text-slate-550 font-sans tracking-wide">انقر هنا لتعديل اسم البوت، البادئة (Prefix)، والحالة الحركية</span>
              </div>
            </div>

            {/* Quick summary indicators when collapsed */}
            <div className="flex items-center gap-3">
              {!isConfigExpanded && (
                <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/70 border border-slate-850/80 px-3.5 py-1.5 rounded-xl text-xs">
                  <span className="font-mono text-indigo-450 font-extrabold">{config.avatar} {config.name}</span>
                  <span className="text-slate-800">|</span>
                  <span className="text-[11px] text-slate-400 font-mono">بادئة الأوامر: {config.prefix}</span>
                  <span className="text-slate-800">|</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      config.status === "online" ? "bg-green-500" :
                      config.status === "idle" ? "bg-amber-500" :
                      config.status === "dnd" ? "bg-red-500" : "bg-slate-500"
                    }`} />
                    <span className="text-[11px] text-slate-400 font-sans capitalize">{config.status}</span>
                  </span>
                </div>
              )}
              
              <button 
                type="button"
                className="p-1 px-3 bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-600/30 group-hover:text-white rounded-lg text-xs font-bold text-indigo-400 transition cursor-pointer"
              >
                {isConfigExpanded ? "إخفاء التخصيص 🔼" : "تعديل الهوية 🔽"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isConfigExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  
                  {/* Bot name */}
                  <div className="col-span-1 sm:col-span-2 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">اسم البوت (Name)</label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => handleUpdateConfigValue("name", e.target.value.replace(/\s+/g, ""))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono text-left focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      placeholder="SystemAI"
                      style={{ direction: "ltr" }}
                    />
                  </div>

                  {/* Prefix trigger key */}
                  <div className="col-span-1 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">بادئة الأوامر (Prefix)</label>
                    <input
                      type="text"
                      value={config.prefix}
                      maxLength={4}
                      onChange={(e) => handleUpdateConfigValue("prefix", e.target.value.trim())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      placeholder="!"
                      style={{ direction: "ltr" }}
                    />
                  </div>

                  {/* Profile Avatar customizer */}
                  <div className="col-span-1 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">أيقونة البوت (Avatar)</label>
                    <select
                      value={config.avatar}
                      onChange={(e) => handleUpdateConfigValue("avatar", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer focus:border-indigo-500"
                    >
                      <option value="🤖">🤖 Robust Robot</option>
                      <option value="👾">👾 Cyber Alien</option>
                      <option value="🦊">🦊 Smart Fox</option>
                      <option value="🐱">🐱 Space Kitten</option>
                      <option value="🌸">🌸 Sakura Blossom</option>
                      <option value="🔥">🔥 Plasma Core</option>
                    </select>
                  </div>

                  {/* Status dot selector */}
                  <div className="col-span-1 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">حالة التواجد (Status)</label>
                    <select
                      value={config.status}
                      onChange={(e) => handleUpdateConfigValue("status", e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer font-sans focus:border-indigo-500"
                    >
                      <option value="online">🟢 Online (متصل)</option>
                      <option value="idle">🟡 Idle (خارج الخدمة)</option>
                      <option value="dnd">🔴 Do Not Disturb (مشغول)</option>
                      <option value="offline">⚪ Invisible (مخفي)</option>
                    </select>
                  </div>

                  {/* Activity Status type selection */}
                  <div className="col-span-1 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">نوع النشاط (Activity)</label>
                    <select
                      value={config.activityType}
                      onChange={(e) => handleUpdateConfigValue("activityType", e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer focus:border-indigo-500"
                    >
                      <option value="PLAYING">🎮 Playing (يلعب)</option>
                      <option value="LISTENING">🎧 Listening (يستمع إلى)</option>
                      <option value="WATCHING">📺 Watching (يشاهد)</option>
                      <option value="STREAMING">🎬 Streaming (يبث)</option>
                    </select>
                  </div>

                  {/* Activity Status text */}
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 mt-1 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">نص الحالة الخاص المخصص (Status Presence Text)</label>
                    <input
                      type="text"
                      value={config.activityName}
                      onChange={(e) => handleUpdateConfigValue("activityName", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-left placeholder-slate-705"
                      placeholder="مثال: with modular parameters"
                      style={{ direction: 'ltr' }}
                    />
                  </div>

                  {/* Bot Default Embed Color customizer */}
                  <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 mt-1 space-y-1.5 text-right" style={{ direction: "rtl" }}>
                    <label className="block text-[11px] font-bold text-slate-400 font-sans">لون الإمبد الافتراضي للبوت (Bot Embed Color)</label>
                    <div className="flex gap-2 font-mono">
                      <input
                        type="color"
                        value={config.embedColor || "#5865F2"}
                        onChange={(e) => handleUpdateConfigValue("embedColor", e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                      />
                      <input
                        type="text"
                        value={config.embedColor || "#5865F2"}
                        onChange={(e) => handleUpdateConfigValue("embedColor", e.target.value)}
                        placeholder="#5865F2"
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Workspace Display Area Router */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "studio" && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <CommandStudio
                  commands={commands}
                  setCommands={setCommands}
                  prefix={config.prefix}
                />
              </motion.div>
            )}

            {activeTab === "advanced" && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <AdvancedModules
                  welcome={welcome}
                  setWelcome={setWelcome}
                  ticket={ticket}
                  setTicket={setTicket}
                  staffApp={staffApp}
                  setStaffApp={setStaffApp}
                  security={security}
                  setSecurity={setSecurity}
                  rulesBot={rulesBot}
                  setRulesBot={setRulesBot}
                  leaveConfig={leaveConfig}
                  setLeaveConfig={setLeaveConfig}
                  suggestion={suggestion}
                  setSuggestion={setSuggestion}
                  report={report}
                  setReport={setReport}
                  warning={warning}
                  setWarning={setWarning}
                  autoResponse={autoResponse}
                  setAutoResponse={setAutoResponse}
                  giveaway={giveaway}
                  setGiveaway={setGiveaway}
                  levelConfig={levelConfig}
                  setLevelConfig={setLevelConfig}
                  reactionRoles={reactionRoles}
                  setReactionRoles={setReactionRoles}
                  voiceStats={voiceStats}
                  setVoiceStats={setVoiceStats}
                  autoRoles={autoRoles}
                  setAutoRoles={setAutoRoles}
                  embedFormatter={embedFormatter}
                  setEmbedFormatter={setEmbedFormatter}
                  staffManagement={staffManagement}
                  setStaffManagement={setStaffManagement}
                  modLogs={modLogs}
                  setModLogs={setModLogs}
                  guildRoles={guildRoles}
                  selectedGuildId={selectedGuild?.id}
                  discordSession={discordSession}
                  channels={channels}
                  setChannels={setChannels}
                  onAddLog={handleAddLog}
                  members={members}
                  setMembers={setMembers}
                  allowedModules={subDetails?.allowedModules}
                  isAdmin={isAdminLoggedIn}
                  isLoadingChannels={isLoadingChannels}
                  channelLoadError={channelLoadError}
                  botInviteUrl={botInviteUrl}
                  onRetryChannels={() => selectedGuild && handleSelectGuild(selectedGuild)}
                />
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <BotDashboard
                  logs={logs}
                  setLogs={setLogs}
                  commandsCount={commands.length}
                />
              </motion.div>
            )}

            {activeTab === "exporter" && (
              <motion.div
                key="exporter"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <CodeExporter
                  config={config}
                  commands={commands}
                  welcome={welcome}
                  ticket={ticket}
                  staffApp={staffApp}
                  security={security}
                  rulesBot={rulesBot}
                  leaveConfig={leaveConfig}
                  suggestion={suggestion}
                  report={report}
                  warning={warning}
                  autoResponse={autoResponse}
                  giveaway={giveaway}
                  levelConfig={levelConfig}
                  reactionRoles={reactionRoles}
                  voiceStats={voiceStats}
                />
              </motion.div>
            )}

            {activeTab === "host" && (
              <motion.div
                key="host"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <LiveHost
                  config={config}
                  commands={commands}
                  welcome={welcome}
                  ticket={ticket}
                  staffApp={staffApp}
                  security={security}
                  rulesBot={rulesBot}
                  leaveConfig={leaveConfig}
                  suggestion={suggestion}
                  report={report}
                  warning={warning}
                  autoResponse={autoResponse}
                  giveaway={giveaway}
                  levelConfig={levelConfig}
                  reactionRoles={reactionRoles}
                  voiceStats={voiceStats}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Floating Interactive Guide Companion Trigger Bubble */}
      {!showGuideCenter && !localStorage.getItem("mjk_guide_seen") && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 left-6 z-40 font-sans"
          dir="rtl"
        >
          <button
            type="button"
            onClick={() => {
              setShowGuideCenter(true);
              window.scrollTo({ top: 100, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-3 px-4 shadow-2xl shadow-indigo-500/30 font-black text-xs hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-200 border border-indigo-400/20 cursor-pointer"
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>💡 دليل تشغيل البوت السريع</span>
          </button>
        </motion.div>
      )}

      {/* OAuth Setup Modal */}
      {showOAuthSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">إعداد Discord OAuth</h3>
              <button
                onClick={() => setShowOAuthSetup(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              لأجل ربط حساب Discord، أدخل بيانات OAuth من{' '}
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 underline"
              >
                بوابة المطورين
              </a>.
              توجه إلى تطبيقك &gt; OAuth2 &gt; General، وانسخ البيانات أدناه.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Client ID</label>
                <input
                  type="text"
                  value={oauthClientId}
                  onChange={(e) => setOauthClientId(e.target.value)}
                  placeholder="ألصق Client ID هنا"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-[13px] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Client Secret</label>
                <input
                  type="password"
                  value={oauthClientSecret}
                  onChange={(e) => setOauthClientSecret(e.target.value)}
                  placeholder="ألصق Client Secret هنا"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-[13px] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Bot Token <span className="text-yellow-400">(اختياري)</span></label>
                <input
                  type="password"
                  value={oauthBotToken}
                  onChange={(e) => setOauthBotToken(e.target.value)}
                  placeholder="Bot Token (لجلب رومات السيرفر)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-[13px] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[9px] text-slate-500 mt-0.5">اختياري - ضروري فقط عشان تجيب الرومات الحقيقية للسيرفر. البوت لازم يكون في السيرفر.</p>
              </div>
              <p className="text-[10px] text-slate-500">
                ⚠️ تأكد من إضافة <span className="text-indigo-400 font-bold">http://localhost:3000/api/discord/callback</span> في OAuth2 &gt; Redirects.
              </p>
              <button
                onClick={saveOAuthConfig}
                disabled={savingOAuth}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-[13px] rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
              >
                {savingOAuth ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Humble craft credit line */}
      <footer className="mt-12 py-6 border-t border-slate-850/60 bg-slate-950/20 text-center text-[11px] text-slate-600 font-mono select-none">
        MJK System • Active Sandbox Port: 3000 • Production ready exports
      </footer>

    </div>
  );
}
