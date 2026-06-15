import React, { useState } from "react";
import { BotCommand, EmbedField } from "../types";
import { Plus, Trash, HelpCircle, Sparkles, BookOpen, AlertCircle, Copy, Check } from "lucide-react";

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
      <div className="lg:col-span-4 bg-card border border-border rounded-xl flex flex-col h-[700px]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Commands</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Manage bot triggers &amp; responses</p>
          </div>
          <button
            onClick={handleAddCommand}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {commands.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-dim">
              <AlertCircle className="w-8 h-8 mb-2 text-border" />
              <p className="text-sm font-medium text-text-muted">No commands yet</p>
              <button onClick={handleAddCommand} className="mt-3 text-xs text-primary hover:underline cursor-pointer font-medium">
                Create your first command
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
                  className={`group relative p-3 rounded-lg border cursor-pointer transition select-none flex items-center justify-between ${
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface border-border hover:border-border-hover"
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide font-mono uppercase ${
                        cmd.type === 'slash'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-success/10 text-success border border-success/20'
                      }`}>
                        {cmd.type.toUpperCase()}
                      </span>
                      <span className="font-mono text-sm font-semibold text-white truncate">
                        {displayLabel}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {cmd.description || "No description"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] uppercase font-mono bg-surface px-2 py-0.5 rounded text-text-dim border border-border font-medium">
                      {cmd.responseType}
                    </span>
                    <button
                      onClick={(e) => handleDeleteCommand(cmd.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger rounded-lg transition-all cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto p-3 border-t border-border">
          <div className="flex items-start gap-2.5 text-xs text-text-muted">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Commands activate immediately in the simulator. Edit and test live.</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Detail Configurator Panel */}
      <div className="lg:col-span-8 bg-card border border-border rounded-xl h-[700px] overflow-y-auto">
        {!selectedCmd ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-dim">
            <BookOpen className="w-12 h-12 mb-3 text-border" />
            <h3 className="text-sm font-semibold text-text-muted">No command selected</h3>
            <p className="text-xs text-text-dim mt-1.5 max-w-sm">Choose a command from the left panel to customize its behavior.</p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                  Editing:
                  <span className="text-primary font-mono">{selectedCmd.type === 'slash' ? '/' : prefix}{selectedCmd.trigger.replace('/', '').trim()}</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">Configure response type and behavior</p>
              </div>

              <div className="bg-surface p-0.5 border border-border rounded-lg flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const clean = selectedCmd.trigger.replace("/", "").trim();
                    updateSelectedCommand({ type: 'slash', trigger: clean });
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedCmd.type === 'slash'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  Slash (/)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clean = selectedCmd.trigger.replace("/", "").trim();
                    updateSelectedCommand({ type: 'prefix', trigger: clean });
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedCmd.type === 'prefix'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  Prefix ({prefix})
                </button>
              </div>
            </div>

            {/* Core fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">Trigger Word</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 px-1.5 text-xs font-medium rounded bg-surface border border-border font-mono text-text-dim select-none">
                    {selectedCmd.type === 'slash' ? '/' : prefix}
                  </span>
                  <input
                    type="text"
                    value={selectedCmd.trigger.replace("/", "").trim()}
                    onChange={(e) => updateSelectedCommand({ trigger: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                    className="w-full pl-10 pr-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none text-left"
                    placeholder="help"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">Description</label>
                <input
                  type="text"
                  value={selectedCmd.description}
                  onChange={(e) => updateSelectedCommand({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none"
                  placeholder="Shows available commands"
                />
              </div>
            </div>

            {/* Response type selector */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-muted">Response Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "text", title: "Plain Text", sub: "Simple message", icon: HelpCircle },
                  { type: "embed", title: "Rich Embed", sub: "Formatted card", icon: BookOpen },
                  { type: "ai", title: "AI Response", sub: "Gemini powered", icon: Sparkles }
                ].map(opt => {
                  const isActive = selectedCmd.responseType === opt.type;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => updateSelectedCommand({ responseType: opt.type as any })}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                        isActive
                          ? "bg-primary/10 border-primary/30 text-white"
                          : "bg-surface border-border text-text-muted hover:border-border-hover"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isActive ? "text-primary" : "text-text-dim"}`} />
                      <span className="text-xs font-semibold block">{opt.title}</span>
                      <span className="text-[9px] opacity-60 font-medium mt-0.5">{opt.sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editor */}
            <div className="p-4 bg-surface border border-border rounded-lg space-y-4">
              {/* Placeholders */}
              <div className="p-3 bg-[#080B12] border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-text-dim">Click to copy</span>
                  <span className="font-semibold text-text-muted uppercase">Variables</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {placeholders.map(p => {
                    const isCopied = copiedPlaceholder === p.code;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleCopyPlaceholder(p.code)}
                        className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          isCopied
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-surface text-text-dim border border-border hover:border-border-hover hover:text-text-muted"
                        }`}
                        title={p.label}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {p.code}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TEXT */}
              {selectedCmd.responseType === "text" && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">Text Response</label>
                  <textarea
                    rows={4}
                    value={selectedCmd.responseText}
                    onChange={(e) => updateSelectedCommand({ responseText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none"
                    placeholder="Hello {user}! My stats are online."
                  />
                </div>
              )}

              {/* AI */}
              {selectedCmd.responseType === "ai" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold">Gemini AI Module</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Define the AI personality prompt below to guide how the bot responds.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Personality Prompt</label>
                    <textarea
                      rows={4}
                      value={selectedCmd.responseText}
                      onChange={(e) => updateSelectedCommand({ responseText: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B12] border border-border rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none"
                      placeholder="Act as a funny grumpy pirate bot..."
                    />
                  </div>
                </div>
              )}

              {/* EMBED */}
              {selectedCmd.responseType === "embed" && (
                <div className="space-y-5">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
                    Rich Embed Builder
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Embed Title</label>
                      <input
                        type="text"
                        value={selectedCmd.embedTitle || ""}
                        onChange={(e) => updateSelectedCommand({ embedTitle: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none"
                        placeholder="Welcome!"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Border Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={selectedCmd.embedColor || "#5865F2"} onChange={(e) => updateSelectedCommand({ embedColor: e.target.value })} className="w-8 h-7 bg-transparent border-0 rounded cursor-pointer shrink-0" />
                        <input type="text" value={selectedCmd.embedColor || "#5865F2"} onChange={(e) => updateSelectedCommand({ embedColor: e.target.value })} className="w-full px-2 py-1 bg-[#080B12] border border-border rounded-lg text-xs text-white font-mono focus:border-primary/50 focus:outline-none" placeholder="#5865F2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-text-muted mb-1">Embed Description</label>
                    <textarea rows={3} value={selectedCmd.embedDescription || ""} onChange={(e) => updateSelectedCommand({ embedDescription: e.target.value })} className="w-full px-3 py-1.5 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none" placeholder="Welcome to our server!" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Thumbnail URL</label>
                      <input type="text" value={selectedCmd.embedThumbnail || ""} onChange={(e) => updateSelectedCommand({ embedThumbnail: e.target.value })} className="w-full px-3 py-1.5 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Image URL</label>
                      <input type="text" value={selectedCmd.embedImage || ""} onChange={(e) => updateSelectedCommand({ embedImage: e.target.value })} className="w-full px-3 py-1.5 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50 focus:outline-none" placeholder="https://..." />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Fields ({selectedCmd.embedFields?.length || 0})</label>
                      <button type="button" onClick={handleAddField} className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3 h-3" /> Add Field
                      </button>
                    </div>
                    {(!selectedCmd.embedFields || selectedCmd.embedFields.length === 0) ? (
                      <p className="text-[11px] text-text-dim italic">No custom fields.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCmd.embedFields.map((field, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 bg-[#080B12] border border-border rounded-lg">
                            <div className="flex-1">
                              <label className="block text-[10px] text-text-dim mb-1 uppercase font-semibold">Name</label>
                              <input type="text" value={field.name} onChange={(e) => handleUpdateField(idx, { name: e.target.value })} className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-white focus:border-primary/50" placeholder="Title" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] text-text-dim mb-1 uppercase font-semibold">Value</label>
                              <input type="text" value={field.value} onChange={(e) => handleUpdateField(idx, { value: e.target.value })} className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-white focus:border-primary/50" placeholder="Value" />
                            </div>
                            <div className="flex items-center shrink-0 pt-4 md:pt-0">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-text-muted select-none">
                                <input type="checkbox" checked={field.inline} onChange={(e) => handleUpdateField(idx, { inline: e.target.checked })} className="rounded border-border bg-[#080B12] w-3.5 h-3.5" />
                                Inline
                              </label>
                            </div>
                            <button type="button" onClick={() => handleRemoveField(idx)} className="self-end md:self-center p-1.5 bg-danger/10 border border-danger/20 hover:bg-danger/20 text-danger rounded transition cursor-pointer">
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-text-muted mb-1">Footer Text</label>
                    <input type="text" value={selectedCmd.embedFooter || ""} onChange={(e) => updateSelectedCommand({ embedFooter: e.target.value })} className="w-full px-3 py-1.5 bg-[#080B12] border border-border rounded-lg text-xs text-white focus:border-primary/50" placeholder="Bot Center © 2026" />
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
