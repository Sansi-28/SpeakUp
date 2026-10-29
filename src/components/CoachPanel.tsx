import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface CoachPanelProps {
  currentTopicTitle: string;
  currentNotes: string;
  onClose?: () => void;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  currentTopicTitle,
  currentNotes,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      role: "model",
      text: `Hello! I am Coach Vance, your technical articulation and speech advisor.
${
  currentTopicTitle
    ? `I see you are preparing to speak on: "${currentTopicTitle}".`
    : "Pick a topic or share your technical thoughts to start rehearsing."
}

My goal is to help you deliver a crisp, authoritative 2-to-3 minute talk. Ask me to help you craft an opening hook, critique your talking points, or highlight key architectural trade-offs.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputPrompt("");
    setIsSending(true);

    try {
      const res = await fetch("/api/gemini/chat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, text: m.text })),
          topicTitle: currentTopicTitle,
          currentNotes,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.reply || "Keep practicing! Speak clearly and watch your pacing.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Coach chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: "I encountered an issue connecting to the coaching server. Please check your network connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    "Craft a punchy 30-second opening hook for this topic.",
    "What are the 2 most critical production trade-offs I must mention?",
    "Review my current notes and suggest a tight 3-minute structure.",
    "What counter-intuitive fact about this technology will surprise the listener?",
  ];

  return (
    <div className="studio-surface-elevated border border-slate-800 rounded-2xl p-5 flex flex-col h-[650px] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Coach Vance
            </h2>
            <p className="text-[11px] text-slate-400">
              Technical Speech & Argumentation Coach
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs leading-relaxed">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "model" && (
              <div className="w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 space-y-1 ${
                m.role === "user"
                  ? "bg-amber-400 text-slate-950 font-medium"
                  : "bg-slate-900 border border-slate-800 text-slate-200"
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              <div
                className={`text-[10px] text-right tabular-nums ${
                  m.role === "user" ? "text-slate-950/70" : "text-slate-500"
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            <span>Formulating suggestions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px] border-t border-slate-800/80">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={isSending}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-slate-300 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          placeholder="Ask Coach Vance (e.g. 'Is my problem statement clear?')..."
          disabled={isSending}
          className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isSending || !inputPrompt.trim()}
          className="p-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
