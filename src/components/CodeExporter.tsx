import { useState } from "react";
import { BotConfig, BotCommand, WelcomeConfig, TicketConfig, StaffAppConfig, SecurityConfig, RulesConfig, LeaveResignationConfig } from "../types";
import { generateProjectFiles, GeneratedProject } from "../utils/codeGenerator";
import { 
  FileCode, FolderOpen, Copy, Check, Download, Info, ExternalLink, 
  HelpCircle, BookOpen, ChevronDown, CheckSquare, Layers 
} from "lucide-react";

interface CodeExporterProps {
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

export default function CodeExporter({ 
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
}: CodeExporterProps) {
  const generatedFiles = generateProjectFiles(
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
  );
  const [activeFilename, setActiveFilename] = useState<string>("index.js");
  const [copied, setCopied] = useState(false);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);

  const [activeGuide, setActiveGuide] = useState<"bot" | "website">("bot");

  const activeFile = generatedFiles.find(f => f.filename === activeFilename) || generatedFiles[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipFake = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([activeFile.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = activeFile.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {}
  };

  const arabicBotSteps = [
    {
      title: "1. إنشاء تطبيق ديسكورد جديد (Portal Discord)",
      desc: "لتشغيل البوت، يجب أولاً الحصول على هويته الرسمية وتصريحه من نظام خلايا ديسكورد:",
      bullets: [
        "افتح موقع المطورين المعتمد: https://discord.com/developers/applications",
        "قم بتسجيل الدخول بحساب ديسكورد الخاص بك، ثم اضغط على زر New Application الأزرق المضيء بأعلى اليمين.",
        "قم بكتابة اسم البوت الذي ترغب به (مثل: بوت السيرفر الذكي) واضغط على موافقة وإنشاء (Create)."
      ]
    },
    {
      title: "2. استخراج رمز أمان البوت الخاص بك (Bot Token)",
      desc: "هذا الرمز يُعتبر بمثابة الرقم السري لتشغيل الكود وربطه بالسيرفر الفعلي:",
      bullets: [
        "من القائمة اليسرى داخل موقع المطورين، انتقل إلى قسم Bot.",
        "اضغط على زر Reset Token ثم أدخل رمز التحقق إذا طلب منك، وقم بنسخ الرمز الطويل (Token) فوراً.",
        "⚠️ هام جداً: لا تشارك هذا الرمز مع أي شخص! هذا هو التوكن الذي ستضعه في ملف .env ليتمكن كود البوت من إقلاع السيرفر."
      ]
    },
    {
      title: "3. تفعيل صلاحيات الاستقبال الحساسة (Gateway Intents)",
      desc: "بدون هذه الصلاحيات، سيظل البوت صامتاً ولن يتمكن من قراءة الشات أو التفاعل مع الأعضاء:",
      bullets: [
        "في نفس صفحة Bot بموقع المطورين، قم بالتمرير لأسفل حتى تجد قسم Privileged Gateway Intents.",
        "قم بتفعيل الخيارات الثلاثة التالية بالكامل (اضغط على المفتاح ليصبح باللون الأخضر):",
        "• Presence Intent (رصد الحضور)\n• Server Members Intent (رصد انضمام وتعديل الأعضاء)\n• Message Content Intent (قراءة محتوى الرسائل وتشغيل الأوامر مثل !عمل أو !هوية)\n\nاضغط الآن على Save Changes لحفظ التعديلات."
      ]
    },
    {
      title: "4. توليد رابط دعوة البوت وإدخاله لسيرفرك (OAuth2)",
      desc: "الآن حان الوقت لجلب البوت كعضو إلى سيرفر الديسكورد الخاص بك:",
      bullets: [
        "من القائمة اليسرى، اضغط على OAuth2 ثم اختر URL Generator.",
        "من جدول Scopes، ضع علامة صح ✅ على خيار bot وخيار applications.commands.",
        "سيظهر لك جدول جديد بالأسفل لصلاحيات البوت (Bot Permissions)، حدد الصلاحيات الأساسية مثل (Send Messages, Embed Links, Read Message History, Manage Messages).",
        "انسخ الرابط الذي تولد بالأسفل بالكامل، وافتحه في علامة تبويب جديدة بالمتصفح، واختر السيرفر الخاص بك ثم وافق على دخوله!"
      ]
    }
  ];

  const guideSteps = [
    {
      title: "1. Create App on Discord Developer Portal",
      desc: "First, you must register a unique Application with Discord's developer infrastructure.",
      bullets: [
        "Head to the official web link: https://discord.com/developers/applications.",
        "Sign in using standard Discord account logs, then click the purple New Application button in the top right.",
        "Give your application a beautiful descriptive title (e.g. MySuperBot) then click Create."
      ]
    },
    {
      title: "2. Setting up Bot & Token Creation",
      desc: "To empower logins via local scripts, activate a dedicated Bot user inside the application profile.",
      bullets: [
        "On the left-side navigations of your new project, click the Bot tab.",
        "Verify your username configurations and profile icons (matches your designed assets nicely).",
        "Click Reset Token under the token menu header. Copy this private key immediately. Treat this key like a password — paste it inside your .env file as DISCORD_TOKEN."
      ]
    },
    {
      title: "3. Enable Essential Gateway Privileged Intents",
      desc: "To read message strings, parse triggers, and detect joins, Discord sandbox filters require enabling intents.",
      bullets: [
        "In that same Bot tab, scroll down to the Privileged Gateway Intents section.",
        "Toggle ON the following three choices strictly: Presence Intent, Server Members Intent, and Message Content Intent.",
        "Click Save Changes at the bottom of the portal! Without this, your bot will launch but ignore text inputs."
      ]
    },
    {
      title: "4. Create Your OAuth2 Bot Invite Link",
      desc: "Authorize your newly registered bot character to secure a position inside your server.",
      bullets: [
        "Select the OAuth2 tab on the left margin menu, then select URL Generator nested underneath.",
        "Under Scopes checklist, check: ☑ bot and ☑ applications.commands.",
        "Under the secondary Bot Permissions checklist, check: ☑ Send Messages, ☑ Embed Links, ☑ Read Message History, and ☑ Manage Messages.",
        "Copy the generated link at the bottom. Paste it inside a separate internet browser tab, choose a target Discord server, and click Authorize!"
      ]
    }
  ];

  return (
    <div className="space-y-6" id="code-exporter">

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Layers className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider text-white">Production Bundle Generator</span>
          </div>
          <p className="text-xs text-text-muted max-w-2xl">
            Exports your bot configuration, commands, and modules into ready-to-use <strong>Discord.js v14</strong> source code.
          </p>
        </div>
        <a
          href="https://discord.com/developers/applications"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-border-hover text-text-muted hover:text-white rounded-lg text-xs font-medium transition shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Developer Portal
        </a>
      </div>

      {/* Code Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* File Tree */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl h-[600px] flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
            <FolderOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Files</span>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {generatedFiles.map(file => {
              const isActive = file.filename === activeFilename;
              return (
                <div
                  key={file.filename}
                  onClick={() => { setActiveFilename(file.filename); setCopied(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition select-none border ${
                    isActive
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "bg-surface border-border text-text-muted hover:border-border-hover hover:text-white"
                  }`}
                >
                  <FileCode className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-dim"}`} />
                  <span className="text-xs font-mono truncate">{file.filename}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-3 border-t border-border">
            <p className="text-xs text-text-dim flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Click a file to view, copy, or download its source.
            </p>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-9 bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="px-5 py-3.5 bg-surface border-b border-border flex items-center justify-between select-none">
            <div className="flex items-center gap-2 font-mono">
              <FileCode className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-white">{activeFile.filename}</span>
              <span className="text-[10px] text-text-dim ml-1.5 font-sans">
                ({activeFile.filename === "index.js" ? "Engine Bootstrapper" : "Configuration Module"})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZipFake}
                className="px-3 py-1.5 text-[11px] font-medium text-text-muted hover:text-white bg-surface border border-border rounded-lg hover:border-border-hover transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary hover:bg-primary-hover text-white transition flex items-center gap-1.5"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" /> Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy Code</>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#080B12] p-5 font-mono text-xs text-text-muted leading-relaxed">
            <pre className="whitespace-pre overflow-x-visible">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>

      </div>

      {/* Setup Guide */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-6">
        <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Setup Guide
            </h3>
            <p className="text-xs text-text-muted mt-1">Step-by-step instructions to run your bot or host the dashboard.</p>
          </div>

          <div className="flex bg-surface p-0.5 rounded-lg border border-border self-start md:self-center">
            <button
              onClick={() => setActiveGuide("bot")}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
                activeGuide === "bot" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-white"
              }`}
            >
              Bot Guide
            </button>
            <button
              onClick={() => setActiveGuide("website")}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
                activeGuide === "website" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-white"
              }`}
            >
              Website Guide
            </button>
          </div>
        </div>

        {activeGuide === "bot" && (
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-xs text-text-muted leading-relaxed">
              <p className="font-medium text-primary mb-1">Running your bot:</p>
              The code above is a complete Discord.js v14 bot. Copy the files, place them in a folder, and run with Node.js.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {guideSteps.map((step, idx) => (
                <div key={idx} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center">{idx + 1}</span>
                    <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{step.desc}</p>
                  <ul className="text-[10.5px] text-text-muted space-y-1.5 list-disc list-inside leading-relaxed">
                    {step.bullets.map((b, bidx) => (
                      <li key={bidx} className="marker:text-primary">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-5 bg-surface border border-border rounded-xl space-y-4">
              <h4 className="text-xs font-semibold text-white border-b border-border pb-2">Running the bot locally</h4>
              <div className="space-y-3 text-xs text-text-muted leading-relaxed">
                <p>1. Install <strong>Node.js</strong> v18+ from <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-primary hover:underline">nodejs.org</a>.</p>
                <p>2. Create a folder <code className="text-success bg-surface px-1 py-0.5 rounded font-mono">my-discord-bot</code>.</p>
                <p>3. Download all files from the left panel into that folder.</p>
                <div className="bg-[#080B12] p-3 rounded-lg border border-border text-[10px] font-mono text-left space-y-1">
                  <div>📁 my-discord-bot/</div>
                  <div className="pl-4">├── index.js</div>
                  <div className="pl-4">├── config.json</div>
                  <div className="pl-4">├── .env</div>
                  <div className="pl-4">├── package.json</div>
                  <div className="pl-4">└── deploy-commands.js</div>
                </div>
                <p>4. Run <code className="text-primary bg-surface px-1.5 py-0.5 rounded font-mono text-[11px]">npm install</code> in the folder.</p>
                <p>5. Run <code className="text-warning bg-surface px-1.5 py-0.5 rounded font-mono text-[11px]">npm run deploy</code> to register slash commands.</p>
                <p>6. Start the bot with <code className="text-accent bg-surface px-1.5 py-0.5 rounded font-mono text-[11px]">npm start</code>.</p>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-[10px] text-text-muted mt-2">
                  💡 For 24/7 hosting, push the files to GitHub and deploy on <strong>Render.com</strong> or <strong>Railway.app</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeGuide === "website" && (
          <div className="space-y-6">
            <div className="p-4 bg-success/5 rounded-lg border border-success/10 text-xs text-text-muted leading-relaxed">
              <p className="font-medium text-success mb-1">Running this dashboard locally:</p>
              This project is built with React (TypeScript), Vite, and Tailwind CSS. Run it locally to customize and extend.
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-semibold text-white border-b border-border pb-2">Development Setup</h4>
              <div className="space-y-3.5 text-xs text-text-muted leading-relaxed">
                <div><span className="text-primary font-medium block mb-1">1. Download the code</span> Export from the dashboard or clone from your repository.</div>
                <div><span className="text-primary font-medium block mb-1">2. Install dependencies</span>
                  <div className="bg-[#080B12] p-2.5 rounded text-left font-mono text-success border border-border whitespace-pre mt-1">npm install</div>
                </div>
                <div><span className="text-primary font-medium block mb-1">3. Start dev server</span>
                  <div className="bg-[#080B12] p-2.5 rounded text-left font-mono text-primary border border-border whitespace-pre mt-1">npm run dev</div>
                  <p className="text-[10px] text-text-dim mt-1">Opens at <code className="text-primary font-mono">http://localhost:5173</code></p>
                </div>
                <div><span className="text-primary font-medium block mb-1">4. Build for production</span>
                  <div className="bg-[#080B12] p-2.5 rounded text-left font-mono text-warning border border-border whitespace-pre mt-1">npm run build</div>
                  <p className="text-[10px] text-text-dim mt-1">Outputs a <code className="text-primary font-mono">dist/</code> folder ready for Vercel, Netlify, or any static host.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
