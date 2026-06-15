import React, { useState } from "react";
import { WelcomeConfig, TicketConfig, StaffAppConfig, StaffSubmission, Channel, TicketInstance, SecurityConfig, Member, RulesConfig, LeaveResignationConfig, SuggestionConfig, ReportConfig, WarningConfig, AutoResponseConfig, GiveawayConfig, LevelConfig, ReactionRolesConfig, VoiceStatsConfig, AutoRolesConfig, EmbedFormatterConfig, ModLogsConfig } from "../types";
import { 
  Sparkles, Bot, Ticket, Users, CheckCircle, XCircle, Trash2, ChevronRight,
  Settings, Layout, Heart, AlertCircle, Plus, PenTool, Image, UserCheck, Trophy, Layers,
  Star, MessageSquare, Clipboard, Send, Lock, UserPlus, Shield, Check, ListFilter, AlertTriangle, Play, Terminal, BookOpen, Scaling, FileText, Hash, CheckSquare, RefreshCw, Zap, Calendar
} from "lucide-react";
import { motion } from "motion/react";

interface AdvancedModulesProps {
  welcome: WelcomeConfig;
  setWelcome: (update: WelcomeConfig) => void;
  ticket: TicketConfig;
  setTicket: (update: TicketConfig) => void;
  staffApp: StaffAppConfig;
  setStaffApp: (update: StaffAppConfig) => void;
  security: SecurityConfig;
  setSecurity: (update: SecurityConfig) => void;
  rulesBot: RulesConfig;
  setRulesBot: React.Dispatch<React.SetStateAction<RulesConfig>>;
  leaveConfig: LeaveResignationConfig;
  setLeaveConfig: React.Dispatch<React.SetStateAction<LeaveResignationConfig>>;
  suggestion: SuggestionConfig;
  setSuggestion: React.Dispatch<React.SetStateAction<SuggestionConfig>>;
  report: ReportConfig;
  setReport: React.Dispatch<React.SetStateAction<ReportConfig>>;
  warning: WarningConfig;
  setWarning: React.Dispatch<React.SetStateAction<WarningConfig>>;
  autoResponse: AutoResponseConfig;
  setAutoResponse: React.Dispatch<React.SetStateAction<AutoResponseConfig>>;
  giveaway: GiveawayConfig;
  setGiveaway: React.Dispatch<React.SetStateAction<GiveawayConfig>>;
  levelConfig: LevelConfig;
  setLevelConfig: React.Dispatch<React.SetStateAction<LevelConfig>>;
  reactionRoles: ReactionRolesConfig;
  setReactionRoles: React.Dispatch<React.SetStateAction<ReactionRolesConfig>>;
  voiceStats: VoiceStatsConfig;
  setVoiceStats: React.Dispatch<React.SetStateAction<VoiceStatsConfig>>;
  autoRoles: AutoRolesConfig;
  setAutoRoles: React.Dispatch<React.SetStateAction<AutoRolesConfig>>;
  embedFormatter: EmbedFormatterConfig;
  setEmbedFormatter: React.Dispatch<React.SetStateAction<EmbedFormatterConfig>>;
  modLogs: ModLogsConfig;
  setModLogs: React.Dispatch<React.SetStateAction<ModLogsConfig>>;
  guildRoles: { id: string; name: string; color: number }[];
  selectedGuildId?: string;
  discordSession?: string;
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  onAddLog: (log: any) => void;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  allowedModules?: string[];
  isAdmin?: boolean;
  isLoadingChannels?: boolean;
  channelLoadError?: string;
  botInviteUrl?: string;
  onRetryChannels?: () => void;
}

export default function AdvancedModules({
  welcome,
  setWelcome,
  ticket,
  setTicket,
  staffApp,
  setStaffApp,
  security,
  setSecurity,
  rulesBot,
  setRulesBot,
  leaveConfig,
  setLeaveConfig,
  suggestion,
  setSuggestion,
  report,
  setReport,
  warning,
  setWarning,
  autoResponse,
  setAutoResponse,
  giveaway,
  setGiveaway,
  levelConfig,
  setLevelConfig,
  reactionRoles,
  setReactionRoles,
  voiceStats,
  setVoiceStats,
  autoRoles,
  setAutoRoles,
  embedFormatter,
  setEmbedFormatter,
  modLogs,
  setModLogs,
  guildRoles,
  selectedGuildId,
  discordSession,
  channels,
  setChannels,
  onAddLog,
  members,
  setMembers,
  allowedModules,
  isAdmin,
  isLoadingChannels,
  channelLoadError,
  botInviteUrl,
  onRetryChannels
}: AdvancedModulesProps) {
  const [activeSubTab, setActiveSubTab] = useState<"welcome" | "auto-roles" | "ticket" | "staff" | "security" | "auto-responses" | "embed-formatter" | "suggestions" | "reports" | "warnings" | "mod-logs" | "levels" | "giveaways" | "reaction-roles" | "voice-stats" | "rules-bot" | "leave-resignation">("welcome");
  
  const isModuleAllowed = (moduleId: string) => {
    if (isAdmin) return true;
    if (!allowedModules) return true;
    return allowedModules.includes(moduleId);
  };

  const [newQuestion, setNewQuestion] = useState("");
  const [newBadWord, setNewBadWord] = useState("");
  const [adminReplyText, setAdminReplyText] = useState<Record<string, string>>({});

  // Auto-Response UI Input States
  const [newResponseTrigger, setNewResponseTrigger] = useState("");
  const [newResponseReply, setNewResponseReply] = useState("");
  const [newResponseMatchType, setNewResponseMatchType] = useState<'exact' | 'contains'>('contains');

  // Giveaway UI Input States
  const [newGiveawayPrize, setNewGiveawayPrize] = useState("");
  const [newGiveawayWinners, setNewGiveawayWinners] = useState<number>(1);
  const [newGiveawayDuration, setNewGiveawayDuration] = useState<number>(60);

  // Levels & XP Form States
  const [newRewardLevel, setNewRewardLevel] = useState<number>(5);
  const [newRewardRoleName, setNewRewardRoleName] = useState<string>("");

  // Reaction Roles Form States
  const [newRRoleLabel, setNewRRoleLabel] = useState<string>("");
  const [newRRoleName, setNewRRoleName] = useState<string>("");
  const [newRRoleEmoji, setNewRRoleEmoji] = useState<string>("🏆");
  const [newRRoleColor, setNewRRoleColor] = useState<'blue' | 'gray' | 'green' | 'red' | 'yellow'>("blue");

  // Auto Roles Form States
  const [newAutoRoleId, setNewAutoRoleId] = useState("");

  // Embed Formatter States
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedDesc, setEmbedDesc] = useState("");
  const [embedColorVal, setEmbedColorVal] = useState("#5865F2");
  const [embedThumb, setEmbedThumb] = useState("");
  const [embedImg, setEmbedImg] = useState("");
  const [embedFooter, setEmbedFooter] = useState("");
  const [embedTargetChannel, setEmbedTargetChannel] = useState("");

  // Voice Stats States
  const [isCreatingStats, setIsCreatingStats] = useState(false);
  const [statsActionMessage, setStatsActionMessage] = useState("");

  // Ticket types custom form states
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeEmoji, setNewTypeEmoji] = useState("💬");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [newTypeWelcome, setNewTypeWelcome] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("");

  const handleAddTicketType = () => {
    if (!newTypeName.trim()) return;
    const newType = {
      id: "type-" + Date.now(),
      name: newTypeName.trim(),
      emoji: newTypeEmoji,
      description: newTypeDesc.trim(),
      welcomeMessage: newTypeWelcome.trim() || undefined,
      ticketCategoryName: newTypeCategory.trim() || undefined,
    };
    const currentTypes = ticket.ticketTypes || [];
    handleUpdateTicket("ticketTypes", [...currentTypes, newType]);

    // reset inputs
    setNewTypeName("");
    setNewTypeEmoji("💬");
    setNewTypeDesc("");
    setNewTypeWelcome("");
    setNewTypeCategory("");
  };

  const handleRemoveTicketType = (typeId: string) => {
    const currentTypes = ticket.ticketTypes || [];
    const updated = currentTypes.filter(t => t.id !== typeId);
    handleUpdateTicket("ticketTypes", updated);
  };

  // Rules Bot UI Input States
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⚖️");
  const [newRuleTexts, setNewRuleTexts] = useState<Record<string, string>>({});
  const [previewCatId, setPreviewCatId] = useState<string | null>(null);

  const handleUpdateRulesBot = (key: keyof RulesConfig, value: any) => {
    setRulesBot({ ...rulesBot, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `⚖️ تم تحديث إعدادات بوت القوانين: [${key}] حفظ التغير.`
    });
  };

  const handleUpdateLeaveConfig = (key: keyof LeaveResignationConfig, value: any) => {
    setLeaveConfig({ ...leaveConfig, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🌴 تم تحديث إعدادات الإجازات والاستقالات: [${key}] حفظ التغير.`
    });
  };

  const handleAddRulesCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: "cat-" + Date.now(),
      name: newCatName.trim(),
      icon: newCatIcon,
      rules: []
    };
    const updated = [...rulesBot.categories, newCat];
    handleUpdateRulesBot("categories", updated);
    setNewCatName("");
    setNewCatIcon("⚖️");
  };

  const handleRemoveRulesCategory = (catId: string) => {
    const updated = rulesBot.categories.filter(c => c.id !== catId);
    handleUpdateRulesBot("categories", updated);
  };

  const handleAddAutoRole = () => {
    if (!newAutoRoleId) return;
    const selectedRole = guildRoles.find(r => r.id === newAutoRoleId);
    if (!selectedRole) return;
    const newRole = { id: selectedRole.id, roleName: selectedRole.name };
    setAutoRoles({ ...autoRoles, rolesList: [...autoRoles.rolesList, newRole] });
    setNewAutoRoleId("");
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🎖️ تمت إضافة رتبة تلقائية: ${selectedRole.name}`
    });
  };

  const handleRemoveAutoRole = (roleId: string) => {
    const updated = autoRoles.rolesList.filter(r => r.id !== roleId);
    setAutoRoles({ ...autoRoles, rolesList: updated });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🗑️ تم حذف رتبة تلقائية`
    });
  };

  const [isSendingEmbed, setIsSendingEmbed] = useState(false);
  const [embedSendMessage, setEmbedSendMessage] = useState("");

  const handleSendEmbed = async () => {
    if (!embedTitle.trim() && !embedDesc.trim()) {
      setEmbedSendMessage('⚠️ يجب إدخال عنوان أو وصف للـ Embed');
      return;
    }
    if (!embedTargetChannel) {
      setEmbedSendMessage('⚠️ الرجاء اختيار روم للإرسال');
      return;
    }
    if (!selectedGuildId) {
      setEmbedSendMessage('⚠️ الرجاء اختيار سيرفر أولاً');
      return;
    }
    setIsSendingEmbed(true);
    setEmbedSendMessage('جاري الإرسال...');
    try {
      const res = await fetch(`/api/discord/guilds/${selectedGuildId}/embed/send?session=${encodeURIComponent(discordSession)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: embedTargetChannel,
          title: embedTitle.trim(),
          description: embedDesc.trim(),
          color: embedColorVal,
          thumbnail: embedThumb.trim(),
          image: embedImg.trim(),
          footer: embedFooter.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmbedSendMessage('✅ تم إرسال الـ Embed بنجاح');
        onAddLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
          message: `📝 تم إرسال Embed إلى الروم ${embedTargetChannel}`
        });
      } else {
        setEmbedSendMessage(`❌ ${data.error || 'فشل الإرسال'}`);
      }
    } catch {
      setEmbedSendMessage('❌ فشل الاتصال بالخادم');
    } finally {
      setIsSendingEmbed(false);
    }
  };

  const handleAddRuleToCategory = (catId: string) => {
    const ruleText = newRuleTexts[catId] || "";
    if (!ruleText.trim()) return;
    
    const updated = rulesBot.categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, rules: [...cat.rules, ruleText.trim()] };
      }
      return cat;
    });

    handleUpdateRulesBot("categories", updated);
    setNewRuleTexts(prev => ({ ...prev, [catId]: "" }));
  };

  const handleRemoveRuleFromCategory = (catId: string, ruleIdx: number) => {
    const updated = rulesBot.categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, rules: cat.rules.filter((_, idx) => idx !== ruleIdx) };
      }
      return cat;
    });
    handleUpdateRulesBot("categories", updated);
  };

  const handleUpdateSecurity = (key: keyof SecurityConfig, value: any) => {
    setSecurity({ ...security, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "automod",
      message: `⚡ تم تحديث نظام الحماية والسيكيورتي: [${key}] تم إعداده.`
    });
  };

  const handleAddBadWord = () => {
    if (!newBadWord.trim()) return;
    const trimWord = newBadWord.trim();
    if (security.badWordsList.includes(trimWord)) return;
    const updated = [...security.badWordsList, trimWord];
    handleUpdateSecurity("badWordsList", updated);
    setNewBadWord("");
  };

  const handleRemoveBadWord = (word: string) => {
    const updated = security.badWordsList.filter(w => w !== word);
    handleUpdateSecurity("badWordsList", updated);
  };

  // Preset welcome banners
  const bannerPresets = [
    { name: "Cosmic Wave", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80" },
    { name: "Neon Lines", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80" },
    { name: "Dark Purple Space", url: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&auto=format&fit=crop&q=80" },
    { name: "Abstract Cyberpunk", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80" },
  ];

  const handleUpdateWelcome = (key: keyof WelcomeConfig, value: any) => {
    setWelcome({ ...welcome, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `⚙️ Welcome system updated: [${key}] configured.`
    });
  };

  const handleUpdateTicket = (key: keyof TicketConfig, value: any) => {
    setTicket({ ...ticket, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `⚙️ Ticket bot updated: [${key}] configured.`
    });
  };

  const handleUpdateLevelConfig = (key: keyof LevelConfig, value: any) => {
    setLevelConfig({ ...levelConfig, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `⚙️ Levels system updated: [${key}] configured.`
    });
  };

  const handleLevelRewardAdd = () => {
    if (!newRewardRoleName.trim()) return;
    const newReward = { id: "rr-" + Date.now(), level: newRewardLevel, roleName: newRewardRoleName.trim() };
    const updated = [...levelConfig.roleRewards, newReward].sort((a,b) => a.level - b.level);
    setLevelConfig({ ...levelConfig, roleRewards: updated });
    setNewRewardRoleName("");
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🏆 Level rewards updated: Added reward at milestone Level ${newRewardLevel}.`
    });
  };

  const handleLevelRewardRemove = (id: string) => {
    const updated = levelConfig.roleRewards.filter(r => r.id !== id);
    setLevelConfig({ ...levelConfig, roleRewards: updated });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🏆 Level rewards updated: Removed reward milestone.`
    });
  };

  const handleUpdateReactionRoles = (key: keyof ReactionRolesConfig, value: any) => {
    setReactionRoles({ ...reactionRoles, [key]: value });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `⚙️ Reaction roles updated: [${key}] configured.`
    });
  };

  const handleReactionRoleAdd = () => {
    if (!newRRoleLabel.trim() || !newRRoleName.trim()) return;
    const newRoleObj = {
      id: "rrole-" + Date.now(),
      label: newRRoleLabel.trim(),
      roleName: newRRoleName.trim(),
      emoji: newRRoleEmoji,
      color: newRRoleColor
    };
    const updated = [...reactionRoles.rolesList, newRoleObj];
    setReactionRoles({ ...reactionRoles, rolesList: updated });
    setNewRRoleLabel("");
    setNewRRoleName("");
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🎭 Button Roles updated: Added interactive role "${newRRoleName.trim()}"`
    });
  };

  const handleReactionRoleRemove = (id: string) => {
    const updated = reactionRoles.rolesList.filter(r => r.id !== id);
    setReactionRoles({ ...reactionRoles, rolesList: updated });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🎭 Button Roles updated: Removed role.`
    });
  };

  const handleUpdateVoiceStats = (key: keyof VoiceStatsConfig, value: any) => {
    const updated = { ...voiceStats, [key]: value };
    setVoiceStats(updated);
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `⚙️ Voice stats updated: [${key}] configured.`
    });
    // If disabling, delete voice channels from the server
    if (key === 'enabled' && value === false && selectedGuildId) {
      fetch(`/api/discord/guilds/${selectedGuildId}/voice-stats/delete?session=${encodeURIComponent(discordSession)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});
      setStatsActionMessage('🗑️ تم حذف قنوات الإحصائيات من السيرفر');
    }
  };

  const handleCreateVoiceStats = async () => {
    if (!selectedGuildId) {
      setStatsActionMessage('❌ الرجاء اختيار سيرفر أولاً');
      return;
    }
    setIsCreatingStats(true);
    setStatsActionMessage('');
    try {
      const res = await fetch(`/api/discord/guilds/${selectedGuildId}/voice-stats/create?session=${encodeURIComponent(discordSession)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalMembersName: voiceStats.totalMembersName,
          activeMembersName: voiceStats.activeMembersName,
          voiceUsersName: voiceStats.voiceUsersName
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatsActionMessage('✅ تم إنشاء/تحديث قنوات الإحصائيات بنجاح');
      } else {
        setStatsActionMessage(`❌ ${data.error || 'فشل إنشاء القنوات'}`);
      }
    } catch {
      setStatsActionMessage('❌ فشل الاتصال بالخادم');
    } finally {
      setIsCreatingStats(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const updated = [...staffApp.questions, newQuestion.trim()];
    setStaffApp({ ...staffApp, questions: updated });
    setNewQuestion("");
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `📝 Added application questionnaire item: "${newQuestion.trim()}"`
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    const updated = staffApp.questions.filter((_, i) => i !== idx);
    setStaffApp({ ...staffApp, questions: updated });
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      message: `🗑️ Removed application questionnaire item at index ${idx + 1}`
    });
  };

  // STAFF RECRUITER ACTIONS
  const handleUpdateSubmissionState = (subId: string, updates: Partial<StaffSubmission>) => {
    const targetSub = staffApp.submissions.find(sub => sub.id === subId);

    const updatedSubmissions = staffApp.submissions.map(sub => {
      if (sub.id === subId) {
        return { ...sub, ...updates };
      }
      return sub;
    });

    setStaffApp({ ...staffApp, submissions: updatedSubmissions });

    // Update member role in state if approved from Advanced panel
    if (updates.status === "approved" && targetSub) {
      const assignedRole = staffApp.approvedRoleId ? `رتبة (${staffApp.approvedRoleId})` : "مقبول مبدئياً";
      setMembers(prev => prev.map(m => {
        if (m.username === targetSub.username) {
          return {
            ...m,
            role: `${assignedRole} 🏅`,
            roleColor: "#E2a522"
          };
        }
        return m;
      }));

      onAddLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type: "application",
        message: `🏅 Member @${targetSub.username} approved from advanced panel. Rank [${assignedRole}] assigned.`
      });
    }
  };

  const handleNotifyCandidate = (sub: StaffSubmission) => {
    const isApprove = sub.status === "approved";
    const template = isApprove ? (staffApp.autoMessageOnApprove || "") : (staffApp.autoMessageOnReject || "");
    const customizedMsg = template.replace(/{user}/g, `@${sub.username}`);

    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "application",
      message: `📡 Broadcast Alert: RecruiterBot sent a formal notification to @${sub.username} (${sub.status.toUpperCase()})`
    });

    // Mark as notified in state
    handleUpdateSubmissionState(sub.id, { notified: true });
    alert(`تم إرسال إشعار التقديم بنجاح إلى @${sub.username} عبر هاتف تنبيهات البوت السلكي!`);
  };

  // SUPPORT TICKETS DASHBOARD LOOPS
  const activeTicketChannels = channels.filter(c => c.type === 'ticket');

  const handleClaimTicketDashboard = (chanId: string, chanName: string) => {
    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "ticket",
      message: `🤝 Admin panel claimed Ticket channel #${chanName}. Claim status broadcasted.`
    });

    // We can also save this ticket inside a managed list on ticket.activeTickets
    const updatedTickets = [...(ticket.activeTickets || [])];
    const existingIdx = updatedTickets.findIndex(t => t.channelId === chanId);
    if (existingIdx > -1) {
      updatedTickets[existingIdx].status = 'claimed';
      updatedTickets[existingIdx].claimedBy = 'Admin Desk (لوحة التحكم)';
    } else {
      updatedTickets.push({
        id: "t-" + Date.now(),
        channelId: chanId,
        username: chanName.replace("🎫-تذكرة-", ""),
        status: 'claimed',
        claimedBy: 'Admin Desk (لوحة التحكم)',
        openedAt: new Date().toLocaleTimeString()
      });
    }
    setTicket({ ...ticket, activeTickets: updatedTickets });
    alert(`تم استلام التذكرة #${chanName} بنجاح ومتابعتها!`);
  };

  const handleCloseTicketDashboard = (chanId: string, chanName: string) => {
    const confirmed = window.confirm(`هل أنت متأكد من إغلاق التذكرة وإلغاء القناة #${chanName} في السيرفر؟`);
    if (!confirmed) return;

    setChannels(channels.filter(c => c.id !== chanId));

    const updatedTickets = [...(ticket.activeTickets || [])];
    const existingIdx = updatedTickets.findIndex(t => t.channelId === chanId);
    if (existingIdx > -1) {
      updatedTickets[existingIdx].status = 'closed';
    } else {
      updatedTickets.push({
        id: "t-" + Date.now(),
        channelId: chanId,
        username: chanName.replace("🎫-تذكرة-", ""),
        status: 'closed',
        openedAt: new Date().toLocaleTimeString()
      });
    }
    setTicket({ ...ticket, activeTickets: updatedTickets });

    onAddLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type: "ticket",
      message: `🔒 Private ticket room #${chanName} was successfully closed and cleared via administration command desk.`
    });
  };

  const handleSaveTicketDetails = (chanId: string, notes: string, rating: number) => {
    const updatedTickets = [...(ticket.activeTickets || [])];
    const existingIdx = updatedTickets.findIndex(t => t.channelId === chanId);
    if (existingIdx > -1) {
      updatedTickets[existingIdx].adminNotes = notes;
      updatedTickets[existingIdx].rating = rating;
    } else {
      const chan = channels.find(c => c.id === chanId);
      updatedTickets.push({
        id: "t-" + Date.now(),
        channelId: chanId,
        username: chan ? chan.name.replace("🎫-تذكرة-", "") : "User",
        status: 'open',
        adminNotes: notes,
        rating: rating,
        openedAt: new Date().toLocaleTimeString()
      });
    }
    setTicket({ ...ticket, activeTickets: updatedTickets });
    alert("تم حفظ تفاصيل وملاحظات التذكرة بنجاح!");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="advanced-modules">
      {/* Banner / Title Header */}
      <div className="p-6 bg-card border border-border rounded-xl select-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Bot className="w-5 h-5" />
            <span className="font-semibold text-xs uppercase tracking-wider">Modules Engine</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Bot System Modules
          </h2>
          <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
            Configure and manage all integrated bot modules — welcome, tickets, staff applications, security, and more.
          </p>
        </div>
      </div>

      {/* Specialized Bots Engine Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
        
        {/* RIGHT SIDEBAR: List of specialized bots */}
        <div className="lg:col-span-1 space-y-4 select-none" dir="rtl">
          {/* Dropdown for Mobile / Tablet devices */}
          <div className="block lg:hidden">
            <span className="block text-[11px] font-bold text-slate-400 mb-1.5">اختر النظام الذكي للتخصيص:</span>
            <select
              value={activeSubTab}
              onChange={(e) => setActiveSubTab(e.target.value as any)}
              className="w-full bg-card border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
            >
              <option value="welcome">👋 الترحيب التلقائي (WelcomeBot)</option>
              <option value="auto-roles">🎖️ الرتب التلقائية (Auto Roles)</option>
              <option value="ticket">🎫 الدعم والتذاكر (TicketBot)</option>
              <option value="staff">🛡️ التوظيف والإشراف (RecruitBot)</option>
              <option value="security">🛡️ نظام الحماية المتطور (Guard & Security)</option>
              <option value="auto-responses">💬 الردود التلقائية العبقرية (Auto-Responses)</option>
              <option value="embed-formatter">📝 المنشورات والرسائل الجاهزة (Embed Formatter)</option>
              <option value="suggestions">💡 بوت الاقتراحات (Suggestions)</option>
              <option value="reports">🚨 الشكاوى والبلاغات (Reports)</option>
              <option value="warnings">🔨 نظام التحذيرات والعقوبات (Warnings)</option>
              <option value="mod-logs">📋 نظام السجلات واللوقات (Mod Logs)</option>
              <option value="levels">🏆 نظام مستويات الخبرة (Leveling System)</option>
              <option value="giveaways">🎁 قيف اواي والفعاليات (Giveaways)</option>
              <option value="reaction-roles">🎭 رتب التفاعل الذاتي (Button Roles)</option>
              <option value="rules-bot">⚖️ دستور وقوانين السيرفر (Rules Bot)</option>
              <option value="leave-resignation">🌴 الإجازات والاستقالات (Leave & Resignation)</option>
              <option value="voice-stats">📊 قنوات الإحصائيات (Voice Stats)</option>
            </select>
          </div>

          {/* Vertical Menu for Large screens */}
          <div className="hidden lg:flex flex-col bg-card border border-slate-800/80 p-2 text-right rounded-xl space-y-1 shadow-2xl">
            <div className="px-3 py-2 border-b border-slate-850 mb-1.5 pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">منظومة البوتات والأنظمة</span>
              <span className="text-xs font-bold text-slate-300 mt-0.5 block">انقر للتخصيص الفوري</span>
            </div>

            <button
              onClick={() => setActiveSubTab("welcome")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "welcome"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("welcome") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Layout className="w-3.5 h-3.5" />
                <span>👋 الترحيب التلقائي</span>
              </span>
              {!isModuleAllowed("welcome") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("auto-roles")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "auto-roles"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("auto-roles") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-green-400" />
                <span>🎖️ الرتب التلقائية</span>
              </span>
              {!isModuleAllowed("auto-roles") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("ticket")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "ticket"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("ticket") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>🎫 الدعم والتذاكر</span>
              </span>
              <div className="flex items-center gap-1">
                {activeTicketChannels.length > 0 && isModuleAllowed("ticket") && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {activeTicketChannels.length}
                  </span>
                )}
                {!isModuleAllowed("ticket") && <Lock className="w-3 h-3 text-red-500" />}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("staff")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "staff"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("staff") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>🛡️ التوظيف والإشراف</span>
              </span>
              <div className="flex items-center gap-1">
                {staffApp.submissions.filter(s => s.status === "pending" || s.status === "reviewing").length > 0 && isModuleAllowed("staff") && (
                  <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {staffApp.submissions.filter(s => s.status === "pending" || s.status === "reviewing").length}
                  </span>
                )}
                {!isModuleAllowed("staff") && <Lock className="w-3 h-3 text-red-500" />}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("security")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "security"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("security") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>🛡️ نظام الحماية المتطور</span>
              </span>
              <div className="flex items-center gap-1">
                {isModuleAllowed("security") ? (
                  security.enabled ? (
                    <span className="bg-red-500/20 text-red-400 text-[8px] px-1.5 py-0.5 rounded font-black">نشط</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-bold">معطل</span>
                  )
                ) : (
                  <Lock className="w-3 h-3 text-red-500" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("auto-responses")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "auto-responses"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("auto-responses") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-sky-450" />
                <span>💬 الردود التلقائية العبقرية</span>
              </span>
              {!isModuleAllowed("auto-responses") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("embed-formatter")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "embed-formatter"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("embed-formatter") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>📝 المنشورات والرسائل الجاهزة</span>
              </span>
              {!isModuleAllowed("embed-formatter") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("suggestions")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "suggestions"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("suggestions") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                <span>💡 بوت الاقتراحات</span>
              </span>
              <div className="flex items-center gap-1">
                {suggestion.suggestionsList.filter(s => s.status === "pending").length > 0 && isModuleAllowed("suggestions") && (
                  <span className="bg-teal-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {suggestion.suggestionsList.filter(s => s.status === "pending").length}
                  </span>
                )}
                {!isModuleAllowed("suggestions") && <Lock className="w-3 h-3 text-red-500" />}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("reports")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "reports"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("reports") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#E67E22]" />
                <span>🚨 الشكاوى والبلاغات</span>
              </span>
              <div className="flex items-center gap-1">
                {report.reportsList.filter(r => r.status === "pending").length > 0 && isModuleAllowed("reports") && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {report.reportsList.filter(r => r.status === "pending").length}
                  </span>
                )}
                {!isModuleAllowed("reports") && <Lock className="w-3 h-3 text-red-500" />}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("warnings")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "warnings"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("warnings") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>🔨 نظام التحذيرات والعقوبات</span>
              </span>
              {!isModuleAllowed("warnings") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("mod-logs")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "mod-logs"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("mod-logs") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Clipboard className="w-3.5 h-3.5 text-orange-400" />
                <span>📋 نظام السجلات واللوقات</span>
              </span>
              {!isModuleAllowed("mod-logs") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("levels")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "levels"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("levels") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span>🏆 نظام مستويات الخبرة</span>
              </span>
              <div className="flex items-center gap-1">
                {isModuleAllowed("levels") ? (
                  levelConfig.enabled ? (
                    <span className="bg-yellow-500/20 text-yellow-400 text-[8px] px-1.5 py-0.5 rounded font-black">نشط</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-bold">معطل</span>
                  )
                ) : (
                  <Lock className="w-3 h-3 text-red-500" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("giveaways")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "giveaways"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("giveaways") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-pink-400" />
                <span>🎁 قيف_اواي والفعاليات</span>
              </span>
              {!isModuleAllowed("giveaways") && <Lock className="w-3 h-3 text-red-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab("reaction-roles")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "reaction-roles"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("reaction-roles") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-pink-500" />
                <span>🎭 رتب التفاعل الذاتي</span>
              </span>
              <div className="flex items-center gap-1">
                {isModuleAllowed("reaction-roles") ? (
                  reactionRoles.enabled ? (
                    <span className="bg-pink-500/20 text-pink-400 text-[8px] px-1.5 py-0.5 rounded font-black">نشط</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-bold">معطل</span>
                  )
                ) : (
                  <Lock className="w-3 h-3 text-red-500" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("rules-bot")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "rules-bot"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("rules-bot") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>⚖️ دستور وقوانين السيرفر</span>
              </span>
              <div className="flex items-center gap-1">
                {isModuleAllowed("rules-bot") ? (
                  rulesBot.enabled ? (
                    <span className="bg-purple-500/20 text-purple-400 text-[8px] px-1.5 py-0.5 rounded font-black">نشط</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-bold">معطل</span>
                  )
                ) : (
                  <Lock className="w-3 h-3 text-red-500" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("leave-resignation")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "leave-resignation"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("leave-resignation") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>🌴 الإجازات والاستقالات</span>
              </span>
              <div className="flex items-center gap-1">
                {leaveConfig.requests.filter(r => r.status === "pending").length > 0 && isModuleAllowed("leave-resignation") && (
                  <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {leaveConfig.requests.filter(r => r.status === "pending").length}
                  </span>
                )}
                {isModuleAllowed("leave-resignation") && leaveConfig.requests.filter(r => r.status === "pending").length === 0 && (
                  leaveConfig.enabled ? (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-black">نشط</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-bold">معطل</span>
                  )
                )}
                {!isModuleAllowed("leave-resignation") && <Lock className="w-3 h-3 text-red-500" />}
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("voice-stats")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeSubTab === "voice-stats"
                  ? "bg-slate-900 border-indigo-500/40 text-indigo-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent"
              } ${!isModuleAllowed("voice-stats") ? "opacity-75" : ""}`}
            >
              <span className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                <span>📊 قنوات الإحصائيات صوت</span>
              </span>
              <div className="flex items-center gap-1">
                {isModuleAllowed("voice-stats") ? (
                  voiceStats.enabled ? (
                    <span className="bg-sky-500/20 text-sky-400 text-[8px] px-1.5 py-0.5 rounded font-black">نشط</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-bold">معطل</span>
                  )
                ) : (
                  <Lock className="w-3 h-3 text-red-500" />
                )}
              </div>
            </button>

          </div>
        </div>

        {/* LEFT COLUMN: RENDERED CONTENT VIEWER */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800/80 rounded-xl p-6 shadow-2xl relative select-none">

          {/* Channel loading / error indicator */}
          {isLoadingChannels && (
            <div className="mb-4 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] px-3 py-2 rounded-lg">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>جلب الرومات من دسكورد...</span>
            </div>
          )}
          {channelLoadError && !isLoadingChannels && (
            <div className="mb-4 bg-red-500/10 border border-red-500/25 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-red-300">البوت غير متواجد في هذا السيرفر</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    البوت حقك مو مضاف في هذا السيرفر. لازم تضيفه عشان تقدر تشوف الرومات وتعدل الإعدادات.
                  </p>
                </div>
              </div>
              {botInviteUrl && (
                <div className="flex gap-2 pr-7">
                  <a
                    href={botInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition cursor-pointer"
                  >
                    ➕ إضافة البوت للسيرفر
                  </a>
                  {onRetryChannels && (
                    <button
                      onClick={onRetryChannels}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-black rounded-lg transition cursor-pointer"
                    >
                      🔄 إعادة المحاولة
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        {!isModuleAllowed(activeSubTab) ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto animate-fade-in font-sans">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 animate-pulse">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100 font-mono tracking-tight">هذا النظام غير متاح في اشتراكك 🔒</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              عذراً، هذا النظام الموحد المتقدم (<strong>{
                activeSubTab === "welcome" ? "👋 الترحيب التلقائي" :
                activeSubTab === "auto-roles" ? "🎖️ الرتب التلقائية" :
                activeSubTab === "ticket" ? "🎫 الدعم الفني والتذاكر" :
                activeSubTab === "staff" ? "🛡️ التوظيف واستقبال الإدارة" :
                activeSubTab === "security" ? "🛡️ الحماية ومكافحة الانتهاكات" :
                activeSubTab === "auto-responses" ? "💬 الردود التلقائية العبقرية" :
                activeSubTab === "embed-formatter" ? "📝 المنشورات والرسائل الجاهزة" :
                activeSubTab === "suggestions" ? "💡 الاقتراحات السيرفرية" :
                activeSubTab === "reports" ? "🚨 الشكاوى والبلاغات والمخالفات" :
                activeSubTab === "warnings" ? "🔨 نظام التحذيرات والعقوبات" :
                activeSubTab === "mod-logs" ? "📋 نظام السجلات واللوقات" :
                activeSubTab === "levels" ? "🏆 نظام مستويات الخبرة" :
                activeSubTab === "giveaways" ? "🎁 قيف اواي والهدايا التفاعلية" :
                activeSubTab === "reaction-roles" ? "🎭 رتب الأزرار والتفاعل" :
                activeSubTab === "rules-bot" ? "⚖️ دستور وقوانين السيرفر" :
                activeSubTab === "leave-resignation" ? "🌴 الإجازات والاستقالات" :
                activeSubTab === "voice-stats" ? "📊 قنوات إحصاءات الصوت" : activeSubTab
              }</strong>) مقفل حالياً للاستخدام بناءً على خطة مفتاح الترخيص النشط.
            </p>
            <div className="bg-slate-950 px-4 py-3 rounded-lg border border-slate-850 w-full text-slate-500 text-[10px] font-mono leading-relaxed select-all">
              يرجى التواصل مع الإدارة أو تزويد العميل بمفتاح متكامل يشمل هذا النظام.
            </div>
          </div>
        ) : (
          <>
            {/* 1. WELCOME MODULE DASHBOARD */}
            {activeSubTab === "welcome" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span>إعدادات بوت الترحيب الذكي (WelcomeBot Setup)</span>
                </h3>
                <p className="text-xs text-slate-500">Customize identity, channel outputs, and graphical representations for your server welcome assistant.</p>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400">حالة النظام الداخلي:</span>
                <button
                  onClick={() => handleUpdateWelcome("enabled", !welcome.enabled)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                    welcome.enabled ? "bg-green-500" : "bg-slate-700"
                  }`}
                >
                  <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all duration-200 transform ${
                    welcome.enabled ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
                <span className={`text-xs font-bold ${welcome.enabled ? "text-green-400" : "text-slate-500"}`}>
                  {welcome.enabled ? "متصل (Online)" : "متوقف (Offline)"}
                </span>
              </div>
            </div>

            {welcome.enabled ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side Settings Form */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    
                    {/* Bot Personal Identity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">اسم البوت ومظهره (Welcome Bot Name)</label>
                        <input
                          type="text"
                          value={welcome.botName || "WelcomeBot 👋"}
                          onChange={(e) => handleUpdateWelcome("botName", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-250 focus:border-indigo-500 focus:outline-none font-bold"
                          placeholder="WelcomeBot 👋"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">أيقونة رمز البوت (Bot Avatar Emoji)</label>
                        <select
                          value={welcome.botAvatar || "✨"}
                          onChange={(e) => handleUpdateWelcome("botAvatar", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="✨">✨ Magical Sparkles</option>
                          <option value="🤖">🤖 Standard Robot</option>
                          <option value="👑">👑 Royalty Crown</option>
                          <option value="🎉">🎉 Celebration Confetti</option>
                          <option value="🌟">🌟 Bright Star</option>
                        </select>
                      </div>
                    </div>

                    {/* Select Greeting Channel */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">قناة إرسال الترحيب (Target Channel)</label>
                      <select
                        value={welcome.channelId}
                        onChange={(e) => handleUpdateWelcome("channelId", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                      >
                        {channels.filter(c => c.type === 'text').map(ch => (
                          <option key={ch.id} value={ch.id}>#{ch.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Choose Preset Background */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-2 font-mono font-black">قوالب خلفيات بطاقة الترحيب الجاهزة (Graphic Presets)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {bannerPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleUpdateWelcome("bannerUrl", preset.url)}
                            className={`p-1.5 rounded-lg border text-left text-[11px] font-medium truncate bg-slate-900 text-slate-300 transition hover:bg-slate-850 cursor-pointer ${
                              welcome.bannerUrl === preset.url ? "border-indigo-500 text-white font-black bg-indigo-950/20" : "border-slate-800"
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom URL Banner Link and Embed Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">رابط لوحة ترحيب مخصصة (Custom URL Banner)</label>
                        <input
                          type="text"
                          value={welcome.bannerUrl}
                          onChange={(e) => handleUpdateWelcome("bannerUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">لون الإمبد الخاص بالترحيب (Welcome Embed Color)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={welcome.embedColor || "#5865F2"}
                            onChange={(e) => handleUpdateWelcome("embedColor", e.target.value)}
                            className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                          />
                          <input
                            type="text"
                            value={welcome.embedColor || "#5865F2"}
                            onChange={(e) => handleUpdateWelcome("embedColor", e.target.value)}
                            placeholder="#5865F2"
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center font-mono focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Avatar Character & Title */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">لوجو الزائر داخل البطاقة (Card Avatar Emoji)</label>
                        <select
                          value={welcome.avatarEmoji}
                          onChange={(e) => handleUpdateWelcome("avatarEmoji", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="👑">👑 Gold Crown</option>
                          <option value="👾">👾 Retro Alien</option>
                          <option value="🎮">🎮 Gaming Controller</option>
                          <option value="🦊">🦊 Quick Fox</option>
                          <option value="⭐">⭐ Galactic Star</option>
                          <option value="🔥">🔥 Hellfire Core</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">عنوان البطاقة العريض (Welcome Title Card)</label>
                        <input
                          type="text"
                          value={welcome.welcomeTitle}
                          onChange={(e) => handleUpdateWelcome("welcomeTitle", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          placeholder="A Wild Member Appeared!"
                        />
                      </div>
                    </div>

                    {/* Customized Message Text */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">نص رسالة الترحيب في الشات (Chat Welcome Message)</label>
                      <textarea
                        value={welcome.welcomeMessage}
                        onChange={(e) => handleUpdateWelcome("welcomeMessage", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                        placeholder="Welcome {user} to our guild server! Make sure to look around..."
                      />
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[9px] font-mono text-slate-500">
                        <span>قوالب المتغيرات:</span>
                        <span className="text-indigo-400 bg-slate-900 px-1 rounded font-bold">{"{user}"}</span>
                        <span className="text-indigo-400 bg-slate-900 px-1 rounded font-bold">{"{username}"}</span>
                        <span className="text-indigo-400 bg-slate-900 px-1 rounded font-bold">{"{memberCount}"}</span>
                      </div>
                    </div>

                    {/* Advanced DM Greeting Option */}
                    <div className="pt-2 border-t border-slate-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="block text-xs font-bold text-slate-300">الترحيب التلقائي في الخاص (DM Greetings Bot)</label>
                          <p className="text-[10px] text-slate-500">Enable automated DM notifications to welcome newcomers immediately.</p>
                        </div>
                        <button
                          onClick={() => handleUpdateWelcome("dmGreeting", !welcome.dmGreeting)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                            welcome.dmGreeting ? "bg-indigo-500" : "bg-slate-850"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                            welcome.dmGreeting ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {welcome.dmGreeting && (
                        <div>
                          <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">محتوى رسالة الخاص للزائر (Direct Message content)</label>
                          <textarea
                            value={welcome.dmMessage || ""}
                            onChange={(e) => handleUpdateWelcome("dmMessage", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
                            placeholder="🎉 Salam {username}! Welcome privately..."
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Right Side Visual Live Card Preview */}
                <div className="lg:col-span-6 space-y-4 font-sans select-none">
                  <span className="block text-[11px] font-extrabold uppercase text-slate-500 font-sans">Live Graphic Card Rendering (معاينة حية للمظهر الجرافيكي للمستخدم)</span>
                  
                  {/* Actual Card Render */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#1e1f22] aspect-video w-full flex flex-col items-center justify-center p-6 text-center">
                    
                    {/* Background Banner */}
                    <img 
                      src={welcome.bannerUrl}
                      alt="Banner background preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800'; }}
                    />

                    {/* Blurred Glow behind circle */}
                    <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 filter blur-xl" />

                    {/* Logo/Avatar overlay */}
                    <div className="relative z-10 w-20 h-20 rounded-full bg-[#313338] border-3 border-slate-800 flex items-center justify-center text-4xl shadow-xl animate-pulse">
                      {welcome.avatarEmoji}
                    </div>

                    {/* Welcome Text block */}
                    <div className="relative z-10 mt-3 space-y-1 max-w-sm">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 font-mono block">welcome home</span>
                      <h4 className="text-base font-black text-white pr-2 pl-2 truncate">{welcome.welcomeTitle.replace(/{username}/g, "papy615")}</h4>
                      <p className="text-[10px] text-slate-300 font-sans font-medium">papy615#9912 joined the server! (Total count: #25)</p>
                    </div>

                  </div>

                  {/* Welcome Bot Real Discord action instructions */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed font-sans space-y-2">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>كيفية عمل وبث الترحيب في سيرفر الديسكورد الحقيقي:</span>
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      بمجرد تفعيل البوت واختيار قناة التفعيل، سيقوم ديسكورد بوت (WelcomeBot) تلقائياً بالتقاط أي عضو جديد ينضم إلى سيرفرك، وتوليد بطاقة ترحيبية ديناميكية مدمجة بصورته ومستوحاة من القالب المختار فور دخوله للقناة فورا دون أي تدخل يدوي!
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/25 border border-slate-850 rounded-xl text-slate-500 text-xs space-y-1 font-sans py-16">
                <AlertCircle className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                <span className="block font-bold">بوابة خاملة.</span>
                <p>قم بتفعيل البوت من الأعلى للبدء في ضبط مظهره الترحيبي.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. AUTO ROLES MODULE */}
        {activeSubTab === "auto-roles" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="text-lg">🎖️</span>
                  <span>نظام الرتب التلقائية (Auto Roles System)</span>
                </h3>
                <p className="text-xs text-slate-500">يمنح الأعضاء رتباً محددة فور دخولهم السيرفر تلقائياً.</p>
              </div>
              <button
                onClick={() => setAutoRoles({ ...autoRoles, enabled: !autoRoles.enabled })}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  autoRoles.enabled
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-slate-850 text-slate-500 border border-slate-700"
                }`}
              >
                {autoRoles.enabled ? "🟢 مفعل" : "🔴 معطل"}
              </button>
            </div>

            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">قائمة الرتب التلقائية</h4>
                <div className="flex items-center gap-2">
                  <select
                    value={newAutoRoleId}
                    onChange={(e) => setNewAutoRoleId(e.target.value)}
                    className="bg-card border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 w-44 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- اختر رتبة --</option>
                    {guildRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddAutoRole}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> إضافة
                  </button>
                </div>
              </div>
              {autoRoles.rolesList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">لا توجد رتب تلقائية مضافة. أضف رتبة لتُمنح للأعضاء فور الدخول.</p>
              ) : (
                <div className="space-y-1.5">
                  {autoRoles.rolesList.map((role) => (
                    <div key={role.id} className="flex items-center justify-between bg-card border border-slate-800 rounded-lg px-3 py-2">
                      <span className="text-xs font-bold text-slate-300">{role.roleName}</span>
                      <button
                        onClick={() => handleRemoveAutoRole(role.id)}
                        className="text-red-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TICKETS BOT CONFIGURATION */}
        {activeSubTab === "ticket" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="text-lg">🎫</span>
                  <span>لوحة قيادة وإدارة بوت التذاكر الذكي (TicketBot Desk)</span>
                </h3>
                <p className="text-xs text-slate-500">Configures ticket panel designs, bot identities, support feedback metrics, and live ticket administration.</p>
              </div>

              {/* State activator */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400">حالة البوت الداخلي:</span>
                <button
                  onClick={() => handleUpdateTicket("enabled", !ticket.enabled)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                    ticket.enabled ? "bg-green-500" : "bg-slate-700"
                  }`}
                >
                  <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all duration-200 transform ${
                    ticket.enabled ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
                <span className={`text-xs font-bold ${ticket.enabled ? "text-green-400" : "text-slate-500"}`}>
                  {ticket.enabled ? "متصل (Online)" : "متوقف (Offline)"}
                </span>
              </div>
            </div>

            {ticket.enabled ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left controls form */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                      
                      <span className="block text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider font-mono">بطاقة وهوية بوت الدعم الفني (Bot Identity & Settings)</span>

                      {/* Bot Personal Identity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">اسم بوت التذاكر (Custom Bot Name)</label>
                          <input
                            type="text"
                            value={ticket.botName || "SupportBot 🎫"}
                            onChange={(e) => handleUpdateTicket("botName", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-bold"
                            placeholder="SupportBot 🎫"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">لوجو بوت الدعم (Bot Avatar)</label>
                          <select
                            value={ticket.botAvatar || "🛡️"}
                            onChange={(e) => handleUpdateTicket("botAvatar", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                          >
                            <option value="🛡️">🛡️ Support Shield</option>
                            <option value="🎟️">🎟️ Ticket Pass</option>
                            <option value="🦾">🦾 High Tech Cyborg</option>
                            <option value="🚨">🚨 Alarm Beacon</option>
                            <option value="🤝">🤝 Helpful Handshake</option>
                          </select>
                        </div>
                      </div>

                      {/* Category Label Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">تصنيف تذاكر الدعم - اسم أو ID الفئة (Category ID or Name Prefix)</label>
                          <input
                            type="text"
                            value={ticket.ticketCategoryName || "تذاكر الدعم (Support)"}
                            onChange={(e) => handleUpdateTicket("ticketCategoryName", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500"
                            placeholder="تذاكر الدعم الدبلوماسي أو Category ID"
                          />
                          <p className="text-[9px] text-slate-500 mt-0.5">يمكنك استخدام اسم الفئة أو أيدي Category ديسكورد مباشرة.</p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono font-black">قناة حفظ أرشيف التذاكر (Transcript Logs)</label>
                          <select
                            value={ticket.logChannelId || "chan-1"}
                            onChange={(e) => handleUpdateTicket("logChannelId", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                          >
                            {channels.filter(c => c.type === 'text').map(ch => (
                              <option key={ch.id} value={ch.id}>#{ch.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Show support feedback on close */}
                      <div className="flex items-center justify-between pt-1 pb-1">
                        <div className="space-y-0.5">
                          <label className="block text-xs font-bold text-slate-300">نظام تقييم دعم المسؤولين (Request Quality Rating on Close)</label>
                          <p className="text-[10px] text-slate-500">Asks the member to rate support from 1 to 5 stars on closing the ticket.</p>
                        </div>
                        <button
                          onClick={() => handleUpdateTicket("showFeedbackOnClose", !ticket.showFeedbackOnClose)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                            ticket.showFeedbackOnClose ? "bg-indigo-500" : "bg-slate-850"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                            ticket.showFeedbackOnClose ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="border-t border-slate-900/80 pt-3 space-y-3">
                        {/* Panel Title */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">أولاً: عنوان بطاقة فتح التذكرة (Panel Embed Title)</label>
                          <input
                            type="text"
                            value={ticket.panelTitle}
                            onChange={(e) => handleUpdateTicket("panelTitle", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* Panel Description */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">ثانياً: نص وصف بطاقة التذكرة (Panel Description Text)</label>
                          <textarea
                            value={ticket.panelDescription}
                            onChange={(e) => handleUpdateTicket("panelDescription", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                          />
                        </div>

                        {/* Button Label */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">ثالثاً: نص زر فتح التذكرة التفاعلي (Interactive Button Text)</label>
                          <input
                            type="text"
                            value={ticket.buttonLabel}
                            onChange={(e) => handleUpdateTicket("buttonLabel", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500"
                          />
                        </div>

                        {/* Support Welcome Message */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">رابعاً: رسائل البوت الفورية داخل التذكرة (Ticket Welcome Message)</label>
                          <textarea
                            value={ticket.welcomeMessage}
                            onChange={(e) => handleUpdateTicket("welcomeMessage", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                          />
                        </div>

                        {/* Banner & Embed Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-sans">خامساً: رابط بنر لوحة التذاكر (Panel Banner Image URL)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={ticket.bannerUrl || ""}
                                onChange={(e) => handleUpdateTicket("bannerUrl", e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                                placeholder="https://example.com/banner.png"
                              />
                              {ticket.bannerUrl && (
                                <button
                                  onClick={() => handleUpdateTicket("bannerUrl", "")}
                                  className="px-2.5 py-1.5 bg-red-950 border border-red-900 rounded-lg text-xs text-red-400 hover:bg-red-900 hover:text-white transition"
                                  title="إزالة البنر"
                                >
                                  إزالة
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1">يُنصح بوضع صورة عريضة (16:9) لتظهر أعلى بطاقة فتح التذاكر كواجهة احترافية.</p>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-sans">سادساً: لون إمبد لوحة التذاكر (Ticket Panel Embed Color)</label>
                            <div className="flex gap-2 font-mono">
                              <input
                                type="color"
                                value={ticket.embedColor || "#5865F2"}
                                onChange={(e) => handleUpdateTicket("embedColor", e.target.value)}
                                className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                              />
                              <input
                                type="text"
                                value={ticket.embedColor || "#5865F2"}
                                onChange={(e) => handleUpdateTicket("embedColor", e.target.value)}
                                placeholder="#5865F2"
                                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1">يتحكم باللون الجانبي الملون لبطاقة فتح التكت ورسائلها التفاعلية.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right Panel Embed Preview */}
                  <div className="lg:col-span-6 space-y-4">
                    <span className="block text-[11px] font-extrabold uppercase text-slate-500 font-sans">Visual Embedded Preview (معاينة اللوحة التفاعلية في الديسكورد)</span>

                    {/* Panel card style */}
                    <div className="bg-[#2b2d31] p-0 rounded-xl border-l-4 max-w-md shadow-xl overflow-hidden font-sans relative" style={{ borderLeftColor: ticket.embedColor || "#5865F2" }}>
                      <div className="absolute right-3 top-3 text-[10px] text-white/40 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">Support Panel</div>
                      
                      {ticket.bannerUrl && (
                        <div className="w-full h-32 overflow-hidden relative border-b border-[#202225]">
                          <img
                            src={ticket.bannerUrl}
                            alt="Ticket Banner"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{ticket.botAvatar || "🛡️"}</span>
                          <span className="text-xs font-bold text-indigo-400">{ticket.botName || "SupportBot 🎫"}</span>
                          <span className="text-[10px] bg-[#5865f2] px-1 rounded text-white text-[9px] scale-90 font-mono font-bold">BOT</span>
                        </div>
                        <h4 className="font-extrabold text-[#f2f3f5] text-sm truncate">{ticket.panelTitle}</h4>
                        <p className="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-wrap text-right" style={{ direction: "rtl" }}>
                          {ticket.panelDescription}
                        </p>
                        
                        {/* Mock interactive select categories dropdown replica */}
                        {ticket.ticketTypes && ticket.ticketTypes.length > 0 ? (
                          <div className="pt-2.5 border-t border-slate-800/80 space-y-2 text-right" style={{ direction: "rtl" }}>
                            <span className="block text-[9px] text-[#949ba4] font-bold">قائمة الاختيار المنسدلة للتواصل:</span>
                            <div className="relative w-full">
                              <div className="w-full flex items-center justify-between px-3 py-2 bg-[#1e1f22] border border-[#3f4147] rounded text-xs text-[#dbdee1] font-semibold select-none">
                                <span className="flex items-center gap-2">
                                  <span>📥</span>
                                  <span>فتح تذكرة | Open Ticket...</span>
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 transform rotate-90 text-[#949ba4]" />
                              </div>
                              <div className="mt-1 bg-[#111214] border border-[#3f4147] rounded shadow-xl py-1 divide-y divide-[#1e1f22]">
                                {ticket.ticketTypes.map((typ) => (
                                  <div key={typ.id} className="px-3 py-2 flex items-center justify-between text-[#dbdee1] text-xs">
                                    <div className="flex items-center gap-1.5 font-bold">
                                      <span>{typ.emoji || "🎫"}</span>
                                      <span>{typ.name}</span>
                                    </div>
                                    {typ.ticketCategoryName && (
                                      <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                                        📁 {typ.ticketCategoryName}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Mock interactive single button (fallback) */
                          <div className="pt-2">
                            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5865f2] text-white rounded font-bold text-xs shadow hover:bg-opacity-90 select-none cursor-pointer">
                              <Ticket className="w-3.5 h-3.5" />
                              <span>{ticket.buttonLabel}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed font-sans space-y-2">
                      <span className="font-bold text-white block">💡 كيفية بث اللوحة في سيرفرك وبدء استقبال تذاكر عملائك:</span>
                      <p className="text-[11px] leading-relaxed">
                        عند ربط البوت بسيرفرك، استخدم الأمر <strong>/setup-tickets</strong> في قنوات التحكم الإدارية داخل ديسكورد، لتفويض البوت بإرسال لوحة الدعم المجهزة بنظام الأزرار والأقسام المتعددة فورياً. سيكون بإمكان اللاعبين والمشتركين الضغط على الرزم وفتح غرف شخصية خاصة مشفرة بضغطة زر واحدة.
                      </p>
                    </div>
                  </div>

                </div>

                {/* MULTI-TOPIC TICKET TYPES MANAGER */}
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 font-sans text-right" style={{ direction: "rtl" }}>
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-black">Multi-Topic Support Routing (إدارة وتوزيع أقسام التذاكر المتعددة)</span>
                    <h4 className="text-sm font-extrabold text-[#f2f3f5] mt-1">تخصيص تصنيفات وربط التذاكر بفئات ديسكورد مخصصة</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">يمكنك إضافة أنواع تذاكر مخصصة تظهر في شريط ديسكورد كخيارات منسدلة (مثل: استفسارات، شكاوى)، وتوجيه كل نوع فئة تلقائياً إلى Category ديسكورد الخاص به!</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Add new Ticket Type Form */}
                    <div className="p-4 bg-[#0a0c10] border border-slate-900 rounded-xl space-y-3">
                      <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-wide">➕ إضافة فئة/نوع تكت مخصص جديد</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] text-slate-400 mb-1 font-bold">اسم نوع التذكرة (Label Name):</label>
                          <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            placeholder="مثال: تقديم شكوى ضد لاعب"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 mb-1 font-bold font-sans">أيقونة (Emoji):</label>
                          <select
                            value={newTypeEmoji}
                            onChange={(e) => setNewTypeEmoji(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none cursor-pointer"
                          >
                            <option value="💬">💬 استفسار عام</option>
                            <option value="⚠️">⚠️ شكوى وبلاغات</option>
                            <option value="💼">💼 إدارة عليا</option>
                            <option value="🛒">🛒 متجر وشراء</option>
                            <option value="🛠️">🛠️ صيانة ومساعدة</option>
                            <option value="🔒">🔒 سرية تامة</option>
                            <option value="🤝">🤝 شراكات وتواصل</option>
                            <option value="💡">💡 اقتراحات وأفكار</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 mb-1 font-bold font-sans">اسم أو ID كتقوري ديسكورد الخاص (Target Discord Category Name/ID):</label>
                        <input
                          type="text"
                          value={newTypeCategory}
                          onChange={(e) => setNewTypeCategory(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                          placeholder="مثال: 📁 • شكاوى اللاعبين أو Category ID"
                        />
                        <p className="text-[9px] text-slate-500 mt-0.5">البوت سينشئ غرف هذا القسم داخل هذه الفئة المعينة حصرياً.</p>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 mb-1 font-bold">وصف مبسط بالمنيو (Select Sub-Description):</label>
                        <input
                          type="text"
                          value={newTypeDesc}
                          onChange={(e) => setNewTypeDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          placeholder="مثال: للتبليغ عن سلوكيات خارج القوانين"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 mb-1 font-bold">رسالة الترحيب التلقائية الخاصة بهذا القسم (Welcome Message):</label>
                        <textarea
                          value={newTypeWelcome}
                          onChange={(e) => setNewTypeWelcome(e.target.value)}
                          rows={2}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                          placeholder="رسالة مخصصة داخل الشات عند فتح هذه التذكرة بعينها (اكتب هنا أو اتركه للافتراضي)..."
                        />
                      </div>

                      <button
                        onClick={handleAddTicketType}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition cursor-pointer"
                      >
                        إضافة نوع تذكرة جديد 🚀
                      </button>
                    </div>

                    {/* Show List of existing categories */}
                    <div className="space-y-3">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">📋 أنواع وتصنيفات التذاكر المدعومة حالياً ({ (ticket.ticketTypes || []).length })</span>
                      
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {(ticket.ticketTypes || []).map((typ) => (
                          <div key={typ.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-start justify-between gap-3 text-right">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm">{typ.emoji}</span>
                                <span className="text-xs font-black text-slate-200">{typ.name}</span>
                                {typ.ticketCategoryName && (
                                  <span className="text-[9px] bg-slate-950 border border-slate-850 text-indigo-400 px-2 py-0.5 rounded-lg font-mono">
                                    كتقوري: {typ.ticketCategoryName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{typ.description || "لا يوجد وصف مصاحب."}</p>
                              {typ.welcomeMessage && (
                                <p className="text-[9px] text-slate-500 bg-black/30 p-1.5 rounded mt-1 italic leading-relaxed">
                                  💬 رسالة ترحيب: {typ.welcomeMessage}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveTicketType(typ.id)}
                              className="p-1 hover:bg-red-950 border border-transparent hover:border-red-900 text-slate-500 hover:text-red-400 rounded transition cursor-pointer shrink-0 mt-0.5"
                              title="إزالة هذا النوع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {(!ticket.ticketTypes || ticket.ticketTypes.length === 0) && (
                          <div className="p-6 bg-[#0a0c10]/30 rounded-xl border border-dashed border-slate-850 text-center text-slate-500 flex flex-col items-center justify-center gap-1">
                            <Ticket className="w-6 h-6 text-slate-700 mb-1" />
                            <span className="text-xs font-bold text-slate-400">لا يوجد أنواع تذاكر مخصصة بعد!</span>
                            <span className="text-[10px]">البوت سيفعل الأزرار الافتراضية للجميع. قم بإضافة أول قسم خاص بك الآن في اليمين!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTIVE TICKETS LOG AND TRANSCRIPTS MANAGER */}
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#f59e0b] font-black">Admin Support Operations Control (لوحة إشراف التذاكر الفعالة)</span>
                      <h4 className="text-sm font-extrabold text-slate-200">تتبع ومتابعة تذاكر الدعم النشطة حالياً في شات السيرفر</h4>
                    </div>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-amber-500">
                      تذاكر سارية: {activeTicketChannels.length} تذكرة مفتوحة
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live active list */}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {activeTicketChannels.map((chan) => {
                        // Find historical matching ticket meta
                        const ticketMeta = (ticket.activeTickets || []).find(t => t.channelId === chan.id);
                        return (
                          <div key={chan.id} className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-lg flex flex-col justify-between gap-3 transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-amber-500" />
                                <div>
                                  <span className="text-xs font-black text-slate-200 block">#{chan.name}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">ID: {chan.id}</span>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                ticketMeta?.status === 'claimed' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' : 'bg-amber-950/40 text-amber-500 border border-amber-900/30'
                              }`}>
                                {ticketMeta?.status === 'claimed' ? `🤝 مستلمة • By: ${ticketMeta.claimedBy || "Staff"}` : "🟢 بانتظار إداري"}
                              </span>
                            </div>

                            {/* Ticket Rating & Actions */}
                            <div className="flex items-center justify-between border-t border-slate-850 pt-2 flex-wrap gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleClaimTicketDashboard(chan.id, chan.name)}
                                  className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-650 text-white rounded font-bold text-[10px] transition cursor-pointer"
                                  title="Assure customer you are looking into this"
                                >
                                  استلام ودعم
                                </button>
                                <button
                                  onClick={() => handleCloseTicketDashboard(chan.id, chan.name)}
                                  className="px-2.5 py-1 bg-red-700 hover:bg-red-650 text-white rounded font-bold text-[10px] transition cursor-pointer"
                                  title="Permanently remove this ticket chat channel"
                                >
                                  إغلاق التذكرة
                                </button>
                              </div>

                              {/* Simple mini rating */}
                              <div className="flex items-center gap-0.5" title="User feedback rating">
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <Star 
                                    key={starVal} 
                                    className={`w-3 h-3 cursor-pointer ${
                                      (ticketMeta?.rating || 4) >= starVal ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-slate-700'
                                    }`}
                                    onClick={() => handleSaveTicketDetails(chan.id, ticketMeta?.adminNotes || "", starVal)}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Internal administrative note */}
                            <div className="mt-1">
                              <input
                                type="text"
                                placeholder="كتابة ملاحظة إدارية سرية عن هذه التذكرة..."
                                value={ticketMeta?.adminNotes || ""}
                                onChange={(e) => handleSaveTicketDetails(chan.id, e.target.value, ticketMeta?.rating || 4)}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {activeTicketChannels.length === 0 && (
                        <div className="p-8 text-center bg-slate-900/35 border border-slate-800 rounded-lg text-slate-600 text-xs italic">
                          لا توجد تذاكر دعم مفتوحة حالياً في شات السيرفر.
                        </div>
                      )}
                    </div>

                    {/* Support Historical transcript & rating archive */}
                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-850 space-y-3">
                      <span className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">سجلات التقييم وأرشيف الدعم المغلق (Archived Transcript Files)</span>
                      
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
                        {(ticket.activeTickets || []).filter(t => t.status === 'closed').map((archive, aid) => (
                          <div key={aid} className="p-2.5 bg-slate-950 border border-slate-850 rounded flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-300 block">👤 @{archive.username} (Closed Ticket case)</span>
                              <p className="text-[10px] text-slate-500 font-mono">Notes: {archive.adminNotes || "N/A"}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-2.5 h-2.5 ${archive.rating && archive.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`} />
                                ))}
                              </div>
                              <span className="text-[8px] bg-red-950/40 text-red-500 px-1 py-0.5 rounded font-mono uppercase">Archive File</span>
                            </div>
                          </div>
                        ))}

                        {(ticket.activeTickets || []).filter(t => t.status === 'closed').length === 0 && (
                          <p className="p-6 text-center text-slate-650 italic text-[11px]">لا توجد أرشيفات مغلقة متاحة حالياً. سيتم تسجيل هنا التذاكر فور إغلاقها.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/25 border border-slate-850 rounded-xl text-slate-500 text-xs space-y-1 font-sans py-16">
                <AlertCircle className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                <span className="block font-bold">بوابة خاملة.</span>
                <p>قم بتفعيل بوت الدعم الفني وتفتيش التذاكر التفاعلي للبدء في تشغيله.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. STAFF RECRUITMENT AND APPLICATIONS REVIEW DESK */}
        {activeSubTab === "staff" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <span>بوت التوظيف ومراجعة طلبات الانضمام للإدارة (RecruitBot Central)</span>
                </h3>
                <p className="text-xs text-slate-500">Formulates interactive staff requests, reviews submissions, manages ratings, and broadcasts automated notification responses.</p>
              </div>

              {/* State toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400">حالة النظام الداخلي:</span>
                <button
                  onClick={() => setStaffApp({ ...staffApp, enabled: !staffApp.enabled })}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                    staffApp.enabled ? "bg-green-500" : "bg-slate-700"
                  }`}
                >
                  <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all duration-200 transform ${
                    staffApp.enabled ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
                <span className={`text-xs font-bold ${staffApp.enabled ? "text-green-400" : "text-slate-500"}`}>
                  {staffApp.enabled ? "متصل (Online)" : "متوقف (Offline)"}
                </span>
              </div>
            </div>

            {staffApp.enabled ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Create / Manage Application Questions */}
                <div className="lg:col-span-5 space-y-4 font-sans">
                  
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4">
                    <span className="block text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider font-mono">هوية بوت التقديم ورسائل الرد الذاتية (Recruiter Identity & Templates)</span>
                    
                    {/* Bot Name & Avatar */}
                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-900">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">اسم بوت التقديم (Bot Name)</label>
                        <input
                          type="text"
                          value={staffApp.botName || "RecruiterBot 🛡️"}
                          onChange={(e) => setStaffApp({ ...staffApp, botName: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded font-bold text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">لوجو البوت (Bot Avatar)</label>
                        <select
                          value={staffApp.botAvatar || "💼"}
                          onChange={(e) => setStaffApp({ ...staffApp, botAvatar: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="💼">💼 Recruiter Suitcase</option>
                          <option value="🛡️">🛡️ Staff Security</option>
                          <option value="✒️">✒️ Application Quill</option>
                          <option value="🧠">🧠 Smart Intelligence</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto Reponse templates */}
                    <div className="space-y-2 pb-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-1">رسالة القبول الآلي (Approval Custom Template)</label>
                        <textarea
                          value={staffApp.autoMessageOnApprove || ""}
                          onChange={(e) => setStaffApp({ ...staffApp, autoMessageOnApprove: e.target.value })}
                          rows={2}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
                          placeholder="Template for approved members..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-1">رسالة الرفض الفوري (Rejection Custom Template)</label>
                        <textarea
                          value={staffApp.autoMessageOnReject || ""}
                          onChange={(e) => setStaffApp({ ...staffApp, autoMessageOnReject: e.target.value })}
                          rows={2}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
                          placeholder="Template for rejected members..."
                        />
                      </div>
                    </div>

                    {/* Select Review Channel for Applications */}
                    <div className="pt-2.5 border-t border-slate-900/60 pb-1.5">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono font-black">قناة استقبال طلبات التقديم ومراجعتها (Applications Audit Channel)</label>
                      <select
                        value={staffApp.reviewChannelId || ""}
                        onChange={(e) => setStaffApp({ ...staffApp, reviewChannelId: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="">🚫 الأولى (بحث تلقائي بالاسم أو أول روم)</option>
                        {channels.filter(c => c.type === 'text').map(ch => (
                          <option key={ch.id} value={ch.id}>#{ch.name}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-slate-500 mt-1">يُرسل البوت طلبات الموظفين والتقديم إليها مباشرة مع أزرار القبول والرفض.</p>
                    </div>

                    {/* Role ID to assign on approval */}
                    <div className="pt-2.5 border-t border-slate-900/60 pb-1.5">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono font-black">أيدي الرتبة التي تُمنح تلقائياً عند القبول (Role ID on Approval)</label>
                      <input
                        type="text"
                        value={staffApp.approvedRoleId || ""}
                        onChange={(e) => setStaffApp({ ...staffApp, approvedRoleId: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none font-sans text-right"
                        style={{ direction: "rtl" }}
                        placeholder="أدخل ID الرتبة هنا (مثال: 123456789012345678)"
                      />
                      <p className="text-[9px] text-slate-500 mt-1">عند الضغط على "قبول" في شات التقديم، سيقوم البوت بإعطاء الشخص المقبول هذه الرتبة بشكل تلقائي.</p>
                    </div>

                    {/* Banner & Embed Color for Staff */}
                    <div className="pt-2.5 border-t border-slate-900/60 pb-1.5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono text-right">رابط بنر لوحة تقديم الموظفين (Recruitment Banner URL)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={staffApp.bannerUrl || ""}
                            onChange={(e) => setStaffApp({ ...staffApp, bannerUrl: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none text-left"
                            placeholder="https://images.unsplash.com/..."
                            style={{ direction: 'ltr' }}
                          />
                          {staffApp.bannerUrl && (
                            <button
                              onClick={() => setStaffApp({ ...staffApp, bannerUrl: "" })}
                              className="px-2 py-1 bg-red-950 border border-red-900/60 rounded text-xs text-red-500 hover:bg-red-900 hover:text-white transition cursor-pointer"
                            >
                              إزالة
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 text-right mt-1">يظهر كبنر جاذب يعتلي كلاً من لوحة التقديم وبطاقة المراجعة.</p>
                      </div>
                      
                      <div className="space-y-1 text-right">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">لون إمبد تقديم الإدارة (Staff App Embed Color)</label>
                        <div className="flex gap-2 font-mono" style={{ direction: 'ltr' }}>
                          <input
                            type="color"
                            value={staffApp.embedColor || "#2ECC71"}
                            onChange={(e) => setStaffApp({ ...staffApp, embedColor: e.target.value })}
                            className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                          />
                          <input
                            type="text"
                            value={staffApp.embedColor || "#2ECC71"}
                            onChange={(e) => setStaffApp({ ...staffApp, embedColor: e.target.value })}
                            placeholder="#2ECC71"
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 text-right mt-1">يتحكم بلون الإمبد لنموذج الأسئلة وبطاقات الرد المرفقة.</p>
                      </div>
                    </div>

                    <span className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">أسئلة استبيان التوظيف (Application Questionnaire)</span>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {staffApp.questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2 items-start justify-between bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                          <div className="text-[11px] leading-relaxed">
                            <span className="font-bold text-indigo-400 font-mono block mb-0.5">سؤال Q{idx + 1}:</span>
                            <span className="text-slate-300">{q}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveQuestion(idx)}
                            className="p-1 hover:bg-red-950 text-slate-500 hover:text-red-400 rounded transition cursor-pointer"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {staffApp.questions.length === 0 && (
                        <p className="text-xs text-slate-500 italic text-center p-3">No questions defined. Candidate will just submit their name.</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex gap-1.5 flex-col md:flex-row">
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        placeholder="أدخل سؤال جديد للتقديم..."
                      />
                      <button
                        onClick={handleAddQuestion}
                        className="px-3 py-1.5 bg-[#5865f2] text-white hover:bg-indigo-500 rounded-lg text-xs font-black font-sans transition flex items-center gap-1 shrink-0 justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        أضف سؤال
                      </button>
                    </div>
                  </div>

                  {/* Visual Discord Embedded Preview for Staff App */}
                  <div className="space-y-2 select-none">
                    <span className="block text-[11px] font-extrabold uppercase text-slate-500 font-sans text-right">Visual Embedded Preview (معاينة بطاقة طلب التقديم في الديسكورد)</span>
                    
                    <div className="bg-[#2b2d31] p-0 rounded-xl border-l-4 max-w-full shadow-xl overflow-hidden font-sans relative text-right" style={{ borderLeftColor: staffApp.embedColor || "#2ECC71", direction: "rtl" }}>
                      <div className="absolute left-3 top-3 text-[10px] text-white/40 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">Recruitment Panel</div>
                      
                      {staffApp.bannerUrl && (
                        <div className="w-full h-28 overflow-hidden relative border-b border-[#202225]">
                          <img
                            src={staffApp.bannerUrl}
                            alt="Recruitment Banner"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center gap-1.5 justify-start flex-row-reverse">
                          <span className="text-sm">{staffApp.botAvatar || "💼"}</span>
                          <span className="text-xs font-bold text-indigo-400">{staffApp.botName || "RecruiterBot 🛡️"}</span>
                          <span className="text-[10px] bg-[#5865f2] px-1 rounded text-white text-[9px] scale-90 font-mono font-bold">BOT</span>
                        </div>
                        
                        <h4 className="font-extrabold text-[#f2f3f5] text-sm truncate">🛡️ تقديم طلبات الانضمام لطاقم الإدارة</h4>
                        <p className="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-wrap">
                          {staffApp.questions.length > 0
                            ? `إذا كنت تجد في نفسك الكفاءة، الخبرة والالتزام لمساعدتنا في تنظيم شؤون السيرفر، يرجى الضغط على زر التقديم والإجابة على الاستبيان الذي يحتوي على ${staffApp.questions.length} أسئلة مخصصة.`
                            : "إذا كنت تجد في نفسك الكفاءة، الخبرة والالتزام لمساعدتنا في تنظيم شؤون السيرفر، يرجى الضغط على زر التقديم والإجابة على الاستبيان."}
                        </p>
                        
                        {/* Interactive list of questions in preview */}
                        {staffApp.questions.length > 0 && (
                          <div className="bg-[#1e1f22] p-2.5 rounded-lg border border-[#3f4147] space-y-1.5 text-[11px] text-right">
                            <span className="block text-[10px] text-slate-400 font-bold">نموذج الأسئلة التفاعلي الذي سيجيب عليه العضو:</span>
                            {staffApp.questions.map((q, idx) => (
                              <div key={idx} className="flex gap-1 items-start text-[#dbdee1] border-b border-white/[0.04] pb-1 last:border-0 last:pb-0 justify-start flex-row-reverse">
                                <span className="text-indigo-400 font-bold font-mono">Q{idx + 1}:</span>
                                <span className="truncate flex-1 text-right">{q}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Button mockup */}
                        <div className="pt-1.5">
                          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#248046] text-white rounded font-bold text-xs shadow hover:bg-[#1a6535] transition select-none cursor-pointer">
                            <span>تقديم على الإدارة 🛡️ Apply for Staff</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed space-y-2">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>طريقة تفعيل وتدشين استمارات التوظيف:</span>
                    </span>
                    <p className="text-[11px] text-slate-450 leading-relaxed">
                      أرسل الاستمارة في ديسكورد عبر الأمر <strong>/apply-embed</strong> في روم الإعلانات أو التقديم. سيتلقى المستخدمون زراً تفاعلياً يعرض عليهم نموذج الأسئلة المخصصة بالكامل بشكل آمن وخاص، وبمجرد إرسال إجاباتهم، ستتم فلترتها وإرسالها إلى لوحة التحكم الخاصة بك هنا مباشرة لمراجعتها!
                    </p>
                  </div>

                </div>

                {/* Right Side: Candidate Review Submissions Desk */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">ملفات طلبات الإدارة المستلمة ومراجعتها (Candidate Portfolios)</span>
                    <span className="text-[10px] text-slate-450 bg-slate-900 px-2 py-1 border border-slate-850 rounded">إجمالي الطلبات: {staffApp.submissions.length}</span>
                  </div>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {staffApp.submissions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className={`p-4 rounded-xl border font-sans space-y-3.5 transition-all ${
                          sub.status === 'approved' ? 'bg-emerald-950/10 border-emerald-900/60 shadow-emerald-500/5' :
                          sub.status === 'rejected' ? 'bg-red-950/10 border-red-900/60 shadow-red-500/5' :
                          sub.status === 'reviewing' ? 'bg-amber-950/10 border-amber-900/50 shadow-amber-500/5' :
                          'bg-slate-950 border-slate-850'
                        }`}
                      >
                        {/* Member title bar card */}
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl w-8 h-8 rounded-full bg-slate-905 flex items-center justify-center border border-slate-800 shadow-sm">{sub.avatar}</span>
                            <div>
                              <span className="text-xs font-black text-slate-100 block">papy615@{sub.username}</span>
                              <span className="text-[9px] text-slate-550 font-mono">طريان التقديم: {sub.timestamp}</span>
                            </div>
                          </div>

                          {/* Complex submission state pipeline dropdown */}
                          <div className="flex items-center gap-1.5">
                            <select
                              value={sub.status}
                              onChange={(e) => handleUpdateSubmissionState(sub.id, { status: e.target.value as any })}
                              className={`px-2.5 py-1 rounded text-[11px] font-black focus:outline-none cursor-pointer text-slate-200 border ${
                                sub.status === 'approved' ? 'bg-emerald-950/40 border-emerald-800' :
                                sub.status === 'rejected' ? 'bg-red-950/40 border-red-800' :
                                sub.status === 'reviewing' ? 'bg-amber-950/40 border-amber-800' :
                                'bg-slate-900 border-slate-800'
                              }`}
                            >
                              <option value="pending" className="bg-slate-900">⏱️ بانتظار المراجعة</option>
                              <option value="reviewing" className="bg-slate-900">🔎 تحت الفحص والتدقيق</option>
                              <option value="approved" className="bg-slate-900">🟢 قبول وانضمام للطاقم</option>
                              <option value="rejected" className="bg-slate-900">🔴 رفض مع تجميد الطلب</option>
                            </select>

                            {/* Broadcast Alerts trigger */}
                            {(sub.status === 'approved' || sub.status === 'rejected') && (
                              <button
                                onClick={() => handleNotifyCandidate(sub)}
                                className={`px-2.5 py-1 text-slate-950 rounded font-bold text-[10px] transition cursor-pointer flex items-center gap-1 ${
                                  sub.notified ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' : 'bg-amber-400 hover:bg-amber-300'
                                }`}
                                disabled={sub.notified}
                                title={sub.notified ? "المرشح مستلم للتنبيه حالياً" : "بث إشعار من البث اللاسلكي للبوت لتنبيه العضو فوراً"}
                              >
                                {sub.notified ? "⚡ تم التبليغ" : "📡 بث التنبيه"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interview Questionnaire answers */}
                        <div className="space-y-2">
                          {sub.answers.map((ans, ansidx) => (
                            <div key={ansidx} className="bg-slate-900/60 border border-slate-850 rounded p-2 text-xs">
                              <span className="font-extrabold text-[#949ba4] block mb-0.5">{ans.question}</span>
                              <p className="text-slate-200 leading-relaxed italic">{ans.answer || "[لم تتم الإجابة]"}</p>
                            </div>
                          ))}
                        </div>

                        {/* Professional internal administrator reviews */}
                        <div className="pt-2 border-t border-slate-900/80 space-y-2">
                          <div className="grid grid-cols-2 gap-3.5">
                            {/* Auditor evaluation star rating matrix */}
                            <div>
                              <span className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">تقييم جودة إجابات المرشح (Candidate Rating)</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    onClick={() => handleUpdateSubmissionState(sub.id, { rating: star })}
                                    className={`w-4 h-4 cursor-pointer transition active:scale-90 ${
                                      (sub.rating || 3) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-800 hover:text-yellow-500/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Reviewer name input */}
                            <div>
                              <span className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">الإداري المسؤول عن الفحص (Auditor name)</span>
                              <input
                                type="text"
                                placeholder="اسم المدقق..."
                                value={sub.reviewer || ""}
                                onChange={(e) => handleUpdateSubmissionState(sub.id, { reviewer: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-850 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* review notes text area */}
                          <div>
                            <span className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">سجل التوصيات وملاحظات التدقيق (Internal review notes)</span>
                            <textarea
                              rows={1.5}
                              placeholder="ملاحظات تدقيق داخلية... (مثال: لديه خبرة إدارية مميزة وصاحب ردود هادئة، يوصى بقبوله وتدريبه)"
                              value={sub.adminNotes || ""}
                              onChange={(e) => handleUpdateSubmissionState(sub.id, { adminNotes: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-850 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>

                      </div>
                    ))}

                    {staffApp.submissions.length === 0 && (
                      <div className="p-8 text-center bg-slate-950/25 border border-slate-850 rounded-xl text-slate-600 text-xs py-16">
                        <UserCheck className="w-7 h-7 text-slate-700 mx-auto mb-1.5 animate-pulse" />
                        <p>لا توجد طلبات تقديم مستلمة حالياً في نظام التوظيف المركزي.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/25 border border-slate-850 rounded-xl text-slate-500 text-xs space-y-1 font-sans py-16">
                <AlertCircle className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                <span className="block font-bold">بوابة خاملة.</span>
                <p>قم بتفعيل بوت الإشراف والتوظيف لاستقبال طلبات الأعضاء وتدقيقها.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. SECURITY MODULE DASHBOARD */}
        {activeSubTab === "security" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500 animate-pulse" />
                  <span>إعدادات نظام الحماية المتطور (Advanced Shield & Security System)</span>
                </h3>
                <p className="text-xs text-slate-500">Configure global protection limits, custom verified channels, word blacklist databases, and anti-link features.</p>
              </div>

              {/* Security Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400">درع الحماية المركزي:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateSecurity("enabled", !security.enabled)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                    security.enabled ? "bg-red-600" : "bg-slate-700"
                  }`}
                >
                  <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all duration-200 transform ${
                    security.enabled ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
                <span className={`text-xs font-bold ${security.enabled ? "text-red-400" : "text-slate-500"}`}>
                  {security.enabled ? "نشط (Protected)" : "معطل (Inactive/Vulnerable)"}
                </span>
              </div>
            </div>

            {security.enabled && (
              <div className="p-4 bg-[#140e0e]/20 border border-red-950/40 rounded-xl space-y-3 font-sans relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-full filter blur-xl pointer-events-none" />
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span>مستوى جدار جودة الأمن (Select Security Level Profile)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">مستويات حماية مبرمجة مسبقاً لتعديل دروع السيرفر تلقائياً بضغطة زر واحدة.</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 font-bold rounded uppercase ${
                    (security.securityLevel || "medium") === "low" ? "bg-green-950/40 text-green-400 border border-green-900/40" :
                    (security.securityLevel || "medium") === "medium" ? "bg-amber-950/40 text-amber-400 border border-amber-900/40" :
                    "bg-red-950 text-red-400 border border-red-800/60 animate-pulse"
                  }`}>
                    المستوى الحالي: {
                      (security.securityLevel || "medium") === "low" ? "منخفض (Standard)" :
                      (security.securityLevel || "medium") === "medium" ? "متوازن (Balanced)" :
                      "حالة الطوارئ (Lockdown! 🚨)"
                    }
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Low */}
                  <button
                    type="button"
                    onClick={() => {
                      setSecurity({
                        ...security,
                        securityLevel: 'low',
                        wordFilterEnabled: false,
                        linkFilterEnabled: false,
                        spamProtectionEnabled: false,
                        antiRaidEnabled: false
                      });
                      onAddLog({
                        id: crypto.randomUUID(),
                        timestamp: new Date().toLocaleTimeString(),
                        type: "automod",
                        message: "⚠️ [SECURITY PRESET] Switched security shield to LOW standard level. Heavy restrictions bypassed."
                      });
                    }}
                    className={`p-3 rounded-lg border text-right transition cursor-pointer select-none ${
                      (security.securityLevel || "medium") === "low"
                        ? "bg-green-950/20 border-green-500/50 hover:bg-green-950/30"
                        : "bg-slate-950/50 border-slate-850 hover:border-slate-800 hover:bg-slate-900/30"
                    }`}
                  >
                    <span className="block text-xs font-bold text-green-400 mb-0.5">🟢 أمن طبيعي (Normal Shield)</span>
                    <span className="block text-[10px] text-slate-400 leading-relaxed">تعطيل نظام الفلترة الشامل لمنع الكتم، مناسب للدردشات الودية مع الأصدقاء.</span>
                  </button>

                  {/* Medium */}
                  <button
                    type="button"
                    onClick={() => {
                      setSecurity({
                        ...security,
                        securityLevel: 'medium',
                        wordFilterEnabled: true,
                        linkFilterEnabled: true,
                        spamProtectionEnabled: true,
                        antiRaidEnabled: true,
                        maxMessagesPerMinute: 6
                      });
                      onAddLog({
                        id: crypto.randomUUID(),
                        timestamp: new Date().toLocaleTimeString(),
                        type: "automod",
                        message: "🛡️ [SECURITY PRESET] Switched security shield to MEDIUM/BALANCED setup. All standard guards online."
                      });
                    }}
                    className={`p-3 rounded-lg border text-right transition cursor-pointer select-none ${
                      (security.securityLevel || "medium") === "medium"
                        ? "bg-amber-950/20 border-amber-500/50 hover:bg-amber-950/30"
                        : "bg-slate-950/50 border-slate-850 hover:border-slate-800 hover:bg-slate-900/30"
                    }`}
                  >
                    <span className="block text-xs font-bold text-amber-400 mb-0.5">🟡 أمن معزز (Balanced Guards)</span>
                    <span className="block text-[10px] text-slate-400 leading-relaxed">تشغيل مضاد السبامات والتصرفات اللفظية مع فلترة كفؤة للروابط الترويجية ومصادقات الدخول.</span>
                  </button>

                  {/* High Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSecurity({
                        ...security,
                        securityLevel: 'high',
                        wordFilterEnabled: true,
                        linkFilterEnabled: true,
                        spamProtectionEnabled: true,
                        antiRaidEnabled: true,
                        maxMessagesPerMinute: 3
                      });
                      onAddLog({
                        id: crypto.randomUUID(),
                        timestamp: new Date().toLocaleTimeString(),
                        type: "automod",
                        message: "🚨 [SECURITY LOCKDOWN] WARNING: Active server under maximum EMERGENCY lock mode. Rapid fire messages heavily stricted (max 3/min)."
                      });
                    }}
                    className={`p-3 rounded-lg border text-right transition cursor-pointer select-none ${
                      (security.securityLevel || "medium") === "high"
                        ? "bg-red-950/30 border-red-500/50 hover:bg-red-950/40"
                        : "bg-slate-950/50 border-slate-850 hover:border-slate-800 hover:bg-slate-900/30"
                    }`}
                  >
                    <span className="block text-xs font-bold text-red-400 mb-0.5 flex items-center gap-1.5 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      <span>🔴 أمن طوارئ (Raid Emergency)</span>
                    </span>
                    <span className="block text-[10px] text-slate-400 leading-relaxed">تفعيل حالة الطوارئ والحظر الإلكتروني الفوري وعقوبات الكتم الشاملة لمنع أي اختراق هجومي.</span>
                  </button>
                </div>
              </div>
            )}

            {security.enabled ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left controls */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Persona Configuration */}
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-4 h-4 text-red-400" />
                      <span>بيانات وتصميم بوت الحماية (Security Bot Persona)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">اسم البوت (Bot Name)</label>
                        <input
                          type="text"
                          value={security.botName || "GuardBot 🛡️"}
                          onChange={(e) => handleUpdateSecurity("botName", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-red-500 focus:outline-none"
                          placeholder="GuardBot 🛡️"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">أيقونة رمز البوت (Avatar Emoji)</label>
                        <select
                          value={security.botAvatar || "⚡"}
                          onChange={(e) => handleUpdateSecurity("botAvatar", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="⚡">⚡ High Voltage Spark</option>
                          <option value="🛡️">🛡️ Iron Shield</option>
                          <option value="🤖">🤖 Robust Guardian</option>
                          <option value="☣️">☣️ Cyber Threat Shield</option>
                          <option value="🔥">🔥 Plasma Protection</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Verification Gating (Captcha) Configuration */}
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-400" />
                        <span>نظام التحقق بالكبسة والتحقق البشري (Verification Captcha Gate)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleUpdateSecurity("verificationEnabled", !security.verificationEnabled)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                          security.verificationEnabled ? "bg-green-500" : "bg-slate-800"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                          security.verificationEnabled ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    {security.verificationEnabled && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">قناة التحقق (Verification Channel)</label>
                            <select
                              value={security.verificationChannelId}
                              onChange={(e) => handleUpdateSecurity("verificationChannelId", e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                            >
                              {channels.filter(c => c.type === 'text').map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">نص زر التحقق (Verification Button Label)</label>
                            <input
                              type="text"
                              value={security.verificationButtonLabel}
                              onChange={(e) => handleUpdateSecurity("verificationButtonLabel", e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-red-500 focus:outline-none"
                              placeholder="تفعيل الحساب (Verify Profile) ✅"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">رسالة النجاح عند التحقق البشري (Success Message)</label>
                          <textarea
                            value={security.verificationSuccessMessage}
                            onChange={(e) => handleUpdateSecurity("verificationSuccessMessage", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-red-500 focus:outline-none leading-relaxed"
                            placeholder="تهانينا! لقد رصد نظام الحماية هويتك البشرية وتم منحك رتبة العضو وتفعيل الحساب بنجاح. 🔓"
                          />
                        </div>

                        {/* Banner & Embed Color for Security Gate */}
                        <div className="pt-2 border-t border-slate-900/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">رابط بنر بوابة التحقق البشري (Verification Banner URL)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={security.bannerUrl || ""}
                                onChange={(e) => handleUpdateSecurity("bannerUrl", e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none text-left"
                                placeholder="https://images.unsplash.com/..."
                                style={{ direction: 'ltr' }}
                              />
                              {security.bannerUrl && (
                                <button
                                  onClick={() => handleUpdateSecurity("bannerUrl", "")}
                                  className="px-2.5 py-1.5 bg-red-950 border border-red-900 rounded-lg text-xs text-red-400 hover:bg-red-900 hover:text-white transition cursor-pointer"
                                >
                                  إزالة
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1">يظهر البنر أعلى رسالة بوابة حماية التحقق ليكون الترحيب البصري متناسقاً.</p>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">لون إمبد بوابة حماية البوت (Security Embed Color)</label>
                            <div className="flex gap-2 font-mono">
                              <input
                                type="color"
                                value={security.embedColor || "#E74C3C"}
                                onChange={(e) => handleUpdateSecurity("embedColor", e.target.value)}
                                className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                              />
                              <input
                                type="text"
                                value={security.embedColor || "#E74C3C"}
                                onChange={(e) => handleUpdateSecurity("embedColor", e.target.value)}
                                placeholder="#E74C3C"
                                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1">يُنظم اللون الجانبي لرسائل التحقق الأمني ورسائل سجل الحماية (Logs).</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Anti Spam & Filter Safeguards */}
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ListFilter className="w-4 h-4 text-amber-400" />
                      <span>إعدادات الفلترة السريعة والأمن المتقدم (Filters & Anti-Spam Control)</span>
                    </h4>

                    <div className="space-y-4 pt-1">
                      
                      {/* Control Spam Limit */}
                      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-850">
                        <div className="space-y-0.5">
                          <label className="block text-xs font-bold text-slate-205 text-slate-200">حظر إرسال الرسائل المزعج والسبام (Anti-Spam Shield)</label>
                          <p className="text-[10px] text-slate-550 text-slate-500">Limits how many rapid messages a user can stream continuously.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {security.spamProtectionEnabled && (
                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400">الحد الأقصى:</span>
                              <input
                                type="number"
                                min={2}
                                max={30}
                                value={security.maxMessagesPerMinute}
                                onChange={(e) => handleUpdateSecurity("maxMessagesPerMinute", parseInt(e.target.value) || 5)}
                                className="w-10 bg-transparent text-center text-xs text-red-400 font-mono font-bold focus:outline-none"
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUpdateSecurity("spamProtectionEnabled", !security.spamProtectionEnabled)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                              security.spamProtectionEnabled ? "bg-red-500" : "bg-slate-800"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                              security.spamProtectionEnabled ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Control Link Filters */}
                      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-850">
                        <div className="space-y-0.5">
                          <label className="block text-xs font-bold text-slate-200">حظر روابط الدعوات والروابط الضارة (Invite Links Filter)</label>
                          <p className="text-[10px] text-slate-500">Blocks messages with discord.gg invites or unpermitted links.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateSecurity("linkFilterEnabled", !security.linkFilterEnabled)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                            security.linkFilterEnabled ? "bg-red-500" : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                            security.linkFilterEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Control Anti Raid */}
                      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-850">
                        <div className="space-y-0.5">
                          <label className="block text-xs font-bold text-slate-200">تفعيل نظام مضاد الهجمات والرييد الذكي (Anti-Raid Auto Shield)</label>
                          <p className="text-[10px] text-slate-500">Triggers alert sequences and logs suspicious join behavior instantly.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateSecurity("antiRaidEnabled", !security.antiRaidEnabled)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                            security.antiRaidEnabled ? "bg-red-500" : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                            security.antiRaidEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right controls: Word filter list & logs channel */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Bad Words Word Blacklist Database */}
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>قاعدة البيانات اللفظية المحظورة (Swear Word Filter)</span>
                        </h4>
                        <p className="text-[9px] text-slate-500">Automatically filter bad words or advertising keywords.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateSecurity("wordFilterEnabled", !security.wordFilterEnabled)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer ${
                          security.wordFilterEnabled ? "bg-red-500" : "bg-slate-800"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                          security.wordFilterEnabled ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    {security.wordFilterEnabled && (
                      <div className="space-y-3 pt-1">
                        
                        {/* Word Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="مثال: هكر ، حمار..."
                            value={newBadWord}
                            onChange={(e) => setNewBadWord(e.target.value)}
                            onKeyDown={(e) => { if(e.key === "Enter") handleAddBadWord(); }}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-250 focus:outline-none focus:border-red-500 font-sans"
                          />
                          <button
                            type="button"
                            onClick={handleAddBadWord}
                            className="px-3 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة</span>
                          </button>
                        </div>

                        {/* Bad Word Badges */}
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-900/60 rounded-lg border border-slate-850/60 text-right">
                          {security.badWordsList.map((word, wIdx) => (
                            <div
                              key={wIdx}
                              className="flex items-center gap-1.5 px-2 py-0.5 bg-red-955 bg-red-950/40 border border-red-900/40 rounded-md text-[11px] font-bold text-red-300 font-sans"
                            >
                              <span>{word}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBadWord(word)}
                                className="text-red-400 hover:text-red-200 transition-colors"
                              >
                                &times;
                              </button>
                            </div>
                          ))}

                          {security.badWordsList.length === 0 && (
                            <span className="text-[10px] text-slate-400 italic p-1">قائمة الكلمات المحظورة فارغة حالياً.</span>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Security Log Channel Setup */}
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850 font-sans">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-slate-400" />
                      <span>قناة سجل السيكيورتي (Security Logs Channel)</span>
                    </h4>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 font-mono">قناة التقارير الرسمية للبوت (Logs Destination)</label>
                      <select
                        value={security.logsChannelId || ""}
                        onChange={(e) => handleUpdateSecurity("logsChannelId", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="">🚫 تعطيل تقارير سجلات الوقاية</option>
                        {channels.filter(c => c.type === 'text').map(ch => (
                          <option key={ch.id} value={ch.id}>#{ch.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-550 mt-1.5 leading-relaxed">سيقوم البوت بإرسال أي محاولات تخريبية أو إشكالية أو عمليات تفعيل في هذه القناة تلقائياً كرادار واقي.</p>
                    </div>
                  </div>

                  {/* Interactive Attack Diagnostics Trigger */}
                  <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-xs font-semibold text-white">Core Shield Diagnostics</span>
                        <p className="text-[10px] text-text-muted leading-relaxed">Run diagnostics to verify security shield integrity and anti-spam systems.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAddLog({
                          id: crypto.randomUUID(),
                          timestamp: new Date().toLocaleTimeString(),
                          type: "automod",
                          message: "🛡️ [SHIELD INTEGRITY] All quarantine pipelines & security rules checked. Protection is 100% active."
                        });
                      }}
                      className="w-full p-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-[11px] font-medium text-primary flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Run Shield Diagnostics</span>
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-surface border border-border rounded-xl text-text-dim text-xs space-y-1 py-16">
                <Shield className="w-8 h-8 text-border mx-auto mb-2" />
                <span className="block font-medium text-text-muted">Security shield inactive</span>
                <p>Activate the shield to enable defense and anti-spam systems.</p>
              </div>
            )}
          </div>
        )}

        {/* 5. GTA RP SYSTEMS INTEGRATION PANEL */}
        {activeSubTab === "gta-rp" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>GTA RP Bot Settings</span>
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">Configure job salaries, identity cards, and citizen management systems.</p>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2.5 flex-row-reverse">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-100">دليل المبتدئين المتكامل لقراند الحياة الواقعية 💡</h4>
                  <p className="text-[10px] text-slate-400">تابع الخطوات البسيطة أدناه لتصبح خبيراً في تسيير السيرفر خلال دقيقة واحدة!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right pt-2 border-t border-slate-900">
                {/* Step 1 */}
                <div className="p-3.5 bg-slate-900/40 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex items-center gap-2 flex-row-reverse justify-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black flex items-center justify-center font-mono">1</span>
                    <span className="text-xs font-bold text-slate-250">التحكم الفوري (بكبسة زر)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    من لوحة التحكم أدناه، يمكنك تعديل معلومات أي لاعب <span className="text-emerald-400 font-bold">(الوظيفة، المال، الرخص، السيارات)</span> فوراً وبنقرة واحدة بدون الحاجة لأوامر معقدة.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-slate-900/40 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex items-center gap-2 flex-row-reverse justify-start">
                    <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-black flex items-center justify-center font-mono">2</span>
                    <span className="text-xs font-bold text-slate-250">تفعيل الأوامر المباشرة بالديسكورد</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    اكتب الأوامر التفاعلية مثل <span className="text-blue-400 font-bold">/id</span> أو <span className="text-blue-400 font-bold">/profile</span> في شات السيرفر الفعلي، ليرد عليك البوت ببطاقات الهوية والمحاضر الفخمة فوراً.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-slate-900/40 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex items-center gap-2 flex-row-reverse justify-start">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-black flex items-center justify-center font-mono">3</span>
                    <span className="text-xs font-bold text-slate-250">رعاية وازدهار الاقتصاد</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    عندما يكتب الأعضاء أمر <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded text-[9px] font-mono font-bold">!عمل</code> أو <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded text-[9px] font-mono font-bold">!work</code>، سيتم احتساب رواتبهم تلقائياً بناءً على مهنتهم التي حددتها هنا لمواكبة شفت العمل!
                  </p>
                </div>
              </div>

              {/* Commands Cheat-Sheet Section */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-900 text-right space-y-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block font-mono">📋 قائمة الأوامر المدعومة للمواطنين (شات المحاكي)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-850 flex flex-col justify-between">
                    <code className="text-[#3498db] font-bold font-mono">!id أو !هوية</code>
                    <span className="text-[9px] text-slate-400 mt-1">لعرض الهوية ورخص السير والسيارات والمال بالتفصيل.</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-850 flex flex-col justify-between">
                    <code className="text-[#2ecc71] font-bold font-mono">!work أو !عمل</code>
                    <span className="text-[9px] text-slate-400 mt-1">لإنهاء نوبة العمل اليومية والحصول على راتب فوري في الكاش.</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-850 flex flex-col justify-between">
                    <code className="text-[#f1c40f] font-bold font-mono">!dmv buy-license</code>
                    <span className="text-[9px] text-slate-400 mt-1">للقيام بشراء واجتياز اختبار رخصة القيادة برسم $1,500.</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-850 flex flex-col justify-between">
                    <code className="text-[#e67e22] font-bold font-mono">!dmv register [السيارة]</code>
                    <span className="text-[9px] text-slate-400 mt-1">لتسجيل لوحة سيارة جديدة باسمك ورسم ملكيتها بقيمة $2,000.</span>
                  </div>
                </div>

                {/* Admin-only Commands Row */}
                <div className="pt-2 border-t border-slate-900/60 flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-2">
                  <span className="text-[9.5px] font-black text-[#e74c3c] flex items-center gap-1 flex-row-reverse">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-450 inline" />
                    <span>أوامر الإداريين والشرطة الفورية:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 text-[9px] text-slate-350">
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-850 font-mono">
                      <strong className="text-rose-400">!jail @اللاعب [الوقت] [السبب]</strong> - لسجن مواطن
                    </span>
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-850 font-mono">
                      <strong className="text-amber-400">!fine @اللاعب [المبلغ] [السبب]</strong> - لفرض غرامات بنكية
                    </span>
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-850 font-mono">
                      <strong className="text-emerald-400">!transfer @اللاعب [المبلغ]</strong> - لتحويل الأموال لغيرك
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core RP Matrix Setup Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-right">
              
              {/* Left Column: DMV / Economy Config settings */}
              <div className="md:col-span-4 space-y-6">
                
                {/* Bot DMV Settings Box */}
                <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-[#f1c40f] uppercase tracking-widest block font-mono">1. DMV Bot & Vehicles (المرور والمركبات)</span>
                    <h4 className="text-xs font-bold text-slate-300">إعداد كراسة المرور ورخص السير</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 mb-1 font-sans">اسم بوت المرور المخصص (DMV Bot Name)</label>
                      <input 
                        type="text" 
                        defaultValue="مرور لوس سانتوس 🚗"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        id="gta-dmv-bot-name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 mb-1 font-sans">رسوم رخصة القيادة (License Fee Amount)</label>
                      <input 
                        type="number" 
                        defaultValue={1500}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                        id="gta-dmv-fee"
                      />
                    </div>
                  </div>
                </div>

                {/* Bot Police / Jail Settings Box */}
                <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-[#e74c3c] uppercase tracking-widest block font-mono">2. Police Department (جهاز الشرطة)</span>
                    <h4 className="text-xs font-bold text-slate-300">أمن لوس سانتوس المركزي ومحاضر السجن</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-450 mb-1 font-sans">اسم بوت حماية السيرفر (Police Bot Name)</label>
                      <input 
                        type="text" 
                        defaultValue="شرطة لوس سانتوس 👮"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        id="gta-police-bot-name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-450 mb-1 font-sans">الحد الأقصى للسجن (Max Jail Duration)</label>
                      <select 
                        defaultValue="60" 
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
                        id="gta-max-jail"
                      >
                        <option value="30">30 دقيقة (مخالفات قصيرة)</option>
                        <option value="60">60 دقيقة (سجل متوسط)</option>
                        <option value="120">120 دقيقة (قضايا عظمى)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Eco Work Job Payrates */}
                <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-[#2ecc71] uppercase tracking-widest block font-mono">3. Economy & Wages (مستويات الأجور)</span>
                    <h4 className="text-xs font-bold text-slate-300">رواتب ومكافاءات الشفتات</h4>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-slate-900 rounded-md">
                      <span className="text-emerald-400 font-mono font-bold">$3,000</span>
                      <span className="font-bold">رئيس الشرطة / شفت الأمن</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-900 rounded-md">
                      <span className="text-emerald-400 font-mono font-bold">$1,800</span>
                      <span className="font-bold">مسعف البلدية / الإسعاف</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-900 rounded-md">
                      <span className="text-emerald-400 font-mono font-bold">$1,500</span>
                      <span className="font-bold">سائق تاكسي / خدمة النقل</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-900 rounded-md">
                      <span className="text-emerald-400 font-mono font-bold">$4,500</span>
                      <span className="font-bold">عصابة تهريب (مكسب عالي المخاطر)</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Right Column: Citizen ID database directory */}
              <div className="md:col-span-8 flex flex-col">
                <div className="p-5 bg-slate-950 rounded-xl space-y-4 border border-slate-850 flex-1 flex flex-col">
                  <div className="space-y-1 pb-3 border-b border-slate-900">
                    <span className="text-[10px] font-extrabold text-[#3498db] uppercase tracking-widest block font-mono">4. Citizens Interactive Directory (سجلات الأحوال المدنية)</span>
                    <h4 className="text-sm font-bold text-slate-200">إدارة بطاقات المواطنين والتحكم الإمبراطوري</h4>
                    <p className="text-[10px] text-slate-500">انقر على أي مواطن لتعديل مركباته، أو ترقيته في السلك الوظيفي، أو منح/خصم مكاسبه المالية فورا لتحديث بياناته السحابية وبث التغييرات لحسابه بالديسكورد مباشرة.</p>
                  </div>
                  
                  {/* Members directory loop */}
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {members.filter(m => !m.isBot).map((citizen) => (
                      <div 
                        key={citizen.id}
                        className="p-4 bg-slate-900/60 rounded-xl border border-slate-850/80 hover:border-slate-800 transition duration-150 relative overflow-hidden"
                      >
                        {/* citizen stats inline summary */}
                        <div className="flex flex-col sm:flex-row-reverse sm:items-center justify-between gap-4">
                          
                          {/* Person base profile and avatar */}
                          <div className="flex items-center gap-3 flex-row-reverse">
                            <span className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow select-none font-sans font-bold">
                              {citizen.avatar}
                            </span>
                            <div className="text-right">
                              <h5 className="text-xs font-black text-white hover:text-indigo-300 transition cursor-pointer flex items-center justify-end gap-1.5 flex-row-reverse">
                                <span>{citizen.username}</span>
                                <span className="text-[9px] text-slate-500 font-mono font-semibold">#{citizen.discriminator}</span>
                              </h5>
                              <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: citizen.roleColor }}>
                                {citizen.role}
                              </span>
                            </div>
                          </div>

                          {/* citizen RP attributes blocks */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-right">
                            <div className="bg-slate-950 p-2 rounded border border-slate-850/60">
                              <span className="block text-[8px] text-slate-500 font-extrabold font-sans">الوظيفة (GTA Job)</span>
                              <span className="text-[11px] font-black text-slate-350">{citizen.rpJob || "عاطل عن العمل 👤"}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-850/60 font-mono">
                              <span className="block text-[8px] text-slate-500 font-extrabold font-sans">الكاش (Wallet)</span>
                              <span className="text-[11px] font-extrabold text-[#2ecc71]">${(citizen.rpCash || 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-850/60 font-mono">
                              <span className="block text-[8px] text-slate-500 font-extrabold font-sans">البنك (Bank)</span>
                              <span className="text-[11px] font-extrabold text-[#3498db]">${(citizen.rpBank || 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-850/60">
                              <span className="block text-[8px] text-slate-500 font-extrabold font-sans">رخصة القيادة</span>
                              <span className={`text-[11px] font-black ${
                                citizen.rpLicense === 'Active' 
                                  ? "text-emerald-400" 
                                  : citizen.rpLicense === 'Suspended' 
                                    ? "text-amber-500" 
                                    : "text-red-400"
                              }`}>
                                {citizen.rpLicense === 'Active' ? "فعّالة ✅" : citizen.rpLicense === 'Suspended' ? "موقوفة ⚠️" : "غير متوفرة ❌"}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Owner vehicles */}
                        <div className="mt-3.5 pt-2 border-t border-slate-850 flex flex-wrap gap-2 items-center justify-end">
                          <span className="text-[9px] text-slate-500 font-bold ml-auto block">المركبات المسجلة:</span>
                          {(citizen.rpCars || []).length > 0 ? (
                            (citizen.rpCars || []).map((carName, cidx) => (
                              <span key={cidx} className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[9px] text-slate-300 font-bold font-sans">
                                {carName}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-600 italic">لا توجد مركبات مسجلة باسمه</span>
                          )}
                        </div>

                        {/* Citizen Quick Action bar controllers (DMV, Jobs) */}
                        <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-start gap-1.5 flex-wrap">
                          
                          {/* Give Driver License toggle button */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatusMap: Record<string, 'Active' | 'None' | 'Suspended'> = {
                                'None': 'Active',
                                'Active': 'Suspended',
                                'Suspended': 'None'
                              };
                              const current = citizen.rpLicense || 'None';
                              const next = nextStatusMap[current];
                              
                              setMembers(prev => prev.map(m => m.id === citizen.id ? { ...m, rpLicense: next } : m));
                              onAddLog({
                                id: crypto.randomUUID(),
                                timestamp: new Date().toLocaleTimeString(),
                                type: "system",
                                message: `🪪 [DMV ADMIN] Changed driving license status of @${citizen.username} to [${next}]`
                              });
                            }}
                            className="px-2.5 py-1 bg-indigo-950/40 hover:bg-indigo-950 border border-indigo-900/30 text-indigo-300 rounded text-[10px] font-bold active:scale-95 transition cursor-pointer"
                          >
                            🪪 رخصة سير ({citizen.rpLicense === 'Active' ? "إلغاء رخصة" : "تفعيل رخصة"})
                          </button>

                          {/* Give cash bonuses */}
                          <button
                            type="button"
                            onClick={() => {
                              const bonus = 5000;
                              setMembers(prev => prev.map(m => m.id === citizen.id ? { ...m, rpBank: (m.rpBank || 0) + bonus } : m));
                              onAddLog({
                                id: crypto.randomUUID(),
                                timestamp: new Date().toLocaleTimeString(),
                                type: "system",
                                message: `💰 [ECONOMY ADMIN] Dispatched $5,000 allowance to Bank of @${citizen.username}`
                              });
                            }}
                            className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-900/30 text-emerald-300 rounded text-[10px] font-bold active:scale-95 transition cursor-pointer font-mono"
                          >
                            💰 صرف منحة $5K
                          </button>

                          {/* Job change selector dropdown */}
                          <div className="flex items-center gap-1">
                            <select
                              value={citizen.rpJob || "عاطل عن العمل 👤"}
                              onChange={(e) => {
                                const newJobVal = e.target.value;
                                setMembers(prev => prev.map(m => m.id === citizen.id ? { ...m, rpJob: newJobVal } : m));
                                onAddLog({
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString(),
                                  type: "system",
                                  message: `💼 [CITIZEN JOBS] Reassigned @${citizen.username} to new roleplay job: [${newJobVal}]`
                                });
                              }}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded text-[10px] font-bold cursor-pointer focus:outline-none"
                            >
                              <option value="عاطل عن العمل 👤">👤 عاطل عن العمل (Unemployed)</option>
                              <option value="رئيس الشرطة 👮">👮 رئيس الشرطة (Police Captain)</option>
                              <option value="شرطي مرور 👮">👮 شرطي مرور (Traffic Police)</option>
                              <option value="مسعف البلدية 🩺">🩺 مسعف البلدية (Medic Dispatch)</option>
                              <option value="سائق تاكسي 🚕">🚕 سائق تاكسي (Taxi Chauffeur)</option>
                              <option value="ملاك معرض سيارات 🏎️">🏎️ معارض سيارات (DMV Showroom)</option>
                              <option value="قاضي المحكمة ⚖️">⚖️ قاضي المحكمة (Judiciary Court)</option>
                              <option value="عصابة تهريب 🕶️">🕶️ عصابات تهريب (Smuggler Cartel)</option>
                            </select>
                            <span className="text-[9px] text-slate-500 font-sans pr-1">:تعديل المهنية</span>
                          </div>

                          {/* Quick Clear records */}
                          {(citizen.rpWarnings || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setMembers(prev => prev.map(m => m.id === citizen.id ? { ...m, rpWarnings: 0 } : m));
                                onAddLog({
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString(),
                                  type: "system",
                                  message: `😇 [JAIL ADMIN] Amnesty for @${citizen.username}: warnings counter cleared successfully`
                                });
                              }}
                              className="px-2 py-1 bg-rose-955 bg-rose-950/40 border border-rose-900/40 hover:bg-rose-950 text-rose-300 rounded text-[9px] font-bold transition cursor-pointer"
                            >
                              😇 عفو وتصفير السوابق ({citizen.rpWarnings} مخالفات)
                            </button>
                          )}

                          {/* Add manual car to player! */}
                          <button
                            type="button"
                            onClick={() => {
                              const carChoices = [
                                "بوقاتي تشيرون 🏎️", "رولز رويس فانتوم 🚘", "مكلارين P1 🏁", 
                                "شفروليه تاهو 🚔", "شفروليه كورفيت 🏎️", "مرسيدس G-Class 🚙"
                              ];
                              const r = carChoices[Math.floor(Math.random() * carChoices.length)];
                              const updatedCars = [...(citizen.rpCars || []), r];
                              
                              setMembers(prev => prev.map(m => m.id === citizen.id ? { ...m, rpCars: updatedCars } : m));
                              onAddLog({
                                id: crypto.randomUUID(),
                                timestamp: new Date().toLocaleTimeString(),
                                type: "system",
                                message: `🚗 [DMV REGISTRATION] Issued dynamic car keys of "${r}" to Citizen @${citizen.username}`
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-955 bg-amber-950/40 border border-amber-900/30 hover:bg-amber-950 text-amber-300 rounded text-[10px] font-bold active:scale-95 transition cursor-pointer ml-auto"
                          >
                            + إضافة مركبة كلاسيكية (Car)
                          </button>

                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* 5a. SUGGESTIONS PANEL */}
        {activeSubTab === "suggestions" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-emerald-950/20 border border-emerald-950 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-emerald-300">💡 نظام الاقتراحات وإشراك المجتمع المتكامل (Suggestions Bot)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  قم بتمكين هذا النظام لنشر اقتراحات الأعضاء مباشرة في الروم المخصص للتصويت مع تفعيل التصويت التلقائي بأزرار الموافقة والرفض. تستقبل الإدارة كافة الاقتراحات هنا لتعديل لوائحه من "معلق" إلى "مقبول" أو "مرفوض" مع إرفاق تعليق إداري مبرر.
                </p>
              </div>
            </div>

            {/* Config details suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right" style={{ direction: "rtl" }}>
              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">اسم بوت الاقتراحات (Suggestions Bot Name)</span>
                <input
                  type="text"
                  value={suggestion.botName}
                  onChange={(e) => setSuggestion({ ...suggestion, botName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200"
                  placeholder="SuggestBot 💡"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">أيقونة البوت (Bot Avatar Emoji)</span>
                <input
                  type="text"
                  value={suggestion.botAvatar}
                  onChange={(e) => setSuggestion({ ...suggestion, botAvatar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200"
                  placeholder="💡"
                />
              </div>

              <div className="space-y-1.5 font-sans md:col-span-2">
                <span className="text-[11px] font-extrabold text-slate-405">قناة نشر الاقتراحات (Target Channel)</span>
                <select
                  value={suggestion.channelId}
                  onChange={(e) => setSuggestion({ ...suggestion, channelId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none text-slate-200 cursor-pointer"
                >
                  {channels.filter(c => c.type === 'text').map(ch => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>

              {/* Banner & Embed Color for Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block">رابط بنر لوحة الاقتراحات (Banner Image Link)</span>
                  <input
                    type="text"
                    value={suggestion.bannerUrl || ""}
                    onChange={(e) => setSuggestion({ ...suggestion, bannerUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none text-slate-200 text-left"
                    style={{ direction: 'ltr' }}
                    placeholder="https://images.unsplash.com/... for embedding visuals"
                  />
                </div>

                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block">لون إمبيد الاقتراحات (Suggestion Embed Color)</span>
                  <div className="flex gap-2 font-mono">
                    <input
                      type="color"
                      value={suggestion.embedColor || "#3498DB"}
                      onChange={(e) => setSuggestion({ ...suggestion, embedColor: e.target.value })}
                      className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                    />
                    <input
                      type="text"
                      value={suggestion.embedColor || "#3498DB"}
                      onChange={(e) => setSuggestion({ ...suggestion, embedColor: e.target.value })}
                      placeholder="#3498DB"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-250 text-center focus:border-indigo-500 focus:outline-none animate-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Discord Embedded Preview for Suggestions */}
            <div className="space-y-2 select-none text-right font-sans animate-fade-in" style={{ direction: "rtl" }}>
              <span className="block text-[11px] font-extrabold uppercase text-slate-500 font-sans">Visual Suggestions Card Preview (معاينة بطاقة المقترحات التفاعلية في الديسكورد)</span>
              
              <div className="bg-[#2b2d31] p-0 rounded-xl border-l-4 max-w-full shadow-xl overflow-hidden font-sans relative text-right" style={{ borderLeftColor: suggestion.embedColor || "#3498DB" }}>
                <div className="absolute left-3 top-3 text-[10px] text-white/40 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">Suggestions Board</div>
                
                {suggestion.bannerUrl && (
                  <div className="w-full h-28 overflow-hidden relative border-b border-[#202225]">
                    <img
                      src={suggestion.bannerUrl}
                      alt="Suggestions Banner"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 justify-start flex-row-reverse">
                    <span className="text-sm">{suggestion.botAvatar || "💡"}</span>
                    <span className="text-xs font-bold text-slate-200">{suggestion.botName || "SuggestBot 💡"}</span>
                    <span className="text-[10px] bg-[#5865f2] px-1 rounded text-white text-[9px] scale-90 font-mono font-bold">BOT</span>
                  </div>
                  
                  <div className="border-t border-[#3f4147] pt-2 space-y-1 text-right">
                    <span className="text-[10px] text-[#2ecc71] font-bold block">💡 اقتراح جديد للترقية والتطوير:</span>
                    <p className="text-xs text-[#dbdee1] bg-[#111214]/65 p-2.5 rounded border border-[#1e1f22] italic font-sans leading-relaxed">
                      "نقترح إضافة متجر متكامل بالكامل يُمكّن الأعضاء من شراء رتب صوتية مخصصة ومميزة ومحفزة للتفاعل اليومي بالسيرفر."
                    </p>
                  </div>
                  
                  {suggestion.anonymous ? (
                    <div className="text-[10px] text-[#949ba4] font-semibold text-right">👤 كاتب الاقتراح: عضو مجهول الهوية (Anonymous)</div>
                  ) : (
                    <div className="text-[10px] text-[#949ba4] font-semibold text-right">👤 كاتب الاقتراح: @papy615 (المعرف الرقمي للمقترح: #1004)</div>
                  )}

                  {/* Vote Mockup Buttons */}
                  <div className="flex gap-2 pt-1 font-sans justify-start flex-row-reverse">
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-[#248046] text-white rounded font-bold text-[11px] shadow hover:bg-opacity-95 select-none cursor-pointer">
                      <span>👍 موافق (25)</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-[#da373c] text-white rounded font-bold text-[11px] shadow hover:bg-opacity-95 select-none cursor-pointer">
                      <span>👎 معارض (3)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox toggles suggestions */}
            <div className="flex flex-wrap gap-4 font-sans text-right justify-end select-none" style={{ direction: "rtl" }}>
              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold font-sans">
                <input
                  type="checkbox"
                  checked={suggestion.enabled}
                  onChange={(e) => {
                    setSuggestion({ ...suggestion, enabled: e.target.checked });
                    onAddLog({
                      id: crypto.randomUUID(),
                      timestamp: new Date().toLocaleTimeString(),
                      type: "system",
                      message: `💡 Suggestions Engine state toggled: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`
                    });
                  }}
                  className="accent-indigo-550 w-4 h-4 cursor-pointer font-sans"
                />
                <span>تنشيط نظام بوت الاقتراحات بالكامل</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold">
                <input
                  type="checkbox"
                  checked={suggestion.autoReact}
                  onChange={(e) => setSuggestion({ ...suggestion, autoReact: e.target.checked })}
                  className="accent-indigo-550 w-4 h-4 cursor-pointer"
                />
                <span>تفعيل التفاعل التلقائي بالايموجيات (Auto-Reaction ✅/❌)</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold font-sans">
                <input
                  type="checkbox"
                  checked={suggestion.anonymous}
                  onChange={(e) => setSuggestion({ ...suggestion, anonymous: e.target.checked })}
                  className="accent-indigo-550 w-4 h-4 cursor-pointer"
                />
                <span>اقتراحات مجهولة بدون إظهار اسم العضو الراسل</span>
              </label>
            </div>

            {/* Table of active suggestions */}
            <div className="space-y-3 text-right font-sans" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2">📋 الاقتراحات المرفوعة من المجتمع ومراجعتها</h4>

              {suggestion.suggestionsList.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                  <span className="text-xl">💡</span>
                  <p className="text-[11px] text-slate-500 font-bold">لم يقم الأعضاء بنشر أي اقتراحات في الروم حتى الآن.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-extrabold border-b border-slate-850">
                        <th className="p-3">العضو الراسل</th>
                        <th className="p-3">الاقتراح بالكامل</th>
                        <th className="p-3 text-center col-span-1">التصويتات المؤيدة (👍)</th>
                        <th className="p-3 text-center col-span-1">التصويتات المعارضة (👎)</th>
                        <th className="p-3">ملاحظة المدير ومبررات القرار</th>
                        <th className="p-3 font-sans">الحالة الحالية</th>
                        <th className="p-3 text-center">الإجراء الفوري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {suggestion.suggestionsList.map((sug) => (
                        <tr key={sug.id} className="hover:bg-slate-900/40 font-sans">
                          <td className="p-3 font-bold text-slate-350 flex items-center gap-2">
                            <span>{sug.avatar}</span>
                            <span>{suggestion.anonymous ? "عضو مجهول" : `@${sug.username}`}</span>
                          </td>
                          <td className="p-3 max-w-[280px] break-words text-slate-200 font-semibold leading-relaxed">
                            {sug.content}
                          </td>
                          <td className="p-3 text-center font-mono text-green-500 font-black">
                            {sug.upvotes} 👍
                          </td>
                          <td className="p-3 text-center font-mono text-red-500 font-black">
                            {sug.downvotes} 👎
                          </td>
                          <td className="p-3 min-w-[200px]">
                            {sug.status === 'pending' ? (
                              <input
                                type="text"
                                placeholder="إرفاق مبررات القبول أو الرفض للمجتمع..."
                                value={adminReplyText[sug.id] || ""}
                                onChange={(e) => setAdminReplyText({ ...adminReplyText, [sug.id]: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {sug.adminNotes || "لا توجد ملاحظة إضافية"}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-sans">
                            {sug.status === 'pending' ? (
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-500 border border-amber-950 text-[10px] font-black uppercase">قيد التصويت</span>
                            ) : sug.status === 'approved' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-black uppercase">مقبول ومعتمد ✅</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-955 text-[10px] font-black uppercase">مرفوض ❌</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {sug.status === 'pending' ? (
                              <div className="flex justify-center gap-1.5 select-none text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const notes = adminReplyText[sug.id] || "نشكرك على اقتراحك الرائع! تم اعتماد الفكرة وسيتم تطبيقها قريباً من الإدارة العليا.";
                                    const updatedList = suggestion.suggestionsList.map(item =>
                                      item.id === sug.id ? { ...item, status: 'approved' as const, adminNotes: notes } : item
                                    );
                                    setSuggestion({ ...suggestion, suggestionsList: updatedList });
                                    onAddLog({
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString(),
                                      type: "ticket",
                                      message: `💡 Suggestion #${sug.id} APPROVED by admin: "${notes}"`
                                    });
                                  }}
                                  className="px-2 py-1 bg-emerald-600 rounded text-white font-black hover:bg-emerald-500 transition cursor-pointer active:scale-95"
                                >
                                  اعتماد 👍
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const notes = adminReplyText[sug.id] || "نعتذر منك، تم رفض الفكرة لعدم ملائمتها لسياسة وخطة السيرفر الحالية.";
                                    const updatedList = suggestion.suggestionsList.map(item =>
                                      item.id === sug.id ? { ...item, status: 'rejected' as const, adminNotes: notes } : item
                                    );
                                    setSuggestion({ ...suggestion, suggestionsList: updatedList });
                                    onAddLog({
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString(),
                                      type: "ticket",
                                      message: `💡 Suggestion #${sug.id} REJECTED by admin`
                                    });
                                  }}
                                  className="px-2 py-1 bg-rose-600 rounded text-white font-black hover:bg-rose-500 transition cursor-pointer active:scale-95"
                                >
                                  رفض ❌
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[11px] font-bold">- مغلق -</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5b. REPORTS PANEL */}
        {activeSubTab === "reports" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-amber-955 bg-amber-950/20 border border-amber-950 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-300 font-sans">🚨 نظام البلاغات والشكاوى السرية المباشرة (Reports System)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  يسمح هذا البوت لأعضاء السيرفر برفع شكاوى سرية للغاية مع إرفاق روابط الأدلة وصور المشاكل. تصل الشكاوى فوراً وبشكل مغلق للإداريين لتحقيق الخصوصية، ومزودة بأزرار الحل الفوري أو رفض البلاغ مع تسجيل تفاصيل الشكاوى.
                </p>
              </div>
            </div>

            {/* Reports Settings inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right font-sans" style={{ direction: "rtl" }}>
              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">اسم بوت البلاغات والشكاوى (Reports Bot Name)</span>
                <input
                  type="text"
                  value={report.botName}
                  onChange={(e) => setReport({ ...report, botName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none text-slate-200"
                  placeholder="ReportBot 🚨"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">أيقونة البوت التفاعلية (Bot Avatar)</span>
                <input
                  type="text"
                  value={report.botAvatar}
                  onChange={(e) => setReport({ ...report, botAvatar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none text-slate-200"
                  placeholder="⚠️"
                />
              </div>

              <div className="space-y-1.5 font-sans md:col-span-2">
                <span className="text-[11px] font-extrabold text-slate-400">قناة استقبال الشكاوى للإدارة (Staff Logs Channel)</span>
                <select
                  value={report.logsChannelId}
                  onChange={(e) => setReport({ ...report, logsChannelId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none text-slate-200 cursor-pointer"
                >
                  {channels.filter(c => c.type === 'text').map(ch => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>

              {/* Banner & Embed Color for Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1">
                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block">بنر نظام الشكاوى (Complaint Header Banner URL)</span>
                  <input
                    type="text"
                    value={report.bannerUrl || ""}
                    onChange={(e) => setReport({ ...report, bannerUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none text-slate-200 text-left"
                    style={{ direction: 'ltr' }}
                    placeholder="https://images.unsplash.com/... for aesthetic appeal"
                  />
                </div>

                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block">لون إمبيد البلاغات (Report Embed Color)</span>
                  <div className="flex gap-2 font-mono">
                    <input
                      type="color"
                      value={report.embedColor || "#E67E22"}
                      onChange={(e) => setReport({ ...report, embedColor: e.target.value })}
                      className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                    />
                    <input
                      type="text"
                      value={report.embedColor || "#E67E22"}
                      onChange={(e) => setReport({ ...report, embedColor: e.target.value })}
                      placeholder="#E67E22"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-250 text-center focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Discord Embedded Preview for Reports */}
            <div className="space-y-2 select-none text-right font-sans animate-fade-in" style={{ direction: "rtl" }}>
              <span className="block text-[11px] font-extrabold uppercase text-slate-500 font-sans">Visual Reports Embed Preview (معاينة بطاقة البلاغات والشكاوى في الديسكورد)</span>
              
              <div className="bg-[#2b2d31] p-0 rounded-xl border-l-4 max-w-full shadow-xl overflow-hidden font-sans relative text-right" style={{ borderLeftColor: report.embedColor || "#E67E22" }}>
                <div className="absolute left-3 top-3 text-[10px] text-white/40 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">Reports Logs</div>
                
                {report.bannerUrl && (
                  <div className="w-full h-28 overflow-hidden relative border-b border-[#202225]">
                    <img
                      src={report.bannerUrl}
                      alt="Reports Banner"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="p-4 space-y-2.5 text-right">
                  <div className="flex items-center gap-1.5 justify-start flex-row-reverse">
                    <span className="text-sm">{report.botAvatar || "⚠️"}</span>
                    <span className="text-xs font-bold text-slate-200">{report.botName || "ReportBot 🚨"}</span>
                    <span className="text-[10px] bg-[#5865f2] px-1 rounded text-white text-[9px] scale-90 font-mono font-bold">BOT</span>
                  </div>
                  
                  <div className="border-t border-[#3f4147] pt-2 space-y-1.5 text-xs text-[#dbdee1]">
                    <div className="grid grid-cols-2 gap-2 text-right justify-start flex-row-reverse">
                      <div className="text-right">
                        <span className="block text-[10px] text-[#949ba4]">👤 المشتكي:</span>
                        <span className="font-bold">@ReporterMember</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-[#da373c] font-bold">🎯 المشتكى عليه:</span>
                        <span className="font-bold">@ViolatorUser</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="block text-[10px] text-[#949ba4]">⚠️ سبب الشكوى والمخالفة:</span>
                      <span className="font-semibold text-white">"محاولة تخريب السيرفر وإزعاج الأعضاء في الشات العام ومخالفة قوانين السيرفر المتكررة."</span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-[#949ba4]">📎 المرفقات وروابط الإثبات:</span>
                      <span className="text-[#3498db] underline font-mono text-[10px] break-all">https://example.com/proof-screenshot-12.png</span>
                    </div>
                  </div>

                  {/* Actions buttons mockup resembling Discord Buttons attached to log */}
                  <div className="flex gap-2 pt-1 font-sans justify-start flex-row-reverse">
                    <button className="flex items-center gap-1 px-2.5 py-1 bg-[#248046] text-white rounded font-bold text-[10px] shadow select-none cursor-pointer">
                      <span>✅ حل الشكوى (Resolve)</span>
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1 bg-[#da373c] text-white rounded font-bold text-[10px] shadow select-none cursor-pointer">
                      <span>❌ رفض البلاغ (Reject)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex select-none text-right justify-end font-sans" style={{ direction: "rtl" }}>
              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold">
                <input
                  type="checkbox"
                  checked={report.enabled}
                  onChange={(e) => setReport({ ...report, enabled: e.target.checked })}
                  className="accent-indigo-550 w-4 h-4"
                />
                <span>تفعيل نظام البلاغات والشكاوى بالكامل في السيرفر</span>
              </label>
            </div>

            {/* List of active reports */}
            <div className="space-y-3 text-right font-sans" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2">📂 سجلات البلاغات المستلمة في الإدارة العامة</h4>

              {report.reportsList.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 border border-slate-850 rounded-xl">
                  <span className="text-xl">🚨</span>
                  <p className="text-[11px] text-slate-500 font-bold">كل شيء هادئ! لا توجد شكاوى أو بلاغات مسجلة حالياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950 font-sans">
                  <table className="w-full text-right border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-extrabold border-b border-slate-850">
                        <th className="p-3">العضو المشتكي</th>
                        <th className="p-3">العضو المشتكى عليه</th>
                        <th className="p-3 font-sans">سبب البلاغ والمخالفة</th>
                        <th className="p-3">رابط الدليل / الإثبات المرسل</th>
                        <th className="p-3">وقت تقديم البلاغ</th>
                        <th className="p-3 font-sans">ملاحظات التحقيق</th>
                        <th className="p-3 font-sans">حالة الشكوى</th>
                        <th className="p-3 text-center">التصرف الإداري السريع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {report.reportsList.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-slate-350">@{rep.reporter}</td>
                          <td className="p-3 font-black text-rose-400">@{rep.reportedUser}</td>
                          <td className="p-3 font-semibold text-slate-200 leading-relaxed font-sans">{rep.reason}</td>
                          <td className="p-3 font-mono text-[11px] text-indigo-450 font-black">
                            {rep.proof ? (
                              <a href={rep.proof} target="_blank" rel="noopener noreferrer" className="hover:underline">📎 استعراض المرفق (الأدلة)</a>
                            ) : (
                              <span className="text-slate-600">بدون دليل مصور</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{rep.timestamp}</td>
                          <td className="p-3 min-w-[180px]">
                            {rep.status === 'pending' ? (
                              <input
                                type="text"
                                placeholder="نتائج مراجعة الدليل الإدارية..."
                                value={adminReplyText[rep.id] || ""}
                                onChange={(e) => setAdminReplyText({ ...adminReplyText, [rep.id]: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {rep.adminNotes || "تمت التسوية بنجاح"}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {rep.status === 'pending' ? (
                              <span className="px-2 py-0.5 rounded bg-amber-955 bg-amber-950 text-amber-500 border border-amber-950 text-[10px] font-black uppercase">قيد الفرز</span>
                            ) : rep.status === 'under_review' ? (
                              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-450 border border-sky-900 text-[10px] font-black uppercase-none">تحت التحقيق</span>
                            ) : rep.status === 'resolved' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-black uppercase">مقبول / معاقب ✅</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-955 bg-rose-950 text-rose-400 border border-rose-955 text-[10px] font-black uppercase">حفظ للرفض 🚫</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {rep.status === 'pending' ? (
                              <div className="flex justify-center gap-1.5 select-none text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const note = adminReplyText[rep.id] || "تم إدانة العضو ومعاقبته فوراً استناداً للدليل المرسل.";
                                    const updated = report.reportsList.map(r => r.id === rep.id ? { ...r, status: 'resolved' as const, adminNotes: note } : r);
                                    setReport({ ...report, reportsList: updated });
                                    onAddLog({
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString(),
                                      type: "automod",
                                      message: `🚨 Report #${rep.id} RESOLVED: Penalty applied to @${rep.reportedUser}`
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded font-black transition cursor-pointer active:scale-95"
                                >
                                  حل وعقوبة
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const note = adminReplyText[rep.id] || "تم حفظ البلاغ لعدم كفاية الأدلة أو عدم توافقها مع الواقعة.";
                                    const updated = report.reportsList.map(r => r.id === rep.id ? { ...r, status: 'dismissed' as const, adminNotes: note } : r);
                                    setReport({ ...report, reportsList: updated });
                                    onAddLog({
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString(),
                                      type: "system",
                                      message: `🚨 Report #${rep.id} DISMISSED`
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 text-white hover:bg-rose-500 rounded font-black transition cursor-pointer active:scale-95"
                                >
                                  رفض وحفظ البلاغ
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[11px] font-bold font-sans">- مقفل -</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5c. WARNINGS PANEL */}
        {activeSubTab === "warnings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-rose-950/20 border border-rose-955 border-rose-950 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-rose-300">🔨 نظام التحذيرات والعقوبات التراكمية (Warnings & Infractions)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-sans">
                  حافظ على انضباط سيرفرك بدقة فائقة! يمكنك التحكم بأقصى عدد من التحذيرات التي يحصل عليها العضو قبل تطبيق الإجراء التلقائي الصارم (Ban/Kick/Mute). تستطيع الإدارة العامة كذلك كتابة تفاصيل كل تحذير وإصدارها أو سحبها بلحظة واحدة.
                </p>
              </div>
            </div>

            {/* Config warning limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right justify-end font-sans placeholder-slate-705" style={{ direction: "rtl" }}>
              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">اسم بوت إدارة العقوبات والتحذيرات</span>
                <input
                  type="text"
                  value={warning.botName}
                  onChange={(e) => setWarning({ ...warning, botName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-rose-500 focus:outline-none text-slate-200"
                  placeholder="PunishBot 🔨"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">الحد الأقصى للتحذيرات قبل الطرد أو الحظر (Max Warnings)</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={warning.maxWarningsBeforeBan}
                  onChange={(e) => setWarning({ ...warning, maxWarningsBeforeBan: parseInt(e.target.value) || 3 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold font-mono focus:border-rose-500 focus:outline-none text-slate-200"
                />
              </div>

              {/* Banner & Embed Color for Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block">رابط البنر التوضيحي (Banner URL)</span>
                  <input
                    type="text"
                    value={warning.bannerUrl || ""}
                    onChange={(e) => setWarning({ ...warning, bannerUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:border-rose-500 focus:outline-none text-slate-200 text-left"
                    style={{ direction: 'ltr' }}
                    placeholder="https://images.unsplash.com/... for warning layout embed"
                  />
                </div>

                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block">لون إمبيد التحذيرات (Warning Embed Color)</span>
                  <div className="flex gap-2 font-mono">
                    <input
                      type="color"
                      value={warning.embedColor || "#E74C3C"}
                      onChange={(e) => setWarning({ ...warning, embedColor: e.target.value })}
                      className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                    />
                    <input
                      type="text"
                      value={warning.embedColor || "#E74C3C"}
                      onChange={(e) => setWarning({ ...warning, embedColor: e.target.value })}
                      placeholder="#E74C3C"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-250 text-center focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex select-none text-right justify-end font-sans" style={{ direction: "rtl" }}>
              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold font-sans">
                <input
                  type="checkbox"
                  checked={warning.enabled}
                  onChange={(e) => setWarning({ ...warning, enabled: e.target.checked })}
                  className="accent-rose-550 w-4 h-4"
                />
                <span>تفعيل نظام العقوبات ومراقبة التحذيرات وإجراء الحظر التلقائي</span>
              </label>
            </div>

            {/* List and warn tools */}
            <div className="space-y-4 text-right font-sans" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2">📋 لائحة العقوبات وسجلات المخالفات الحالية بداخل السيرفر</h4>

              {warning.warningsList.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 border border-slate-850 rounded-xl font-sans">
                  <span className="text-xl">🕊️</span>
                  <p className="text-[11px] text-slate-500 font-bold">السيرفر يسوده السلام والمحبة التامة، خالي من أي مخالفات أو عقوبات مسجلة!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950 font-sans">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-extrabold border-b border-slate-850">
                        <th className="p-3">العضو المخالف</th>
                        <th className="p-3">المشرف مصدر العقوبة</th>
                        <th className="p-3 font-sans">سبب التنبيه / المخالفة</th>
                        <th className="p-3">تاريخ العقوبة</th>
                        <th className="p-3 text-center">التحكم الفوري والسحب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {warning.warningsList.map((warn) => (
                        <tr key={warn.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-rose-400">@{warn.username}</td>
                          <td className="p-3 font-medium text-slate-350">@{warn.adminName}</td>
                          <td className="p-3 text-slate-200 font-semibold font-sans">{warn.reason}</td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{warn.timestamp}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = warning.warningsList.filter(item => item.id !== warn.id);
                                setWarning({ ...warning, warningsList: filtered });
                                onAddLog({
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString(),
                                  type: "automod",
                                  message: `🔨 Cleared 1 warning from @${warn.username} by setup controller.`
                                });
                              }}
                              className="px-2.5 py-1 bg-rose-950 text-rose-400 hover:bg-rose-905 hover:bg-rose-900 hover:text-white rounded text-[10px] font-black cursor-pointer transition select-none active:scale-95"
                            >
                              سحب التنبيه 🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOD LOGS SYSTEM */}
        {activeSubTab === "mod-logs" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span>نظام السجلات واللوقات (Mod Logs System)</span>
                </h3>
                <p className="text-xs text-slate-500">تتبع جميع أحداث السيرفر: الرسائل المحذوفة، الرتب المعدلة، حالات الطرد والباند، وتعديلات القنوات.</p>
              </div>
              <button
                onClick={() => setModLogs({ ...modLogs, enabled: !modLogs.enabled })}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  modLogs.enabled
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-slate-850 text-slate-500 border border-slate-700"
                }`}
              >
                {modLogs.enabled ? "🟢 مفعل" : "🔴 معطل"}
              </button>
            </div>

            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-300">إعدادات رومات المراقبة (Log Channels)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'logChannelId', label: 'روم السجلات الرئيسي', placeholder: 'اختر روم للسجلات...' },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">{field.label}</label>
                    <select
                      value={(modLogs as any)[field.key] || ''}
                      onChange={(e) => setModLogs({ ...modLogs, [field.key]: e.target.value })}
                      className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- اختر روم --</option>
                      {channels.filter(c => c.type === 'text').map(ch => (
                        <option key={ch.id} value={ch.id}>#{ch.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-300 mb-3">الأحداث المطلوب تسجيلها</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { key: 'logMessageDeletes', label: 'حذف الرسائل', icon: '🗑️' },
                    { key: 'logMessageEdits', label: 'تعديل الرسائل', icon: '✏️' },
                    { key: 'logMemberBans', label: 'حظر الأعضاء', icon: '🔨' },
                    { key: 'logMemberKicks', label: 'طرد الأعضاء', icon: '👢' },
                    { key: 'logMemberTimeouts', label: 'كتم الأعضاء', icon: '🔇' },
                    { key: 'logRoleChanges', label: 'تعديل الرتب', icon: '🎭' },
                    { key: 'logChannelChanges', label: 'تعديل القنوات', icon: '📺' },
                    { key: 'logMemberJoins', label: 'انضمام عضو', icon: '👋' },
                    { key: 'logMemberLeaves', label: 'مغادرة عضو', icon: '🚪' },
                  ].map((evt) => (
                    <label
                      key={evt.key}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-bold cursor-pointer select-none transition ${
                        (modLogs as any)[evt.key]
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-card border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(modLogs as any)[evt.key] as boolean}
                        onChange={() => setModLogs({ ...modLogs, [evt.key]: !(modLogs as any)[evt.key] })}
                        className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{evt.icon} {evt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5d. AUTO-RESPONSES PANEL */}
        {activeSubTab === "auto-responses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-sky-950/20 border border-sky-950 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <Terminal className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-sky-300 font-sans">💬 محرك البناء والردود التلقائية الذكي (Auto-Responses Builder)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  وفر أوقات فريق الدعم والمشرفين! من خلال هذا المحرك، يمكنك إدخل كلمات مفتاحية معينة أو عبارات متكررة شائعة، ليقوم البوت فوراً بالرد على السائل بشكل ذاتي بمجرد تطابق العبارة مع قاعدة البيانات الخاصة بك بسرعة فائقة.
                </p>
              </div>
            </div>

            {/* Enabled check */}
            <div className="flex font-sans text-right select-none justify-between items-center gap-4 border-b border-slate-800 pb-4" style={{ direction: "rtl" }}>
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-slate-300">ميزة الردود التلقائية</span>
                <span className="block text-[10px] text-slate-550">يقوم البوت بدراسة شات السيرفر وتحليل رسائل الأعضاء لمطابقة المحفزات.</span>
              </div>
              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold">
                <input
                  type="checkbox"
                  checked={autoResponse.enabled}
                  onChange={(e) => {
                    setAutoResponse({ ...autoResponse, enabled: e.target.checked });
                    onAddLog({
                      id: crypto.randomUUID(),
                      timestamp: new Date().toLocaleTimeString(),
                      type: "system",
                      message: `💬 Auto-Response parser toggled to: ${e.target.checked ? "ON" : "OFF"}`
                    });
                  }}
                  className="accent-indigo-550 w-4 h-4 cursor-pointer"
                />
                <span>تنشيط محرك الرد المبرمج</span>
              </label>
            </div>

            {/* Creator form */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4 text-right" style={{ direction: "rtl" }}>
              <span className="block text-[11px] font-black uppercase text-indigo-400 tracking-wider">➕ إضافة رد تلقائي جديد لقاعدة البيانات (Create Response Rule)</span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">الكلمة المفتاحية أو الجملة المحفزة (Keyword Trigger)</span>
                  <input
                    type="text"
                    value={newResponseTrigger}
                    onChange={(e) => setNewResponseTrigger(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-300 font-bold focus:border-indigo-500 focus:outline-none"
                    placeholder="مثال: رابط السيرفر أو متجر"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">طريقة مطابقة الرسالة (Matching Rule)</span>
                  <select
                    value={newResponseMatchType}
                    onChange={(e) => setNewResponseMatchType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-300 cursor-pointer focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <option value="contains">تحتوي الرسالة على الكلمة (Contains)</option>
                    <option value="exact">تطابق تام ومطلق للرسالة (Exact Match)</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold">الإجراء (Action)</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newResponseTrigger.trim() || !newResponseReply.trim()) {
                        alert("⚠️ يرجى تعبئة الكلمة المحفزة وجواب البوت المبرمج أولاً!");
                        return;
                      }
                      const newItem = {
                        id: "ar-" + Date.now(),
                        trigger: newResponseTrigger.trim(),
                        response: newResponseReply.trim(),
                        matchType: newResponseMatchType
                      };
                      setAutoResponse({ ...autoResponse, responses: [...autoResponse.responses, newItem] });
                      onAddLog({
                        id: crypto.randomUUID(),
                        timestamp: new Date().toLocaleTimeString(),
                        type: "system",
                        message: `💬 Added auto-response trigger: "${newResponseTrigger}"`
                      });
                      setNewResponseTrigger("");
                      setNewResponseReply("");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-[7.5px] rounded border border-indigo-500/10 cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل بالقاعدة 📝</span>
                  </button>
                </div>

                <div className="space-y-1 md:col-span-3">
                  <span className="text-[10px] text-slate-400 font-bold font-sans">إجابة البوت المبرمجة بالكامل (Auto Bot Response Content)</span>
                  <textarea
                    rows={2}
                    value={newResponseReply}
                    onChange={(e) => setNewResponseReply(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-300 font-semibold focus:border-indigo-500 focus:outline-none font-sans"
                    placeholder="ضع هنا النص الكامل للرد الإلكتروني التلقائي للبوت..."
                  />
                </div>
              </div>
            </div>

            {/* List responses */}
            <div className="space-y-3 text-right font-sans" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2">📋 القواعد والردود التلقائية النشطة والمسجلة حالياً</h4>

              {autoResponse.responses.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 border border-slate-850 rounded-xl font-sans">
                  <p className="text-[11px] text-slate-500 font-bold font-sans">لا يوجد ردود تلقائية مبرمجة حالياً. يمكنك بناء رد ترحيبي أو تفعيلي من النموذج أعلاه!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans">
                  {autoResponse.responses.map((res) => (
                    <div key={res.id} className="p-4 bg-slate-950 border border-slate-850 hover:border-indigo-900/30 rounded-xl space-y-3 relative group font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = autoResponse.responses.filter(item => item.id !== res.id);
                          setAutoResponse({ ...autoResponse, responses: filtered });
                          onAddLog({
                            id: crypto.randomUUID(),
                            timestamp: new Date().toLocaleTimeString(),
                            type: "system",
                            message: `💬 Removed auto-response trigger ID: ${res.id}`
                          });
                        }}
                        className="absolute left-3.5 top-3.5 p-1 bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-rose-905 hover:bg-red-900 hover:text-white rounded cursor-pointer transition select-none active:scale-95"
                        title="حذف القاعدة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex gap-2 items-center flex-wrap font-sans">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-900/30 text-[10px] font-black text-indigo-400">
                          {res.matchType === 'exact' ? "تطابق كامل 🔒" : "كلمة مفتاحية 🔑"}
                        </span>
                        <div className="text-xs font-bold text-slate-100 font-mono text-left" style={{ direction: "ltr" }}>
                          Trigger: <span className="text-emerald-400">"{res.trigger}"</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-900 font-sans" style={{ wordBreak: 'break-word' }}>
                        {res.response}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMBED FORMATTER MODULE */}
        {activeSubTab === "embed-formatter" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span>المنشورات والرسائل الجاهزة (Embed Formatter)</span>
                </h3>
                <p className="text-xs text-slate-500">أنشئ رسائل Embed مخصصة وأرسلها إلى أي روم في السيرفر.</p>
              </div>
              <button
                onClick={() => setEmbedFormatter({ ...embedFormatter, enabled: !embedFormatter.enabled })}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  embedFormatter.enabled
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-slate-850 text-slate-500 border border-slate-700"
                }`}
              >
                {embedFormatter.enabled ? "🟢 مفعل" : "🔴 معطل"}
              </button>
            </div>

            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-bold text-slate-400">الروم المستهدف (Target Channel)</label>
                <select
                  value={embedTargetChannel}
                  onChange={(e) => setEmbedTargetChannel(e.target.value)}
                  className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- اختر روم --</option>
                  {channels.filter(c => c.type === 'text').map(ch => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">العنوان (Title)</label>
                  <input
                    type="text"
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    placeholder="عنوان الرسالة"
                    className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">اللون (Color)</label>
                  <input
                    type="color"
                    value={embedColorVal}
                    onChange={(e) => setEmbedColorVal(e.target.value)}
                    className="w-full h-9 bg-card border border-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400">الوصف (Description)</label>
                  <textarea
                    value={embedDesc}
                    onChange={(e) => setEmbedDesc(e.target.value)}
                    placeholder="نص الوصف..."
                    rows={3}
                    className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">الصورة المصغرة (Thumbnail URL)</label>
                  <input
                    type="text"
                    value={embedThumb}
                    onChange={(e) => setEmbedThumb(e.target.value)}
                    placeholder="https://example.com/thumb.png"
                    className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">الصورة الكبيرة (Image URL)</label>
                  <input
                    type="text"
                    value={embedImg}
                    onChange={(e) => setEmbedImg(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400">التذييل (Footer)</label>
                  <input
                    type="text"
                    value={embedFooter}
                    onChange={(e) => setEmbedFooter(e.target.value)}
                    placeholder="نص التذييل"
                    className="w-full bg-card border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSendEmbed}
                disabled={isSendingEmbed}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs font-black rounded-lg transition cursor-pointer ${
                  isSendingEmbed
                    ? "bg-indigo-500/50 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                <Send className={`w-3.5 h-3.5 ${isSendingEmbed ? "animate-spin" : ""}`} />
                {isSendingEmbed ? "جاري الإرسال..." : "إرسال الرسالة إلى السيرفر"}
              </button>
              {embedSendMessage && (
                <p className={`text-xs font-bold text-center mt-2 ${
                  embedSendMessage.includes('✅') ? 'text-green-400' :
                  embedSendMessage.includes('❌') || embedSendMessage.includes('⚠️') ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {embedSendMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5e. GIVEAWAYS PANEL */}
        {activeSubTab === "giveaways" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-blue-950/20 border border-blue-950 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <Star className="w-5 h-5 text-[#E67E22] shrink-0 mt-0.5 animate-spin-slow" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-blue-300">🎁 بوت قيف_اواي والفعاليات والجوائز (Giveaways Manager)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-sans">
                  قم بإنشاء سحوبات أوتوماتيكية وقيف_اواي لمكافأة الأعضاء وزيادة حركة التفاعل بسيرفرك! يمكن للأعضاء المشاركة بضغطة زر (🎉)، وعند انتهاء المؤقت يختار البوت عشوائياً الفائزين، مع إرسال منشن في شات المسابقات للمصداقية.
                </p>
              </div>
            </div>

            {/* Config select channel giveaway */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right font-sans" style={{ direction: "rtl" }}>
              <div className="space-y-1.5 font-sans font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">اسم بوت المسابقات والفعاليات (Giveaway Bot Name)</span>
                <input
                  type="text"
                  value={giveaway.botName}
                  onChange={(e) => setGiveaway({ ...giveaway, botName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none text-slate-200"
                  placeholder="GiveawayBot 🎉"
                />
              </div>

              <div className="space-y-1.5 font-sans md:col-span-2">
                <span className="text-[11px] font-extrabold text-slate-400">قناة نشر وإرسال القيف اواي (Giveaway Channel)</span>
                <select
                  value={giveaway.channelId}
                  onChange={(e) => setGiveaway({ ...giveaway, channelId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none text-slate-200 cursor-pointer"
                >
                  {channels.filter(c => c.type === 'text').map(ch => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>

              {/* Banner & Embed Color for Giveaways */}
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block pb-1">بنر إيداع القيف اواي (Giveaway Banner URL)</span>
                  <input
                    type="text"
                    value={giveaway.bannerUrl || ""}
                    onChange={(e) => setGiveaway({ ...giveaway, bannerUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none text-slate-200 text-left"
                    style={{ direction: 'ltr' }}
                    placeholder="https://images.unsplash.com/... for beautiful contest posts"
                  />
                </div>

                <div className="space-y-1.5 font-sans text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 block pb-1">لون إمبيد المسابقات (Giveaway Embed Color)</span>
                  <div className="flex gap-2 font-mono">
                    <input
                      type="color"
                      value={giveaway.embedColor || "#9B59B6"}
                      onChange={(e) => setGiveaway({ ...giveaway, embedColor: e.target.value })}
                      className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                    />
                    <input
                      type="text"
                      value={giveaway.embedColor || "#9B59B6"}
                      onChange={(e) => setGiveaway({ ...giveaway, embedColor: e.target.value })}
                      placeholder="#9B59B6"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-250 text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex select-none text-right justify-between items-center bg-slate-950 border border-slate-850 p-4 rounded-xl" style={{ direction: "rtl" }}>
              <div className="space-y-0.5 font-sans">
                <span className="text-xs font-bold text-slate-200">التحكم في بوت المسابقات والفعاليات</span>
                <p className="text-[10px] text-slate-550 leading-relaxed font-sans">تعطيل أو تنشيط إمكانية فتح قيف اواي ومسابقات سحب مبرمجة في السيرفر.</p>
              </div>
              <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold font-sans">
                <input
                  type="checkbox"
                  checked={giveaway.enabled}
                  onChange={(e) => setGiveaway({ ...giveaway, enabled: e.target.checked })}
                  className="accent-indigo-550 w-4 h-4 cursor-pointer"
                />
                <span>تنشيط بوت الجوائز بالكامل</span>
              </label>
            </div>

            {/* Launch giveaway post block */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4 text-right font-sans" style={{ direction: "rtl" }}>
              <span className="block text-[11px] uppercase text-indigo-400 font-extrabold tracking-wider font-sans">🎉 إطلاق ومبرمجة قيف_اواي تفاعلي جديد فوراً (Create New Giveaway)</span>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 font-sans">
                <div className="md:col-span-2 space-y-1 font-sans">
                  <span className="text-[10px] text-slate-400 font-black font-sans">العنوان أو الجائزة المطروحة بالسحب (Prize / Item)</span>
                  <input
                    type="text"
                    value={newGiveawayPrize}
                    onChange={(e) => setNewGiveawayPrize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-350 font-bold focus:border-indigo-500 focus:outline-none"
                    placeholder="مثال: رتبة كبار الشخصيات VIP ⚜️ + كاش 🪙"
                  />
                </div>

                <div className="space-y-1 font-sans">
                  <span className="text-[10px] text-slate-400 font-black font-sans">عدد الفائزين (Winners Count)</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newGiveawayWinners}
                    onChange={(e) => setNewGiveawayWinners(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:outline-none font-mono text-slate-350"
                  />
                </div>

                <div className="space-y-1 font-sans">
                  <span className="text-[10px] text-slate-400 font-black font-sans">مدة السحب بالدقائق (Duration Min)</span>
                  <input
                    type="number"
                    min={1}
                    value={newGiveawayDuration}
                    onChange={(e) => setNewGiveawayDuration(parseInt(e.target.value) || 60)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:outline-none font-mono text-slate-350"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newGiveawayPrize.trim()) {
                      alert("⚠️ يرجى تحديد الجائزة أولاً قبل محاولة إطلاق القيف اواي السحب!");
                      return;
                    }
                    const newItem = {
                      id: "gw-" + Date.now(),
                      prize: newGiveawayPrize.trim(),
                      winnerCount: newGiveawayWinners,
                      durationMinutes: newGiveawayDuration,
                      status: 'active' as const,
                      participants: ["papy615", "GamerPro"],
                      openedAt: new Date().toLocaleTimeString(),
                      endsAt: new Date(Date.now() + newGiveawayDuration * 60 * 1000).toLocaleTimeString()
                    };
                    setGiveaway({ ...giveaway, giveawaysList: [...giveaway.giveawaysList, newItem] });
                    onAddLog({
                      id: crypto.randomUUID(),
                      timestamp: new Date().toLocaleTimeString(),
                      type: "system",
                      message: `🎁 Giveaway opened for "${newGiveawayPrize}" with ${newGiveawayWinners} winner(s).`
                    });
                    setNewGiveawayPrize("");
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-[7.5px] rounded border border-emerald-500/10 cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 md:col-span-4"
                >
                  <span>🚀 إطلاق سحب القيف اواي ونشره بالقنوات</span>
                </button>
              </div>
            </div>

            {/* List active and ended contest */}
            <div className="space-y-3 text-right font-sans" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2 font-sans">📋 لائحة المسابقات النشطة والأرشيف والمشاركات الحالية</h4>

              {giveaway.giveawaysList.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 border border-slate-850 rounded-xl font-sans">
                  <p className="text-[11px] text-slate-500 font-bold">لا يوجد مسابقات أو سحوبات قيف اواي نشطة حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  {giveaway.giveawaysList.map((gw) => (
                    <div key={gw.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 relative group font-sans">
                      <div className="flex items-center justify-between font-sans">
                        {gw.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900 text-[10px] font-black uppercase animate-pulse">السحب جاري 🎟️</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-800 text-[10px] font-black uppercase">انتهى السحب 🛑</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">ID: {gw.id}</span>
                      </div>

                      <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                        <span>🏆</span>
                        <span className="text-indigo-400 font-sans">{gw.prize}</span>
                      </h4>

                      <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-350">👥 اجمالي المشاركين:</span>
                          <span className="font-extrabold text-indigo-400 font-mono">{gw.participants.length} عضو</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-350">🎯 عدد الفائزين المطلوب:</span>
                          <span className="font-bold font-mono">{gw.winnerCount} فائز</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-350">🕒 تاريخ وتوقيت الانتهاء:</span>
                          <span className="font-mono text-slate-305">{gw.endsAt}</span>
                        </div>
                      </div>

                      {gw.status === 'ended' && gw.winners && (
                        <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-lg text-xs font-sans space-y-1">
                          <span className="block font-black text-[10px] uppercase text-emerald-500">الفائزون المحظوظون 🎉:</span>
                          <div className="font-extrabold font-mono text-[11px] flex gap-2 flex-wrap">
                            {gw.winners.map(w => (
                              <span key={w} className="bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded">@{w}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Roll action */}
                      {gw.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => {
                            const candidates = gw.participants.length > 0 ? gw.participants : ["papy615", "GamerPro"];
                            const shuffled = [...candidates].sort(() => 0.5 - Math.random());
                            const picked = shuffled.slice(0, gw.winnerCount);
                            
                            const updated = giveaway.giveawaysList.map(item =>
                              item.id === gw.id ? { ...item, status: 'ended' as const, winners: picked } : item
                            );
                            setGiveaway({ ...giveaway, giveawaysList: updated });
                            
                            onAddLog({
                              id: crypto.randomUUID(),
                              timestamp: new Date().toLocaleTimeString(),
                              type: "system",
                              message: `🎁 Giveaway #${gw.id} ended. Winners rolled: ${picked.join(', ')}`
                            });
                          }}
                          className="w-full py-1.5 px-3 bg-[#E67E22] hover:bg-[#D35400] text-slate-950 font-black text-xs rounded transition-all cursor-pointer select-none active:scale-95 text-center font-sans"
                        >
                          🎉 سحب وإعلان الفائزين الآن | End & Roll Winners
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. RULES BOT (دستور وقوانين السيرفر) */}
        {activeSubTab === "rules-bot" && (
          <div className="space-y-6 animate-fade-in text-right" style={{ direction: "rtl" }}>
            <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <BookOpen className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-purple-300">⚖️ نظام القوانين التفاعلية بالخيارات المنسدلة (Rules Selection)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  يسمح هذا البوت التلقائي بنشر لوائح القوانين والأنظمة الرسمية مقسمة بداخل قوائم خيارات منسدلة أنيقة. يختار العضو نوع القانون (مثل قوانين الإدارة، الشؤون العامة، قوانين السرية) ليقوم البوت بعرض اللائحة كاملة في إمبيد منسق فوراً في القناة لتأمين سهولة وسلاسة التصفح لكافة الأعضاء بلا زحمة رسائل.
                </p>
              </div>
            </div>

            {/* Activation Switch for Rules BOT */}
            <div className="flex select-none text-right justify-end font-sans" style={{ direction: "rtl" }}>
              <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-900 transition text-xs font-bold font-sans">
                <input
                  type="checkbox"
                  checked={rulesBot.enabled}
                  onChange={(e) => handleUpdateRulesBot("enabled", e.target.checked)}
                  className="accent-purple-550 w-4 h-4 cursor-pointer"
                />
                <span className="text-purple-300">تفعيل نظام دستور وقوانين السيرفر بالكامل (Enable Rules Selection System)</span>
              </label>
            </div>

            {/* Visual Discord Embedded Preview for Rules Bot */}
            <div className="space-y-2 select-none text-right font-sans animate-fade-in" style={{ direction: "rtl" }}>
              <span className="block text-[11px] font-extrabold uppercase text-slate-500 font-sans">Visual Rules Embed & Dropdown Preview (معاينة تفاعلية لبطاقة وقائمة القوانين في الديسكورد)</span>
              
              <div className="bg-[#2b2d31] p-0 rounded-xl border-l-4 max-w-full shadow-xl overflow-hidden font-sans relative text-right" style={{ borderLeftColor: rulesBot.embedColor || "#9B59B6" }}>
                <div className="absolute left-3 top-3 text-[10px] text-white/40 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">Rules Selection Board</div>
                
                {rulesBot.bannerUrl && (
                  <div className="w-full h-28 overflow-hidden relative border-b border-[#202225]">
                    <img
                      src={rulesBot.bannerUrl}
                      alt="Rules Banner"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 justify-start flex-row-reverse text-right">
                    <span className="text-sm">{rulesBot.botAvatar || "⚖️"}</span>
                    <span className="text-xs font-bold text-[#f2f3f5]">{rulesBot.botName || "LawyerBot • دستور السيرفر"}</span>
                    <span className="text-[10px] bg-[#5865f2] px-1 rounded text-white text-[9px] scale-90 font-mono font-bold">BOT</span>
                  </div>
                  
                  {previewCatId === null ? (
                    // Main overview card
                    <div className="space-y-1 text-right">
                      <h4 className="font-extrabold text-[#f2f3f5] text-sm">⚖️ دستور وقوانين السيرفر الرسمية</h4>
                      <p className="text-xs text-[#dbdee1] leading-relaxed">
                        يرجى اختيار القسم أو لائحة القوانين التي تود مراجعتها من خلال القائمة المنسدلة في الأسفل لقراءة البنود والتعليمات بكل سلاسة.
                      </p>
                    </div>
                  ) : (() => {
                    const activeCat = rulesBot.categories.find(c => c.id === previewCatId);
                    if (!activeCat) return (
                      <div className="text-xs text-[#da373c] text-center font-bold">فئة القوانين غير متوفرة حالياً</div>
                    );
                    return (
                      <div className="space-y-2 text-right border-t border-[#3f4147] pt-2">
                        <div className="flex justify-between items-center flex-row-reverse border-b border-white/[0.05] pb-2">
                          <h4 className="font-extrabold text-[#f2f3f5] text-xs flex items-center gap-1.5 justify-end flex-row-reverse">
                            <span className="text-sm">{activeCat.icon}</span>
                            <span>{activeCat.name}</span>
                          </h4>
                          <button 
                            type="button"
                            onClick={() => setPreviewCatId(null)}
                            className="bg-[#4e5058] hover:bg-[#6d6f78] text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer leading-none"
                          >
                            ↩️ البداية
                          </button>
                        </div>
                        <div className="bg-[#1e1f22]/90 p-3 rounded-lg border border-[#1e1f22] space-y-2 text-[11px] text-[#dbdee1] leading-relaxed">
                          {activeCat.rules.length === 0 ? (
                            <span className="block italic text-slate-400 text-center">لا توجد بنود مضافة لهذه الفئة بعد.</span>
                          ) : (
                            activeCat.rules.map((rule, idx) => (
                              <div key={idx} className="border-b border-white/[0.03] pb-1.5 last:border-0 last:pb-0 text-right">
                                <b className="text-[#a370f7] font-bold ml-1 font-mono">البند ({idx + 1}):</b> {rule}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dropdown Select Simulation */}
                  <div className="pt-2 border-t border-white/[0.05] space-y-1 text-right">
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase">المظهر التفاعلي للقائمة المنسدلة بالديسكورد (اختر لتجربة العرض والبنود):</span>
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreviewCatId(val === "main" ? null : val);
                        }}
                        value={previewCatId || "main"}
                        className="w-full bg-[#1e1f22] hover:bg-[#35363c] text-[#dbdee1] rounded border border-[#3f4147] px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
                        style={{ direction: "rtl" }}
                      >
                        <option value="main">⚖️ اختر لـائـحـة القـوانيـن | Select Category...</option>
                        {rulesBot.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Rules Bot Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right select-none" style={{ direction: "rtl" }}>
              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">اسم بوت القوانين (Bot Nickname)</span>
                <input
                  type="text"
                  value={rulesBot.botName}
                  onChange={(e) => handleUpdateRulesBot("botName", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-purple-500 focus:outline-none text-slate-200"
                  placeholder="مثال: LawyerBot • دستور السيرفر"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">كود الأيقونة الرمزية للبوت (Emoji)</span>
                <input
                  type="text"
                  value={rulesBot.botAvatar}
                  onChange={(e) => handleUpdateRulesBot("botAvatar", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-purple-500 focus:outline-none text-slate-200"
                  placeholder="مثال: ⚖️"
                />
              </div>
            </div>

            {/* Banner & Embed Color for Rules BOT */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4 text-right" style={{ direction: "rtl" }}>
              <div className="space-y-3">
                <span className="block text-[11px] font-extrabold uppercase text-purple-400 tracking-wider font-sans">رابط بنر لوحة القوانين (Rules Panel Banner Image Link)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rulesBot.bannerUrl || ""}
                    onChange={(e) => handleUpdateRulesBot("bannerUrl", e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none text-left"
                    placeholder="https://images.unsplash.com/... or upload clean"
                    style={{ direction: 'ltr' }}
                  />
                  {rulesBot.bannerUrl && (
                    <button
                      onClick={() => handleUpdateRulesBot("bannerUrl", "")}
                      className="px-2.5 py-1.5 bg-red-950 border border-red-900 rounded-lg text-xs text-red-400 hover:bg-red-900 hover:text-white transition cursor-pointer"
                    >
                      إزالة
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-550">يظهر البنر أعلى رسالة القوانين في حال تفعيله بشكل متناسق واحترافي.</p>
              </div>

              <div className="space-y-3">
                <span className="block text-[11px] font-extrabold uppercase text-purple-400 tracking-wider font-sans">لون إمبد القوانين (Rules Embed Color)</span>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={rulesBot.embedColor || "#9B59B6"}
                    onChange={(e) => handleUpdateRulesBot("embedColor", e.target.value)}
                    className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                  />
                  <input
                    type="text"
                    value={rulesBot.embedColor || "#9B59B6"}
                    onChange={(e) => handleUpdateRulesBot("embedColor", e.target.value)}
                    placeholder="#9B59B6"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <p className="text-[9px] text-slate-550">منظم ألوان يسار رسالة القوانين وجداول الفروع التابعة لها.</p>
              </div>
            </div>

            {/* Categories & Rules Customizer */}
            <div className="space-y-4 text-right" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2">📂 تهيئة وتخصيص تصنيفات القوانين وبنودها</h4>
              
              {/* Add New Category form */}
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-slate-400">اسم فئة القوانين الجديدة (مثال: قوانين الإدارة العامة)</span>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-purple-500 focus:outline-none text-slate-200"
                      placeholder="اكتب اسم الفئة هنا..."
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-slate-400 font-sans">الأيقونة المعبرة (Emoji)</span>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-bold focus:border-purple-500 focus:outline-none text-slate-300"
                    >
                      <option value="⚖️">⚖️ ميزان</option>
                      <option value="📜">📜 لفافة ورق</option>
                      <option value="🛡️">🛡️ درع</option>
                      <option value="🚨">🚨 تنبيه</option>
                      <option value="💼">💼 حقيبة</option>
                      <option value="🚗">🚗 سيارة</option>
                      <option value="🕶️">🕶️ نظارات</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRulesCategory}
                    className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 h-9"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة الفئة الفهرسية</span>
                  </button>
                </div>
              </div>

              {/* Render Existing Categories and their Rules lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {rulesBot.categories.map((cat) => (
                  <div key={cat.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base select-none">{cat.icon}</span>
                          <span className="text-xs font-black text-slate-200">{cat.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRulesCategory(cat.id)}
                          className="p-1 px-2.5 rounded bg-rose-950/20 hover:bg-rose-950 text-rose-400 border border-rose-900/30 text-[10px] font-extrabold select-none transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>إزالة الفئة</span>
                        </button>
                      </div>

                      {/* Rules items in this category */}
                      {cat.rules.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-slate-500">
                          لا توجد أي قوانين مضافة بداخل هذه المجموعة حالياً.
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {cat.rules.map((rule, rIdx) => (
                            <li 
                              key={rIdx} 
                              className="p-2.5 bg-slate-900 border border-slate-850/80 rounded flex justify-between items-start gap-4 font-sans"
                            >
                              <span className="text-xs text-slate-300 leading-relaxed font-sans block flex-1 text-right">
                                <b className="text-purple-400 text-[10px] uppercase font-mono pl-1">البند {rIdx+1}:</b> {rule}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRuleFromCategory(cat.id, rIdx)}
                                className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition cursor-pointer select-none"
                                title="إزالة القانون"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Add Rule Form inside this category */}
                    <div className="pt-3 border-t border-slate-850/60 mt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRuleTexts[cat.id] || ""}
                          onChange={(e) => setNewRuleTexts({ ...newRuleTexts, [cat.id]: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs focus:border-purple-500 focus:outline-none text-slate-300 font-sans text-right"
                          placeholder="مثال: يمنع منعا كليا ممارسة السبام أو العنصرية..."
                        />
                        <button
                          type="button"
                          onClick={() => handleAddRuleToCategory(cat.id)}
                          className="px-3 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/40 rounded-md text-[11px] font-bold active:scale-95 transition cursor-pointer flex items-center justify-center font-sans gap-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة بند</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. LEAVE AND RESIGNATION (الإجازات والاستقالات) */}
        {activeSubTab === "leave-resignation" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌴</span>
                <h3 className="text-sm font-bold text-slate-200">نظام الإجازات والاستقالات (Leave & Resignation)</h3>
              </div>
              <button
                onClick={() => setLeaveConfig({ ...leaveConfig, enabled: !leaveConfig.enabled })}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  leaveConfig.enabled
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-slate-850 text-slate-500 border border-slate-700"
                }`}
              >
                {leaveConfig.enabled ? "🟢 مفعل" : "🔴 معطل"}
              </button>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex gap-3.5 items-start text-right" style={{ direction: "rtl" }}>
              <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-emerald-300">🌴 نظام إدارة الموارد البشرية والطلبات الصارمة (HR Automation)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  يسمح هذا البوت للإداريين والمشرفين بطلب إجازة مؤقتة أو إنهاء تكليف بالاستقالة عبر النقر على أزرار تفاعلية وكتابة السبب. تفوض الإدارات العليا بمراجعتها فورياً وإصدار القرار، حيث يعطى المجاز رتبة **[ في إجازة 🌴 ]** تسكيناً لوضعه، ويجرد المستقيل كلياً من رتبه وصلاحياته ويعاد كلياً لرتبة **[ عضو 👤 ]** بأمان تام.
                </p>
              </div>
            </div>

            {leaveConfig.enabled ? (
            <div className="space-y-6">
            {/* Core HR Bot Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right" style={{ direction: "rtl" }}>
              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400 animate-pulse">اسم بوت إدارة الشؤون (Bot Nickname)</span>
                <input
                  type="text"
                  value={leaveConfig.botName}
                  onChange={(e) => handleUpdateLeaveConfig("botName", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200"
                  placeholder="مثال: OfficeBot • الموارد البشرية"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">لوية البوت الوجيهة (Bot Emoji)</span>
                <input
                  type="text"
                  value={leaveConfig.botAvatar}
                  onChange={(e) => handleUpdateLeaveConfig("botAvatar", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200"
                  placeholder="مثال: 📇"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">ID رتبة الإجازة الممنوحة تلقائياً (Leave Role ID)</span>
                <input
                  type="text"
                  value={leaveConfig.leaveRoleId || ""}
                  onChange={(e) => handleUpdateLeaveConfig("leaveRoleId", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200"
                  placeholder="مثال: 112233445566778899 أو اسم الرتبة 'في إجازة'"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-extrabold text-slate-400">معرفات رتب الاستقالة المطلوب تجريدها بفاصلة (Resignation Remove Role IDs)</span>
                <input
                  type="text"
                  value={leaveConfig.resignationRemoveRoleIds || ""}
                  onChange={(e) => handleUpdateLeaveConfig("resignationRemoveRoleIds", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200 text-left"
                  style={{ direction: "ltr" }}
                  placeholder="e.g. 112233, 445566, 778899"
                />
              </div>
            </div>

            {/* Banner & Embed Color for HR / Leave */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4 text-right" style={{ direction: "rtl" }}>
              <div className="space-y-3">
                <span className="block text-[11px] font-extrabold uppercase text-emerald-400 tracking-wider font-sans">رابط بنر لوحة الإجازات والاستقالات (HR Panel Banner Image Link)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leaveConfig.bannerUrl || ""}
                    onChange={(e) => handleUpdateLeaveConfig("bannerUrl", e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none text-left"
                    placeholder="https://images.unsplash.com/... or upload clean"
                    style={{ direction: 'ltr' }}
                  />
                  {leaveConfig.bannerUrl && (
                    <button
                      onClick={() => handleUpdateLeaveConfig("bannerUrl", "")}
                      className="px-2.5 py-1.5 bg-red-950 border border-red-900 rounded-lg text-xs text-red-400 hover:bg-red-900 hover:text-white transition cursor-pointer"
                    >
                      إزالة
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-550">يظهر البنر فوق أزرار الإجازات والاستقالات لرفع جاذبية واجهة الموظفين.</p>
              </div>

              <div className="space-y-3">
                <span className="block text-[11px] font-extrabold uppercase text-emerald-400 tracking-wider font-sans">لون إمبيد شؤون الموظفين (HR Embed Color)</span>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={leaveConfig.embedColor || "#2ECC71"}
                    onChange={(e) => handleUpdateLeaveConfig("embedColor", e.target.value)}
                    className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                  />
                  <input
                    type="text"
                    value={leaveConfig.embedColor || "#2ECC71"}
                    onChange={(e) => handleUpdateLeaveConfig("embedColor", e.target.value)}
                    placeholder="#2ECC71"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[9px] text-slate-550">يتحكم باللون الجانبي لبطاقات وسجلات طلبات الإجازة والاستقالة المعلقة.</p>
              </div>
            </div>

            {/* HR Bot Review Channel Selection */}
            <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850 text-right font-sans" style={{ direction: "rtl" }}>
              <span className="block text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider font-mono font-black">قناة استقبال طلبات الإجازات والاستقالات ومراجعتها (HR Logs & Review Channel)</span>
              <select
                value={leaveConfig.reviewChannelId || ""}
                onChange={(e) => handleUpdateLeaveConfig("reviewChannelId", e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-slate-200 cursor-pointer"
              >
                <option value="">🚫 الأولى (بحث تلقائي بالاسم أو أول روم)</option>
                {channels.filter(c => c.type === 'text').map(ch => (
                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-510 text-slate-500 mt-1">يُقرر البوت رفع طلبات الغياب والإقالات الإدارية مباشرة في هذه القناة مع أزرار الموافقة والتشغيل الآلي.</p>
            </div>

            {/* Visual Discord Embedded Preview for Leave / Resignation */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-right font-sans animate-fade-in" style={{ direction: "rtl" }}>
              <span className="block text-[11px] font-extrabold uppercase text-slate-450 font-sans mb-2">Visual HR Board Preview (معاينة بطاقة لوحة الإجازات والاستقالات بالديسكورد)</span>
              
              <div className="bg-[#2b2d31] p-0 rounded-xl border-l-4 max-w-full shadow-xl overflow-hidden font-sans relative text-right" style={{ borderLeftColor: leaveConfig.embedColor || "#2ECC71" }}>
                <div className="absolute left-3 top-3 text-[10px] text-white/40 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">HR Control Board</div>
                
                {leaveConfig.bannerUrl && (
                  <div className="w-full h-28 overflow-hidden relative border-b border-[#202225]">
                    <img
                      src={leaveConfig.bannerUrl}
                      alt="HR Banner"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 justify-start flex-row-reverse">
                    <span className="text-sm">{leaveConfig.botAvatar || "📇"}</span>
                    <span className="text-xs font-bold text-slate-200">{leaveConfig.botName || "OfficeBot • الموارد البشرية"}</span>
                    <span className="text-[10px] bg-[#5865f2] px-1 rounded text-white text-[9px] scale-90 font-mono font-bold">BOT</span>
                  </div>
                  
                  <h4 className="font-extrabold text-[#f2f3f5] text-sm truncate">🌴 شؤون الموظفين والإجازات والاستقالات</h4>
                  <p className="text-xs text-[#dbdee1] leading-relaxed">
                    خاص بتقديم رغبات الإجازات المؤقتة أو تقديم طلبات الاستقالة الرسمية كعضو في الإدارة. انقر فوق الزر المناسب للبدء بقفل الأوراق ومراجعتها كلياً.
                  </p>
                  
                  {/* Action row buttons replica */}
                  <div className="flex gap-2.5 pt-1.5 justify-start flex-row-reverse">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-[#5865f2] text-white rounded font-bold text-xs shadow select-none cursor-pointer">
                      <span>طلب إجازة مؤقتة 🌴</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-[#da373c] text-white rounded font-bold text-xs shadow select-none cursor-pointer">
                      <span>تقديم طلب الاستقالة 🚪</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Log / Request Reviews Admin Workspace */}
            <div className="space-y-4 text-right" style={{ direction: "rtl" }}>
              <h4 className="text-xs font-black text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-1.5">
                  <span>📁 طلبات الإجازات والاستقالات الإدارية المعلقة</span>
                  <span className="px-2 py-0.5 rounded bg-teal-900 border border-teal-850 text-[10px] text-white">إدارات شؤون الوظائف</span>
                </div>
              </h4>

              {leaveConfig.requests.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <div className="text-lg">🌴</div>
                  <p className="text-[11px] text-slate-500 font-bold">لا يوجد أي طلبات إجازة أو استقالة مسجلة باللوائح حالياً.</p>
                  <p className="text-[10px] text-slate-600 font-sans">لتجربة الفرز، توجه إلى قناة <span className="text-indigo-400">#🌴-اجازات-استقالات</span> بداخل محاكي ديسكورد باليمين واطلب إجازة أو استقالة للعضو papy615!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-extrabold border-b border-slate-850">
                        <th className="p-3 text-right">الموظف / المشرف</th>
                        <th className="p-3">نوع الطلب</th>
                        <th className="p-3 font-sans">السبب التوضيحي بالكامل</th>
                        <th className="p-3 font-sans">وقت التقديم</th>
                        <th className="p-3">حالة الطلب الإداري</th>
                        <th className="p-3 text-center">الإجراء الفوري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {leaveConfig.requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/40 font-sans">
                          {/* User */}
                          <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-300">
                              {req.avatar}
                            </span>
                            <span>@{req.username}</span>
                          </td>

                          {/* Request Type */}
                          <td className="p-3">
                            {req.type === 'leave' ? (
                              <span className="px-2 py-1 rounded bg-yellow-950/40 border border-yellow-900/30 text-yellow-500 font-bold">
                                🌴 طلب إجازة مؤقتة
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-rose-950/40 border border-rose-900/30 text-rose-500 font-bold">
                                🚪 طلب استقالة نهائية
                              </span>
                            )}
                          </td>

                          {/* Reason */}
                          <td className="p-3 max-w-[240px] truncate text-slate-300 font-sans font-semibold" title={req.reason}>
                            {req.reason}
                          </td>

                          {/* Timestamp */}
                          <td className="p-3 text-slate-500 font-mono text-[10px]">
                            {req.timestamp}
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            {req.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-500 border border-amber-955 text-[10px] font-extrabold uppercase animate-pulse">
                                معلق للموافقة
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-extrabold uppercase">
                                تم الاعتماد بنجاح ✅
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-950 text-[10px] font-extrabold uppercase">
                                تم رفض الطلب ❌
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="p-3 text-center">
                            {req.status === 'pending' ? (
                              <div className="flex justify-center gap-1.5 select-none">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Make a fake automated trigger inside simulator to keep state completely mirrored
                                    onAddLog({
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString(),
                                      type: "application",
                                      message: `📋 Approved HR submission for @${req.username} via Config Panel.`
                                    });

                                    // Update leaveConfig request directly
                                    const updated = leaveConfig.requests.map(r => r.id === req.id ? { ...r, status: "approved" as const } : r);
                                    setLeaveConfig({ ...leaveConfig, requests: updated });

                                    // Role update to appropriate role in state
                                    setMembers(prev => prev.map(m => {
                                      if (m.username === req.username) {
                                        return {
                                          ...m,
                                          role: req.type === 'leave' ? "في إجازة 🌴" : "عضو 👤",
                                          roleColor: req.type === 'leave' ? "#F1C40F" : "#95A5A6"
                                        };
                                      }
                                      return m;
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] transition cursor-pointer select-none active:scale-95"
                                >
                                  قبول
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = leaveConfig.requests.map(r => r.id === req.id ? { ...r, status: "rejected" as const } : r);
                                    setLeaveConfig({ ...leaveConfig, requests: updated });
                                  }}
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] transition cursor-pointer select-none active:scale-95"
                                >
                                  رفض
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-600">- مغلق -</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
            ) : (
              <div className="py-12 text-center bg-slate-950 border border-slate-850 rounded-xl">
                <p className="text-xs font-bold text-slate-500">نظام الإجازات والاستقالات معطل حالياً</p>
                <p className="text-[10px] text-slate-600 mt-1">فعّل النظام من الزر بالأعلى لظهور الكوماند في الدسكورد</p>
              </div>
            )}
          </div>
        )}

        {/* 1. LEVELS & XP MODULE */}
        {activeSubTab === "levels" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1 text-right" style={{ direction: "rtl" }}>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 justify-end">
                  <span className="text-lg">🏆</span>
                  <span>نظام مستويات وتفاعل الأعضاء (Levels & XP System)</span>
                </h3>
                <p className="text-xs text-slate-500">نظام خبرة تلقائي يحفز الأعضاء على التفاعل والكتابة المستمرة داخل السيرفر للحصول على رتب تشريفية متقدمة.</p>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-2.5 justify-end font-sans">
                <span className="text-xs font-bold text-slate-400 font-sans">حالة النظام:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateLevelConfig("enabled", !levelConfig.enabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    levelConfig.enabled ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      levelConfig.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {levelConfig.enabled ? (
              <div className="space-y-6">
                {/* Basic configuration grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right" style={{ direction: "rtl" }}>
                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    <span className="block text-[11px] font-extrabold uppercase text-indigo-400 tracking-wider font-mono">الهوية واسم البوت المسؤول</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400">اسم البوت (Bot Name):</span>
                        <input
                          type="text"
                          value={levelConfig.botName}
                          onChange={(e) => handleUpdateLevelConfig("botName", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400">إيموجي البوت (Bot Avatar):</span>
                        <input
                          type="text"
                          value={levelConfig.botAvatar}
                          onChange={(e) => handleUpdateLevelConfig("botAvatar", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 text-center"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400">نقاط الخبرة XP المكتسبة لكل رسالة (XP Multiplier):</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={levelConfig.xpPerMessage}
                        onChange={(e) => handleUpdateLevelConfig("xpPerMessage", parseInt(e.target.value) || 15)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                    <span className="block text-[11px] font-extrabold uppercase text-indigo-400 tracking-wider font-mono">صيغة إعلان الترقية وروم الإشعارات</span>
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400">رسالة صعود المستوى (Level Up Message):</span>
                      <textarea
                        value={levelConfig.levelUpMessage}
                        onChange={(e) => handleUpdateLevelConfig("levelUpMessage", e.target.value)}
                        className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200"
                        placeholder="استخدم {user} لذكر العضو و {level} لذكر المستوى الجديد تلقائياً."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400">قناة نشر مباركات الصعود (Announcement Channel):</span>
                      <select
                        value={levelConfig.levelUpChannelId}
                        onChange={(e) => handleUpdateLevelConfig("levelUpChannelId", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
                      >
                        {channels.filter(c => c.type === 'text').map(ch => (
                          <option key={ch.id} value={ch.id}>#{ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Role rewards workspace */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-right space-y-4" style={{ direction: "rtl" }}>
                  <span className="block text-[11px] font-extrabold uppercase text-indigo-400 tracking-wider font-mono">🏆 جوائز الرتب عند الوصول لمستوى معين (Level Rewards Setups)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-3 bg-slate-900/60 rounded-lg border border-slate-850">
                    <div className="space-y-1 text-right">
                      <span className="block text-[10px] text-slate-400 mb-1">المستوى المستهدف (Target Level):</span>
                      <input
                        type="number"
                        min="1"
                        value={newRewardLevel}
                        onChange={(e) => setNewRewardLevel(parseInt(e.target.value) || 5)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="block text-[10px] text-slate-400 mb-1">اسم الرتبة الممنوحة بالتوجيه (Reward Role Name):</span>
                      <input
                        type="text"
                        placeholder="مثال: متفاعل برونزي 🥉"
                        value={newRewardRoleName}
                        onChange={(e) => setNewRewardRoleName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleLevelRewardAdd}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded transition cursor-pointer"
                    >
                      إضافة جائزة رتبة جديدة ➕
                    </button>
                  </div>

                  {/* Rewards grid list */}
                  {levelConfig.roleRewards.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-2">لا يوجد أي جوائز رتب مستهدفة حالياً للترقي التلقائي.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {levelConfig.roleRewards.map((reward) => (
                        <div key={reward.id} className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between text-xs font-sans">
                          <button
                            type="button"
                            onClick={() => handleLevelRewardRemove(reward.id)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer active:scale-95 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-950/50 text-indigo-400 px-1.5 py-0.5 rounded font-mono text-[10px]">Lvl {reward.level}</span>
                            <span className="font-bold text-slate-300">← {reward.roleName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scoreboard / Leaderboard simulation preview */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-right space-y-4 font-sans" style={{ direction: "rtl" }}>
                  <span className="block text-[11px] font-extrabold uppercase text-amber-500 tracking-wider font-mono">🏆 لائحة الصدارة الافتراضية للنشاط وفحوصات الـ XP (Leaderboard Preview)</span>
                  <div className="divide-y divide-slate-850 bg-slate-900 border border-slate-850 rounded-xl overflow-hidden">
                    {levelConfig.leaderboard.map((xpUser, idx) => (
                      <div key={xpUser.id} className="p-3 flex items-center justify-between hover:bg-slate-900/60">
                        <div className="text-right flex items-center gap-2 font-mono">
                          <span className="text-[10px] bg-slate-800 text-slate-400 rounded-full px-2 py-0.5 font-mono">XP {xpUser.xp}</span>
                          <span className="text-xs font-extrabold text-indigo-400">مستوى {xpUser.level}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-200">@{xpUser.username}</span>
                          <span className="w-7 h-7 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center text-xs">
                            {xpUser.avatar}
                          </span>
                          <span className="font-mono text-slate-500 text-xs w-5 text-center font-black">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-950 border border-slate-850 rounded-xl">
                <p className="text-xs font-bold text-slate-500">نظام المستويات والخبرة معطل حالياً (تفعيل اختياري).</p>
                <p className="text-[10px] text-slate-650 mt-1">قم بتفعيله من الزر بالأعلى لمراكمة الـ XP مع كل رسالة بالمحاكي.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. REACTION ROLES MODULE */}
        {activeSubTab === "reaction-roles" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1 text-right" style={{ direction: "rtl" }}>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 justify-end">
                  <span className="text-lg">🎭</span>
                  <span>رتب التفاعل الذاتي والتحكم بالأزرار (Button Roles)</span>
                </h3>
                <p className="text-xs text-slate-500">تسمح للأعضاء بالحصول على رتب اختيار الاهتمام بطريقة مريحة وفورية بمجرد الضغط المباشر على أزرار البوت المنسقة.</p>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-2.5 justify-end font-sans">
                <span className="text-xs font-bold text-slate-400 font-sans">حالة النظام:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateReactionRoles("enabled", !reactionRoles.enabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    reactionRoles.enabled ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      reactionRoles.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {reactionRoles.enabled ? (
              <div className="space-y-6 text-right" style={{ direction: "rtl" }}>
                {/* Embedded post styling */}
                <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850 text-right">
                  <span className="block text-[11px] font-extrabold uppercase text-pink-400 tracking-wider font-mono">تخصيص لوحة الأزرار والقناة (Button Roles Embed Panel Builder)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400">روم نشر لوحة الأزرار (Target Channel):</span>
                      <select
                        value={reactionRoles.channelId}
                        onChange={(e) => handleUpdateReactionRoles("channelId", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 cursor-pointer text-right"
                      >
                        {channels.filter(c => c.type === 'text').map(ch => (
                          <option key={ch.id} value={ch.id}>#{ch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 col-span-2 text-right">
                      <span className="text-[10px] text-slate-400">عنوان اللوحة الرئيسي (Panel Title):</span>
                      <input
                        type="text"
                        value={reactionRoles.panelTitle}
                        onChange={(e) => handleUpdateReactionRoles("panelTitle", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-slate-400">الوصف التعريفي للرتب (Panel Description Text):</span>
                    <textarea
                      value={reactionRoles.panelDescription}
                      onChange={(e) => handleUpdateReactionRoles("panelDescription", e.target.value)}
                      className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] text-slate-400 block pb-1">صورة بنر لوحة الرتب URL (Banner URL)</span>
                      <input
                        type="text"
                        value={reactionRoles.bannerUrl || ""}
                        onChange={(e) => handleUpdateReactionRoles("bannerUrl", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono text-left"
                        style={{ direction: 'ltr' }}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="text-[10px] text-slate-400 block pb-1">لون بطاقة الرتب التفاعلية (Panel Embed Color)</span>
                      <div className="flex gap-2 font-mono">
                        <input
                          type="color"
                          value={reactionRoles.embedColor || "#9B59B6"}
                          onChange={(e) => handleUpdateReactionRoles("embedColor", e.target.value)}
                          className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded-lg cursor-pointer self-center"
                        />
                        <input
                          type="text"
                          value={reactionRoles.embedColor || "#9B59B6"}
                          onChange={(e) => handleUpdateReactionRoles("embedColor", e.target.value)}
                          placeholder="#9B59B6"
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adding roles list panel */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4 text-right">
                  <span className="block text-[11px] font-extrabold uppercase text-pink-400 tracking-wider font-mono">🛠️ تخصيص الأزرار والرتب المتاحة (Active Interactive Buttons Selection)</span>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                      <div className="space-y-1">
                        <span className="block text-[10px] text-slate-400">اسم الزر (Button Label):</span>
                        <input
                          type="text"
                          placeholder="🎮 رتبة لول"
                          value={newRRoleLabel}
                          onChange={(e) => setNewRRoleLabel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 text-xs py-1.5 text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] text-slate-400">الرتبة بالديسكورد (Role Name):</span>
                        <input
                          type="text"
                          placeholder="لاعب League"
                          value={newRRoleName}
                          onChange={(e) => setNewRRoleName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 text-xs py-1.5 text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] text-slate-400 font-sans">إيموجي الزر (Emoji):</span>
                        <input
                          type="text"
                          value={newRRoleEmoji}
                          onChange={(e) => setNewRRoleEmoji(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 text-xs py-1.5 text-slate-200 text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] text-slate-400">لون طابع الزر (Color style):</span>
                        <select
                          value={newRRoleColor}
                          onChange={(e) => setNewRRoleColor(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 text-xs py-1.5 text-slate-200 cursor-pointer"
                        >
                          <option value="blue">أزرق رئيسي (Primary)</option>
                          <option value="green">أخضر تأكيد (Success)</option>
                          <option value="red">أحمر خطر (Danger)</option>
                          <option value="yellow">أصفر تذكيري (Warning)</option>
                          <option value="gray">رمادي متزن (Secondary)</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleReactionRoleAdd}
                      className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs py-2 rounded transition cursor-pointer active:scale-95"
                    >
                      إضافة رتبة وجدولتها في قائمة أزرار البوت ➕
                    </button>
                  </div>

                  {/* List of reaction roles buttons */}
                  {reactionRoles.rolesList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-2 font-bold">لا يوجد رتب مرتبطة بأزرار تفاعلية حالياً.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {reactionRoles.rolesList.map((r) => {
                        const styleNames: Record<string, string> = {
                          blue: "bg-blue-600 hover:bg-blue-500 border-blue-750 text-white",
                          green: "bg-emerald-600 hover:bg-emerald-500 border-emerald-750 text-white",
                          red: "bg-red-600 hover:bg-red-500 border-red-750 text-white",
                          yellow: "bg-amber-600 hover:bg-amber-500 border-amber-850 text-white",
                          gray: "bg-slate-700 hover:bg-slate-600 border-slate-800 text-white"
                        };
                        return (
                          <div key={r.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between font-sans">
                            <button
                              type="button"
                              onClick={() => handleReactionRoleRemove(r.id)}
                              className="text-slate-500 hover:text-red-400 cursor-pointer active:scale-95 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex flex-col items-end gap-1.5 text-xs text-right">
                              <span className="font-extrabold text-slate-400">يمنح رتبة: <span className="text-pink-400 font-bold">@{r.roleName}</span></span>
                              <div className={`px-3 py-1 rounded text-[10px] font-black flex items-center gap-1 border ${styleNames[r.color]}`}>
                                <span>{r.emoji}</span>
                                <span>{r.label}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-950 border border-slate-850 rounded-xl">
                <p className="text-xs font-bold text-slate-400">نظام اختيار الرتب بأزرار معطل حالياً.</p>
                <p className="text-[10px] text-slate-650 mt-1">تفعيله يتيح إلقاء لوحة اختيار رتب اختيارية في شات الرتب بالمحاكي.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. VOICE STATS MODULE */}
        {activeSubTab === "voice-stats" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="space-y-1 text-right" style={{ direction: "rtl" }}>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 justify-end">
                  <span className="text-lg">📊</span>
                  <span>قنوات الإحصائيات التلقائية الفورية (Voice Stats & Live Counters)</span>
                </h3>
                <p className="text-xs text-slate-500">يقوم البوت بإنشاء قنوات صوتية مقفلة تلقائياً لتعكس إحصائيات السيرفر (كالأعضاء، المتصلين، ورومات الصوت) دقيقة بدقيقة وبمظهر خلاب.</p>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-2.5 justify-end font-sans">
                <span className="text-xs font-bold text-slate-400 font-sans">حالة النظام:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateVoiceStats("enabled", !voiceStats.enabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    voiceStats.enabled ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      voiceStats.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {voiceStats.enabled ? (
              <div className="space-y-6 text-right" style={{ direction: "rtl" }}>
                <div className="p-4 bg-slate-950 rounded-xl space-y-4 border border-slate-850">
                  <span className="block text-[11px] font-extrabold uppercase text-sky-400 tracking-wider font-mono">تخصيص أسماء وصيغ رومات إحصائيات السيرفر (Stats Channel Naming Layouts)</span>
                  <p className="text-[10px] text-slate-500">استخدم المتغير <strong>{`{count}`}</strong> في الخانة ليقوم البوت باستبداله ديناميكياً بأرقام الأعضاء المستجدة داخل السيرفر.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400">إجمالي أعضاء السيرفر:</span>
                      <input
                        type="text"
                        value={voiceStats.totalMembersName}
                        onChange={(e) => handleUpdateVoiceStats("totalMembersName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400">الأعضاء المتصلين حالياً:</span>
                      <input
                        type="text"
                        value={voiceStats.activeMembersName}
                        onChange={(e) => handleUpdateVoiceStats("activeMembersName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400">المتواجدين بالغرف الصوتية:</span>
                      <input
                        type="text"
                        value={voiceStats.voiceUsersName}
                        onChange={(e) => handleUpdateVoiceStats("voiceUsersName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated preview display of sidebar stats channels */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3 font-mono text-left" style={{ direction: "ltr" }}>
                  <span className="block text-[11px] font-extrabold uppercase text-sky-450 tracking-wider font-sans text-right">⚙️ معاينة ظهور قنوات الاحصائيات في قائمة الرومات (Category Preview)</span>
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 text-xs text-slate-350 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase select-none tracking-wider flex justify-between">
                      <span>📊 SERVER LIVE STATS</span>
                      <span className="font-sans text-slate-600">فئة الإحصائيات</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 px-2 py-1 bg-slate-950/40 rounded border border-slate-850/40">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{voiceStats.totalMembersName.replace("{count}", String(members.length))}</span>
                      </span>
                      <span className="font-sans text-[9px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-1 rounded">Locked</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 px-2 py-1 bg-slate-950/40 rounded border border-slate-850/40">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{voiceStats.activeMembersName.replace("{count}", String(members.filter(m => m.status === 'online').length))}</span>
                      </span>
                      <span className="font-sans text-[9px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-1 rounded">Locked</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 px-2 py-1 bg-slate-950/40 rounded border border-slate-850/40">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{voiceStats.voiceUsersName.replace("{count}", "1")}</span>
                      </span>
                      <span className="font-sans text-[9px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-1 rounded">Locked</span>
                    </div>
                  </div>
                </div>

                {/* Voice Stats Action Button */}
                <div className="space-y-3">
                  <button
                    onClick={handleCreateVoiceStats}
                    disabled={isCreatingStats || !selectedGuildId}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      isCreatingStats
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isCreatingStats ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        جاري إنشاء القنوات...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        ⚡ إنشاء وتحديث قنوات الإحصائيات في السيرفر الآن
                      </>
                    )}
                  </button>
                  {statsActionMessage && (
                    <p className={`text-[10px] font-bold text-center ${
                      statsActionMessage.includes('✅') ? 'text-green-400' :
                      statsActionMessage.includes('❌') ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {statsActionMessage}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-950 border border-slate-850 rounded-xl">
                <p className="text-xs font-bold text-slate-450">نظام تعداد الإحصائيات بالقنوات الصوتية معطل.</p>
                <p className="text-[10px] text-slate-650 mt-1">تفعيله سيظهر قنوات صوتية علوية مقفلة لحسابات التعداد ديناميكياً.</p>
              </div>
            )}
          </div>
        )}
      </>
    )}

      </div>
    </div>
    </div>
  );
}
