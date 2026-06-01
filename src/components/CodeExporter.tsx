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
      
      {/* Visual walkthrough banner */}
      <div className="p-4.5 bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-900/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Layers className="w-5 h-5" />
            <span className="font-extrabold text-[13px] uppercase tracking-wider">Production Node Bundle Generator</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            This module dynamically maps all status presets, custom designed prefix/slash commands, and layouts crafted in other tabs into ready-to-use <strong>Discord.js v14</strong> JavaScript source code.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
          >
            <span>Developer Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Code explorer structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Files Tree */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 h-[600px] flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-slate-400">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Workspace Files</span>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {generatedFiles.map(file => {
              const isActive = file.filename === activeFilename;
              return (
                <div
                  key={file.filename}
                  onClick={() => {
                    setActiveFilename(file.filename);
                    setCopied(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition select-none group border ${
                    isActive
                      ? "bg-slate-800/80 border-blue-600/40 text-blue-400 font-bold"
                      : "bg-slate-950/20 border-transparent text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                  }`}
                >
                  <FileCode className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  <span className="text-xs font-mono truncate">{file.filename}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-500 font-sans">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 inline mr-1 mb-0.5" />
            Click on any file directory workspace entry to load, copy, or download components separately.
          </div>
        </div>

        {/* Right Code Area viewport with Syntax Pre Render */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
          
          {/* Active File Header */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-850 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 font-mono">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">{activeFile.filename}</span>
              <span className="text-[10px] text-slate-600 ml-1.5 font-sans">({activeFile.filename === "index.js" ? "Engine Bootstrapper" : "Configuration Module"})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZipFake}
                className="p-1 px-2 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded hover:border-slate-700 transition flex items-center gap-1 font-sans shadow"
                title="Download this file standalone"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={handleCopyCode}
                className="p-1.5 px-3 rounded text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 font-sans shadow-sm hover:shadow"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Source Code view */}
          <div className="flex-1 overflow-auto bg-[#0b0c0e] p-5 font-mono text-xs text-slate-300 leading-relaxed custom-scrollbar selection:bg-blue-700/50">
            <pre className="whitespace-pre overflow-x-visible">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>

      </div>

      {/* Guide walk-through blocks with interactive Arabic / English beginner assistant */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-start md:justify-end gap-1.5 flex-row-reverse">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>دليل المبتدئين خطوة بخطوة للتشغيل 🚀</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">كيف تقوم بتشغيل كود البوت أو تعديل موقع لوحة التحكم وتنزيله على جهازك بسهولة تامة</p>
          </div>

          {/* Interactive Toggle tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-center font-sans">
            <button
              onClick={() => setActiveGuide("bot")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 ${
                activeGuide === "bot"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🤖 تشغيل كود البوت</span>
            </button>
            <button
              onClick={() => setActiveGuide("website")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 ${
                activeGuide === "website"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🖥️ تشغيل الموقع بالكامل</span>
            </button>
          </div>
        </div>

        {/* 1. DISCORD BOT GUIDE */}
        {activeGuide === "bot" && (
          <div className="space-y-6 text-right animate-fadeIn">
            {/* Quick Overview */}
            <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-xs text-slate-300 leading-relaxed">
              <p className="font-bold text-indigo-400 mb-1">💡 فكرة تشغيل البوت:</p>
              الكود الذي أمامك بالأعلى هو المحرك الفعلي لبوت الديسكورد الخاص بك (مكتوب بـ <strong>Discord.js v14</strong>). لتشغيله في سيرفرك الحقيقي، ستقوم بنسخ هذه الملفات ووضعها في مجلد على كمبيوترك الخاص وتشغيلها باستخدام بيئة <strong>Node.js</strong>.
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {arabicBotSteps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 justify-start flex-row-reverse border-b border-slate-900 pb-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-black flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-200">{step.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{step.desc}</p>
                  <ul className="text-[10.5px] text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed pr-1">
                    {step.bullets.map((b, bidx) => (
                      <li key={bidx} className="marker:text-blue-500 pl-1">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Run Local Bot Commands Setup */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
              <h4 className="text-xs font-black text-slate-100 border-b border-slate-900 pb-2 flex items-center gap-2 flex-row-reverse">
                <span className="p-1 bg-emerald-500/10 rounded text-emerald-400 font-bold">🔨 خطوة التشغيل الفعلي على كمبيوترك</span>
              </h4>

              <div className="space-y-3 text-right text-[11px] text-slate-400 font-sans">
                <p>1. قم بتثبيت برنامج <strong>Node.js</strong> (اصدار 18 أو أحدث) من موقعه الرسمي: <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-blue-450 hover:underline">nodejs.org</a>.</p>
                <p>2. أنشئ مجلداً فارغاً على جهازك باسم <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">my-discord-bot</code>.</p>
                <p>3. قم بتحميل الملفات المعروضة في القائمة اليسرى بالأعلى وضعها جميعاً داخل هذا المجلد:</p>
                
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-left space-y-1 my-2">
                  <div>📁 my-discord-bot/</div>
                  <div className="pl-4">├── index.js      {"<-"} (انسخ ولصق كود هذا الملف)</div>
                  <div className="pl-4">├── config.json   {"<-"} (انسخ ولصق كود الكوفنج)</div>
                  <div className="pl-4">├── .env          {"<-"} (ضع فيه التوكن والـ Client ID الخاص بك)</div>
                  <div className="pl-4">├── package.json  {"<-"} (ملف تعريفي للمكتبات المطلوبة)</div>
                  <div className="pl-4">└── deploy-commands.js {"<-"} (ملف تسجيل أوامر السلاش)</div>
                </div>

                <p>4. افتح شاشة الأوامر (Terminal أو الـ CMD) داخل المجلد واكتب الأمر التالي لتثبيت المبرمجات:</p>
                <div className="bg-slate-900 p-2.5 rounded text-left font-mono text-emerald-400 select-all border border-slate-800 whitespace-pre">
                  npm install
                </div>

                <p>5. لتسجيل أوامر السلاش (Slash Commands) الجديدة داخل الديسكورد، قم بتشغيل هذا الأمر لمرة واحدة:</p>
                <div className="bg-slate-900 p-2.5 rounded text-left font-mono text-amber-400 select-all border border-slate-800 whitespace-pre">
                  npm run deploy
                </div>

                <p>6. وأخيراً، قم بتشغيل البوت ليعمل 24 ساعة ويستجيب للأعضاء بسيرفرك:</p>
                <div className="bg-slate-900 p-2.5 rounded text-left font-mono text-blue-400 select-all border border-slate-800 whitespace-pre">
                  npm start
                </div>

                <div className="p-3.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[10px] text-slate-400 mt-2">
                  💡 **الاستضافة السحابية المجانية (للعمل دون انقطاع):** إذا أردت أن يعمل البوت حتى لو أغلقت كمبيوترك، يمكنك رفع هذه الملفات إلى مستودع <strong>GitHub</strong> وربطه بمواقع استضافة مجانية لبوتات الديسكورد مثل <strong>Render.com</strong> أو <strong>Railway.app</strong>!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. WEBSITE PANEL DEVELOPER GUIDE */}
        {activeGuide === "website" && (
          <div className="space-y-6 text-right animate-fadeIn">
            {/* Quick Website Overview */}
            <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/40 text-xs text-slate-300 leading-relaxed">
              <p className="font-bold text-emerald-400 mb-1">💡 تشغيل هذا الموقع بالكامل على جهازك (المحاكي ولوحة التحكم):</p>
              هذا الموقع مبني كلياً كبرنامج ويب ديناميكي متكامل باستخدام لغة <strong>React (TypeScript)</strong> مع أداة البناء الفائقة <strong>Vite</strong> وستايل <strong>Tailwind CSS</strong>. يمكنك تشغيل وتخصيص الموقع بالكامل محلياً على جهازك لتعديله كما تحب ومشاركته مع أصدقائك.
            </div>

            {/* Run Website Steps */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-100 border-b border-slate-900 pb-2">💻 خطوات تنزيل وتشغيل الموقع خطوة بخطوة</h4>
              
              <div className="space-y-3.5 text-[11px] text-slate-400 font-sans leading-relaxed">
                <div>
                  <span className="text-indigo-400 font-bold block mb-1">1. تنزيل كود الموقع:</span>
                  يمكنك الحصول على ملفات المشروع بالكامل عبر تنزيلها بصيغة <strong>ZIP</strong> من خلال قائمة الإعدادات أو القائمة العلوية الخاصة بالمنصة وإخراجها على جهازك.
                </div>

                <div>
                  <span className="text-indigo-400 font-bold block mb-1">2. تثبيت الحزم والمكتبات:</span>
                  افتح برنامج سطر الأوامر (Terminal أو VS Code Command Panel) في مجلد المشروع، ثم اكتب واستدعي الأمر التالي لتنزيل مكتبات React بالكامل:
                  <div className="bg-slate-900 p-2.5 rounded text-left font-mono text-emerald-400 select-all border border-slate-800 whitespace-pre mt-1">
                    npm install
                  </div>
                </div>

                <div>
                  <span className="text-indigo-400 font-bold block mb-1">3. بدء تشغيل المطور المحلي (Local Server):</span>
                  قم بتشغيل السيرفر المحلي بضغطة زر لرؤية الموقع وتعديلاته حياً على جهازك فورا:
                  <div className="bg-slate-900 p-2.5 rounded text-left font-mono text-blue-400 select-all border border-slate-800 whitespace-pre mt-1">
                    npm run dev
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    سيفتح لك الموقع تلقائياً على الرابط المحلي: <code className="text-indigo-400 font-mono">http://localhost:3000</code> أو <code className="text-indigo-400 font-mono">http://localhost:5173</code> لتشغيله كصفحة محلية متطورة وسريعة للغاية!
                  </p>
                </div>

                <div>
                  <span className="text-indigo-400 font-bold block mb-1">4. بناء ملفات الإنتاج لرفعها أونلاين (Build):</span>
                  عندما تنتهي من تعديلاتك وتصبح جاهزاً لمشاركة الموقع مجاناً مع سيرفرك عبر الإنترنت، قم ببناء النسخة المعقمة الخفيفة عبر تشغيل:
                  <div className="bg-slate-900 p-2.5 rounded text-left font-mono text-amber-400 select-all border border-slate-800 whitespace-pre mt-1">
                    npm run build
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    سينشأ لديك مجلد يدعى <code className="text-indigo-400 font-mono">dist</code> يحتوي على ملفات HTML و CSS خفيفة ومستقرة، يمكنك سحبها وإلقائها في مواقع الاستضافة الساحرة بضغطة زر واحدة ومجاناً مثل **Vercel** أو **Netlify** لتجعل موقعك متاحاً لكل العالم!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
