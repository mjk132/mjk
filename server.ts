import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Global process exception/rejection safety fallback to keep the bot server running
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL-WARN] Unhandled Rejection at promise:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[CRITICAL-WARN] Uncaught Exception thrown:', error);
});

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiInstance = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiInstance;
}

// ============================================
// LIVE DISCORD BOT HOST STATE CONTROLLER
// ============================================
interface BotInstance {
  client: any;
  clientsList: any[];
  config: any;
  status: 'offline' | 'logging_in' | 'online' | 'error';
  error: string | null;
  logs: string[];
}

const botInstances = new Map<string, BotInstance>();

function getBotInstance(subscriptionKey: string): BotInstance {
  const cleanKey = (subscriptionKey || "default_public_bot").trim().toUpperCase();
  if (!botInstances.has(cleanKey)) {
    botInstances.set(cleanKey, {
      client: null,
      clientsList: [],
      config: null,
      status: 'offline',
      error: null,
      logs: []
    });
  }
  return botInstances.get(cleanKey)!;
}

function addLiveBotLogGlobal(subscriptionKey: string, message: string, level: 'READY' | 'ERROR' | 'SETUP' | 'EVENT' | 'AUTOMOD' | 'COMMAND' | 'INFO' = 'INFO') {
  const botState = getBotInstance(subscriptionKey);
  const time = new Date().toLocaleTimeString();
  const logLine = `[${time}] ${level === 'INFO' ? '' : `[${level}] `}${message}`;
  botState.logs.push(logLine);
  
  // Keep last 150 items to optimize memory
  if (botState.logs.length > 150) {
    botState.logs.shift();
  }
  console.log(`[DiscordBot][${subscriptionKey}] ${logLine}`);
}

async function stopDiscordBot(subscriptionKey: string) {
  const botState = getBotInstance(subscriptionKey);
  // Destroy all clients including those that are in intermediate login state
  if (botState.clientsList && botState.clientsList.length > 0) {
    for (const client of botState.clientsList) {
      try {
        if (client) {
          client.destroy();
        }
      } catch (err) {
        console.error("Error destroying intermediate client:", err);
      }
    }
    botState.clientsList = [];
  }

  if (botState.client) {
    try {
      botState.client.destroy();
      addLiveBotLogGlobal(subscriptionKey, "Offline sequence engaged. Discord client destroyed successfully.", "INFO");
    } catch (err: any) {
      console.error("Destroy Discord Bot Client Error:", err);
    }
    botState.client = null;
  }
  botState.status = 'offline';
}

async function startDiscordBot(token: string, clientId: string, botPayload: any) {
  const subscriptionKey = (botPayload.subscriptionKey || "default_public_bot").trim().toUpperCase();
  const botState = getBotInstance(subscriptionKey);

  // shadowing addLiveBotLog to capture subscriptionKey
  function addLiveBotLog(message: string, level: 'READY' | 'ERROR' | 'SETUP' | 'EVENT' | 'AUTOMOD' | 'COMMAND' | 'INFO' = 'INFO') {
    addLiveBotLogGlobal(subscriptionKey, message, level);
  }

  // Destructure payloads from request body
  const { 
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
  } = botPayload;

  const parseColor = (colorValue: any, defaultVal: number = 3447003): number => {
    if (!colorValue) return defaultVal;
    if (typeof colorValue === 'number') return colorValue;
    const cleaned = colorValue.toString().replace(/[^0-9a-fA-F]/g, '');
    if (!cleaned) return defaultVal;
    const parsed = parseInt(cleaned, 16);
    return isNaN(parsed) ? defaultVal : parsed;
  };
  
  // Stop existing first
  await stopDiscordBot(subscriptionKey);
  
  botState.status = 'logging_in';
  botState.error = null;
  addLiveBotLog(`Start request initiated for Bot Profile: ${config?.name || "SystemAI"}.`, 'INFO');
  
  try {
    const { 
      Client, 
      GatewayIntentBits, 
      PermissionFlagsBits, 
      EmbedBuilder, 
      ActionRowBuilder, 
      ButtonBuilder, 
      ButtonStyle, 
      ModalBuilder, 
      TextInputBuilder, 
      TextInputStyle, 
      StringSelectMenuBuilder,
      StringSelectMenuOptionBuilder,
      AttachmentBuilder,
      Partials 
    } = await import("discord.js");
    
    // Crash-proof overrides for EmbedBuilder.prototype.setImage and setThumbnail
    const originalSetImage = EmbedBuilder.prototype.setImage;
    EmbedBuilder.prototype.setImage = function(url: any) {
      if (url && typeof url === 'string') {
        const trimmed = url.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          try {
            return originalSetImage.call(this, trimmed);
          } catch (err) {
            console.error("[CRASH-PREVENTION] Error set image URL:", trimmed, err);
          }
        }
      }
      return this; // Ignore invalid or empty string/Url safely
    };

    const originalSetThumbnail = EmbedBuilder.prototype.setThumbnail;
    EmbedBuilder.prototype.setThumbnail = function(url: any) {
      if (url && typeof url === 'string') {
        const trimmed = url.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          try {
            return originalSetThumbnail.call(this, trimmed);
          } catch (err) {
            console.error("[CRASH-PREVENTION] Error set thumbnail URL:", trimmed, err);
          }
        }
      }
      return this; // Ignore invalid or empty string/Url safely
    };
    
    const { REST } = await import("@discordjs/rest");
    const { Routes } = await import("discord-api-types/v10");

    // 1. Publish commands first to Discord global router
    addLiveBotLog("Compiling and packaging slash command manifests for Discord Gateway API...", "SETUP");
    const deployList: any[] = [];
    
    // Core user-custom slash commands
    for (const cmd of (commands || [])) {
      if (cmd.type === 'slash') {
        const cleanName = cmd.trigger.replace('/', '').toLowerCase().trim();
        deployList.push({
          name: cleanName,
          description: cmd.description || "Custom interactive command"
        });
      }
    }

    // Include interactive system slash commands if they are toggled as active
    if (ticket && ticket.enabled) {
      deployList.push({ name: "setup-tickets", description: "Spawns the Support Ticket embedded board inside a channel." });
    }
    if (staffApp && staffApp.enabled) {
      deployList.push({ name: "setup-staff", description: "Spawns the Staff recruitment submission board." });
    }
    if (security && security.enabled && security.verificationEnabled) {
      deployList.push({ name: "setup-verify", description: "Spawns the Security Captcha profile verification card." });
    }
    if (rulesBot && rulesBot.enabled) {
      deployList.push({ name: "setup-rules", description: "Spawns the server categorized laws embedded list." });
    }
    if (leaveConfig && leaveConfig.enabled) {
      deployList.push({ name: "setup-hr", description: "Spawns the HR Leave request dashboard button." });
    }
    if (autoRoles && autoRoles.enabled) {
      deployList.push({ name: "setup-auto-roles", description: "Spawns the Auto Roles panel for member join role assignment." });
    }
    if (suggestion && suggestion.enabled) {
      deployList.push({ name: "setup-suggestions", description: "Spawns the Suggestions interactive board with submit button." });
    }

    if (report && report.enabled) {
      deployList.push({ name: "report", description: "تقديم شكوى أو بلاغ ضد عضو" });
    }
    if (warning && warning.enabled) {
      deployList.push({ name: "warn", description: "إصدار تحذير لعضو مخالف (للمشرفين)" });
    }
    if (giveaway && giveaway.enabled) {
      deployList.push({ name: "giveaway", description: "إنشاء سحب جائزة جديدة" });
    }

    const rest = new REST({ version: '10' }).setToken(token);
    addLiveBotLog(`Pushing ${deployList.length} slash commands registering to Discord API...`, "SETUP");
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: deployList }
    );
    addLiveBotLog("Slash commands registered successfully with Discord global API scope!", "SETUP");

    // 2. Initialize the Client
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
    });

    // Push client immediately to active list so it can be cleaned if subsequent login begins
    botState.clientsList.push(client);

    // Capture connection/socket and API failures without crashing
    client.on('error', (error: any) => {
      addLiveBotLog(`Discord connection or API request error: ${error.message || error}`, 'ERROR');
      console.error('Discord client error:', error);
    });

    // Keep cache for anti-spam Protection
    const messageTimestamps = new Map<string, number[]>();

    // Client Ready handle
    client.once('ready', async () => {
      botState.status = 'online';
      botState.config = {
        tag: client.user?.tag || "Bot#0000",
        avatar: client.user?.displayAvatarURL({ forceStatic: true }),
        guildsCount: client.guilds.cache.size,
        latency: client.ws.ping
      };
      
      addLiveBotLog(`Connected securely! Logged in as: ${client.user?.tag}`, 'READY');
      
      const activityMap: Record<string, number> = { 'PLAYING': 0, 'STREAMING': 1, 'LISTENING': 2, 'WATCHING': 3 };
      client.user?.setPresence({
        activities: [{ 
          name: config?.activityName || "with developers!", 
          type: activityMap[config?.activityType || 'PLAYING'] || 0
        }],
        status: config?.status || 'online'
      });

      // Initialize Voice Stats channels on ready
      if (voiceStats && voiceStats.enabled) {
        for (const guild of client.guilds.cache.values()) {
          try {
            const catName = '📊 SERVER STATS';
            let category = guild.channels.cache.find((c: any) => c.name === catName && c.type === 4);
            if (!category) {
              category = await guild.channels.create({ name: catName, type: 4 }).catch(() => null);
            }

            if (category) {
              const existingTotalName = (voiceStats.totalMembersName || '📊 إجمالي الأعضاء: {count}').replace('{count}', guild.memberCount.toString());
              let chTotal = guild.channels.cache.find((c: any) => c.name.includes('إجمالي الأعضاء') || c.name.startsWith('📊 إجمالي'));
              if (!chTotal) {
                chTotal = await guild.channels.create({
                  name: existingTotalName,
                  type: 2,
                  parent: category.id,
                  permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }]
                }).catch(() => null);
              }
              statsChannels.total = chTotal;

              const existingActiveName = (voiceStats.activeMembersName || '🟢 المتصلين: {count}').replace('{count}', '0');
              let chActive = guild.channels.cache.find((c: any) => c.name.includes('المتصلين') || c.name.includes('Online'));
              if (!chActive) {
                chActive = await guild.channels.create({
                  name: existingActiveName,
                  type: 2,
                  parent: category.id,
                  permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }]
                }).catch(() => null);
              }
              statsChannels.active = chActive;

              const existingVoiceName = (voiceStats.voiceUsersName || '🔊 بالرومات الصوتية: {count}').replace('{count}', '0');
              let chVoice = guild.channels.cache.find((c: any) => c.name.includes('بالصوت') || c.name.includes('Voice'));
              if (!chVoice) {
                chVoice = await guild.channels.create({
                  name: existingVoiceName,
                  type: 2,
                  parent: category.id,
                  permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }]
                }).catch(() => null);
              }
              statsChannels.voice = chVoice;

              await updateStatsChannels(guild);
            }
          } catch (err: any) {
            addLiveBotLog(`Stats channel init error in ${guild.name}: ${err.message}`, 'ERROR');
          }
        }
        addLiveBotLog('Voice stats channels initialized and updated.', 'READY');
      }

      // Cleanup guild-specific commands to prevent ANY duplicated slash commands in servers
      try {
        const guildIds = client.guilds.cache.map((g: any) => g.id);
        if (guildIds && guildIds.length > 0) {
          addLiveBotLog(`Clearing redundant guild-specific slash commands for ${guildIds.length} guilds...`, 'SETUP');
          const restInstance = new REST({ version: '10' }).setToken(token);
          for (const guildId of guildIds) {
            await restInstance.put(
              Routes.applicationGuildCommands(clientId, guildId),
              { body: [] }
            );
          }
          addLiveBotLog(`Guild-specific commands cleared successfully. Only global commands will be displayed!`, 'READY');
        }
      } catch (err: any) {
        console.error("Failed to clear guild-specific commands:", err);
        addLiveBotLog(`Warning: Failed to clear guild commands cache: ${err.message || err}`, 'ERROR');
      }
    });

    // Welcomer Event Router
    client.on('guildMemberAdd', async (member: any) => {
      if (!welcome || !welcome.enabled) return;
      try {
        const welcomeChanId = welcome.channelId;
        const channel = member.guild.channels.cache.get(welcomeChanId) as any;
        if (channel) {
          const uP = (text: string) => {
            if (!text) return "";
            return text
              .replace(/{user}/g, member.toString())
              .replace(/{username}/g, member.user.username)
              .replace(/{memberCount}/g, member.guild.memberCount.toString());
          };

          const pTitle = uP(welcome.welcomeTitle || "Welcome {username}");
          const pMsg = uP(welcome.welcomeMessage || "Welcome {user} to our community!");

          const welcomeEmbed = new EmbedBuilder()
            .setTitle(pTitle)
            .setDescription(pMsg)
            .setColor(parseColor(welcome.embedColor, 5793266)) // dynamic or blurple
            .setThumbnail(member.user.displayAvatarURL({ forceStatic: true }))
            .setFooter({ text: `Member #${member.guild.memberCount} • ${welcome.botName || "Welcome System"}` })
            .setTimestamp();

          if (welcome.bannerUrl) {
            welcomeEmbed.setImage(welcome.bannerUrl);
          }

          await channel.send({ content: member.toString(), embeds: [welcomeEmbed] });
          addLiveBotLog(`Welcomer card broadcasted for new user: ${member.user.tag}`, 'EVENT');
        }

        if (welcome.dmGreeting && welcome.dmMessage) {
          const dmText = welcome.dmMessage
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{memberCount}/g, member.guild.memberCount.toString());
          await member.send({ content: dmText }).catch(() => {});
        }
      } catch (err: any) {
        addLiveBotLog(`Welcomer system logical fault: ${err.message}`, 'ERROR');
      }
    });

    // Auto Roles Event Router — assign roles on member join
    client.on('guildMemberAdd', async (member: any) => {
      if (!autoRoles || !autoRoles.enabled || !autoRoles.rolesList || autoRoles.rolesList.length === 0) return;
      try {
        for (const roleEntry of autoRoles.rolesList) {
          const role = member.guild.roles.cache.get(roleEntry.id);
          if (role) {
            await member.roles.add(role).catch(() => {});
          }
        }
        addLiveBotLog(`Auto-roles assigned to new member: ${member.user.tag}`, 'EVENT');
      } catch (err: any) {
        addLiveBotLog(`Auto-roles assignment error: ${err.message}`, 'ERROR');
      }
    });

    // Placeholder rendering helpers
    const renderPlaceholders = (text: string, interactionOrMessage: any, isInteraction = false) => {
      if (!text) return "";
      const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
      const channel = interactionOrMessage.channel;
      const guild = interactionOrMessage.guild;
      
      return text
        .replace(/{user}/g, user.toString())
        .replace(/{username}/g, user.username)
        .replace(/{channel}/g, channel ? channel.name : 'dm')
        .replace(/{memberCount}/g, guild ? guild.memberCount.toString() : '1')
        .replace(/{time}/g, new Date().toUTCString());
    };

    // Helper inside server to replace visual embeds
    const makeEmbedFromCommand = (cmd: any, interactionOrMsg: any, isInteraction = false) => {
      const p = (txt: string) => renderPlaceholders(txt, interactionOrMsg, isInteraction);
      
      const customEmbed = new EmbedBuilder()
        .setTitle(p(cmd.embedTitle || ""))
        .setDescription(p(cmd.embedDescription || ""))
        .setColor(parseColor(cmd.embedColor, 5793266))
        .setTimestamp();
      
      if (cmd.embedThumbnail) customEmbed.setThumbnail(cmd.embedThumbnail);
      if (cmd.embedImage) customEmbed.setImage(cmd.embedImage);
      if (cmd.embedFooter) customEmbed.setFooter({ text: p(cmd.embedFooter) });
      
      if (cmd.embedFields && cmd.embedFields.length > 0) {
        customEmbed.addFields(cmd.embedFields.map((f: any) => ({
          name: p(f.name),
          value: p(f.value),
          inline: !f.inline ? false : f.inline
        })));
      }
      return customEmbed;
    };

    // Message events, spam protection, word filtering & prefix commands
    client.on('messageCreate', async (message: any) => {
      if (message.author.bot || !message.guild) return;

      const content = message.content.trim();
      const prefix = config?.prefix || '!';

      // A. Live Suggestions System Message-Level Handler
      if (suggestion && suggestion.enabled) {
        const rawInput = (suggestion.channelId || "").toString().trim();
        const matchDigits = rawInput.match(/\d+/);
        const cleanSugId = matchDigits ? matchDigits[0] : rawInput.toLowerCase();
        
        const isSuggestionsChannel = cleanSugId && (
          message.channel.id === cleanSugId ||
          message.channel.name.toLowerCase() === cleanSugId ||
          message.channel.name.toLowerCase().includes(cleanSugId) ||
          cleanSugId.includes(message.channel.name.toLowerCase())
        );
        if (isSuggestionsChannel && content.length > 0) {
          try {
            await message.delete().catch(() => {});
            
            const suggestEmbed = new EmbedBuilder()
              .setTitle("💡 اقتراح جديد | New Suggestion")
              .setDescription(content)
              .setColor(parseColor(suggestion.embedColor, 15859727))
              .setTimestamp();

            if (suggestion.anonymous) {
              suggestEmbed.setAuthor({ name: "عضو مساهم | Anonymous Member" });
            } else {
              suggestEmbed.setAuthor({ 
                name: message.author.tag, 
                iconURL: message.author.displayAvatarURL() 
              });
            }

            suggestEmbed.setFooter({ text: suggestion.botName || "Suggestions Bot" });

            if (suggestion.bannerUrl) {
              const cleanedBanner = suggestion.bannerUrl.trim();
              if (cleanedBanner.startsWith("http://") || cleanedBanner.startsWith("https://")) {
                suggestEmbed.setImage(cleanedBanner);
              }
            }

            const sugRow = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('submit_suggestion_btn')
                .setLabel('💡 تقديم اقتراح جديد')
                .setStyle(ButtonStyle.Primary)
            );

            const sentMsg = await message.channel.send({ embeds: [suggestEmbed], components: [sugRow] });
            addLiveBotLog(`Generated fresh suggestion embed from ${suggestion.anonymous ? 'Anonymous' : message.author.tag} in target channel.`, 'EVENT');
            
            if (suggestion.autoReact) {
              await sentMsg.react('👍').catch(() => {});
              await sentMsg.react('👎').catch(() => {});
            }
            return;
          } catch (err: any) {
            console.error("Error creating suggestion inside live bot:", err);
            addLiveBotLog(`Error post suggestion: ${err.message}`, 'ERROR');
          }
        }
      }

      // B. Auto-Responses System
      if (autoResponse && autoResponse.enabled && autoResponse.responses && autoResponse.responses.length > 0) {
        for (const ar of autoResponse.responses) {
          let matches = false;
          if (ar.matchType === 'exact') {
            matches = content.toLowerCase() === ar.trigger.toLowerCase();
          } else {
            matches = content.toLowerCase().includes(ar.trigger.toLowerCase());
          }
          if (matches) {
            const replyText = ar.response
              .replace(/{user}/g, message.author.toString())
              .replace(/{username}/g, message.author.username);
            await message.channel.sendTyping().catch(() => {});
            setTimeout(async () => {
              try {
                await message.channel.send(replyText);
                addLiveBotLog(`Auto-response triggered by "${ar.trigger}" from user: ${message.author.tag}`, 'AUTOMOD');
              } catch (e) {}
            }, 800);
            break;
          }
        }
      }

      // Security checking automod protection
      if (security && security.enabled) {
        
        // AntiSpam checking
        if (security.spamProtectionEnabled) {
          const now = Date.now();
          const userLogs = messageTimestamps.get(message.author.id) || [];
          const recentLogs = userLogs.filter(ts => now - ts < 60000);
          recentLogs.push(now);
          messageTimestamps.set(message.author.id, recentLogs);

          const maxLimit = security.maxMessagesPerMinute || 6;
          if (recentLogs.length > maxLimit) {
            await message.delete().catch(() => {});
            message.channel.send(`⚠️ ${message.author} يرجى التوقف عن السبام وتكرار الرسائل! (Anti-Spam active)`).then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
            addLiveBotLog(`Deleted spam message and protected channels from user: ${message.author.tag}`, 'AUTOMOD');
            
            if (security.logsChannelId) {
              const logChan = message.guild.channels.cache.get(security.logsChannelId) as any;
              if (logChan) {
                logChan.send({
                  embeds: [new EmbedBuilder()
                    .setTitle("🚨 تحذير نظام السيكيورتي: سبام مفرط")
                    .setDescription(`العضو ${message.author} (${message.author.tag}) تجاوز حد الإرسال مع تصفية رسالته المزعجة.`)
                    .setColor(15158332)
                    .setTimestamp()
                  ]
                }).catch(() => {});
              }
            }
            return;
          }
        }

        // Word filtering list
        if (security.wordFilterEnabled && security.badWordsList && security.badWordsList.length > 0) {
          const containsBadWord = security.badWordsList.some((badWord: string) => {
            const regex = new RegExp(`\\b${badWord}\\b`, 'i');
            return regex.test(content) || content.toLowerCase().includes(badWord.toLowerCase());
          });

          if (containsBadWord) {
            await message.delete().catch(() => {});
            message.channel.send(`⚠️ ${message.author} يُمنع استخدام الكلمات النابية والشتائم داخل هذا السيرفر!`).then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
            addLiveBotLog(`Filtered forbidden swear words from chatter: ${message.author.tag}`, 'AUTOMOD');

            if (security.logsChannelId) {
              const logChan = message.guild.channels.cache.get(security.logsChannelId) as any;
              if (logChan) {
                logChan.send({
                  embeds: [new EmbedBuilder()
                    .setTitle("🚨 تصفية جمل بذيئة")
                    .setDescription(`حذف رسالة تحتوي على عبارات ممنوعة من العضو ${message.author} (${message.author.tag})`)
                    .addFields({ name: "محتوى الرسالة الأصلي", value: content })
                    .setColor(15158332)
                    .setTimestamp()
                  ]
                }).catch(() => {});
              }
            }
            return;
          }
        }

        // Link invite advertise spam blocking
        if (security.linkFilterEnabled) {
          const linkRegex = /(https?:\/\/[^\s]+|discord\.gg\/[^\s]+)/i;
          const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);
          if (linkRegex.test(content) && !isAdmin) {
            await message.delete().catch(() => {});
            message.channel.send(`⚠️ ${message.author} يُمنع نشر الروابط الخارجية أو الدعوات الإعلانية هنا!`).then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
            addLiveBotLog(`Deleted external link advertising invite from: ${message.author.tag}`, 'AUTOMOD');

            if (security.logsChannelId) {
              const logChan = message.guild.channels.cache.get(security.logsChannelId) as any;
              if (logChan) {
                logChan.send({
                  embeds: [new EmbedBuilder()
                    .setTitle("🚨 حماية الروابط والدعايات")
                    .setDescription(`تم حذف رابط غير مصرح به من العضو ${message.author} (${message.author.tag}).`)
                    .addFields({ name: "رابط المخالفة المكتوب", value: content })
                    .setColor(15158332)
                    .setTimestamp()
                  ]
                }).catch(() => {});
              }
            }
            return;
          }
        }
      }

      // Check prefix trigger
      if (!content.startsWith(prefix)) return;

      const args = content.slice(prefix.length).split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      // Custom systems Prefix setups
      if (commandName === 'setup-tickets' && ticket?.enabled) {
        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const hasTypes = ticket.ticketTypes && ticket.ticketTypes.length > 0;
        let row;

        if (hasTypes) {
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('open_ticket_select')
            .setPlaceholder('📥 · اختر نوع التذكرة | Select Support Category...')
            .addOptions(
              ticket.ticketTypes.map((typ: any) => 
                new StringSelectMenuOptionBuilder()
                  .setLabel(typ.name)
                  .setValue(typ.id)
                  .setDescription(typ.description || `${typ.name} Support`)
                  .setEmoji(typ.emoji || '🎫')
              )
            );
          row = new ActionRowBuilder<any>().addComponents(selectMenu);
        } else {
          row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('open_ticket')
              .setLabel(ticket.buttonLabel || 'فتح تذكرة | Open Ticket 📩')
              .setStyle(ButtonStyle.Primary)
          );
        }

        const chanEmbed = new EmbedBuilder()
          .setTitle(ticket.panelTitle || "🎫 نظام فتح التذاكر")
          .setDescription(ticket.panelDescription || "اضغط على الزر أدناه بالتواصل أو القائمة المخصصة للتوجيه المريح وتفادي التعطيل.")
          .setColor(parseColor(ticket.embedColor, 3447003));
          
        if (ticket.bannerUrl) {
          chanEmbed.setImage(ticket.bannerUrl);
        }
        
        if (ticket.botName) chanEmbed.setFooter({ text: ticket.botName });
        
        await message.channel.send({ embeds: [chanEmbed], components: [row] });
        addLiveBotLog(`Placed support ticket panel (${hasTypes ? "select menu" : "button"}) on channel: ${message.channel?.name}`, 'COMMAND');
        return;
      }

      if (commandName === 'setup-verify' && security?.enabled && security.verificationEnabled) {
        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;
        const row = new ActionRowBuilder<any>().addComponents(
          new ButtonBuilder()
            .setCustomId('verify_user')
            .setLabel(security.verificationButtonLabel || 'تفعيل الحساب (Verify Profile) ✅')
            .setStyle(ButtonStyle.Success)
        );
        const secEmbed = new EmbedBuilder()
          .setTitle("🔐 بوابة التحقق البشري الآمن (Server Verification Gate)")
          .setDescription("أهلاً بك في حماية السيرفر! لمنع دخول الحسابات الوهمية والسبام بوتس، من فضلك اضغط على زر تفعيل وتأكيد الحماية لتتمكن من الوصول لباقي القنوات والمحادثة أونلاين.")
          .setColor(parseColor(security.embedColor, 3447003));
        
        if (security.bannerUrl) {
          secEmbed.setImage(security.bannerUrl);
        }
        
        await message.channel.send({ embeds: [secEmbed], components: [row] });
        addLiveBotLog(`Placed Verification Capture gate panel on channel: ${message.channel?.name}`, 'COMMAND');
        return;
      }

      if (commandName === 'setup-staff' && staffApp?.enabled) {
        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;
        const row = new ActionRowBuilder<any>().addComponents(
          new ButtonBuilder()
            .setCustomId('apply_staff')
            .setLabel('تقديم على الإدارة 🛡️ Apply for Staff')
            .setStyle(ButtonStyle.Success)
        );
        const recruitmentEmbed = new EmbedBuilder()
          .setTitle("🛡️ تقديم طلبات الانضمام لطاقم الإدارة")
          .setDescription("إذا كنت تجد في نفسك الكفاءة، الخبرة والالتزام لمساعدتنا في تنظيم شؤون السيرفر، يرجى الضغط على زر التقديم والإجابة على الاستبيان.")
          .setColor(parseColor(staffApp.embedColor, 3066993));
        if (staffApp.botName) recruitmentEmbed.setFooter({ text: staffApp.botName });
        
        if (staffApp.bannerUrl) {
          recruitmentEmbed.setImage(staffApp.bannerUrl);
        }
        
        await message.channel.send({ embeds: [recruitmentEmbed], components: [row] });
        addLiveBotLog(`Placed Administration recruitment submission board on channel: ${message.channel?.name}`, 'COMMAND');
        return;
      }

      if (commandName === 'setup-suggestions' && suggestion?.enabled) {
        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const row = new ActionRowBuilder<any>().addComponents(
          new ButtonBuilder()
            .setCustomId('submit_suggestion_btn')
            .setLabel('تقديم اقتراح جديد 💡 Submit Suggestion')
            .setStyle(ButtonStyle.Primary)
        );
        
        const sugEmbed = new EmbedBuilder()
          .setTitle("💡 لوحة المقترحات والترقيات التفاعلية")
          .setDescription("أهلاً بك! يمكنك المساهمة في تطوير وتحسين السيرفر عبر تقديم اقتراحاتك وآرائك مباشرة. اضغط على الزر أدناه لكتابة اقتراحك.")
          .setColor(parseColor(suggestion.embedColor, 15859727));
          
        if (suggestion.botName) sugEmbed.setFooter({ text: suggestion.botName });
        if (suggestion.bannerUrl) sugEmbed.setImage(suggestion.bannerUrl);

        await message.channel.send({ embeds: [sugEmbed], components: [row] });
        addLiveBotLog(`Placed Interactive suggestions panel on channel: ${message.channel?.name}`, 'COMMAND');
        return;
      }

      if (commandName === 'setup-rules' && rulesBot?.enabled) {
        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const mainEmbed = new EmbedBuilder()
          .setTitle("⚖️ دستور وقوانين السيرفر الرسمية")
          .setDescription("يرجى اختيار القسم أو لائحة القوانين التي تود مراجعتها من خلال القائمة المنسدلة في الأسفل لقراءة البنود والتعليمات بكل سلاسة.")
          .setColor(parseColor(rulesBot.embedColor, 10181046));
          
        if (rulesBot.botName) {
          mainEmbed.setFooter({ text: rulesBot.botName });
        }
        if (rulesBot.bannerUrl) {
          mainEmbed.setImage(rulesBot.bannerUrl);
        }

        const options = (rulesBot.categories || []).map((cat: any) => 
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.name || 'قسم القوانين')
            .setValue(cat.id)
            .setEmoji(cat.icon || '📜')
        );

        if (options.length === 0) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel('لا توجد أقسام حالياً')
              .setValue('none')
              .setEmoji('⚠️')
          );
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('select_rules_category')
          .setPlaceholder('اختر القسم المطلوب قراءته | Select Category 📜')
          .addOptions(options);

        const row = new ActionRowBuilder<any>().addComponents(selectMenu);

        await message.channel.send({ embeds: [mainEmbed], components: [row] });
        addLiveBotLog("Generated rules panel with select category dropdown menu successfully in Discord.", 'COMMAND');
        return;
      }

      if (commandName === 'setup-hr' && leaveConfig?.enabled) {
        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;
        const row = new ActionRowBuilder<any>().addComponents(
          new ButtonBuilder()
            .setCustomId('hr_apply_leave')
            .setLabel('طلب إجازة مؤقتة 🌴')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('hr_apply_resignation')
            .setLabel('تقديم طلب الاستقالة 🚪')
            .setStyle(ButtonStyle.Danger)
        );
        const hrEmbed = new EmbedBuilder()
          .setTitle("🌴 شؤون الموظفين والإجازات والاستقالات")
          .setDescription("خاص بتقديم رغبات الإجازات المؤقتة أو تقديم طلبات الاستقالة الرسمية كعضو في الإدارة. انقر فوق الزر المناسب للبدء.")
          .setColor(parseColor(leaveConfig.embedColor, 1752220));
        
        if (leaveConfig.bannerUrl) {
          hrEmbed.setImage(leaveConfig.bannerUrl);
        }
        
        await message.channel.send({ embeds: [hrEmbed], components: [row] });
        addLiveBotLog(`Placed HR staffing separate panels with separate buttons on channel: ${message.channel?.name}`, 'COMMAND');
        return;
      }

      // Check standard prefix command
      const userCmd = (commands || []).find((c: any) => c.type === 'prefix' && c.trigger.toLowerCase().trim() === commandName);
      if (userCmd) {
        addLiveBotLog(`Executed prefix command: ${prefix}${commandName} [User: ${message.author.tag}]`, 'COMMAND');
        
        if (userCmd.responseType === 'text') {
          const processed = renderPlaceholders(userCmd.responseText, message, false);
          await message.channel.send(processed);
        } else if (userCmd.responseType === 'embed') {
          const embed = makeEmbedFromCommand(userCmd, message, false);
          await message.channel.send({ embeds: [embed] });
        } else if (userCmd.responseType === 'ai') {
          await message.channel.sendTyping();
          try {
            const aiClient = getGeminiClient();
            if (!aiClient) {
              await message.channel.send("🤖 AI cognitive system is currently offline. Provide GEMINI_API_KEY in the Settings.");
              return;
            }
            const prompt = `Act as simulated Discord Bot named "${config?.name}". Custom instruction constraints: "${userCmd.responseText}". Response to this chatting text in a witty, immersive Discord style: "${content}"`;
            const output = await aiClient.models.generateContent({
              model: "gemini-3.5-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }]
            });
            await message.channel.send(output.text || "I was unable to structure thoughts.");
          } catch (err: any) {
            await message.channel.send("❌ Error indexing Gemini matrix core.");
          }
        }
      }
    });

    // Voice Stats System - update voice channel names
    let statsChannels: { total?: any; active?: any; voice?: any } = {};

    async function updateStatsChannels(guild: any) {
      if (!voiceStats || !voiceStats.enabled) return;
      try {
        const totalMembers = guild.memberCount;
        const activeMembers = guild.members.cache.filter((m: any) => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;
        const voiceUsers = guild.members.cache.filter((m: any) => m.voice.channelId).size;

        const totalName = (voiceStats.totalMembersName || '📊 إجمالي الأعضاء: {count}').replace('{count}', totalMembers.toString());
        const activeName = (voiceStats.activeMembersName || '🟢 المتصلين: {count}').replace('{count}', activeMembers.toString());
        const voiceName = (voiceStats.voiceUsersName || '🔊 بالرومات الصوتية: {count}').replace('{count}', voiceUsers.toString());

        // Find existing stats channels or use cached
        if (!statsChannels.total || !guild.channels.cache.has(statsChannels.total?.id)) {
          statsChannels.total = guild.channels.cache.find((c: any) => c.name.includes('إجمالي الأعضاء') || c.name.startsWith('📊 إجمالي'));
        }
        if (!statsChannels.active || !guild.channels.cache.has(statsChannels.active?.id)) {
          statsChannels.active = guild.channels.cache.find((c: any) => c.name.includes('المتصلين') || c.name.includes('Online'));
        }
        if (!statsChannels.voice || !guild.channels.cache.has(statsChannels.voice?.id)) {
          statsChannels.voice = guild.channels.cache.find((c: any) => c.name.includes('بالصوت') || c.name.includes('Voice'));
        }

        if (statsChannels.total) {
          await statsChannels.total.setName(totalName).catch(() => {});
        }
        if (statsChannels.active) {
          await statsChannels.active.setName(activeName).catch(() => {});
        }
        if (statsChannels.voice) {
          await statsChannels.voice.setName(voiceName).catch(() => {});
        }
      } catch (err: any) {
        addLiveBotLog(`Voice stats update error: ${err.message}`, 'ERROR');
      }
    }

    client.on('voiceStateUpdate', async (oldState: any, newState: any) => {
      if (!voiceStats || !voiceStats.enabled) return;
      await updateStatsChannels(newState.guild);
    });

    // Update stats when members come online/offline via presence update
    client.on('presenceUpdate', async (oldPresence: any, newPresence: any) => {
      if (!voiceStats || !voiceStats.enabled) return;
      if (newPresence?.guild) {
        await updateStatsChannels(newPresence.guild);
      }
    });

    // Update voice stats on member join/leave
    client.on('guildMemberAdd', async (member: any) => {
      if (!voiceStats || !voiceStats.enabled) return;
      await updateStatsChannels(member.guild);
    });
    client.on('guildMemberRemove', async (member: any) => {
      if (!voiceStats || !voiceStats.enabled) return;
      await updateStatsChannels(member.guild);
    });

    // ==========================================
    // MOD LOGS SYSTEM — أحداث السجلات واللوقات
    // ==========================================

    // دالة مساعدة لإرسال اللوقات إلى روم السجلات
    async function sendModLog(guild: any, embed: any) {
      if (!modLogs || !modLogs.enabled || !modLogs.logChannelId) return;
      try {
        const logChannel = guild.channels.cache.get(modLogs.logChannelId);
        if (logChannel) {
          await logChannel.send({ embeds: [embed] });
        }
      } catch (err: any) {
        addLiveBotLog(`ModLog send error: ${err.message}`, 'ERROR');
      }
    }

    // 1️⃣ تعديل الرسائل (messageUpdate)
    client.on('messageUpdate', async (oldMsg: any, newMsg: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMessageEdits) return;
      if (oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
      if (!oldMsg.content || !newMsg.content) return;
      const embed = new EmbedBuilder()
        .setTitle('📝 تعديل رسالة')
        .setColor(0xFFA500)
        .setDescription(
          `**المؤلف:** ${oldMsg.author}\n` +
          `**الروم:** ${oldMsg.channel}\n` +
          `**رابط الرسالة:** [اضغط هنا](https://discord.com/channels/${oldMsg.guild.id}/${oldMsg.channel.id}/${oldMsg.id})\n\n` +
          `**القبل:**\n\`\`\`${oldMsg.content.slice(0, 1000)}\`\`\`\n` +
          `**البعد:**\n\`\`\`${newMsg.content.slice(0, 1000)}\`\`\``
        )
        .setTimestamp();
      await sendModLog(oldMsg.guild, embed);
    });

    // 2️⃣ دخول الأعضاء (guildMemberAdd)
    client.on('guildMemberAdd', async (member: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMemberJoins) return;
      const embed = new EmbedBuilder()
        .setTitle('📥 عضو جديد دخل')
        .setColor(0x00FF00)
        .setDescription(
          `**العضو:** ${member.user} (${member.id})\n` +
          `**اسم المستخدم:** ${member.user.tag}\n` +
          `**عمر الحساب:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
        )
        .setThumbnail(member.user.displayAvatarURL({ forceStatic: true }))
        .setTimestamp();
      await sendModLog(member.guild, embed);
    });

    // 3️⃣ خروج الأعضاء (guildMemberRemove)
    client.on('guildMemberRemove', async (member: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMemberLeaves) return;
      const embed = new EmbedBuilder()
        .setTitle('📤 عضو غادر السيرفر')
        .setColor(0x808080)
        .setDescription(
          `**العضو:** ${member.user} (${member.id})\n` +
          `**اسم المستخدم:** ${member.user.tag}`
        )
        .setThumbnail(member.user.displayAvatarURL({ forceStatic: true }))
        .setTimestamp();
      await sendModLog(member.guild, embed);
    });

    // 4️⃣ حظر عضو (guildBanAdd)
    client.on('guildBanAdd', async (ban: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMemberBans) return;
      const embed = new EmbedBuilder()
        .setTitle('🔨 حظر عضو (BAN)')
        .setColor(0x8B0000)
        .setDescription(
          `**العضو المحظور:** ${ban.user.tag} (${ban.user.id})\n` +
          `**آيدي العضو:** ${ban.user.id}`
        )
        .setTimestamp();
      await sendModLog(ban.guild, embed);
    });

    // 5️⃣ إلغاء حظر (guildBanRemove)
    client.on('guildBanRemove', async (ban: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMemberBans) return;
      const embed = new EmbedBuilder()
        .setTitle('🔓 إلغاء حظر (UNBAN)')
        .setColor(0x00FF00)
        .setDescription(
          `**العضو:** ${ban.user.tag} (${ban.user.id})\n` +
          `**تم فك الحظر عن العضو**`
        )
        .setTimestamp();
      await sendModLog(ban.guild, embed);
    });

    // 6️⃣ إنشاء روم (channelCreate)
    client.on('channelCreate', async (channel: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logChannelChanges) return;
      if (channel.type === 4) return; // تجاهل التصنيفات
      const typeName = channel.type === 2 ? '🔊 صوتي' : '💬 نصي';
      const embed = new EmbedBuilder()
        .setTitle('📁 إنشاء روم جديدة')
        .setColor(0x0000FF)
        .setDescription(
          `**اسم الروم:** ${channel.name}\n` +
          `**النوع:** ${typeName}\n` +
          `**آيدي الروم:** ${channel.id}`
        )
        .setTimestamp();
      await sendModLog(channel.guild, embed);
    });

    // 7️⃣ حذف روم (channelDelete)
    client.on('channelDelete', async (channel: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logChannelChanges) return;
      if (channel.type === 4) return; // تجاهل التصنيفات
      const typeName = channel.type === 2 ? '🔊 صوتي' : '💬 نصي';
      const embed = new EmbedBuilder()
        .setTitle('🗑️ حذف روم')
        .setColor(0xFF0000)
        .setDescription(
          `**اسم الروم:** ${channel.name}\n` +
          `**النوع:** ${typeName}\n` +
          `**آيدي الروم:** ${channel.id}`
        )
        .setTimestamp();
      await sendModLog(channel.guild, embed);
    });

    // 8️⃣ حذف رسالة (messageDelete)
    client.on('messageDelete', async (msg: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMessageDeletes) return;
      try { if (msg.partial) await msg.fetch(); } catch { /* partial fetch failed, continue with what we have */ }
      if (msg.author?.bot) return;
      const embed = new EmbedBuilder()
        .setTitle('🗑️ حذف رسالة')
        .setColor(0xFF0000)
        .setDescription(
          `**المؤلف:** ${msg.author || 'غير معروف'} (${msg.author?.id || '?'})\n` +
          `**الروم:** ${msg.channel}\n` +
          `**المحتوى:**\n` +
          `\`\`\`${(msg.content || 'محتوى غير متوفر (قد تكون الرسالة من ذاكرة التخزين المؤقت)').slice(0, 1000)}\`\`\``
        )
        .setTimestamp();
      await sendModLog(msg.guild, embed);
    });
    // 9️⃣ حذف رسائل متعددة (messageDeleteBulk)
    client.on('messageDeleteBulk', async (messages: any) => {
      if (!modLogs || !modLogs.enabled || !modLogs.logMessageDeletes) return;
      const guild = messages.first()?.guild;
      if (!guild) return;
      const embed = new EmbedBuilder()
        .setTitle('🗑️ حذف رسائل متعددة (Bulk)')
        .setColor(0xFF4500)
        .setDescription(
          `**عدد الرسائل المحذوفة:** ${messages.size}\n` +
          `**الروم:** ${messages.first()?.channel || '?'}`
        )
        .setTimestamp();
      await sendModLog(guild, embed);
    });

    // Interaction commands routing
    client.on('interactionCreate', async (interaction: any) => {
      try {
        // SLASH CHAT INPUT
      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        addLiveBotLog(`Executed Slash command: /${commandName} [User: ${interaction.user.tag}]`, 'COMMAND');

        // Setup commands
        if (commandName === 'setup-tickets' && ticket?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ لا تمتلك صلاحيات كافية لتهيئة وإعداد هذا النظام.", ephemeral: true });
          }
          
          const hasTypes = ticket.ticketTypes && ticket.ticketTypes.length > 0;
          let row;

          if (hasTypes) {
            const selectMenu = new StringSelectMenuBuilder()
              .setCustomId('open_ticket_select')
              .setPlaceholder('📥 · اختر نوع التذكرة | Select Support Category...')
              .addOptions(
                ticket.ticketTypes.map((typ: any) => 
                  new StringSelectMenuOptionBuilder()
                    .setLabel(typ.name)
                    .setValue(typ.id)
                    .setDescription(typ.description || `${typ.name} Support`)
                    .setEmoji(typ.emoji || '🎫')
                )
              );
            row = new ActionRowBuilder<any>().addComponents(selectMenu);
          } else {
            row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel(ticket.buttonLabel || 'فتح تذكرة | Open Ticket 📩')
                .setStyle(ButtonStyle.Primary)
            );
          }

          const chanEmbed = new EmbedBuilder()
            .setTitle(ticket.panelTitle || "🎫 نظام فتح التذاكر")
            .setDescription(ticket.panelDescription || "اضغط على الزر أدناه بالتواصل أو القائمة المخصصة للتوجيه المريح وتفادي التعطيل.")
            .setColor(parseColor(ticket.embedColor, 3447003));
            
          if (ticket.bannerUrl) {
            chanEmbed.setImage(ticket.bannerUrl);
          }
          
          if (ticket.botName) chanEmbed.setFooter({ text: ticket.botName });

          await interaction.reply({ embeds: [chanEmbed], components: [row] });
          return;
        }

        if (commandName === 'setup-staff' && staffApp?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ لا تمتلك الرتبة العسكرية الكافية لتعيين البورد.", ephemeral: true });
          }
          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('apply_staff')
              .setLabel('تقديم على الإدارة 🛡️ Apply for Staff')
              .setStyle(ButtonStyle.Success)
          );
          const embed = new EmbedBuilder()
            .setTitle("🛡️ تقديم طلبات الانضمام لطاقم الإدارة")
            .setDescription("إذا كنت تجد في نفسك الكفاءة والالتزام لمساعدتنا، اضغط على زر التقديم أدناه.")
            .setColor(parseColor(staffApp.embedColor, 3066993));
          if (staffApp.botName) embed.setFooter({ text: staffApp.botName });
          if (staffApp.bannerUrl) {
            embed.setImage(staffApp.bannerUrl);
          }

          await interaction.reply({ embeds: [embed], components: [row] });
          return;
        }

        if (commandName === 'setup-verify' && security?.enabled && security.verificationEnabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ حماية الكابتشا محصورة للإمبراطور والمشرف العام فقط.", ephemeral: true });
          }
          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('verify_user')
              .setLabel(security.verificationButtonLabel || 'تفعيل الحساب (Verify Profile) ✅')
              .setStyle(ButtonStyle.Success)
          );
          const embed = new EmbedBuilder()
            .setTitle("🔐 بوابة التحقق البشري الآمن (Server Verification Gate)")
            .setDescription("اضغط على زر التفعيل لتأكيد حمايتك ومنحك الرتبة تلقائياً.")
            .setColor(parseColor(security.embedColor, 3447003));

          if (security.bannerUrl) {
            embed.setImage(security.bannerUrl);
          }

          await interaction.reply({ embeds: [embed], components: [row] });
          return;
        }

        if (commandName === 'setup-rules' && rulesBot?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return;
          
          const mainEmbed = new EmbedBuilder()
            .setTitle("⚖️ دستور وقوانين السيرفر الرسمية")
            .setDescription("يرجى اختيار القسم أو لائحة القوانين التي تود مراجعتها من خلال القائمة المنسدلة في الأسفل لقراءة البنود والتعليمات بكل سلاسة.")
            .setColor(parseColor(rulesBot.embedColor, 10181046));
            
          if (rulesBot.botName) {
            mainEmbed.setFooter({ text: rulesBot.botName });
          }
          if (rulesBot.bannerUrl) {
            mainEmbed.setImage(rulesBot.bannerUrl);
          }

          const options = (rulesBot.categories || []).map((cat: any) => 
            new StringSelectMenuOptionBuilder()
              .setLabel(cat.name || 'قسم القوانين')
              .setValue(cat.id)
              .setEmoji(cat.icon || '📜')
          );

          if (options.length === 0) {
            options.push(
              new StringSelectMenuOptionBuilder()
                .setLabel('لا توجد أقسام حالياً')
                .setValue('none')
                .setEmoji('⚠️')
            );
          }

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_rules_category')
            .setPlaceholder('اختر القسم المطلوب قراءته | Select Category 📜')
            .addOptions(options);

          const row = new ActionRowBuilder<any>().addComponents(selectMenu);

          await interaction.reply({ embeds: [mainEmbed], components: [row] });
          addLiveBotLog("Generated rules panel with select category dropdown menu via slash command successfully in Discord.", 'COMMAND');
          return;
        }

        if (commandName === 'setup-suggestions' && suggestion?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ لا تمتلك صلاحيات كافية لتهيئة وإعداد هذا النظام.", ephemeral: true });
          }
          
          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('submit_suggestion_btn')
              .setLabel('تقديم اقتراح جديد 💡 Submit Suggestion')
              .setStyle(ButtonStyle.Primary)
          );
          
          const sugEmbed = new EmbedBuilder()
            .setTitle("💡 لوحة المقترحات والترقيات التفاعلية")
            .setDescription("أهلاً بك! يمكنك المساهمة في تطوير وتحسين السيرفر عبر تقديم اقتراحاتك وآرائك مباشرة. اضغط على الزر أدناه لكتابة اقتراحك.")
            .setColor(parseColor(suggestion.embedColor, 15859727));
            
          if (suggestion.botName) sugEmbed.setFooter({ text: suggestion.botName });
          if (suggestion.bannerUrl) sugEmbed.setImage(suggestion.bannerUrl);

          await interaction.reply({ embeds: [sugEmbed], components: [row] });
          addLiveBotLog(`Placed Interactive suggestions panel on channel via slash command: ${interaction.channel?.name}`, 'COMMAND');
          return;
        }

        if (commandName === 'setup-hr' && leaveConfig?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return;
          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('hr_apply_leave')
              .setLabel('طلب إجازة مؤقتة 🌴')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('hr_apply_resignation')
              .setLabel('تقديم طلب الاستقالة 🚪')
              .setStyle(ButtonStyle.Danger)
          );
          const embed = new EmbedBuilder()
            .setTitle("🌴 شؤون الموظفين والإجازات والاستقالات")
            .setDescription("خاص بتقديم رغبات الإجازات المؤقتة أو تقديم طلبات الاستقالة الرسمية كعضو في الإدارة. انقر فوق الزر المناسب للبدء.")
            .setColor(parseColor(leaveConfig.embedColor, 1752220));

          if (leaveConfig.bannerUrl) {
            embed.setImage(leaveConfig.bannerUrl);
          }

          await interaction.reply({ embeds: [embed], components: [row] });
          return;
        }

        if (commandName === 'setup-auto-roles' && autoRoles?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return;
          const roleList = (autoRoles.rolesList || []).map((r: any) => `<@&${r.id}>`).join('\n') || 'No roles configured';
          const embed = new EmbedBuilder()
            .setTitle("🎖️ نظام الرتب التلقائية")
            .setDescription(`سيتم منح الرتب التالية تلقائياً للأعضاء الجدد عند دخولهم السيرفر:\n\n${roleList}`)
            .setColor(parseColor(autoRoles.embedColor, 16748842));
          if (autoRoles.bannerUrl) embed.setImage(autoRoles.bannerUrl);
          if (autoRoles.botName) embed.setFooter({ text: autoRoles.botName });
          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        // H. Report System - slash command
        if (commandName === 'report' && report?.enabled) {
          const modal = new ModalBuilder()
            .setCustomId('report_modal')
            .setTitle('🚨 تقديم شكوى أو بلاغ');

          const reportedUserInput = new TextInputBuilder()
            .setCustomId('reported_user')
            .setLabel('اسم أو ID العضو المشتكى عليه')
            .setPlaceholder('مثال: @user#1234 أو 569832145896324158')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const reasonInput = new TextInputBuilder()
            .setCustomId('report_reason')
            .setLabel('سبب البلاغ بالتفصيل')
            .setPlaceholder('اكتب تفاصيل المخالفة هنا...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const proofInput = new TextInputBuilder()
            .setCustomId('report_proof')
            .setLabel('رابط الإثبات أو الدليل (اختياري)')
            .setPlaceholder('https://i.imgur.com/screenshot.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          modal.addComponents(
            new ActionRowBuilder<any>().addComponents(reportedUserInput),
            new ActionRowBuilder<any>().addComponents(reasonInput),
            new ActionRowBuilder<any>().addComponents(proofInput)
          );

          await interaction.showModal(modal);
          return;
        }

        // I. Warn System - slash command
        if (commandName === 'warn' && warning?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers) && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ ليس لديك صلاحية إصدار تحذيرات.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('warn_modal')
            .setTitle('🔨 إصدار تحذير لعضو');

          const targetUserInput = new TextInputBuilder()
            .setCustomId('warn_user')
            .setLabel('الرقم التعريفي للعضو (Discord ID)')
            .setPlaceholder('مثال: 569832145896324158')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const warnReasonInput = new TextInputBuilder()
            .setCustomId('warn_reason')
            .setLabel('سبب التحذير')
            .setPlaceholder('اكتب سبب المخالفة...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder<any>().addComponents(targetUserInput),
            new ActionRowBuilder<any>().addComponents(warnReasonInput)
          );

          await interaction.showModal(modal);
          return;
        }

        // J. Giveaway System - slash command
        if (commandName === 'giveaway' && giveaway?.enabled) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ ليس لديك صلاحية إنشاء سحوبات.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('giveaway_modal')
            .setTitle('🎁 إنشاء سحب جائزة جديد');

          const prizeInput = new TextInputBuilder()
            .setCustomId('giveaway_prize')
            .setLabel('الجائزة')
            .setPlaceholder('مثال: رتبة VIP + 50,000 كاش')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const winnersInput = new TextInputBuilder()
            .setCustomId('giveaway_winners')
            .setLabel('عدد الفائزين')
            .setPlaceholder('مثال: 1')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const durationInput = new TextInputBuilder()
            .setCustomId('giveaway_duration')
            .setLabel('المدة بالدقائق')
            .setPlaceholder('مثال: 60')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder<any>().addComponents(prizeInput),
            new ActionRowBuilder<any>().addComponents(winnersInput),
            new ActionRowBuilder<any>().addComponents(durationInput)
          );

          await interaction.showModal(modal);
          return;
        }

        // Custom designer slash commands
        const cleanName = commandName.toLowerCase().trim();
        const userCmd = (commands || []).find((c: any) => c.type === 'slash' && c.trigger.replace('/', '').toLowerCase().trim() === cleanName);
        if (userCmd) {
          if (userCmd.responseType === 'text') {
            const reply = renderPlaceholders(userCmd.responseText, interaction, true);
            await interaction.reply({ content: reply });
          } else if (userCmd.responseType === 'embed') {
            const embed = makeEmbedFromCommand(userCmd, interaction, true);
            await interaction.reply({ embeds: [embed] });
          } else if (userCmd.responseType === 'ai') {
            await interaction.deferReply();
            try {
              const aiClient = getGeminiClient();
              if (!aiClient) {
                await interaction.editReply({ content: "🤖 Gemini core is offline! Hook up Process.env.GEMINI_API_KEY inside Settings." });
                return;
              }
              const prompt = `Act as simulated Discord Bot named "${config?.name}". Custom instruction constraints: "${userCmd.responseText}". Respond to this user query: "/${commandName}" in an engaging Discord style.`;
              const output = await aiClient.models.generateContent({
                model: "gemini-3.5-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }]
              });
              await interaction.editReply({ content: output.text || "Cannot query thoughts." });
            } catch (err: any) {
              await interaction.editReply({ content: "❌ Mindcore connection fault error." });
            }
          }
        }
      }

      // BUTTON CLICK EVENTS
      if (interaction.isButton()) {
        const { customId } = interaction;

        // A. Security Verification Captcha Profile
        if (customId === 'verify_user') {
          await interaction.deferReply({ ephemeral: true });
          try {
            let role = interaction.guild?.roles.cache.find((r: any) => r.name.toLowerCase() === 'member' || r.name === 'الأعضاء' || r.name === 'عضو');
            if (!role) {
              // Create role
              role = await interaction.guild?.roles.create({
                name: 'Member',
                color: '#3498db',
                reason: 'Automated verified member role generation'
              }).catch(() => undefined);
            }

            if (role) {
              await interaction.member.roles.add(role);
              await interaction.editReply({ content: security?.verificationSuccessMessage || "تهانينا! تم تفعيل حسابك ومنحك رتبة الأعضاء وزوال الحظر أوتوماتيكيًا. ✅" });
              addLiveBotLog(`Security verification successful, member role granted: ${interaction.user.tag}`, 'EVENT');
            } else {
              await interaction.editReply({ content: "⚠️ لم أستطع العثور على رتبة العضو (Member) لتعيينها لك حاليًا." });
            }
          } catch (err: any) {
            await interaction.editReply({ content: "❌ لم تمتلك صلاحية كافية لتسيير الرتبة! تأكد من سحب رتبة البوت للأعلى فوق رتبة الأعضاء في إعدادات رتب السيرفر!" });
          }
          return;
        }

        // B. Active Ticket Click Launcher
        if (customId === 'open_ticket') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const ticketId = Math.floor(1000 + Math.random() * 9000).toString();
            const roomName = `🎫-تذكرة-${ticketId}-${interaction.user.username.toLowerCase()}`;
            const exists = interaction.guild?.channels.cache.find((c: any) => c.name.startsWith(`🎫-تذكرة-`) && c.name.endsWith(interaction.user.username.toLowerCase()));
            if (exists) {
              return interaction.editReply({ content: `⚠️ لديك تذكرة دعم فني مفتوحة حالياً للحديث بالفعل: ${exists}` });
            }

            // Create private text room channel in server
            const room = await interaction.guild?.channels.create({
              name: roomName,
              type: 0, // Text Channel
              permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  deny: [PermissionFlagsBits.ViewChannel] // Hide for everyone
                },
                {
                  id: interaction.user.id,
                  allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.ReadMessageHistory
                  ]
                }
              ]
            } as any);

            const categoryPrefix = ticket?.ticketCategoryName || "تذاكر الدعم Open Tickets";
            let cat = interaction.guild?.channels.cache.get(categoryPrefix) as any;
            if (!cat) {
              cat = interaction.guild?.channels.cache.find((c: any) => c.name.toLowerCase().includes(categoryPrefix.toLowerCase()) && c.type === 4);
            }
            if (cat && room) {
              await (room as any).setParent(cat.id, { lockPermissions: false }).catch(() => {});
            }

            const welcomeText = ticket?.welcomeMessage || "سيتواصل معك كابتن الإدارة قريباً بمجرد توفره. يرجى توضيح استفسارك.";
            const ticketEmbed = new EmbedBuilder()
              .setTitle(`طلب الدعم الفني 🖥️ • #${ticketId}`)
              .setDescription(`
**mjk system - premium ticket**

------------------------------------------
💸 **رقم التذكرة:** \`#${ticketId}\`
📁 **القسم:** \`الدعم العام\`
⚡ **الأولوية:** \`🟢 عادية\`
📌 **الحالة:** \`🟢 مفتوحة\`
👤 **صاحب التذكرة:** ${interaction.user}
🛡️ **المستلم:** \`غير مستلمة\`
⌚ **وقت الفتح:** <t:${Math.floor(Date.now() / 1000)}:R>
------------------------------------------

**مرحباً بك يا ${interaction.user}!**
${welcomeText}
`)
              .setColor(3447003)
              .setTimestamp();
            if (ticket?.botName) ticketEmbed.setFooter({ text: ticket.botName });
            if (ticket?.bannerUrl) {
              ticketEmbed.setImage(ticket.bannerUrl);
            }

            const row1 = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('premium_ticket_close_btn_start')
                .setLabel('إغلاق التذكرة 🔒 Close')
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId('premium_ticket_remind_btn')
                .setLabel('تذكير الطاقم 🔔')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_unclaim_btn')
                .setLabel('إلغاء الاستلام 🔄')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('premium_ticket_claim_btn')
                .setLabel('استلام التذكرة 📌')
                .setStyle(ButtonStyle.Success)
            );

            const row2 = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('premium_ticket_ai_suggest')
                .setLabel('اقتراح إداري 🤖')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_priority')
                .setLabel('الأولوية ⚡')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_remove_user')
                .setLabel('إخراج شخص 👤➖')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_add_user')
                .setLabel('إضافة شخص 👤➕')
                .setStyle(ButtonStyle.Secondary)
            );

            if (room) {
              await (room as any).send({
                content: `${interaction.user} | @here`,
                embeds: [ticketEmbed],
                components: [row1, row2]
              });
            }

            await interaction.editReply({ content: `✅ تم إنشاء تذكرة الدعم الفني الخاصة بك بنجاح! توجه إليها هنا: ${room}` });
            addLiveBotLog(`New premium privatized Support Channel ticket room opened for: ${interaction.user.tag}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ لم يملك البوت صلاحيات كافية لإنشاء وإعداد غرف التذاكر! الخطأ: ${err.message}` });
          }
          return;
        }

        // UPGRADED PREMIUM TICKET CONTROLS
        if (customId === 'premium_ticket_claim_btn') {
          const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
          if (!isStaff) {
            return interaction.reply({ content: "❌ عذراً، هذا الإجراء مخصص لفرق الدعم الإداري فقط!", ephemeral: true });
          }

          const oldEmbed = interaction.message.embeds[0];
          if (!oldEmbed) return interaction.reply({ content: "❌ لم يتم العثور على البنية الأساسية للتذكرة.", ephemeral: true });

          const embedBuilder = EmbedBuilder.from(oldEmbed);
          let desc = oldEmbed.description || "";
          
          desc = desc.replace(/🛡️ \*\*المستلم:\*\* `غير مستلمة`/g, `🛡️ **المستلم:** ${interaction.user}`);
          desc = desc.replace(/🛡️ \*\*المستلم:\*\* <@\d+>/g, `🛡️ **المستلم:** ${interaction.user}`);
          embedBuilder.setDescription(desc);

          const oldRows = interaction.message.components;
          const newRow1 = new ActionRowBuilder<any>();
          oldRows[0].components.forEach((comp: any) => {
            const btn = ButtonBuilder.from(comp);
            if (comp.customId === 'premium_ticket_claim_btn') btn.setDisabled(true);
            if (comp.customId === 'premium_ticket_unclaim_btn') btn.setDisabled(false);
            newRow1.addComponents(btn);
          });

          const row2Comp = oldRows[1] ? ActionRowBuilder.from(oldRows[1] as any) : null;
          const components = row2Comp ? [newRow1, row2Comp] : [newRow1];

          await interaction.update({ embeds: [embedBuilder], components });
          await interaction.followUp({ content: `📌 تم استلام هذه التذكرة بنجاح من قبَل الإداري المساعد: ${interaction.user}` });
          addLiveBotLog(`Ticket room ${(interaction.channel as any).name} claimed by support agent: ${interaction.user.tag}`, 'EVENT');
          return;
        }

        if (customId === 'premium_ticket_unclaim_btn') {
          const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
          if (!isStaff) {
            return interaction.reply({ content: "❌ عذراً، هذا الإجراء مخصص لفرق الدعم الإداري فقط!", ephemeral: true });
          }

          const oldEmbed = interaction.message.embeds[0];
          if (!oldEmbed) return interaction.reply({ content: "❌ لم يتم العثور على البنية الأساسية للتذكرة.", ephemeral: true });

          const embedBuilder = EmbedBuilder.from(oldEmbed);
          let desc = oldEmbed.description || "";
          
          desc = desc.replace(/🛡️ \*\*المستلم:\*\* <@\d+>/g, `🛡️ **المستلم:** \`غير مستلمة\``);
          embedBuilder.setDescription(desc);

          const oldRows = interaction.message.components;
          const newRow1 = new ActionRowBuilder<any>();
          oldRows[0].components.forEach((comp: any) => {
            const btn = ButtonBuilder.from(comp);
            if (comp.customId === 'premium_ticket_claim_btn') btn.setDisabled(false);
            if (comp.customId === 'premium_ticket_unclaim_btn') btn.setDisabled(true);
            newRow1.addComponents(btn);
          });

          const row2Comp = oldRows[1] ? ActionRowBuilder.from(oldRows[1] as any) : null;
          const components = row2Comp ? [newRow1, row2Comp] : [newRow1];

          await interaction.update({ embeds: [embedBuilder], components });
          await interaction.followUp({ content: `🔄 تم التنازل عن استلام التذكرة من قبل ${interaction.user} وهي متوفرة لباقي الطاقم.` });
          return;
        }

        if (customId === 'premium_ticket_remind_btn') {
          const isStaffOrOwner = interaction.user.id === interaction.channel.name.split('-')[2] || interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
          if (!isStaffOrOwner) {
            return interaction.reply({ content: "❌ لا يمكنك إرسال تنبيه تذكيري إلا إذا كنت صاحب التذكرة أو عضواً في الإدارة.", ephemeral: true });
          }
          await interaction.reply({
            content: `🔔 **تنبيه هام لطاقم الإدارة والدعم الفني:** يرجى الرد على تذكرة الأستاذ المتابع لإنهاء خدمته في أقرب فرصة! @here`
          });
          return;
        }

        if (customId === 'premium_ticket_priority') {
          const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
          if (!isStaff) {
            return interaction.reply({ content: "❌ عذراً، تغيير أولوية التكت متاح لطاقم الدعم فقط!", ephemeral: true });
          }

          const oldEmbed = interaction.message.embeds[0];
          if (!oldEmbed) return interaction.reply({ content: "❌ لم يتم العثور على البنية الأساسية للتذكرة.", ephemeral: true });

          const embedBuilder = EmbedBuilder.from(oldEmbed);
          let desc = oldEmbed.description || "";

          let nextPriority = "🟢 عادية";
          if (desc.includes("🟢 عادية")) {
            nextPriority = "🟡 متوسطة";
            desc = desc.replace(/⚡ \*\*الأولوية:\*\* `🟢 عادية`/g, `⚡ **الأولوية:** \`🟡 متوسطة\``);
            desc = desc.replace(/⚡ \*\*الأولولية:\*\* `🟢 عادية`/g, `⚡ **الأولولية:** \`🟡 متوسطة\``);
          } else if (desc.includes("🟡 متوسطة")) {
            nextPriority = "🔴 عاجلة";
            desc = desc.replace(/⚡ \*\*الأولوية:\*\* \`🟡 متوسطة\`/g, `⚡ **الأولوية:** \`🔴 عاجلة\``);
            desc = desc.replace(/⚡ \*\*الأولولية:\*\* \`🟡 متوسطة\`/g, `⚡ **الأولولية:** \`🔴 عاجلة\``);
          } else {
            nextPriority = "🟢 عادية";
            desc = desc.replace(/⚡ \*\*الأولوية:\*\* \`🔴 عاجلة\`/g, `⚡ **الأولوية:** \`🟢 عادية\``);
            desc = desc.replace(/⚡ \*\*الأولولية:\*\* \`🔴 عاجلة\`/g, `⚡ **الأولولية:** \`🟢 عادية\``);
          }

          embedBuilder.setDescription(desc);
          await interaction.update({ embeds: [embedBuilder] });
          await interaction.followUp({ content: `⚡ تم تحديث أولوية التذكرة رسمياً لتصبح: **${nextPriority}**` });
          return;
        }

        if (customId === 'premium_ticket_add_user') {
          const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
          if (!isStaff) {
            return interaction.reply({ content: "❌ عذراً، هذا الخيار مخصص لممثلي الإدارة.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('premium_add_user_modal')
            .setTitle('إضافة عضو للمناقشة 👤➕');

          const input = new TextInputBuilder()
            .setCustomId('premium_add_user_id_input')
            .setLabel('الرقم التعريفي (Discord User ID)')
            .setPlaceholder('مثال: 569832145896324158')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
          await interaction.showModal(modal);
          return;
        }

        if (customId === 'premium_ticket_remove_user') {
          const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
          if (!isStaff) {
            return interaction.reply({ content: "❌ عذراً، هذا الخيار مخصص لممثلي الإدارة.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('premium_remove_user_modal')
            .setTitle('إخراج عضو من التذكرة 👤➖');

          const input = new TextInputBuilder()
            .setCustomId('premium_remove_user_id_input')
            .setLabel('الرقم التعريفي (Discord User ID)')
            .setPlaceholder('مثال: 569832145896324158')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
          await interaction.showModal(modal);
          return;
        }

        if (customId === 'premium_ticket_ai_suggest') {
          const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
          if (!isStaff) {
            return interaction.reply({ content: "❌ عذراً، الاقتراحات الإدارية الذكية مخصصة لمشرفي السيرفر وطاقم التدريب فقط!", ephemeral: true });
          }

          await interaction.deferReply({ ephemeral: true });
          try {
            const fetchedMessages = await (interaction.channel as any).messages.fetch({ limit: 15 });
            const sorted = Array.from(fetchedMessages.values()).reverse() as any[];
            
            let dialogue = "";
            for (const msg of sorted) {
              if (msg.author && !msg.author.bot) {
                dialogue += `${msg.author.username}: ${msg.content || ""}\n`;
              }
            }

            if (!dialogue.trim()) {
              return interaction.editReply({ content: "💡 لم يتم العثور على رسائل كافية من الأعضاء في الغرفة لتوليد رد ذكي مخصص ومدروس بالذكاء الاصطناعي حالياً." });
            }

            const aiClient = getGeminiClient();
            if (!aiClient) {
              return interaction.editReply({ content: "❌ عذراً، خدمة الذكاء الاصطناعي غير متصلة حالياً." });
            }

            const prompt = `
أنت مساعد إداري ذكي ومستشار فني محترف في مجتمعات الديسكورد باللغتين العربية والإنجليزية.
راجع محادثة تذكرة الدعم الفني التالية واقترح رداً نموذجياً إدارياً فريداً ومنظماً ومؤدباً جداً يساعد العضو على الفور ويظهر مدى احترافيتنا.

المحادثة الحالية:
${dialogue}

اكتب فقط نص الرد مباشرة وبصيغة جذابة مسبوقة بـ "الرد الإداري المقترح 📋" لتتم كتابته للأعضاء. لا تضف أي شرح أو نصوص ترحيبية خاصة بك للآدمن.
`;

            const modelName = 'gemini-2.5-flash';
            const output = await aiClient.models.generateContent({
              model: modelName,
              contents: prompt
            });

            const solution = output.text || "لم نتمكن من صياغة رد تلقائي حالياً.";
            
            const embedAI = new EmbedBuilder()
              .setTitle("🤖 اقتراح إداري ذكي (Gemini Core)")
              .setDescription(`${solution}`)
              .setColor(8388863)
              .setTimestamp();

            await interaction.editReply({ embeds: [embedAI] });
          } catch (err: any) {
            console.error("AI suggestion generation error:", err);
            await interaction.editReply({ content: `❌ عذراً، واجهنا خطأ أثناء تحليل المحادثة بالذكاء الاصطناعي: ${err.message || err}` });
          }
          return;
        }

        if (customId === 'premium_ticket_close_btn_start' || customId === 'close_ticket') {
          const modal = new ModalBuilder()
            .setCustomId('premium_ticket_close_modal')
            .setTitle('إغلاق وتوثيق التذكرة 🚪');

          const input = new TextInputBuilder()
            .setCustomId('premium_close_reason_input')
            .setLabel('أدخل سبب الإغلاق بالكامل')
            .setPlaceholder('مثال: تم إجابة العميل وحل مشكلته بنجاح...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
          await interaction.showModal(modal);
          return;
        }

        // Ratings star buttons click
        if (customId === 'premium_rate_1' || customId === 'premium_rate_2' || customId === 'premium_rate_3' || customId === 'premium_rate_4' || customId === 'premium_rate_5') {
          const stars = customId.replace('premium_rate_', '');
          await interaction.reply({
            content: `🌟 شكرًا جزيلاً لك على تقييم الخدمة بـ **${stars} من 5 نجوم**! نقدّر رأيك كثيراً. سيتم تدمير وإغلاق الغرفة نهائياً الآن...`
          });
          
          if (ticket?.logChannelId) {
            const logChan = interaction.guild?.channels.cache.get(ticket.logChannelId) as any;
            if (logChan) {
              await logChan.send({
                content: `⭐ **تقييم جديد للأداء:** قام العضو **${interaction.user.tag}** بتقييم تذاكر الدعم وحظي الغرفة بـ \`${stars} / 5\` نجوم! 🎉`
              }).catch(() => {});
            }
          }

          setTimeout(async () => {
            await interaction.channel?.delete().catch(() => {});
          }, 3000);
          return;
        }

        // Additional feedback comments modal trigger
        if (customId === 'premium_rate_notes_btn') {
          const modal = new ModalBuilder()
            .setCustomId('premium_feedback_notes_modal')
            .setTitle('ملاحظات إضافية للدعم الفني 📝');

          const input = new TextInputBuilder()
            .setCustomId('premium_feedback_notes_text')
            .setLabel('اكتب ملاحظاتك بحرية لتحسين خدمتنا')
            .setPlaceholder('اكتب رأيك أو شكواك هنا بكل سرية وأمانة...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
          await interaction.showModal(modal);
          return;
        }

        // Suggestions Board Apply Form Launcher
        if (customId === 'submit_suggestion_btn') {
          if (!suggestion || !suggestion.enabled) {
            return interaction.reply({ content: "⚠️ نظام المقترحات معطل ومغلق حالياً.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('submit_suggestion_modal')
            .setTitle('تقديم اقتراح جديد 💡');

          const input = new TextInputBuilder()
            .setCustomId('suggestion_text_input')
            .setLabel('اكتب اقتراحك بالتفصيل | Type your suggestion:')
            .setPlaceholder('يرجى كتابة مقترحك الفعال هنا لمساعدتنا في تطوير السيرفر...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const row = new ActionRowBuilder<any>().addComponents(input);
          modal.addComponents(row);

          await interaction.showModal(modal);
          return;
        }

        // D. Recruiting Board Apply Form Launcher
        if (customId === 'apply_staff') {
          if (!staffApp || !staffApp.enabled) {
            return interaction.reply({ content: "⚠️ التقديم مغلق ومحجوب حالياً.", ephemeral: true });
          }

          const rQ = staffApp.questions || [];
          if (rQ.length === 0) {
            return interaction.reply({ content: "⚠️ لم يتم إعداد استبيان أسئلة للبوت.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('staff_app_modal')
            .setTitle('طلب الانضمام لطاقم الإدارة 🛡️');

          const rows: any[] = [];
          rQ.slice(0, 5).forEach((q: string, idx: number) => {
            const input = new TextInputBuilder()
              .setCustomId(`q_${idx}`)
              .setLabel(q.length > 45 ? q.slice(0, 42) + '...' : q)
              .setPlaceholder('اكتب إجابتك الواضحة هنا...')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true);
            rows.push(new ActionRowBuilder<any>().addComponents(input));
          });

          modal.addComponents(rows);
          await interaction.showModal(modal);
          return;
        }

        // E. Employee Leaves Apply Form Launcher (Leave)
        if (customId === 'hr_apply_leave') {
          if (!leaveConfig || !leaveConfig.enabled) {
            return interaction.reply({ content: "⚠️ تقديم الاستقالات والإجازات معطل حالياً.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('hr_leave_modal')
            .setTitle('تقديم طلب إجازة مؤقتة 🌴');

          const rInput = new TextInputBuilder()
            .setCustomId('leave_reason')
            .setLabel('السبب الفعلي والمدة المقترحة للإجازة')
            .setPlaceholder('حدد مدة غيابك وظروف الإجازة بالتفصيل...')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

          modal.addComponents(
            new ActionRowBuilder<any>().addComponents(rInput)
          );

          await interaction.showModal(modal);
          return;
        }

        // Employee Resignation Apply Form Launcher (Resignation)
        if (customId === 'hr_apply_resignation') {
          if (!leaveConfig || !leaveConfig.enabled) {
            return interaction.reply({ content: "⚠️ تقديم الاستقالات والإجازات معطل حالياً.", ephemeral: true });
          }

          const modal = new ModalBuilder()
            .setCustomId('hr_resignation_modal')
            .setTitle('تقديم طلب الاستقالة الرسمية 🚪');

          const rInput = new TextInputBuilder()
            .setCustomId('resignation_reason')
            .setLabel('الأسباب الفعالة لتقديم طلب الاستقالة')
            .setPlaceholder('يرجى كتابة أسباب الاستقالة وتوضيح رغبتك بالتفصيل...')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

          modal.addComponents(
            new ActionRowBuilder<any>().addComponents(rInput)
          );

          await interaction.showModal(modal);
          return;
        }

        // F. Leave requests Approve/Reject Admin handles
        if (customId.startsWith('hr_approve_') || customId.startsWith('hr_reject_')) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ صلاحياتك ضعيفة لتنفيذ المعاهدة.", ephemeral: true });
          }
          await interaction.deferReply({ ephemeral: true });
          const isApprove = customId.startsWith('hr_approve_');
          
          let requestType: 'leave' | 'resignation' = 'leave';
          let userId = '';
          if (customId.includes('_leave_')) {
            requestType = 'leave';
            userId = customId.replace(isApprove ? 'hr_approve_leave_' : 'hr_reject_leave_', '');
          } else if (customId.includes('_resignation_')) {
            requestType = 'resignation';
            userId = customId.replace(isApprove ? 'hr_approve_resignation_' : 'hr_reject_resignation_', '');
          } else {
            userId = customId.replace(isApprove ? 'hr_approve_' : 'hr_reject_', '');
          }

          try {
            const target = await interaction.guild?.members.fetch(userId).catch(() => null);
            if (target) {
              let text = '';
              if (requestType === 'leave') {
                text = isApprove
                  ? "🎉 نود إعلامك بأنه تم **الموافقة على طلب إجازتك** الإدارية في السيرفر بنجاح والاعتماد."
                  : "⚠️ نود إعلامك بأنه تم **الاعتراض ورفض طلب إجازتك** الإدارية السابقة نظراً للحاجة الهامة للعمل.";
                
                // Add leave role if configured
                if (isApprove && leaveConfig?.leaveRoleId) {
                  const role = interaction.guild?.roles.cache.get(leaveConfig.leaveRoleId) || 
                               interaction.guild?.roles.cache.find((r: any) => r.name.toLowerCase() === leaveConfig.leaveRoleId?.toLowerCase() || r.id === leaveConfig.leaveRoleId);
                  if (role) {
                    await target.roles.add(role).catch(() => {});
                  }
                }
              } else {
                text = isApprove
                  ? "🚪 تم **الموافقة على طلب استقالتك رسميًا** وسحب كافة رتبك وصلاحياتك وتسويه مستحقاتك الإدارية. نشكرك على فترتك وخدمتك."
                  : "❌ تم **رفض طلب استقالتك الإدارية**. يرجى مراجعة الإدارة العليا للتفاهم وتسوية الأوضاع بشكل داخلي.";
                
                // Remove resignation roles if configured
                if (isApprove && leaveConfig?.resignationRemoveRoleIds) {
                  const roleIds = leaveConfig.resignationRemoveRoleIds.split(',').map((id: string) => id.trim()).filter(Boolean);
                  for (const rId of roleIds) {
                    const role = interaction.guild?.roles.cache.get(rId) || 
                                 interaction.guild?.roles.cache.find((r: any) => r.name.toLowerCase() === rId.toLowerCase() || r.id === rId);
                    if (role) {
                      await target.roles.remove(role).catch(() => {});
                    }
                  }
                }
              }
              await target.send({ content: text }).catch(() => {});
            }

            const orig = interaction.message.embeds[0];
            const updated = EmbedBuilder.from(orig)
              .setTitle(orig.title + (isApprove ? " [مقبولة إدارياً ✅]" : " [مرفوضة إدارياً ❌]"))
              .setColor(isApprove ? 3066993 : 15158332)
              .setFooter({ text: `الموقّع: ${interaction.user.tag}` });

            await interaction.message.edit({ embeds: [updated], components: [] }).catch(() => {});
            await interaction.editReply({ content: "✅ تم توقيع المعاملة بالخاص واعتمادها بنجاح!" });
            addLiveBotLog(`HR petition (${requestType}) processed successfully [${isApprove ? "Approved" : "Rejected"}] for User UID: ${userId}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل التسيير: ${err.message}` });
          }
          return;
        }

        // H. Report resolve/dismiss button handlers
        if (customId.startsWith('report_resolve_') || customId.startsWith('report_dismiss_')) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) && !interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: "❌ ليس لديك صلاحية لإدارة البلاغات.", ephemeral: true });
          }
          const isResolve = customId.startsWith('report_resolve_');
          const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setTitle(isResolve ? '✅ تم حل الشكوى' : '❌ تم رفض البلاغ')
            .setColor(isResolve ? 3066993 : 15158332)
            .setFooter({ text: `تم التصرف بواسطة: ${interaction.user.tag}` });
          await interaction.message.edit({ embeds: [embed], components: [] });
          await interaction.reply({ content: isResolve ? '✅ تم حل الشكوى وحفظها.' : '❌ تم رفض البلاغ وحفظه.', ephemeral: true });
          addLiveBotLog(`Report ${isResolve ? 'resolved' : 'dismissed'} by ${interaction.user.tag}`, 'AUTOMOD');
          return;
        }

        // I. Giveaway enter button handler
        if (customId === 'giveaway_enter') {
          // Handled via collector in the modal submission, but add fallback
          await interaction.reply({ content: '✅ تم تسجيل مشاركتك في السحب!', ephemeral: true });
          return;
        }

        // G. Staff recruiting candidates Approve/Reject Admin handles
        if (customId.startsWith('staff_approve_') || customId.startsWith('staff_reject_')) {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ ليس لديك الأقدمية الكافية لتقرير شؤون التعيينات.", ephemeral: true });
          }
          await interaction.deferReply({ ephemeral: true });
          const isApprove = customId.startsWith('staff_approve_');
          const userId = customId.replace(isApprove ? 'staff_approve_' : 'staff_reject_', '');

          try {
            const target = await interaction.guild?.members.fetch(userId).catch(() => null);
            if (target) {
              const rule = isApprove
                ? (staffApp.autoMessageOnApprove || "🎉 Application Accepted!")
                : (staffApp.autoMessageOnReject || "Thank you. App Rejected.");
              
              const text = rule
                .replace(/{user}/g, target.toString())
                .replace(/{username}/g, target.user.username);
              
              await target.send({ content: text }).catch(() => {});

              // Auto-assign role on approval
              if (isApprove && staffApp?.approvedRoleId) {
                const role = interaction.guild?.roles.cache.get(staffApp.approvedRoleId) || 
                             interaction.guild?.roles.cache.find((r: any) => r.name.toLowerCase() === staffApp.approvedRoleId?.toLowerCase() || r.id === staffApp.approvedRoleId);
                if (role) {
                  await target.roles.add(role).catch(() => {});
                }
              }
            }

            const orig = interaction.message.embeds[0];
            const updated = EmbedBuilder.from(orig)
              .setTitle(orig.title + (isApprove ? " [تم قبول التوظيف ✅]" : " [تم رفض الطلب ❌]"))
              .setColor(isApprove ? 3066993 : 15158332)
              .setFooter({ text: `العميد المسؤول: ${interaction.user.tag}` });

            await interaction.message.edit({ embeds: [updated], components: [] }).catch(() => {});
            await interaction.editReply({ content: "✅ تم توقيع واستدعاء العقد وإبلاغ المتطوع بالخاص." });
            addLiveBotLog(`Staff Recruiting decision closed [${isApprove ? 'Admitted' : 'Dismissed'}] for user candidate UID: ${userId}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل التوظيف: ${err.message}` });
          }
          return;
        }
      }

      // SELECT MENU INTERACTIONS
      if (interaction.isStringSelectMenu()) {
        const { customId, values } = interaction;
        if (customId === 'open_ticket_select') {
          await interaction.deferReply({ ephemeral: true });
          const chosenTypeId = values[0];
          const selectedType = ticket.ticketTypes?.find((t: any) => t.id === chosenTypeId);
          
          if (!selectedType) {
            return interaction.editReply({ content: "❌ عذراً، لم نتمكن من تحديد الفئة أو القسم المختار للتذكرة." });
          }

          try {
            const ticketId = Math.floor(1000 + Math.random() * 9000).toString();
            const roomName = `🎫-تذكرة-${ticketId}-${interaction.user.username.toLowerCase()}`;
            const exists = interaction.guild?.channels.cache.find((c: any) => c.name.startsWith(`🎫-تذكرة-`) && c.name.endsWith(interaction.user.username.toLowerCase()));
            if (exists) {
              return interaction.editReply({ content: `⚠️ لديك تذكرة دعم فني مفتوحة حالياً للحديث بالفعل: ${exists}` });
            }

            // Create private text room channel in server
            const room = await interaction.guild?.channels.create({
              name: roomName,
              type: 0, // Text Channel
              permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  deny: [PermissionFlagsBits.ViewChannel] // Hide for everyone
                },
                {
                  id: interaction.user.id,
                  allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.ReadMessageHistory
                  ]
                }
              ]
            } as any);

            const categoryPrefix = selectedType.ticketCategoryName || ticket?.ticketCategoryName || "تذاكر الدعم Open Tickets";
            let cat = interaction.guild?.channels.cache.get(categoryPrefix) as any;
            if (!cat) {
              cat = interaction.guild?.channels.cache.find((c: any) => c.name.toLowerCase().includes(categoryPrefix.toLowerCase()) && c.type === 4);
            }
            if (cat && room) {
              await (room as any).setParent(cat.id, { lockPermissions: false }).catch(() => {});
            }

            const welcomeText = selectedType.welcomeMessage || ticket?.welcomeMessage || "سيتواصل معك كابتن الإدارة قريباً بمجرد توفره. يرجى توضيح استفسارك.";
            const ticketEmbed = new EmbedBuilder()
              .setTitle(`طلب الدعم الفني 🖥️ • #${ticketId}`)
              .setDescription(`
**mjk system - premium ticket**

------------------------------------------
💸 **رقم التذكرة:** \`#${ticketId}\`
📁 **القسم:** \`${selectedType.name}\`
⚡ **الأولوية:** \`🟢 عادية\`
📌 **الحالة:** \`🟢 مفتوحة\`
👤 **صاحب التذكرة:** ${interaction.user}
🛡️ **المستلم:** \`غير مستلمة\`
⌚ **وقت الفتح:** <t:${Math.floor(Date.now() / 1000)}:R>
------------------------------------------

**مرحباً بك يا ${interaction.user}!**
${welcomeText}
`)
              .setColor(3447003)
              .setTimestamp();
            if (ticket?.botName) ticketEmbed.setFooter({ text: ticket.botName });
            if (ticket?.bannerUrl) {
              ticketEmbed.setImage(ticket.bannerUrl);
            }

            const row1 = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('premium_ticket_close_btn_start')
                .setLabel('إغلاق التذكرة 🔒 Close')
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId('premium_ticket_remind_btn')
                .setLabel('تذكير الطاقم 🔔')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_unclaim_btn')
                .setLabel('إلغاء الاستلام 🔄')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('premium_ticket_claim_btn')
                .setLabel('استلام التذكرة 📌')
                .setStyle(ButtonStyle.Success)
            );

            const row2 = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('premium_ticket_ai_suggest')
                .setLabel('اقتراح إداري 🤖')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_priority')
                .setLabel('الأولوية ⚡')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_remove_user')
                .setLabel('إخراج شخص 👤➖')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('premium_ticket_add_user')
                .setLabel('إضافة شخص 👤➕')
                .setStyle(ButtonStyle.Secondary)
            );

            if (room) {
              await (room as any).send({
                content: `${interaction.user} | @here`,
                embeds: [ticketEmbed],
                components: [row1, row2]
              });
            }

            await interaction.editReply({ content: `✅ تم إنشاء تذكرة الدعم الفني الخاصة بك بنجاح! توجه إليها هنا: ${room}` });
            addLiveBotLog(`New premium privatized Support Channel ticket room opened in category [${selectedType.name}] for: ${interaction.user.tag}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ لم يملك البوت صلاحيات كافية لإنشاء وإعداد غرف التذاكر! الخطأ: ${err.message}` });
          }
          return;
        }

        // Rules category select handle
        if (customId === 'select_rules_category' && rulesBot?.enabled) {
          await interaction.deferReply({ ephemeral: true });
          const catId = values[0];
          const cat = rulesBot.categories?.find((c: any) => c.id === catId);
          if (!cat) {
            return interaction.editReply({ content: "❌ القسم غير موجود." });
          }
          const lawsIntro = `📜 **قائمة القوانين والأنظمة الرسمية تحت مسمى [ ${cat.name} ]:**\n\n` + 
            cat.rules.map((rule: string, index: number) => `**البند (${index+1}):** ${rule}`).join("\n\n");
          
          const embed = new EmbedBuilder()
            .setTitle(`${cat.icon || '📜'} لائحة: ${cat.name}`)
            .setDescription(lawsIntro || "لا توجد بنود مضافة بداخل هذه المجموعة حالياً.")
            .setColor(parseColor(rulesBot.embedColor, 10181046))
            .setTimestamp();
            
          if (rulesBot.botName) {
            embed.setFooter({ text: rulesBot.botName });
          }
          
          await interaction.editReply({ embeds: [embed] });
          return;
        }
      }

      // MODALS FORM RECEIVED
      if (interaction.type === 5) {
        const { customId } = interaction;

        // Recruitments form submit
        if (customId === 'staff_app_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const rQ = staffApp.questions || [];
            const answers: { q: string, a: string }[] = [];
            rQ.slice(0, 5).forEach((item: string, idx: number) => {
              answers.push({
                q: item,
                a: interaction.fields.getTextInputValue(`q_${idx}`) || "بلا إجابة"
              });
            });

            const embed = new EmbedBuilder()
              .setTitle("⚡ طلب عضوية جديد طاقم الإدارة")
              .setDescription(`تقدّم السيرة الذاتية بواسطة العضو: ${interaction.user} (${interaction.user.tag})\nID: \`${interaction.user.id}\``)
              .setColor(3447003)
              .setTimestamp();

            answers.forEach((ans, idx) => {
              embed.addFields({ name: `📌 ${idx + 1}. ${ans.q}`, value: ans.a });
            });

            const row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId(`staff_approve_${interaction.user.id}`)
                .setLabel("قبول التعيين ✅ Approve")
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`staff_reject_${interaction.user.id}`)
                .setLabel("رفض التعيين ❌ Reject")
                .setStyle(ButtonStyle.Danger)
            );

            let audit = null;
            if (staffApp?.reviewChannelId) {
              audit = interaction.guild?.channels.cache.get(staffApp.reviewChannelId) as any;
            }
            if (!audit) {
              audit = interaction.guild?.channels.cache.find((c: any) => c.name.toLowerCase().includes("تقديمات") || c.name.toLowerCase().includes("staff")) as any;
            }
            if (!audit) {
              audit = interaction.guild?.channels.cache.find((c: any) => c.type === 0) as any; // general text room
            }

            if (audit) {
              await audit.send({ embeds: [embed], components: [row] });
            }

            await interaction.editReply({ content: "✅ تم تسيير طلب تقديمك بنجاح! سيتم مراجعته من قبل الاستخبارات وعمداء السيرفر وإبلاغك بالنيابة في أقرب وقت." });
            addLiveBotLog(`Staff Recruiting questionnaire answers captured for applicant: ${interaction.user.tag}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ عذراً لم تكتمل عملية التسليم: ${err.message}` });
          }
          return;
        }

        // Suggestions modal submit
        if (customId === 'submit_suggestion_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const text = interaction.fields.getTextInputValue('suggestion_text_input');
            if (!text || text.trim().length === 0) {
              return interaction.editReply({ content: "❌ لا يمكن إرسال اقتراح فارغ." });
            }

            const suggestEmbed = new EmbedBuilder()
              .setTitle("💡 اقتراح جديد | New Suggestion")
              .setDescription(text)
              .setColor(parseColor(suggestion.embedColor, 15859727))
              .setTimestamp();

            if (suggestion.anonymous) {
              suggestEmbed.setAuthor({ name: "عضو مساهم | Anonymous Member" });
            } else {
              suggestEmbed.setAuthor({ 
                name: interaction.user.tag, 
                iconURL: interaction.user.displayAvatarURL() 
              });
            }

            suggestEmbed.setFooter({ text: suggestion.botName || "Suggestions Bot" });

            if (suggestion.bannerUrl) {
              const cleanedBanner = suggestion.bannerUrl.trim();
              if (cleanedBanner.startsWith("http://") || cleanedBanner.startsWith("https://")) {
                suggestEmbed.setImage(cleanedBanner);
              }
            }

            // Find target suggestions channel
            let targetChannel = null;
            if (suggestion?.channelId) {
              const rawInput = suggestion.channelId.toString().trim();
              const matchDigits = rawInput.match(/\d+/);
              const cleanSugId = matchDigits ? matchDigits[0] : rawInput;
              
              targetChannel = interaction.guild?.channels.cache.get(cleanSugId);
              if (!targetChannel) {
                targetChannel = interaction.guild?.channels.cache.find((c: any) => 
                  c.id === cleanSugId ||
                  c.name.toLowerCase() === cleanSugId.toLowerCase() ||
                  c.name.toLowerCase().includes(cleanSugId.toLowerCase())
                );
              }
            }

            if (!targetChannel) {
              targetChannel = interaction.channel;
            }

            const sugRow = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('submit_suggestion_btn')
                .setLabel('💡 تقديم اقتراح جديد')
                .setStyle(ButtonStyle.Primary)
            );

            const sentMsg = await targetChannel.send({ embeds: [suggestEmbed], components: [sugRow] });
            addLiveBotLog(`Generated fresh suggestion embed from ${suggestion.anonymous ? 'Anonymous' : interaction.user.tag} in channel ${targetChannel.name || 'Current Channel'}.`, 'EVENT');
            
            if (suggestion.autoReact) {
              await sentMsg.react('👍').catch(() => {});
              await sentMsg.react('👎').catch(() => {});
            }

            // Also keep track of the suggestion locally on-dashboard if we want!
            if (!suggestion.suggestionsList) suggestion.suggestionsList = [];
            suggestion.suggestionsList.push({
              id: crypto.randomUUID(),
              username: interaction.user.tag,
              userId: interaction.user.id,
              text: text,
              votesUp: 0,
              votesDown: 0,
              status: "pending",
              timestamp: new Date().toLocaleTimeString()
            });

            await interaction.editReply({ content: `✅ تم تقديم اقتراحك بنجاح في قناة ${targetChannel}!` });
          } catch (err: any) {
            await interaction.editReply({ content: `❌ عذراً لم تكتمل عملية تقديم الاقتراح: ${err.message}` });
          }
          return;
        }

        // Leaves request form submit
        if (customId === 'hr_leave_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const leaveReason = interaction.fields.getTextInputValue('leave_reason');

            const embed = new EmbedBuilder()
              .setTitle("🌴 طلب إجازة إدارية مؤقتة جديد")
              .setDescription(`قدّم بواسطة الموظف الإداري: ${interaction.user} (${interaction.user.tag})`)
              .setColor(3447003)
              .addFields(
                { name: "🏷️ نوع التماس", value: "إجازة مؤقتة 🌴", inline: true },
                { name: "📝 شرح الأسباب والمدة", value: leaveReason || "غير محدد", inline: false }
              )
              .setTimestamp();

            const row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId(`hr_approve_leave_${interaction.user.id}`)
                .setLabel("موافق عليها ✅ Accept")
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`hr_reject_leave_${interaction.user.id}`)
                .setLabel("مرفوضة ❌ Dismiss")
                .setStyle(ButtonStyle.Danger)
            );

            let hrLogs = null;
            if (leaveConfig?.reviewChannelId) {
              hrLogs = interaction.guild?.channels.cache.get(leaveConfig.reviewChannelId) as any;
            }
            if (!hrLogs) {
              hrLogs = interaction.guild?.channels.cache.find((c: any) => c.name.includes("إجازة") || c.name.includes("hr")) as any;
            }
            if (!hrLogs) {
              hrLogs = interaction.guild?.channels.cache.find((c: any) => c.type === 0) as any;
            }

            if (hrLogs) {
              await hrLogs.send({ embeds: [embed], components: [row] });
            }

            await interaction.editReply({ content: "✅ تم إحالة طلب الإجازة الخاص بك لجهاز الموارد البشرية بنجاح ومراجعته جارية!" });
            addLiveBotLog(`Employee HR Leave request submission dispatched: ${interaction.user.tag}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ عطل في البث: ${err.message}` });
          }
          return;
        }

        // Resignation request form submit
        if (customId === 'hr_resignation_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const resignReason = interaction.fields.getTextInputValue('resignation_reason');

            const embed = new EmbedBuilder()
              .setTitle("🚪 طلب استقالة إدارية رسمية جديد")
              .setDescription(`قدّم بواسطة الموظف الإداري: ${interaction.user} (${interaction.user.tag})`)
              .setColor(15158332)
              .addFields(
                { name: "🏷️ نوع التماس", value: "استقالة رسمية 🚪", inline: true },
                { name: "📝 شرح الأسباب والالتزام بالتسليم", value: resignReason || "غير محدد", inline: false }
              )
              .setTimestamp();

            const row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId(`hr_approve_resignation_${interaction.user.id}`)
                .setLabel("موافقة واعتماد وبدء سحب الرتب 🚪 Approve & Demote")
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`hr_reject_resignation_${interaction.user.id}`)
                .setLabel("مرفوضة ❌ Dismiss")
                .setStyle(ButtonStyle.Danger)
            );

            let hrLogs = null;
            if (leaveConfig?.reviewChannelId) {
              hrLogs = interaction.guild?.channels.cache.get(leaveConfig.reviewChannelId) as any;
            }
            if (!hrLogs) {
              hrLogs = interaction.guild?.channels.cache.find((c: any) => c.name.includes("إجازة") || c.name.includes("hr")) as any;
            }
            if (!hrLogs) {
              hrLogs = interaction.guild?.channels.cache.find((c: any) => c.type === 0) as any;
            }

            if (hrLogs) {
              await hrLogs.send({ embeds: [embed], components: [row] });
            }

            await interaction.editReply({ content: "✅ تم إحالة طلب الاستقالة الخاص بك للإدارة العليا للمراجعة وسحب التكاليف." });
            addLiveBotLog(`Employee HR Resignation request submission dispatched: ${interaction.user.tag}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ عطل في البث: ${err.message}` });
          }
          return;
        }

        // UPGRADED MODALS FOR PREMIUM TICKET SYSTEM (REQ 5)
        if (customId === 'premium_add_user_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const userId = interaction.fields.getTextInputValue('premium_add_user_id_input').trim();
            const member = await interaction.guild?.members.fetch(userId).catch(() => null);
            if (!member) {
              return interaction.editReply({ content: "❌ لم يتم العثور على أي حساب بهذا المعرف في السيرفر!" });
            }

            await (interaction.channel as any).permissionOverwrites.create(member.id, {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true,
              EmbedLinks: true
            });

            await interaction.editReply({ content: `✅ تم إضافة العضو ${member} بنجاح إلى التذكرة لتبادل أطراف النقاش والاستشارة.` });
            await interaction.channel?.send({ content: `👤➕ **انضمام جديد:** تم استدعاء العضو ${member} للمشاركة في الحديث بقرار من ${interaction.user}.` });
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل إضافة العضو: ${err.message}` });
          }
          return;
        }

        if (customId === 'premium_remove_user_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const userId = interaction.fields.getTextInputValue('premium_remove_user_id_input').trim();
            const member = await interaction.guild?.members.fetch(userId).catch(() => null);
            if (!member) {
              return interaction.editReply({ content: "❌ لم يتم العثور على أي حساب بهذا المعرف في السيرفر!" });
            }

            await (interaction.channel as any).permissionOverwrites.delete(member.id);

            await interaction.editReply({ content: `✅ تم إخراج العضو ${member.user.tag} من التذكرة وسحب صلاحية الرؤية بنجاح.` });
            await interaction.channel?.send({ content: `👤➖ **مغادرة:** تم إخراج العضو **${member.user.tag}** من القصة ومسار التذكرة حالياً.` });
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل إخراج العضو: ${err.message}` });
          }
          return;
        }

        if (customId === 'premium_ticket_close_modal') {
          await interaction.deferReply();
          try {
            const reason = interaction.fields.getTextInputValue('premium_close_reason_input') || "لم يذكر سبب";
            
            let transcriptText = `==================================================\n`;
            transcriptText += `📜 PREMIUM TICKET TRANSCRIPT (أرِشيف المحادثة المميز)\n`;
            transcriptText += `==================================================\n`;
            transcriptText += `اسم الغرفة (Channel Name): ${(interaction.channel as any).name}\n`;
            transcriptText += `أغلقت بواسطة (Closed By): ${interaction.user.tag} (${interaction.user.id})\n`;
            transcriptText += `السبب المذكور لطلب الإغلاق: ${reason}\n`;
            transcriptText += `تاريخ الإغلاق (Closed At): ${new Date().toLocaleString('ar-EG')}\n`;
            transcriptText += `==================================================\n\n`;

            try {
              const fetchedMessages = await (interaction.channel as any).messages.fetch({ limit: 100 });
              const sorted = Array.from(fetchedMessages.values()).reverse() as any[];
              for (const msg of sorted) {
                const timestamp = msg.createdAt ? new Date(msg.createdAt).toLocaleString('ar-EG') : "Unknown";
                const author = msg.author ? `${msg.author.tag} (${msg.author.id})` : "System/Unknown";
                let msgContent = msg.content || "";
                
                if (msg.attachments && msg.attachments.size > 0) {
                  const attachmentsUrls = Array.from(msg.attachments.values()).map((a: any) => a.url).join(", ");
                  msgContent += ` [المرفقات: ${attachmentsUrls}]`;
                }

                if (msg.embeds && msg.embeds.length > 0) {
                  const embedsText = msg.embeds.map((emb: any) => {
                    let text = `[Embed: `;
                    if (emb.title) text += `Title: ${emb.title} | `;
                    if (emb.description) text += `Description: ${emb.description}`;
                    text += `]`;
                    return text;
                  }).join(" ");
                  msgContent += ` ${embedsText}`;
                }

                transcriptText += `[${timestamp}] ${author}:\n  ${msgContent}\n\n`;
              }
            } catch (fetchErr: any) {
              transcriptText += `⚠️ فشل جلب رسائل المحادثة الكاملة: ${fetchErr.message || fetchErr}\n`;
            }

            transcriptText += `\n==================================================\n`;
            transcriptText += `نهاية ملف الأرشيف (End of Ticket Transcript)\n`;
            transcriptText += `==================================================\n`;

            const buffer = Buffer.from('\uFEFF' + transcriptText, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `premium-transcript-${(interaction.channel as any).name}.txt` });

            // Post nice logs embed with detailed stats
            if (ticket?.logChannelId) {
              const logChan = interaction.guild?.channels.cache.get(ticket.logChannelId) as any;
              if (logChan) {
                const logEmbed = new EmbedBuilder()
                  .setTitle(`🔒 تم إغلاق التذكرة بنجاح`)
                  .setDescription(`
📝 **تفاصيل تذكرة الدعم المغلقة:**

📁 **اسم الغرفة:** \`${(interaction.channel as any).name}\`
👤 **أغلقت بواسطة:** ${interaction.user} (\`${interaction.user.tag}\`)
❓ **السبب المذكور:** \`${reason}\`
📅 **تاريخ العملية:** <t:${Math.floor(Date.now() / 1000)}:F>

📂 تم سحب أرشيف المحادثة بالكامل وإرفاقه بالأسفل للمراجعة المستجدة وطواقم التوجيه والتطوير.
`)
                  .setColor(15158332)
                  .setTimestamp();
                if (ticket?.botName) logEmbed.setFooter({ text: ticket.botName });

                await logChan.send({
                  embeds: [logEmbed],
                  files: [attachment]
                }).catch(() => {});
              }
            }

            // Create buttons representing stars 1 to 5 for feedback survey
            const rowRating = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder().setCustomId('premium_rate_1').setLabel('1 ⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId('premium_rate_2').setLabel('2 ⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId('premium_rate_3').setLabel('3 ⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId('premium_rate_4').setLabel('4 ⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId('premium_rate_5').setLabel('5 ⭐').setStyle(ButtonStyle.Success)
            );

            const rowNotes = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('premium_rate_notes_btn')
                .setLabel('كتابة ملاحظة إضافية إدارية ✍️')
                .setStyle(ButtonStyle.Primary)
            );

            const feedbackEmbed = new EmbedBuilder()
              .setTitle(`⭐ استبيان رضا العملاء وتقييم الخدمة`)
              .setDescription(`
**تم توثيق وحفظ أرشيف الغرفة بالكامل بنجاح!**
مستوى تقديرك للسرعة لآراء الطاقم الفني وتفاهمهم يساهم في رقينا. 

فضلاً، اختر التقييم المناسب لتجربتك من الخيارات بالأسفل. سيتم تصفية وبتر القناة خلال **30 ثانية** تلقائياً في حال عدم الاستجابة.
`)
              .setColor(15859727)
              .setTimestamp();

            await interaction.editReply({
              embeds: [feedbackEmbed],
              components: [rowRating, rowNotes]
            });

            // Fallback timeout to delete channel if they do not rate
            const chanId = interaction.channel?.id;
            setTimeout(async () => {
              try {
                const checkChan = interaction.guild?.channels.cache.get(chanId);
                if (checkChan) {
                  await checkChan.delete().catch(() => {});
                  addLiveBotLog(`Privatized premium support channel closed automatically after 30 seconds idle ratings survey.`, 'EVENT');
                }
              } catch (err) {}
            }, 30000);

          } catch (err: any) {
            await interaction.editReply({ content: `❌ عطل في إرسال تقرير الإغلاق المكتوب: ${err.message}` });
          }
          return;
        }

        // REPORT MODAL SUBMISSION
        if (customId === 'report_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const reportedUser = interaction.fields.getTextInputValue('reported_user');
            const reason = interaction.fields.getTextInputValue('report_reason');
            const proof = interaction.fields.getTextInputValue('report_proof') || 'بدون دليل';

            let targetChannel = null;
            if (report?.logsChannelId) {
              const rawId = report.logsChannelId.toString().trim().match(/\d+/);
              const cleanId = rawId ? rawId[0] : report.logsChannelId;
              targetChannel = interaction.guild?.channels.cache.get(cleanId);
            }
            if (!targetChannel) {
              targetChannel = interaction.guild?.channels.cache.find((c: any) => c.name.toLowerCase().includes('report') || c.name.toLowerCase().includes('بلاغ'));
            }
            if (!targetChannel) {
              targetChannel = interaction.guild?.channels.cache.find((c: any) => c.type === 0);
            }

            const reportEmbed = new EmbedBuilder()
              .setTitle('🚨 بلاغ وشكوى جديدة')
              .setDescription(`**المشتكي:** ${interaction.user} (\`${interaction.user.tag}\`)\n**المشتكى عليه:** ${reportedUser}\n**السبب:** ${reason}\n**الدليل:** ${proof}`)
              .setColor(parseColor(report?.embedColor, 15158332))
              .setTimestamp()
              .setFooter({ text: report?.botName || 'ReportBot 🚨' });

            const row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId(`report_resolve_${interaction.user.id}`)
                .setLabel('✅ حل الشكوى')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`report_dismiss_${interaction.user.id}`)
                .setLabel('❌ رفض البلاغ')
                .setStyle(ButtonStyle.Danger)
            );

            if (targetChannel) {
              await targetChannel.send({ embeds: [reportEmbed], components: [row] });
            }
            await interaction.editReply({ content: '✅ تم تقديم بلاغك بنجاح! سيتم مراجعته من قبل الإدارة.' });
            addLiveBotLog(`New report submitted by ${interaction.user.tag} against ${reportedUser}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل تقديم البلاغ: ${err.message}` });
          }
          return;
        }

        // WARN MODAL SUBMISSION
        if (customId === 'warn_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const targetId = interaction.fields.getTextInputValue('warn_user').trim();
            const reason = interaction.fields.getTextInputValue('warn_reason');

            const target = await interaction.guild?.members.fetch(targetId).catch(() => null);
            if (!target) {
              return interaction.editReply({ content: '❌ لم يتم العثور على العضو المطلوب في السيرفر!' });
            }

            const warnEmbed = new EmbedBuilder()
              .setTitle('🔨 تحذير جديد')
              .setDescription(`**العضو:** ${target} (\`${target.user.tag}\`)\n**تم بواسطة:** ${interaction.user}\n**السبب:** ${reason}`)
              .setColor(parseColor(warning?.embedColor, 15158332))
              .setTimestamp()
              .setFooter({ text: warning?.botName || 'PunishBot 🔨' });

            const logChan = interaction.guild?.channels.cache.find((c: any) =>
              c.name.toLowerCase().includes('warn') || c.name.toLowerCase().includes('تحذير') || c.name.toLowerCase().includes('mod-logs')
            );
            const warnChan = logChan || interaction.channel;
            await warnChan.send({ embeds: [warnEmbed] });

            try {
              await target.send({ content: `⚠️ لقد تلقيت تحذيراً في السيرفر.\n**السبب:** ${reason}\n**بواسطة:** ${interaction.user.tag}` });
            } catch (e) {}

            await interaction.editReply({ content: `✅ تم إصدار تحذير للعضو ${target} بنجاح!` });
            addLiveBotLog(`Warning issued to ${target.user.tag} by ${interaction.user.tag} for: ${reason}`, 'AUTOMOD');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل إصدار التحذير: ${err.message}` });
          }
          return;
        }

        // GIVEAWAY MODAL SUBMISSION
        if (customId === 'giveaway_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const prize = interaction.fields.getTextInputValue('giveaway_prize');
            const winners = parseInt(interaction.fields.getTextInputValue('giveaway_winners')) || 1;
            const duration = parseInt(interaction.fields.getTextInputValue('giveaway_duration')) || 60;

            let targetChannel = null;
            if (giveaway?.channelId) {
              const rawId = giveaway.channelId.toString().trim().match(/\d+/);
              const cleanId = rawId ? rawId[0] : giveaway.channelId;
              targetChannel = interaction.guild?.channels.cache.get(cleanId);
            }
            if (!targetChannel) {
              targetChannel = interaction.guild?.channels.cache.find((c: any) => c.name.toLowerCase().includes('giveaway') || c.name.toLowerCase().includes('قيف'));
            }
            if (!targetChannel) {
              targetChannel = interaction.channel;
            }

            const endsAt = new Date(Date.now() + duration * 60 * 1000);
            const giveawayEmbed = new EmbedBuilder()
              .setTitle('🎁 قيف أواي | Giveaway')
              .setDescription(`**الجائزة:** ${prize}\n**عدد الفائزين:** ${winners}\n**تنتهي:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n\nاضغط على 🎉 للمشاركة!`)
              .setColor(parseColor(giveaway?.embedColor, 15859727))
              .setTimestamp()
              .setFooter({ text: giveaway?.botName || 'GiveawayBot 🎉' });

            if (giveaway?.bannerUrl) {
              giveawayEmbed.setImage(giveaway.bannerUrl);
            }

            const giveawayRow = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('giveaway_enter')
                .setLabel('🎉 اشترك في السحب')
                .setStyle(ButtonStyle.Success)
            );

            const giveawayMsg = await targetChannel.send({ embeds: [giveawayEmbed], components: [giveawayRow] });

            // Schedule giveaway end
            const participantsMap = new Map<string, string[]>();
            const collector = giveawayMsg.createMessageComponentCollector({
              filter: (i: any) => i.customId === 'giveaway_enter',
              time: duration * 60 * 1000
            });

            collector.on('collect', async (i: any) => {
              const existing = participantsMap.get(giveawayMsg.id) || [];
              if (!existing.includes(i.user.id)) {
                existing.push(i.user.id);
                participantsMap.set(giveawayMsg.id, existing);
              }
              await i.reply({ content: '✅ تم تسجيل مشاركتك في السحب!', ephemeral: true });
            });

            collector.on('end', async () => {
              const participants = participantsMap.get(giveawayMsg.id) || [];
              const picked: string[] = [];
              if (participants.length > 0) {
                const shuffled = [...participants].sort(() => 0.5 - Math.random());
                for (let i = 0; i < Math.min(winners, shuffled.length); i++) {
                  picked.push(shuffled[i]);
                }
              }

              const resultEmbed = EmbedBuilder.from(giveawayEmbed)
                .setTitle('🎁 انتهى السحب! | Giveaway Ended')
                .setDescription(`**الجائزة:** ${prize}\n**الفائزون:** ${picked.length > 0 ? picked.map((id: string) => `<@${id}>`).join(', ') : 'لا يوجد مشتركين'}`)
                .setColor(3066993);

              await giveawayMsg.edit({ embeds: [resultEmbed], components: [] }).catch(() => {});
              if (picked.length > 0) {
                await targetChannel.send(`🎉 تهانينا! الفائزون في سحب **${prize}**: ${picked.map((id: string) => `<@${id}>`).join(', ')}`).catch(() => {});
              }
              addLiveBotLog(`Giveaway "${prize}" ended. Winners: ${picked.length > 0 ? picked.join(', ') : 'No participants'}`, 'EVENT');
            });

            await interaction.editReply({ content: `✅ تم إنشاء السحب بنجاح في ${targetChannel}!` });
            addLiveBotLog(`Giveaway started: "${prize}" in ${targetChannel.name}`, 'EVENT');
          } catch (err: any) {
            await interaction.editReply({ content: `❌ فشل إنشاء السحب: ${err.message}` });
          }
          return;
        }

        if (customId === 'premium_feedback_notes_modal') {
          await interaction.deferReply({ ephemeral: true });
          try {
            const notes = interaction.fields.getTextInputValue('premium_feedback_notes_text') || "لا يوجد";
            await interaction.editReply({ content: "📝 شكرا لتعقيباتك المميزة! تم تسجيل الملاحظات الإدارية، وسيتم إنهاء وحذف الغرفة نهائياً الآن..." });
            
            if (ticket?.logChannelId) {
              const logChan = interaction.guild?.channels.cache.get(ticket.logChannelId) as any;
              if (logChan) {
                await logChan.send({
                  content: `✍️ **ملاحظة إضافية وسرية للعميل (${interaction.user.tag}):** \`"${notes}"\``
                }).catch(() => {});
              }
            }

            setTimeout(async () => {
              await interaction.channel?.delete().catch(() => {});
            }, 3000);
          } catch (err: any) {
            await interaction.editReply({ content: `❌ لم يتم تدوين الملاحظة: ${err.message}` });
          }
          return;
        }
      }
      } catch (err: any) {
        addLiveBotLog(`Exception in interaction handler: ${err.message || err}`, 'ERROR');
        console.error("Interaction runtime failure:", err);
      }
    });

    // Fire login thread sequence
    await client.login(token);
    botState.client = client;

  } catch (err: any) {
    botState.status = 'error';
    botState.error = err.message || "Unknown Connection Failure";
    addLiveBotLog(`Connection handshake failure! ${err.message}`, 'ERROR');
  }
}

const SUBS_FILE = path.join(process.cwd(), "subscriptions.json");

interface SubscriptionKey {
  key: string;
  duration: string;
  status: "unused" | "used" | "expired";
  createdAt: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  clientId?: string | null;
  activatedGuildId?: string | null;
  activatedUserId?: string | null;
  note?: string;
  allowedModules?: string[];
}

function loadSubscriptions() {
  if (!fs.existsSync(SUBS_FILE)) {
    const defaultData = {
      masterCode: "ADMIN-70-VIP-MEMBERSHIP",
      keys: [
        {
          key: "LIFETIME-MASTER-PAPY615",
          duration: "Lifetime",
          status: "unused",
          createdAt: new Date().toISOString(),
          note: "Master Custom Lifetime Key"
        },
        {
          key: "DISCORD-30DAYS-TEST",
          duration: "30 Days",
          status: "unused",
          createdAt: new Date().toISOString(),
          note: "Trial Starter Key"
        }
      ]
    };
    fs.writeFileSync(SUBS_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(SUBS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading subscriptions.json", err);
    return { masterCode: "ADMIN-70-VIP-MEMBERSHIP", keys: [] };
  }
}

function saveSubscriptions(data: any) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing subscriptions.json", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // AI Discord Bot Chat endpoint
  app.post("/api/bot/chat", async (req, res) => {
    try {
      const { message, botName, personality, history } = req.body;
      const client = getGeminiClient();

      if (!client) {
        const fallbackReplies = [
          `beep boop! I am ${botName || "Discord Bot"}. I heard you say: "${message}". Please configure your GEMINI_API_KEY in the Settings panel to enable real-time artificial intelligence dialogues!`,
          `Hello! I'm acting under my "${personality || "Default"}" programming. To ignite my fully independent AI synapses, link your Gemini API key in AI Studio.`,
          `Processing command... 🤖 System intact! Direct integrations can be enabled securely through your workspace's Settings menu.`
        ];
        const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        return res.json({ reply: randomReply, isSimulated: true });
      }

      const systemInstruction = `You are simulated as an active Discord Bot named "${botName || "DevBot"}". 
Your custom profile/personality is: "${personality || "A helpful assistant bot inside a Discord server"}".
Respond in a friendly, conversational, authentic Discord user/bot tone. Use Discord Markdown highlights occasionally (e.g. **bold**, *italics*, \`code\` blocks, or bullet points). Keep your responses concise, engaging, and usually under 120 words to fit beautifully into a Discord chat screen. Do not prefix your messages with "[Bot]" or "Bot:"; just output your response directly.`;

      const contents = (history || []).map((h: { role: 'user' | 'model'; text: string }) => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.82,
          maxOutputTokens: 500,
        }
      });

      const replyText = response.text || `I received your transmission, but my output parser returned empty text. Let's try again!`;
      res.json({ reply: replyText, isSimulated: false });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ 
        error: "Internal failure processing Gemini reasoning", 
        message: error.message || "Unknown error" 
      });
    }
  });

  // ============================================
  // LIVE DISCORD BOT CONTROLLER ENDPOINTS
  // ============================================
  
  app.get("/api/bot/live-status", (req, res) => {
    const subscriptionKey = (req.query.subscriptionKey || "").toString();
    const botState = getBotInstance(subscriptionKey);
    
    // Dynamically query ping/latency of client connection if active
    if (botState.client && botState.status === 'online') {
      try {
        botState.config = {
          tag: botState.client.user?.tag || "Bot#0000",
          avatar: botState.client.user?.displayAvatarURL({ forceStatic: true }),
          guildsCount: botState.client.guilds.cache.size,
          latency: botState.client.ws.ping
        };
      } catch (err) {}
    }
    
    res.json({
      status: botState.status,
      error: botState.error,
      botUser: botState.config,
      logs: botState.logs
    });
  });

  app.post("/api/bot/live-start", async (req, res) => {
    const { 
      token, 
      clientId, 
      subscriptionKey,
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
    } = req.body;
    
    if (!token || !clientId) {
      return res.status(400).json({ status: "error", message: "Token and Client ID are required params." });
    }

    // Subscription & License Check
    const cleanKey = (subscriptionKey || "").toString().trim().toUpperCase();
    if (!cleanKey) {
      return res.status(403).json({ status: "error", message: "يجب إدخال كود اشتراك نشط لتفعيله واستضافته أونلاين!" });
    }

    const subData = loadSubscriptions();
    const foundKey = subData.keys.find((k: any) => k.key.toUpperCase() === cleanKey);

    if (!foundKey) {
      return res.status(403).json({ status: "error", message: "كود الاشتراك المُدخل غير صحيح أو غير متواجد بسجلات الاستضافة!" });
    }

    // Migrate old "active" status
    if (foundKey.status === "active") {
      foundKey.status = "used";
    }

    // Expired check
    if (foundKey.status === "expired") {
      return res.status(403).json({ status: "error", message: "❌ هذا المفتاح منتهي الصلاحية!" });
    }

    if (foundKey.status === "used" && foundKey.expiresAt && foundKey.expiresAt !== "lifetime") {
      const expDate = new Date(foundKey.expiresAt);
      if (expDate.getTime() < Date.now()) {
        foundKey.status = "expired";
        saveSubscriptions(subData);
        return res.status(403).json({ status: "error", message: "❌ الاشتراك منتهي الصلاحية!" });
      }
    }

    // In unused case, first start will activate it
    if (foundKey.status === "unused") {
      foundKey.status = "used";
      foundKey.activatedAt = new Date().toISOString();
      foundKey.clientId = clientId;
      if (foundKey.duration === "Lifetime") {
        foundKey.expiresAt = "lifetime";
      } else {
        const days = parseInt(foundKey.duration) || 30;
        const exp = new Date();
        exp.setDate(exp.getDate() + days);
        foundKey.expiresAt = exp.toISOString();
      }
      saveSubscriptions(subData);
    }
    
    // Launch in background asynchronously to prevent HTTP blocks
    startDiscordBot(token, clientId, req.body);
    
    res.json({ status: "logging_in", message: "Bot handshake connection sequence initiated." });
  });

  app.post("/api/bot/live-stop", async (req, res) => {
    const subscriptionKey = req.body?.subscriptionKey || (req.query.subscriptionKey || "").toString();
    await stopDiscordBot(subscriptionKey);
    res.json({ status: "offline", message: "Live bot connection closed safely." });
  });

  app.post("/api/bot/live-clear-logs", (req, res) => {
    const subscriptionKey = req.body?.subscriptionKey || (req.query.subscriptionKey || "").toString();
    const botState = getBotInstance(subscriptionKey);
    botState.logs = [];
    res.json({ status: "ok" });
  });

  // ============================================
  // SUBSCRIPTION & LICENSE ENDPOINTS
  // ============================================

const ALL_SYSTEM_MODULES = [
    "welcome", "auto-roles", "ticket", "staff", "security", "auto-responses",
    "embed-formatter", "suggestions", "reports", "warnings", "mod-logs",
    "levels", "giveaways", "rules-bot",
    "leave-resignation", "reaction-roles", "voice-stats"
];

  // 1. Validate key
  app.get("/api/subscription/validate", (req, res) => {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ valid: false, message: "الكود مطلوب" });
    }

    const subData = loadSubscriptions();
    const cleanKey = key.toString().trim().toUpperCase();
    const found = subData.keys.find((k: any) => k.key.toUpperCase() === cleanKey);

    if (!found) {
      return res.json({ valid: false, message: "كود التفعيل غير صالح أو غير موجود!" });
    }

    // Migrate old "active" status
    if (found.status === "active") {
      found.status = "used";
      saveSubscriptions(subData);
    }

    // Check expiration dynamically if used
    if (found.status === "used" && found.expiresAt && found.expiresAt !== "lifetime") {
      const expDate = new Date(found.expiresAt);
      if (expDate.getTime() < Date.now()) {
        found.status = "expired";
        saveSubscriptions(subData);
      }
    }

    if (found.status === "expired") {
      return res.json({ valid: false, status: "expired", message: "❌ كود التفعيل هذا انتهى اشتراكه!" });
    }

    return res.json({
      valid: true,
      key: found.key,
      duration: found.duration,
      status: found.status,
      activatedAt: found.activatedAt,
      expiresAt: found.expiresAt,
      clientId: found.clientId,
      activatedGuildId: found.activatedGuildId,
      activatedUserId: found.activatedUserId,
      note: found.note,
      allowedModules: found.duration === "Lifetime" ? ALL_SYSTEM_MODULES : (found.allowedModules || ALL_SYSTEM_MODULES)
    });
  });

  // 2. Activate an unused key
  app.post("/api/subscription/activate", (req, res) => {
    const { key, clientId, guildId, userId } = req.body;
    if (!key) {
      return res.status(400).json({ status: "error", message: "الرجاء إدخال كود التفعيل" });
    }

    const subData = loadSubscriptions();
    const cleanKey = key.toString().trim().toUpperCase();
    const index = subData.keys.findIndex((k: any) => k.key.toUpperCase() === cleanKey);

    if (index === -1) {
      return res.status(404).json({ status: "error", message: "كود التفعيل غير صحيح!" });
    }

    const found = subData.keys[index];

    // Migrate old "active" status to "used"
    if (found.status === "active") {
      found.status = "used";
    }

    if (found.status === "expired") {
      return res.status(400).json({ status: "error", message: "❌ هذا المفتاح منتهي الصلاحية بالفعل!" });
    }

    if (found.status === "used") {
      // Check if it's actually expired
      if (found.expiresAt && found.expiresAt !== "lifetime") {
        const expDate = new Date(found.expiresAt);
        if (expDate.getTime() < Date.now()) {
          found.status = "expired";
          subData.keys[index] = found;
          saveSubscriptions(subData);
          return res.status(400).json({ status: "error", message: "❌ هذا المفتاح منتهي الصلاحية!" });
        }
      }
      // Still valid — allow verification pass
      return res.json({ 
        status: "success", 
        message: "✅ هذا الكود مفعل ونشط بالفعل!", 
        data: {
          ...found,
          allowedModules: found.duration === "Lifetime" ? ALL_SYSTEM_MODULES : (found.allowedModules || ALL_SYSTEM_MODULES)
        } 
      });
    }

    // Activate the key (status === "unused")
    found.status = "used";
    found.activatedAt = new Date().toISOString();
    found.clientId = clientId || null;
    found.activatedGuildId = guildId || null;
    found.activatedUserId = userId || null;

    if (found.duration === "Lifetime") {
      found.expiresAt = "lifetime";
    } else {
      // Calculate expiration date from NOW
      const days = parseInt(found.duration) || 30;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + days);
      found.expiresAt = expDate.toISOString();
    }

    subData.keys[index] = found;
    saveSubscriptions(subData);

    return res.json({
      status: "success",
      message: `✅ تم تفعيل الاشتراك بنجاح لمدة (${found.duration})!`,
      data: {
        ...found,
        allowedModules: found.duration === "Lifetime" ? ALL_SYSTEM_MODULES : (found.allowedModules || ALL_SYSTEM_MODULES)
      }
    });
  });

  // 3. Admin login check
  app.post("/api/subscription/admin/login", (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "رمز الإدارة مطلوب" });
    }

    const subData = loadSubscriptions();
    if (code.toString().trim() === subData.masterCode) {
      return res.json({ success: true, message: "تم تسجيل الدخول كمسؤول بنجاح" });
    }

    return res.status(401).json({ success: false, message: "رمز الإدارة غير صحيح!" });
  });

  // 4. Admin fetch all keys
  app.post("/api/subscription/admin/keys", (req, res) => {
    const { adminCode } = req.body;
    const subData = loadSubscriptions();

    if (!adminCode || adminCode.toString().trim() !== subData.masterCode) {
      return res.status(403).json({ status: "error", message: "غير مصرح لك باستعراض المفاتيح!" });
    }

    // Before returning, sweep and update expired status on any old keys
    let changed = false;
    subData.keys.forEach((key: any) => {
      // Migrate old "active" status
      if (key.status === "active") {
        key.status = "used";
        changed = true;
      }
      if (key.status === "used" && key.expiresAt && key.expiresAt !== "lifetime") {
        const expDate = new Date(key.expiresAt);
        if (expDate.getTime() < Date.now()) {
          key.status = "expired";
          changed = true;
        }
      }
    });

    if (changed) {
      saveSubscriptions(subData);
    }

    // Default modules for older keys inside lists
    const mappedKeys = subData.keys.map((k: any) => ({
      ...k,
      allowedModules: k.duration === "Lifetime" ? ALL_SYSTEM_MODULES : (k.allowedModules || ALL_SYSTEM_MODULES)
    }));

    return res.json({
      masterCode: subData.masterCode,
      keys: mappedKeys
    });
  });

  // 5. Admin generate keys
  app.post("/api/subscription/admin/generate", (req, res) => {
    const { adminCode, count, duration, note, allowedModules } = req.body;
    const subData = loadSubscriptions();

    if (!adminCode || adminCode.toString().trim() !== subData.masterCode) {
      return res.status(403).json({ status: "error", message: "غير مصرح لك بتوليد مفاتيح!" });
    }

    const numCount = parseInt(count) || 1;
    const selectedDuration = duration || "30 Days";
    const keyNote = note || "Generated Key";
    const modulesToAllow = Array.isArray(allowedModules) ? allowedModules : ALL_SYSTEM_MODULES;

    const generated = [];
    for (let i = 0; i < numCount; i++) {
      // Format: LIC-XXXX-XXXX-XXXX
      const rWord = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedKey = `LIC-${rWord()}-${rWord()}-${rWord()}`;
      
      const newKeyObj = {
        key: generatedKey,
        duration: selectedDuration,
        status: "unused",
        createdAt: new Date().toISOString(),
        note: keyNote,
        activatedGuildId: null,
        allowedModules: modulesToAllow
      };
      
      subData.keys.push(newKeyObj);
      generated.push(newKeyObj);
    }

    saveSubscriptions(subData);

    return res.json({
      status: "success",
      message: `تم توليد عدد ${numCount} من الأكواد بنجاح.`,
      keys: generated
    });
  });

  // 6. Admin expire key (بدلاً من الحذف — المفتاح يبقى للأبد)
  app.post("/api/subscription/admin/delete", (req, res) => {
    const { adminCode, keyToDelete } = req.body;
    const subData = loadSubscriptions();

    if (!adminCode || adminCode.toString().trim() !== subData.masterCode) {
      return res.status(403).json({ status: "error", message: "غير مصرح لك بتعديل المفاتيح!" });
    }

    const found = subData.keys.find((k: any) => k.key.toUpperCase() === keyToDelete.toString().trim().toUpperCase());

    if (!found) {
      return res.status(404).json({ status: "error", message: "لم يتم العثور على المفتاح المطلوب" });
    }

    found.status = "expired";
    if (!found.expiresAt || found.expiresAt === "lifetime") {
      found.expiresAt = new Date(0).toISOString(); // mark as expired immediately
    }
    saveSubscriptions(subData);

    return res.json({
      status: "success",
      message: "✅ تم إبطال المفتاح (expired) بنجاح. المفتاح بقي في قاعدة البيانات للأبد ولم يُحذف."
    });
  });

  // ============================================
  // 🚀 DISCORD OAUTH2 & GUILD MANAGEMENT PIPELINE
  // ============================================
  //
  // المرحلة 1: التوجيه لتسجيل الدخول (Redirect to Discord OAuth2)
  // المرحلة 2: جلب وفلترة السيرفرات (Fetch & Filter Guilds)
  // المرحلة 3: جلب قنوات السيرفر المحدد (Dynamic Channels Fetching)
  // ============================================

  const RAW_APP_URL = process.env.APP_URL?.trim() || "";
  const APP_URL = RAW_APP_URL && RAW_APP_URL !== "MY_APP_URL" ? RAW_APP_URL : "http://localhost:3000";
  const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI?.trim() || "";

  // OAuth credentials from .env أو من واجهة الإعدادات
  let oauthConfig = {
    clientId: process.env.DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    botToken: process.env.DISCORD_BOT_TOKEN || "",
  };

  // جلسات Discord (in-memory)
  interface DiscordSession {
    accessToken: string;
    user: any;
    guilds: any[];
    channelsCache: Map<string, any[]>;
  }
  const discordSessions = new Map<string, DiscordSession>();

  function generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // ──────────────────────────────────────────
  // 🇪 إندبوينت حالة إعدادات OAuth
  // ──────────────────────────────────────────
  app.get('/api/discord/setup/status', (req, res) => {
    const hasClientId = !!(process.env.DISCORD_CLIENT_ID || oauthConfig.clientId);
    const hasClientSecret = !!(process.env.DISCORD_CLIENT_SECRET || oauthConfig.clientSecret);
    const hasBotToken = !!(process.env.DISCORD_BOT_TOKEN || oauthConfig.botToken);
    res.json({ configured: hasClientId && hasClientSecret, hasBotToken });
  });

  // ──────────────────────────────────────────
  // 🇪 إندبوينت حفظ إعدادات OAuth من الواجهة
  // ──────────────────────────────────────────
  app.post('/api/discord/setup', (req, res) => {
    const { clientId, clientSecret, botToken } = req.body;
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'يرجى إدخال Client ID و Client Secret' });
    }
    oauthConfig.clientId = clientId.trim();
    oauthConfig.clientSecret = clientSecret.trim();
    if (botToken) oauthConfig.botToken = botToken.trim();
    res.json({ success: true, message: 'تم حفظ بيانات OAuth بنجاح' });
  });

  // ==========================================
  // المرحلة 1: التوجيه لتسجيل الدخول عبر Discord
  // ==========================================
  //
  // الـ Frontend يستدعي هذا الإندبوينت بعد تفعيل الكود مباشرة.
  // يقوم بتوجيه المستخدم إلى رابط OAuth2 الرسمي من Discord.
  //
  // النطاقات (Scopes): identify + guilds
  // ==========================================

  /**
   * POST /api/discord/begin-login
   * يستدعى من الواجهة بعد تفعيل الكود.
   * يعيد رابط OAuth2 لتوجيه المستخدم إليه.
   */
  app.post('/api/discord/begin-login', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID || oauthConfig.clientId;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم إعداد Discord OAuth بعد. يرجى ضبط CLIENT_ID و CLIENT_SECRET في الإعدادات.'
      });
    }
    const rawRedirect = DISCORD_REDIRECT_URI || `${APP_URL}/api/discord/callback`;
    const encodedRedirect = encodeURIComponent(rawRedirect);
    const scopes = encodeURIComponent("identify guilds");
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirect}&response_type=code&scope=${scopes}&prompt=consent`;

    console.log("\n========== DISCORD OAUTH DEBUG ==========");
    console.log("APP_URL        :", APP_URL);
    console.log("Client ID      :", clientId);
    console.log("Raw redirect   :", rawRedirect);
    console.log("Encoded redirect:", encodedRedirect);
    console.log("Full OAuth URL :", oauthUrl);
    console.log("=========================================\n");

    res.json({ success: true, oauthUrl });
  });

  /**
   * GET /api/discord/auth
   * توجيه مباشر (redirect) إلى Discord OAuth2.
   */
  app.get('/api/discord/auth', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID || oauthConfig.clientId;
    if (!clientId) {
      return res.status(400).json({ error: 'DISCORD_CLIENT_ID غير مضبوط.' });
    }
    const rawRedirect = DISCORD_REDIRECT_URI || `${APP_URL}/api/discord/callback`;
    const redirectUri = encodeURIComponent(rawRedirect);
    const scopes = encodeURIComponent("identify guilds");
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&prompt=consent`;
    res.redirect(oauthUrl);
  });

  // ==========================================
  // Callback OAuth2 - استقبال الكود بعد تسجيل الدخول
  // ==========================================
  //
  // 1. تبادل الكود مع Access Token
  // 2. جلب معلومات المستخدم
  // 3. جلب السيرفرات (غير مفلترة بعد - التفلترة بالمرحلة ٢)
  // 4. إنشاء جلسة وتخزين البيانات
  // 5. التوجيه إلى الواجهة مع معرف الجلسة
  // ==========================================

  app.get('/api/discord/callback', async (req, res) => {
    const { code } = req.query;
    const { clientId, clientSecret } = oauthConfig;

    if (!code) return res.redirect('/?oauth_error=no_code');
    if (!clientId || !clientSecret) return res.redirect('/?oauth_error=oauth_not_configured');

    try {
      const redirectUri = DISCORD_REDIRECT_URI || `${APP_URL}/api/discord/callback`;

      // ── 1. تبادل الكود مع Access Token ──
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code.toString(),
          redirect_uri: redirectUri,
        })
      });
      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        return res.redirect(`/?oauth_error=${encodeURIComponent('فشل تبادل رمز OAuth: ' + errText)}`);
      }
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // ── 2. جلب معلومات المستخدم ──
      const userRes = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!userRes.ok) return res.redirect('/?oauth_error=user_fetch_failed');
      const user = await userRes.json();

      // ── 3. جلب جميع السيرفرات (يتم فلترتها لاحقاً بالمرحلة ٢) ──
      const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const guilds = guildsRes.ok ? await guildsRes.json() : [];

      // ── 4. إنشاء جلسة المستخدم ──
      const sessionId = generateSessionId();
      discordSessions.set(sessionId, {
        accessToken,
        user,
        guilds,
        channelsCache: new Map()
      });

      // ── 5. التوجيه إلى الواجهة مع معرف الجلسة ──
      res.redirect(`/?oauth_session=${sessionId}`);

    } catch (err: any) {
      res.redirect(`/?oauth_error=${encodeURIComponent(err.message || 'Unknown OAuth error')}`);
    }
  });

  // ==========================================
  // المرحلة 2: جلب وفلترة السيرفرات (Guilds)
  // ==========================================
  //
  // يتم جلب السيرفرات من Discord API وتطبيق الفلترة التالية:
  // - owner: true (المستخدم هو مالك السيرفر)
  // - ADMINISTRATOR (0x8) (المستخدم عنده صلاحية الإدارة الكاملة)
  //
  // ملاحظة: نستخدم BigInt لتجنب مشكلة الـ 32-bit مع الأرقام الكبيرة.
  // ==========================================

  /**
   * فلترة السيرفرات: نعرض فقط السيرفرات التي:
   * 1. المستخدم هو مالكها (owner === true)
   * 2. أو عنده صلاحية ADMINISTRATOR (0x8)
   */
  function isOwnerOrAdmin(g: any): boolean {
    if (g.owner === true) return true;
    try {
      const perms = BigInt(g.permissions);
      return (perms & 0x8n) === 0x8n;
    } catch {
      return false;
    }
  }

  /**
   * GET /api/discord/me
   * يرجع معلومات المستخدم + السيرفرات المفلترة (owner أو admin فقط).
   */
  app.get('/api/discord/me', (req, res) => {
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.json({ loggedIn: false });
    }
    const session = discordSessions.get(sessionId)!;
    const filteredGuilds = session.guilds.filter(isOwnerOrAdmin);
    res.json({
      loggedIn: true,
      user: session.user,
      guilds: filteredGuilds,
      totalGuilds: session.guilds.length,
      filteredCount: filteredGuilds.length
    });
  });

  /**
   * GET /api/discord/guilds
   * يرجع قائمة السيرفرات المفلترة (owner أو admin فقط).
   */
  app.get('/api/discord/guilds', (req, res) => {
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ error: 'غير مسجل دخول' });
    }
    const session = discordSessions.get(sessionId)!;
    res.json(session.guilds.filter(isOwnerOrAdmin));
  });

  // ==========================================
  // المرحلة 3: جلب قنوات السيرفر المحدد (Channels)
  // ==========================================
  //
  // بعد اختيار المستخدم لسيرفر معين، نقوم بجلب قنواته باستخدام
  // Bot Token (أكثر موثوقية) ثم OAuth token كاحتياطي.
  //
  // الفلترة: نعيد فقط القنوات النصية (0)، والصوتية (2)، والتصنيفات (4).
  // ==========================================

  /**
   * GET /api/discord/guilds/:id/channels
   * جلب قنوات سيرفر معين باستخدام توكن البوت الخاص بالمستخدم.
   *
   * - يعتمد كلياً على الـ User Bot Token المخزن (من localStorage)
   * - إذا فشل الجلب (403/404) => isBotAdded: false + رابط إضافة البوت
   * - الفلترة: نصية (0), صوتية (2), تصنيفات (4)
   * - التخزين المؤقت: Cache للجلسة
   *
   * @query botToken - توكن البوت الخاص بالمستخدم (من LiveBot)
   * @query clientId - Client ID حق البوت (لعرض رابط الدعوة)
   */
  app.get('/api/discord/guilds/:id/channels', async (req, res) => {
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ error: 'غير مسجل دخول' });
    }

    const session = discordSessions.get(sessionId)!;
    const guildId = req.params.id;
    const userBotToken = (req.query.botToken as string) || "";
    const userClientId = (req.query.clientId as string) || "";
    const forceRefresh = req.query.refresh === "true";

    // ── التخزين المؤقت (نتجاوزه إذا forceRefresh=true) ──
    if (!forceRefresh && session.channelsCache.has(guildId)) {
      return res.json(session.channelsCache.get(guildId)!);
    }
    if (forceRefresh) {
      session.channelsCache.delete(guildId);
    }

    /**
     * دالة مساعدة: جلب القنوات من Discord API مع توكن معين
     * الفلترة: نصية (0), صوتية (2), تصنيفات (4)
     */
    async function fetchWithAuth(authHeader: string): Promise<{ ok: boolean; status: number; data: any[] | null }> {
      try {
        const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
          headers: { Authorization: authHeader }
        });
        if (!channelsRes.ok) {
          return { ok: false, status: channelsRes.status, data: null };
        }

        const channels = await channelsRes.json();
        const filtered = channels.filter((c: any) =>
          c.type === 0 ||    // GUILD_TEXT
          c.type === 2 ||    // GUILD_VOICE
          c.type === 4       // GUILD_CATEGORY
        );

        session.channelsCache.set(guildId, filtered);
        return { ok: true, status: 200, data: filtered };
      } catch {
        return { ok: false, status: 0, data: null };
      }
    }

    try {
      let result: { ok: boolean; status: number; data: any[] | null } | null = null;

      // ── المحاولة الأولى: توكن البوت الخاص بالمستخدم (الأقوى) ──
      if (userBotToken) {
        result = await fetchWithAuth(`Bot ${userBotToken}`);
      }

      // ── المحاولة الثانية: توكن المنصة العام (احتياطي) ──
      if ((!result || !result.ok) && oauthConfig.botToken) {
        result = await fetchWithAuth(`Bot ${oauthConfig.botToken}`);
      }

      // ── المحاولة الثالثة: OAuth Token (احتياطي أخير) ──
      if (!result || !result.ok) {
        result = await fetchWithAuth(`Bearer ${session.accessToken}`);
      }

      // ── فشل الجلب ──
      if (!result || !result.ok) {
        const isBotNotInGuild = (result?.status === 403 || result?.status === 404);
        return res.status(500).json({
          error: 'فشل جلب الرومات.',
          isBotAdded: false,
          botInviteUrl: userClientId
            ? `https://discord.com/api/oauth2/authorize?client_id=${userClientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}&disable_guild_select=true`
            : undefined,
          details: [
            !userBotToken && !oauthConfig.botToken && 'لا يوجد Bot Token مضبوط',
            isBotNotInGuild && 'البوت غير مضاف في هذا السيرفر',
            !isBotNotInGuild && 'فشل الاتصال بـ Discord API'
          ].filter(Boolean)
        });
      }

      res.json(result.data);

    } catch (err: any) {
      res.status(500).json({ error: err.message || 'خطأ غير متوقع في جلب الرومات' });
    }
  });

  /**
   * GET /api/discord/guilds/:id/roles
   * جلب رتب سيرفر معين باستخدام توكن البوت الخاص بالمستخدم.
   */
  app.get('/api/discord/guilds/:id/roles', async (req, res) => {
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ error: 'غير مسجل دخول' });
    }

    const guildId = req.params.id;
    const session = discordSessions.get(sessionId)!;
    const guildInfo = session.guilds.find((g: any) => g.id === guildId);
    if (!guildInfo || !isOwnerOrAdmin(guildInfo)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لهذا السيرفر' });
    }
    const userBotToken = (req.query.botToken as string) || "";

    async function fetchRolesWithAuth(authHeader: string): Promise<{ ok: boolean; data: any[] | null }> {
      try {
        const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
          headers: { Authorization: authHeader }
        });
        if (!rolesRes.ok) return { ok: false, data: null };
        const roles = await rolesRes.json();
        return { ok: true, data: roles };
      } catch {
        return { ok: false, data: null };
      }
    }

    try {
      let result: { ok: boolean; data: any[] | null } | null = null;

      if (userBotToken) {
        result = await fetchRolesWithAuth(`Bot ${userBotToken}`);
      }
      if ((!result || !result.ok) && oauthConfig.botToken) {
        result = await fetchRolesWithAuth(`Bot ${oauthConfig.botToken}`);
      }
      if (!result || !result.ok) {
        result = await fetchRolesWithAuth(`Bearer ${oauthConfig.botToken}`);
      }

      if (!result || !result.ok) {
        return res.status(500).json({ error: 'فشل جلب الرتب.' });
      }

      res.json(result.data);

    } catch (err: any) {
      res.status(500).json({ error: err.message || 'خطأ غير متوقع في جلب الرتب' });
    }
  });

  /**
   * GET /api/discord/bot/invite
   * يرجع رابط دعوة البوت للسيرفر.
   * يستخدم عشان المستخدم يضيف البوت لو ما كان موجود.
   */
  app.get('/api/discord/bot/invite', (req, res) => {
    const clientId = oauthConfig.clientId;
    if (!clientId) {
      return res.status(400).json({ error: 'لم يتم إعداد Client ID' });
    }
    const guildId = req.query.guildId as string;
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands${guildId ? `&guild_id=${guildId}` : ''}&disable_guild_select=true`;
    res.json({ success: true, inviteUrl });
  });

  // ==========================================
  // حفظ وتحميل إعدادات السيرفر (Guild Config)
  // ==========================================

  const GUILD_CONFIG_FILE = path.join(process.cwd(), "guild_configs.json");

  function loadGuildConfigs(): Record<string, any> {
    try {
      if (fs.existsSync(GUILD_CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(GUILD_CONFIG_FILE, "utf-8"));
      }
    } catch (e) { /* ignore */ }
    return {};
  }

  function saveGuildConfigs(data: Record<string, any>) {
    try {
      fs.writeFileSync(GUILD_CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) { /* ignore */ }
  }

  /**
   * POST /api/discord/guilds/:id/config
   * حفظ إعدادات السيرفر (مع التحقق من ملكية السيرفر).
   */
  app.post('/api/discord/guilds/:id/config', (req, res) => {
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ error: 'غير مسجل دخول' });
    }
    const session = discordSessions.get(sessionId)!;
    const guildId = req.params.id;

    // Security check: verify user owns or administrates this guild
    const guild = session.guilds.find((g: any) => g.id === guildId);
    if (!guild || !isOwnerOrAdmin(guild)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لتعديل إعدادات هذا السيرفر' });
    }

    const configs = loadGuildConfigs();
    configs[guildId] = req.body;
    configs[guildId]._updatedAt = new Date().toISOString();
    configs[guildId]._updatedBy = session.user.id;
    saveGuildConfigs(configs);
    res.json({ success: true });
  });

  /**
   * GET /api/discord/guilds/:id/config
   * تحميل إعدادات السيرفر المحفوظة (مع التحقق من ملكية السيرفر).
   */
  app.get('/api/discord/guilds/:id/config', (req, res) => {
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ error: 'غير مسجل دخول' });
    }
    const session = discordSessions.get(sessionId)!;
    const guildId = req.params.id;

    // Security check: verify user owns or administrates this guild
    const guild = session.guilds.find((g: any) => g.id === guildId);
    if (!guild || !isOwnerOrAdmin(guild)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لعرض إعدادات هذا السيرفر' });
    }

    const configs = loadGuildConfigs();
    const saved = configs[guildId] || null;
    // Ensure saved data has _updatedBy set from current session if missing
    if (saved && !saved._updatedBy) {
      saved._updatedBy = session.user.id;
    }
    res.json(saved);
  });

  // ==========================================
  // تسجيل الخروج من Discord
  // ==========================================

  /**
   * POST /api/discord/logout
   * تدمير جلسة المستخدم.
   */
  app.post('/api/discord/logout', (req, res) => {
    const sessionId = req.body.session as string;
    if (sessionId) {
      discordSessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  /**
   * POST /api/discord/guilds/:id/voice-stats/create
   * إنشاء أو تحديث قنوات الإحصائيات الصوتية في سيرفر معين.
   */
  app.post('/api/discord/guilds/:id/voice-stats/create', async (req, res) => {
    const guildId = req.params.id;
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ success: false, error: 'غير مسجل دخول' });
    }
    const session = discordSessions.get(sessionId)!;
    const guildInfo = session.guilds.find((g: any) => g.id === guildId);
    if (!guildInfo || !isOwnerOrAdmin(guildInfo)) {
      return res.status(403).json({ success: false, error: 'ليس لديك صلاحية لهذا السيرفر' });
    }
    const { totalMembersName, activeMembersName, voiceUsersName } = req.body;

    // Find an active bot client across all instances
    let botClient: any = null;
    for (const instance of botInstances.values()) {
      botClient = instance.clientsList?.find((c: any) =>
        c.guilds?.cache?.has(guildId)
      );
      if (botClient) break;
    }

    if (!botClient) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد بوت نشط في هذا السيرفر. قم بتشغيل البوت أولاً من قسم الاستضافة.'
      });
    }

    const guild = botClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(400).json({ success: false, error: 'السيرفر غير متاح' });
    }

    try {
      const catName = '📊 SERVER STATS';
      let category = guild.channels.cache.find((c: any) => c.name === catName && c.type === 4);
      if (!category) {
        category = await guild.channels.create({ name: catName, type: 4 });
      }

      const tName = (totalMembersName || '📊 إجمالي الأعضاء: {count}').replace('{count}', guild.memberCount.toString());
      const aName = (activeMembersName || '🟢 المتصلين: {count}').replace('{count}', '0');
      const vName = (voiceUsersName || '🔊 بالرومات الصوتية: {count}').replace('{count}', '0');

      let chTotal = guild.channels.cache.find((c: any) =>
        c.type === 2 && c.parentId === category.id && (c.name.includes('إجمالي') || c.name.startsWith('📊 إجمالي'))
      );
      if (!chTotal) {
        chTotal = await guild.channels.create({
          name: tName, type: 2, parent: category.id,
          permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }]
        });
      } else {
        await chTotal.setName(tName);
      }

      let chActive = guild.channels.cache.find((c: any) =>
        c.type === 2 && c.parentId === category.id && (c.name.includes('المتصلين') || c.name.includes('Online'))
      );
      if (!chActive) {
        chActive = await guild.channels.create({
          name: aName, type: 2, parent: category.id,
          permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }]
        });
      } else {
        await chActive.setName(aName);
      }

      let chVoice = guild.channels.cache.find((c: any) =>
        c.type === 2 && c.parentId === category.id && (c.name.includes('بالصوت') || c.name.includes('Voice'))
      );
      if (!chVoice) {
        chVoice = await guild.channels.create({
          name: vName, type: 2, parent: category.id,
          permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }]
        });
      } else {
        await chVoice.setName(vName);
      }

      res.json({ success: true, message: 'تم إنشاء/تحديث قنوات الإحصائيات بنجاح' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'فشل إنشاء القنوات' });
    }
  });

  /**
   * POST /api/discord/guilds/:id/voice-stats/delete
   * حذف قنوات الإحصائيات الصوتية من السيرفر عند إيقاف النظام.
   */
  app.post('/api/discord/guilds/:id/voice-stats/delete', async (req, res) => {
    const guildId = req.params.id;
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ success: false, error: 'غير مسجل دخول' });
    }
    const session = discordSessions.get(sessionId)!;
    const guildInfo = session.guilds.find((g: any) => g.id === guildId);
    if (!guildInfo || !isOwnerOrAdmin(guildInfo)) {
      return res.status(403).json({ success: false, error: 'ليس لديك صلاحية لهذا السيرفر' });
    }

    let botClient: any = null;
    for (const instance of botInstances.values()) {
      botClient = instance.clientsList?.find((c: any) =>
        c.guilds?.cache?.has(guildId)
      );
      if (botClient) break;
    }

    if (!botClient) {
      return res.json({ success: true, message: 'لا يوجد بوت نشط' });
    }

    const guild = botClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.json({ success: true, message: 'السيرفر غير متاح' });
    }

    try {
      const catName = '📊 SERVER STATS';
      const category = guild.channels.cache.find((c: any) => c.name === catName && c.type === 4);
      if (category) {
        const statsChannels = guild.channels.cache.filter((c: any) =>
          c.type === 2 && c.parentId === category.id
        );
        for (const ch of statsChannels.values()) {
          await ch.delete().catch(() => {});
        }
        await category.delete().catch(() => {});
      }
      res.json({ success: true, message: 'تم حذف قنوات الإحصائيات' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'فشل حذف القنوات' });
    }
  });

  /**
   * POST /api/discord/guilds/:id/embed/send
   * إرسال Embed مخصص إلى روم محدد في السيرفر عبر البوت النشط.
   */
  app.post('/api/discord/guilds/:id/embed/send', async (req, res) => {
    const guildId = req.params.id;
    const sessionId = req.query.session as string;
    if (!sessionId || !discordSessions.has(sessionId)) {
      return res.status(401).json({ success: false, error: 'غير مسجل دخول' });
    }
    const session = discordSessions.get(sessionId)!;
    const guildInfo = session.guilds.find((g: any) => g.id === guildId);
    if (!guildInfo || !isOwnerOrAdmin(guildInfo)) {
      return res.status(403).json({ success: false, error: 'ليس لديك صلاحية لهذا السيرفر' });
    }

    const { channelId, title, description, color, thumbnail, image, footer } = req.body;
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'يجب اختيار روم للإرسال' });
    }
    if (!title && !description) {
      return res.status(400).json({ success: false, error: 'يجب إدخال عنوان أو وصف للـ Embed' });
    }

    let botClient: any = null;
    for (const instance of botInstances.values()) {
      botClient = instance.clientsList?.find((c: any) =>
        c.guilds?.cache?.has(guildId)
      );
      if (botClient) break;
    }

    if (!botClient) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد بوت نشط في هذا السيرفر. قم بتشغيل البوت أولاً من قسم الاستضافة.'
      });
    }

    try {
      const { EmbedBuilder } = await import("discord.js");
      const embed = new EmbedBuilder()
        .setColor(parseInt(color?.replace('#', '') || '5865F2', 16))
        .setTimestamp();

      if (title) embed.setTitle(title.slice(0, 256));
      if (description) embed.setDescription(description.slice(0, 4096));
      if (thumbnail) embed.setThumbnail(thumbnail);
      if (image) embed.setImage(image);
      if (footer) embed.setFooter({ text: footer.slice(0, 2048) });

      const channel = botClient.channels.cache.get(channelId);
      if (!channel) {
        return res.status(400).json({ success: false, error: 'الروم المحدد غير موجود' });
      }

      await channel.send({ embeds: [embed] });
      res.json({ success: true, message: 'تم إرسال الـ Embed بنجاح' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'فشل إرسال الـ Embed' });
    }
  });

  // Serve static UI assets and route appropriately
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
