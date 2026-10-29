import React, { useState, useEffect } from "react";
import { TechTopic } from "../data/topics";
import { playOfflineBinauralFocus, stopOfflineBinauralFocus } from "../utils/focusAudio";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Video,
  MessageSquare,
  Volume2,
  VolumeX,
  FileText,
  ArrowRight,
  Check,
} from "lucide-react";

interface ResearchHubProps {
  topic: TechTopic;
  notes: string;
  onNotesChange: (notes: string) => void;
  onProceedToStudio: () => void;
  onOpenCoach: () => void;
}

export const ResearchHub: React.FC<ResearchHubProps> = ({
  topic,
  notes,
  onNotesChange,
  onProceedToStudio,
  onOpenCoach,
}) => {
  // Timer state
  const [targetDuration, setTargetDuration] = useState<number>(300); // 5 min
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Search Grounding state
  const [isLoadingBrief, setIsLoadingBrief] = useState<boolean>(false);
  const [groundedBrief, setGroundedBrief] = useState<string>("");
  const [sources, setSources] = useState<Array<{ title: string; uri: string }>>([]);

  // Focus Audio state
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSelectPreset = (seconds: number) => {
    setTargetDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setTimeLeft(targetDuration);
    setIsRunning(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      stopOfflineBinauralFocus();
      setIsMusicPlaying(false);
    } else {
      playOfflineBinauralFocus();
      setIsMusicPlaying(true);
    }
  };

  // Fetch concise briefing grounded with Google Search
  const fetchSearchBrief = async () => {
    setIsLoadingBrief(true);
    try {
      const res = await fetch("/api/gemini/search-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicTitle: topic.title,
          topicCategory: topic.category,
          researchQuestion: topic.researchQuestion,
        }),
      });

      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setGroundedBrief(data.brief || "");
      setSources(data.sources || []);

      if (!notes.trim()) {
        onNotesChange(`1. The Hook (Why this matters in production):
- 

2. Technical Mechanism & Key Trade-off:
- 

3. Daily Takeaway for Engineers:
- `);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBrief(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Topic Headline & Timer Bar */}
      <div className="studio-surface-elevated rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Zero-Pill Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{topic.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-medium">{topic.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>Phase 1 of 2</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1 text-balance">
              {topic.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleMusic}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                isMusicPlaying
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border-slate-800"
              }`}
              title="Toggle binaural focus tone to block background noise while preparing"
            >
              {isMusicPlaying ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span>{isMusicPlaying ? "Focus Audio Active" : "Focus Audio"}</span>
            </button>

            <button
              onClick={onOpenCoach}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-800 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Ask Coach</span>
            </button>
          </div>
        </div>

        {/* Challenge Statement Callout */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Speaking Challenge
          </div>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
            "{topic.researchQuestion}"
          </p>
        </div>
      </div>

      {/* Main 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timer & Technical Briefing (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Research Countdown Timer */}
          <div className="studio-surface rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>Research Timer</span>
              </div>

              {/* Presets (5m, 7m, 10m) */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => handleSelectPreset(300)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    targetDuration === 300 ? "bg-slate-800 text-amber-300 font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  5m
                </button>
                <button
                  onClick={() => handleSelectPreset(420)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    targetDuration === 420 ? "bg-slate-800 text-amber-300 font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  7m
                </button>
                <button
                  onClick={() => handleSelectPreset(600)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    targetDuration === 600 ? "bg-slate-800 text-amber-300 font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  10m
                </button>
              </div>
            </div>

            {/* Timer Tabular Display */}
            <div className="text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <div className="text-5xl font-mono tabular-nums font-bold tracking-tight text-white">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {timeLeft === 0 ? "Time's up! Head to the studio" : "Spend this time structuring your 3 points"}
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isRunning
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold shadow-sm"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Preparation</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real Google Search Grounded Briefing */}
          <div className="studio-surface rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Search-Grounded Briefing</span>
              </div>

              {!groundedBrief && (
                <button
                  onClick={fetchSearchBrief}
                  disabled={isLoadingBrief}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {isLoadingBrief ? "Searching Web..." : "Fetch Brief"}
                </button>
              )}
            </div>

            {isLoadingBrief ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs text-slate-400">Grounding with Google Search...</div>
              </div>
            ) : groundedBrief ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {groundedBrief}
                </div>

                {sources.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">
                      Citations:
                    </div>
                    <div className="space-y-1">
                      {sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-amber-400 hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{s.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 leading-relaxed">
                Click "Fetch Brief" to generate a 3-point research summary grounded with real-time Google Search results to jumpstart your outline.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outline Scratchpad & Teleprompter Prep (7 cols) */}
        <div className="lg:col-span-7 studio-surface rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 min-h-[520px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                  Speaking Outline & Notes
                </h3>
              </div>
              <div className="text-xs text-slate-400">
                Transfers automatically to Camera Teleprompter
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Draft concise bullet points. During your 2–3 minute video recording, these bullets will appear in the studio teleprompter so you never lose your train of thought.
            </p>

            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={`1. Hook (Why this matters):
- In real-world microservices, network partitions are inevitable...

2. Architectural Principle:
- Explain the trade-off between consistency and latency...

3. Takeaway for Engineers:
- Always design your APIs with idempotency keys...`}
              rows={14}
              className="w-full p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition-colors leading-relaxed resize-y"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Auto-saved locally in IndexedDB
            </div>

            <button
              onClick={onProceedToStudio}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Enter Recording Studio (2–3 min)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
