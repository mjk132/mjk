import React, { useState } from "react";
import { BotCommand, EmbedField } from "../types";
import { Plus, Trash, HelpCircle, Sparkles, BookOpen, AlertCircle, Copy, Check } from "lucide-react";
import { motion } from "motion/react";

interface CommandStudioProps {
  commands: BotCommand[];
  setCommands: (cmds: BotCommand[]) => void;
  prefix: string;
}

const TEMPLATE_EMBEDS = {
  blue: "#5865F2",
  green: "#57F287",
  yellow: "#FEE75C",
  red: "#ED4245",
  charcoal: "#2F3136"
};

export default function CommandStudio({ commands, setCommands, prefix }: CommandStudioProps) {
  const [selectedCmdId, setSelectedCmdId] = useState<string>(commands[0]?.id || "");
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  const selectedCmd = commands.find(c => c.id === selectedCmdId);

  // Placeholders helper copy
  const placeholders = [
    { code: "{user}", label: "Mentions author (e.g. @papy615)" },
    { code: "{username}", label: "Outputs pure username text (papy615)" },
    { code: "{channel}", label: "Displays current channel name" },
    { code: "{memberCount}", label: "Lists total members inside server" },
    { code: "{time}", label: "Renders active UTC timestamp" }
  ];

  const handleCopyPlaceholder = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlaceholder(text);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const handleAddCommand = () => {
    const isSlash = Math.random() > 0.5;
    const newCmd: BotCommand = {
      id: crypto.randomUUID(),
      trigger: isSlash ? `command-${commands.length + 1}` : `cmd-${commands.length + 1}`,
      type: isSlash ? 'slash' : 'prefix',
      description: "A customized system command ready to execute.",
      responseType: "text",
      responseText: "Hello {user}! This command is active.",
      embedColor: "#5865F2",
      embedFields: []
    };

    const updated = [...commands, newCmd];
    setCommands(updated);
    setSelectedCmdId(newCmd.id);
  };

  const handleDeleteCommand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = commands.filter(c => c.id !== id);
    setCommands(updated);
    if (selectedCmdId === id && updated.length > 0) {
      setSelectedCmdId(updated[0].id);
    } else if (updated.length === 0) {
      setSelectedCmdId("");
    }
  };

  const updateSelectedCommand = (fields: Partial<BotCommand>) => {
    if (!selectedCmdId) return;
    const updated = commands.map(c => {
      if (c.id === selectedCmdId) {
        return { ...c, ...fields };
      }
      return c;
    });
    setCommands(updated);
  };

  // Embed sub-fields builders
  const handleAddField = () => {
    if (!selectedCmd) return;
    const fields = selectedCmd.embedFields || [];
    const updatedFields: EmbedField[] = [...fields, { name: "Label Title", value: "Custom Details Here", inline: true }];
    updateSelectedCommand({ embedFields: updatedFields });
  };

  const handleUpdateField = (index: number, f: Partial<EmbedField>) => {
    if (!selectedCmd || !selectedCmd.embedFields) return;
    const fields = [...selectedCmd.embedFields];
    fields[index] = { ...fields[index], ...f };
    updateSelectedCommand({ embedFields: fields });
  };

  const handleRemoveField = (index: number) => {
    if (!selectedCmd || !selectedCmd.embedFields) return;
    const fields = selectedCmd.embedFields.filter((_, i) => i !== index);
    updateSelectedCommand({ embedFields: fields });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="command-studio">
      {/* LEFT: Commands Listing Panel */}
      <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4.5 flex flex-col h-[700px] shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="text-right" style={{ direction: "rtl" }}>
            <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-wide font-sans">📁 دليل الأوامر (Triggers)</h2>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">إدارة محفزات البوت والردود</p>
          </div>
          <button
            onClick={handleAddCommand}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            أمر جديد
          </button>
        </div>

        {/* List scroll container */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 custom-scrollbar">
          {commands.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-600 font-sans">
              <AlertCircle className="w-8 h-8 opacity-40 mb-2 text-slate-500" />
              <p className="text-sm font-bold text-slate-400">لا توجد أوامر مبرمجة حالياً</p>
              <button
                onClick={handleAddCommand}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                اضغط هنا لإنشاء أول أمر للبوت
              </button>
            </div>
          ) : (
            commands.map(cmd => {
              const isSelected = cmd.id === selectedCmdId;
              const cleanTrigger = cmd.trigger.replace("/", "").trim();
              const displayLabel = cmd.type === 'slash' ? `/${cleanTrigger}` : `${prefix}${cleanTrigger}`;

              return (
                <div
                  key={cmd.id}
                  onClick={() => setSelectedCmdId(cmd.id)}
                  className={`group relative p-3.5 rounded-xl border cursor-pointer transition select-none flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/5 text-white"
                      : "bg-slate-950/45 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40 text-slate-350"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide font-mono uppercase ${
                        cmd.type === 'slash' 
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40' 
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                      }`}>
                        {cmd.type.toUpperCase()}
                      </span>
                      <span className="font-mono text-sm font-bold truncate tracking-tight">
                        {displayLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-550 mt-1 truncate font-sans">
                      {cmd.description || "لا يوجد وصف لهذا الأمر بعد."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono bg-slate-950/85 px-2 py-0.5 rounded-md text-slate-450 border border-slate-800/60 font-semibold">
                      {cmd.responseType}
                    </span>
                    <button
                      onClick={(e) => handleDeleteCommand(cmd.id, e)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 bg-red-950/30 hover:bg-red-950/90 border border-red-900/40 text-red-400 rounded-lg transition-all cursor-pointer"
                      title="حذف الأمر"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info box */}
        <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800/60 rounded-xl text-xs leading-relaxed text-slate-450 font-sans flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
          <span className="text-right" style={{ direction: "rtl" }}>
            <strong>نصيحة ذكية:</strong> جميع الأوامر والبادئات يتم تفعيلها فوراً في <strong>محاكي السيرفر</strong>! غيّر الإعدادات وجرّب النتيجة الحية بضغطة زر.
          </span>
        </div>
      </div>

      {/* RIGHT: Detail Configurator Panel */}
      <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5.5 h-[700px] overflow-y-auto custom-scrollbar shadow-xl">
        {!selectedCmd ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-600 font-sans">
            <BookOpen className="w-12 h-12 opacity-30 mb-3 text-slate-400" />
            <h3 className="text-slate-200 font-extrabold text-sm">لم يتم تحديد أي أمر لتعديله</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm font-medium">
              يرجى اختيار أمر من الدليل على اليسار لتخصيص الخيارات ونوع الاستجابة التلقائية أو الذكية الخاصة بالبوت.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Command Header Details */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="text-right" style={{ direction: "rtl" }}>
                <h3 className="text-base font-extrabold text-slate-200 font-mono flex items-center gap-2">
                  <span>⚙️ تعديل وتخصيص الأمر:</span>
                  <span className="text-indigo-400 font-mono tracking-tight">{selectedCmd.type === 'slash' ? '/' : prefix}{selectedCmd.trigger.replace('/', '').trim()}</span>
                </h3>
                <p className="text-xs text-slate-550 font-sans mt-0.5">حدّد خصائص الاستجابة وبادئات المحاكي</p>
              </div>

              {/* Toggle Prefix or Slash */}
              <div className="bg-slate-950 p-1 border border-slate-800/80 rounded-xl flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const clean = selectedCmd.trigger.replace("/", "").trim();
                    updateSelectedCommand({ type: 'slash', trigger: clean });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                    selectedCmd.type === 'slash'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Slash Command (/)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clean = selectedCmd.trigger.replace("/", "").trim();
                    updateSelectedCommand({ type: 'prefix', trigger: clean });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                    selectedCmd.type === 'prefix'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Prefix Command ({prefix})
                </button>
              </div>
            </div>

            {/* Core configuration parameters card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trigger text */}
              <div className="space-y-1.5 text-right" style={{ direction: "rtl" }}>
                <label className="block text-xs font-bold text-slate-400 font-sans">
                  اسم الاستدعاء (Trigger Word)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 px-1 text-xs font-bold rounded bg-slate-900 border border-slate-800 font-mono text-slate-500 select-none">
                    {selectedCmd.type === 'slash' ? '/' : prefix}
                  </span>
                  <input
                    type="text"
                    value={selectedCmd.trigger.replace("/", "").trim()}
                    onChange={(e) => updateSelectedCommand({ trigger: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-left"
                    placeholder="help"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              {/* Trigger description */}
              <div className="space-y-1.5 text-right" style={{ direction: "rtl" }}>
                <label className="block text-xs font-bold text-slate-400 font-sans">
                  وصف الأمر للمستخدمين (Description)
                </label>
                <input
                  type="text"
                  value={selectedCmd.description}
                  onChange={(e) => updateSelectedCommand({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-sans focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-right"
                  placeholder="مثال: لعرض قائمة الأوامر المتاحة للبوت للسيرفر..."
                />
              </div>
            </div>

            {/* Response action selector */}
            <div className="space-y-2 text-right" style={{ direction: "rtl" }}>
              <label className="block text-xs font-bold text-slate-400 font-sans">
                نوع رد البوت التفاعلي (Bot Response Action)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "text", title: "رسالة نصية بسيطة", sub: "Plain Text Message", icon: HelpCircle, color: "hover:border-slate-500 border-slate-800/80 hover:bg-slate-950/20" },
                  { type: "embed", title: "بطاقة إمبد متطورة", sub: "Rich Embed Form", icon: BookOpen, color: "hover:border-indigo-500 border-slate-800/80 hover:bg-indigo-950/10" },
                  { type: "ai", title: "عقل الذكاء الاصطناعي", sub: "Gemini AI Brain", icon: Sparkles, color: "hover:border-purple-500 border-slate-800/80 hover:bg-purple-950/10" }
                ].map(opt => {
                  const isActive = selectedCmd.responseType === opt.type;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => updateSelectedCommand({ responseType: opt.type as any })}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                        isActive
                          ? "bg-slate-950 border-indigo-500 text-white shadow shadow-indigo-500/10"
                          : `bg-slate-950/40 ${opt.color} text-slate-400`
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="text-xs font-bold font-sans block text-slate-200">{opt.title}</span>
                      <span className="text-[9px] opacity-65 font-medium mt-0.5 font-mono block">{opt.sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic visual editor switch depending on responseType */}
            <div className="p-4.5 bg-slate-950 border border-slate-800/85 rounded-2xl space-y-4">
              {/* PLACEHOLDER DRAWER COLLAPSIBLE */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-2 font-sans text-xs">
                  <span className="text-[10px] text-slate-500">(انقر لنسخ المتغير ولصقه في الرد)</span>
                  <span className="font-extrabold text-slate-300 uppercase block">💡 متغيرات النصوص السريعة (Variables)</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {placeholders.map(p => {
                    const isCopied = copiedPlaceholder === p.code;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleCopyPlaceholder(p.code)}
                        className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          isCopied
                            ? "bg-indigo-900/60 text-indigo-350 border border-indigo-500/60"
                            : "bg-slate-950 text-slate-400 border border-slate-800/80 hover:border-slate-700 hover:text-slate-300"
                        }`}
                        title={p.label}
                      >
                        {isCopied ? <Check className="w-3 h-3 text-indigo-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        {p.code}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OPTION: PLAIN TEXT */}
              {selectedCmd.responseType === "text" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                    Plain Text Response
                  </label>
                  <textarea
                    rows={4}
                    value={selectedCmd.responseText}
                    onChange={(e) => updateSelectedCommand({ responseText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 font-sans focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                    placeholder="E.g. Beep boop! {user}, my system stats are online! Current simulated latency is 14ms."
                  />
                </div>
              )}

              {/* OPTION: AI MODULE */}
              {selectedCmd.responseType === "ai" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold font-sans">Gemini AI Module Configured</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                    Instead of a static reply, this command uses the <strong>Gemini AI model</strong> dynamically! Define the instructions/personality prompt below to guide how the bot responds to user inputs.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                      Bot Personality Instruction Prompt
                    </label>
                    <textarea
                      rows={4}
                      value={selectedCmd.responseText}
                      onChange={(e) => updateSelectedCommand({ responseText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 font-sans focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      placeholder="E.g. Act as a funny grumpy pirate bot. Reply with pirate slang and complain about cleaning the deck."
                    />
                  </div>
                </div>
              )}

              {/* OPTION: RICH DISCORD EMBED BUILDER */}
              {selectedCmd.responseType === "embed" && (
                <div className="space-y-5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-indigo-950 pb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Rich Embed Field Visualizer</span>
                  </div>

                  {/* Top attributes in 2-col grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-sans">Embed Title</label>
                      <input
                        type="text"
                        value={selectedCmd.embedTitle || ""}
                        onChange={(e) => updateSelectedCommand({ embedTitle: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans focus:border-blue-500 focus:outline-none"
                        placeholder="Welcome to our Guild!"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-sans">Left Border Color Hex</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedCmd.embedColor || "#5865F2"}
                          onChange={(e) => updateSelectedCommand({ embedColor: e.target.value })}
                          className="w-8 h-7 bg-transparent border-0 rounded cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedCmd.embedColor || "#5865F2"}
                          onChange={(e) => updateSelectedCommand({ embedColor: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                          placeholder="#5865F2"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-sans">Embed Description</label>
                    <textarea
                      rows={3}
                      value={selectedCmd.embedDescription || ""}
                      onChange={(e) => updateSelectedCommand({ embedDescription: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans focus:border-blue-500 focus:outline-none"
                      placeholder="You are currently in our general lounge. Feel free to interact with other system bot integrations!"
                    />
                  </div>

                  {/* Embed optional Media URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-sans">Thumbnail Image URL</label>
                      <input
                        type="text"
                        value={selectedCmd.embedThumbnail || ""}
                        onChange={(e) => updateSelectedCommand({ embedThumbnail: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans focus:border-blue-500 focus:outline-none"
                        placeholder="https://example.com/small-icon.png"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-sans">Large Embed Image URL</label>
                      <input
                        type="text"
                        value={selectedCmd.embedImage || ""}
                        onChange={(e) => updateSelectedCommand({ embedImage: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans focus:border-blue-500 focus:outline-none"
                        placeholder="https://example.com/banner.png"
                      />
                    </div>
                  </div>

                  {/* Embed Custom Metadata field lists */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                        Embed Custom Columns ({selectedCmd.embedFields?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddField}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Column Field
                      </button>
                    </div>

                    {(!selectedCmd.embedFields || selectedCmd.embedFields.length === 0) ? (
                      <p className="text-[11px] text-slate-500 italic">No custom fields have been injected into this embed.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCmd.embedFields.map((field, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex-1">
                              <label className="block text-[10px] text-slate-500 mb-1 uppercase font-semibold font-sans">Field Title</label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 font-sans focus:border-blue-500"
                                placeholder="Rules Link"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] text-slate-500 mb-1 uppercase font-semibold font-sans">Field Value</label>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => handleUpdateField(idx, { value: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 font-sans focus:border-blue-500"
                                placeholder="#rules text"
                              />
                            </div>
                            <div className="flex items-center shrink-0 pt-4 md:pt-0">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 select-none">
                                <input
                                  type="checkbox"
                                  checked={field.inline}
                                  onChange={(e) => handleUpdateField(idx, { inline: e.target.checked })}
                                  className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                                />
                                Inline Width
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(idx)}
                              className="self-end md:self-center p-1.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900 hover:text-white text-red-400 rounded transition"
                              title="Delete field"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Embed Footer text */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-sans">Embed Footer Text</label>
                    <input
                      type="text"
                      value={selectedCmd.embedFooter || ""}
                      onChange={(e) => updateSelectedCommand({ embedFooter: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans focus:border-blue-500"
                      placeholder="Simulated Bot Center © 2026."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
