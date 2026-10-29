import React from "react";
import { Video, BookOpen, Film, MessageSquare, HardDrive, ArrowRight } from "lucide-react";

export type ActiveTab = "studio" | "topics" | "archive" | "coach" | "storage";

interface TopNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  recordedCount: number;
  totalTopicsCount: number;
  onStartDailySprint: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onTabChange,
  recordedCount,
  totalTopicsCount,
  onStartDailySprint,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080D16]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Clean single-element lockup with unboxed metadata) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange("studio")}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="text-base font-semibold tracking-tight text-white hover:text-amber-300 transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              SpeakUp
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 tabular-nums">
              <span>{recordedCount} recorded</span>
              <span aria-hidden="true">·</span>
              <span>{Math.max(0, totalTopicsCount - recordedCount)} available</span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single line, unboxed, subtle hover indicator) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange("studio")}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === "studio"
                ? "text-amber-400 font-semibold border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => onTabChange("topics")}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === "topics"
                ? "text-amber-400 font-semibold border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Topic Library</span>
          </button>

          <button
            onClick={() => onTabChange("archive")}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === "archive"
                ? "text-amber-400 font-semibold border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Journal Archive</span>
          </button>

          <button
            onClick={() => onTabChange("coach")}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === "coach"
                ? "text-amber-400 font-semibold border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Speech Coach</span>
          </button>

          <button
            onClick={() => onTabChange("storage")}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === "storage"
                ? "text-amber-400 font-semibold border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Local Vault</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartDailySprint}
            className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          >
            <span>Start Daily Sprint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="flex lg:hidden overflow-x-auto gap-5 px-6 py-2 border-t border-slate-800 text-xs text-slate-400">
        <button
          onClick={() => onTabChange("studio")}
          className={`whitespace-nowrap ${activeTab === "studio" ? "text-amber-400 font-semibold" : "hover:text-slate-200"}`}
        >
          Studio
        </button>
        <button
          onClick={() => onTabChange("topics")}
          className={`whitespace-nowrap ${activeTab === "topics" ? "text-amber-400 font-semibold" : "hover:text-slate-200"}`}
        >
          Topics ({totalTopicsCount})
        </button>
        <button
          onClick={() => onTabChange("archive")}
          className={`whitespace-nowrap ${activeTab === "archive" ? "text-amber-400 font-semibold" : "hover:text-slate-200"}`}
        >
          Archive ({recordedCount})
        </button>
        <button
          onClick={() => onTabChange("coach")}
          className={`whitespace-nowrap ${activeTab === "coach" ? "text-amber-400 font-semibold" : "hover:text-slate-200"}`}
        >
          Coach
        </button>
        <button
          onClick={() => onTabChange("storage")}
          className={`whitespace-nowrap ${activeTab === "storage" ? "text-amber-400 font-semibold" : "hover:text-slate-200"}`}
        >
          Vault
        </button>
      </div>
    </header>
  );
};
