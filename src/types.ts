export interface BotConfig {
  name: string;
  avatar: string; // url or solid base64 / emoji
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus: string;
  activityType: 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING';
  activityName: string;
  prefix: string;
  embedColor?: string;
}

export interface WelcomeConfig {
  enabled: boolean;
  bannerUrl: string;
  avatarEmoji: string;
  welcomeTitle: string;
  welcomeMessage: string;
  channelId: string;
  botName?: string;
  botAvatar?: string;
  dmGreeting?: boolean;
  dmMessage?: string;
  embedColor?: string;
}

export interface TicketInstance {
  id: string;
  channelId: string;
  username: string;
  status: 'open' | 'claimed' | 'closed';
  claimedBy?: string;
  openedAt: string;
  adminNotes?: string;
  rating?: number;
}

export interface TicketType {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  welcomeMessage?: string;
  ticketCategoryName?: string;
}

export interface TicketConfig {
  enabled: boolean;
  panelTitle: string;
  panelDescription: string;
  buttonLabel: string;
  welcomeMessage: string;
  botName?: string;
  botAvatar?: string;
  showFeedbackOnClose?: boolean;
  ticketCategoryName?: string;
  activeTickets?: TicketInstance[];
  logChannelId?: string;
  bannerUrl?: string;
  ticketTypes?: TicketType[];
  embedColor?: string;
}

export interface StaffSubmission {
  id: string;
  username: string;
  avatar: string;
  answers: { question: string; answer: string }[];
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  timestamp: string;
  adminNotes?: string;
  rating?: number;
  reviewer?: string;
  notified?: boolean;
}

export interface StaffAppConfig {
  enabled: boolean;
  questions: string[];
  submissions: StaffSubmission[];
  botName?: string;
  botAvatar?: string;
  autoMessageOnApprove?: string;
  autoMessageOnReject?: string;
  reviewChannelId?: string;
  approvedRoleId?: string;
  bannerUrl?: string;
  embedColor?: string;
}

export interface RuleCategory {
  id: string;
  name: string;
  icon: string;
  rules: string[];
}

export interface RulesConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  categories: RuleCategory[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface LeaveResignationRequest {
  id: string;
  username: string;
  avatar: string;
  type: 'leave' | 'resignation';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface LeaveResignationConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  requests: LeaveResignationRequest[];
  reviewChannelId?: string;
  leaveRoleId?: string;
  resignationRemoveRoleIds?: string;
  bannerUrl?: string;
  embedColor?: string;
}

export interface SecurityConfig {
  enabled: boolean;
  botName?: string;
  botAvatar?: string;
  verificationEnabled: boolean;
  verificationChannelId: string;
  verificationButtonLabel: string;
  verificationSuccessMessage: string;
  spamProtectionEnabled: boolean;
  maxMessagesPerMinute: number;
  wordFilterEnabled: boolean;
  badWordsList: string[];
  linkFilterEnabled: boolean;
  antiRaidEnabled: boolean;
  logsChannelId?: string;
  securityLevel?: 'low' | 'medium' | 'high';
  bannerUrl?: string;
  embedColor?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'ticket';
  isPrivate?: boolean;
}

export interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  isBot: boolean;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  role: string;
  roleColor: string;
  // Optional GTA Real Life RP fields
  rpJob?: string;
  rpCash?: number;
  rpBank?: number;
  rpLicense?: 'Active' | 'None' | 'Suspended';
  rpCars?: string[];
  rpJailed?: boolean;
  rpJailReason?: string;
  rpJailTime?: number; // minutes
  rpWarnings?: number;
}

export interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export interface BotCommand {
  id: string;
  trigger: string; // e.g., 'ping' or '/ping'
  type: 'slash' | 'prefix';
  description: string;
  responseType: 'text' | 'embed' | 'ai';
  responseText: string;
  
  // Embed properties (only if type standard or visual)
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string; // hex
  embedThumbnail?: string;
  embedImage?: string;
  embedFooter?: string;
  embedFields?: EmbedField[];
}

export interface DiscordMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderAvatar: string;
  senderIsBot: boolean;
  senderRoleColor?: string;
  isEphemeral?: boolean;
  content?: string;
  embed?: {
    title?: string;
    description?: string;
    color?: string;
    thumbnail?: string;
    image?: string;
    footer?: string;
    fields?: EmbedField[];
  };
  components?: (
    | {
        type: 'button';
        label: string;
        style: 'primary' | 'secondary' | 'danger' | 'success';
        customId: string;
      }
    | {
        type: 'select';
        customId: string;
        placeholder?: string;
        options: {
          label: string;
          value: string;
          emoji?: string;
          description?: string;
        }[];
      }
  )[];
  timestamp: string; // hh:mm am/pm
  isSystem?: boolean;
}

export interface ServerLog {
  id: string;
  timestamp: string;
  type: 'info' | 'command' | 'automod' | 'voice' | 'system' | 'ticket' | 'application';
  message: string;
}

export interface Suggestion {
  id: string;
  username: string;
  avatar: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  upvotes: number;
  downvotes: number;
  adminNotes?: string;
  votedUsers?: string[];
}

export interface SuggestionConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  channelId: string;
  autoReact: boolean;
  anonymous: boolean;
  suggestionsList: Suggestion[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface Report {
  id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  timestamp: string;
  proof?: string;
  adminNotes?: string;
}

export interface ReportConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  logsChannelId: string;
  reportsList: Report[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface Warning {
  id: string;
  username: string;
  adminName: string;
  reason: string;
  timestamp: string;
}

export interface WarningConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  maxWarningsBeforeBan: number;
  warningsList: Warning[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface AutoResponse {
  id: string;
  trigger: string;
  response: string;
  matchType: 'exact' | 'contains';
}

export interface AutoResponseConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  responses: AutoResponse[];
}

export interface Giveaway {
  id: string;
  prize: string;
  winnerCount: number;
  durationMinutes: number;
  status: 'active' | 'ended';
  participants: string[];
  winners?: string[];
  openedAt: string;
  endsAt: string;
}

export interface GiveawayConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  channelId: string;
  giveawaysList: Giveaway[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface XPUser {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
}

export interface LevelConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  xpPerMessage: number;
  levelUpMessage: string;
  levelUpChannelId: string;
  leaderboard: XPUser[];
  roleRewards: { id: string; level: number; roleName: string }[];
}

export interface ReactionRole {
  id: string;
  label: string;
  roleName: string;
  emoji: string;
  color: 'blue' | 'gray' | 'green' | 'red' | 'yellow';
}

export interface ReactionRolesConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  panelTitle: string;
  panelDescription: string;
  channelId: string;
  rolesList: ReactionRole[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface ModLogEntry {
  id: string;
  type: 'message_delete' | 'message_edit' | 'member_ban' | 'member_kick' | 'member_timeout' | 'role_change' | 'channel_create' | 'channel_delete' | 'channel_edit' | 'member_join' | 'member_leave';
  moderator?: string;
  target?: string;
  reason?: string;
  timestamp: string;
  channelId?: string;
}

export interface ModLogsConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  logChannelId: string;
  logMessageDeletes: boolean;
  logMessageEdits: boolean;
  logMemberBans: boolean;
  logMemberKicks: boolean;
  logMemberTimeouts: boolean;
  logRoleChanges: boolean;
  logChannelChanges: boolean;
  logMemberJoins: boolean;
  logMemberLeaves: boolean;
  logs: ModLogEntry[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface VoiceStatsConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  totalMembersName: string;
  activeMembersName: string;
  voiceUsersName: string;
}

export interface AutoRoleEntry {
  id: string;
  roleName: string;
}

export interface AutoRolesConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  rolesList: AutoRoleEntry[];
  bannerUrl?: string;
  embedColor?: string;
}

export interface EmbedFormatterConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  title: string;
  description: string;
  color: string;
  thumbnail: string;
  image: string;
  footer: string;
  fields: EmbedField[];
  bannerUrl?: string;
}

export interface StaffMember {
  id: string;
  username: string;
  avatar: string;
  role: string;
}

export interface StaffManagementConfig {
  enabled: boolean;
  botName: string;
  botAvatar: string;
  members: StaffMember[];
  rulesCategories: RuleCategory[];
  leaveRequests: LeaveResignationRequest[];
  bannerUrl?: string;
  embedColor?: string;
}


