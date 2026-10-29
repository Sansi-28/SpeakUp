import React, { useState, useMemo } from "react";
import { TechTopic, CATEGORIES } from "../data/topics";
import { TopicRecordState } from "../db/journalDb";
import {
  Search,
  Sparkles,
  Shuffle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Filter,
  Layers,
  Clock,
  Compass,
} from "lucide-react";

interface TopicsExplorerProps {
  allTopics: TechTopic[];
  recordedStates: Map<string, TopicRecordState>;
  onSelectTopic: (topic: TechTopic) => void;
  onGenerateCustomTopics: (category: string) => Promise<void>;
  isGeneratingCustom: boolean;
}

export const TopicsExplorer: React.FC<TopicsExplorerProps> = ({
  allTopics,
  recordedStates,
  onSelectTopic,
  onGenerateCustomTopics,
  isGeneratingCustom,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unrecordedOnly, setUnrecordedOnly] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 18;

  // AI custom synthesis modal
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [customCategoryPrompt, setCustomCategoryPrompt] = useState<string>(
    "Distributed Systems & Modern Cloud Infrastructure"
  );

  // Unrecorded list for serendipity drawer
  const unrecordedTopics = useMemo(() => {
    return allTopics.filter((t) => recordedStates.get(t.id)?.status !== "recorded");
  }, [allTopics, recordedStates]);

  // Featured Topic in the Drawer
  const [drawnTopic, setDrawnTopic] = useState<TechTopic>(() => {
    return unrecordedTopics.length > 0 ? unrecordedTopics[0] : allTopics[0];
  });

  // Draw a random topic (optionally respecting category)
  const handleDrawTopic = (domain: string = activeCategory) => {
    let pool = unrecordedTopics;
    if (domain !== "All") {
      const domainPool = unrecordedTopics.filter((t) => t.category === domain);
      if (domainPool.length > 0) {
        pool = domainPool;
      }
    }
    if (pool.length === 0) {
      pool = allTopics;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    setDrawnTopic(pool[randomIndex]);
  };

  // Filtered topics for the library table/grid
  const filteredTopics = useMemo(() => {
    return allTopics.filter((topic) => {
      if (activeCategory !== "All" && topic.category !== activeCategory) {
        return false;
      }

      const state = recordedStates.get(topic.id);
      const isRecorded = state?.status === "recorded";
      if (unrecordedOnly && isRecorded) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          topic.title.toLowerCase().includes(q) ||
          topic.researchQuestion.toLowerCase().includes(q) ||
          topic.keywords.some((k) => k.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [allTopics, activeCategory, unrecordedOnly, searchQuery, recordedStates]);

  const totalPages = Math.ceil(filteredTopics.length / pageSize) || 1;
  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTopics.slice(start, start + pageSize);
  }, [filteredTopics, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleTriggerAiSynthesis = async () => {
    if (!customCategoryPrompt.trim()) return;
    await onGenerateCustomTopics(customCategoryPrompt);
    setShowAiModal(false);
  };

  const isDrawnRecorded = recordedStates.get(drawnTopic.id)?.status === "recorded";

  return (
    <div className="space-y-10">
      {/* SECTION 1: Curated Daily Drawer (Human-crafted serendipity deck) */}
      <section className="studio-surface-elevated rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs text-amber-400 font-medium tracking-wide uppercase">
              Curated Speaking Prompt
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mt-1">
              Today's Technical Challenge
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Research for 5–10 minutes, articulate your technical perspective on camera for 2–3 minutes. Once recorded, topics are locked into your archive.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleDrawTopic()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-medium rounded-lg transition-colors cursor-pointer border border-slate-700/80 active:scale-95"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
              <span>Shuffle Next Prompt</span>
            </button>

            <button
              onClick={() => onSelectTopic(drawnTopic)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs md:text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <span>Begin Research</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawn Topic Focus Display */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            {/* Zero-Pill Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{drawnTopic.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-medium">{drawnTopic.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>5–10 min research</span>
              <span aria-hidden="true">·</span>
              <span>2–3 min speech</span>
              {isDrawnRecorded && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-medium">Already Recorded</span>
                </>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-balance">
              {drawnTopic.title}
            </h2>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Central Question & Speaking Angle
              </div>
              <p className="text-base text-slate-200 leading-relaxed">
                "{drawnTopic.researchQuestion}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
              <span className="font-medium text-slate-500">Core Concepts:</span>
              {drawnTopic.keywords.map((kw, i) => (
                <span key={i} className="text-slate-300">
                  {kw}
                  {i < drawnTopic.keywords.length - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/40 rounded-xl p-5 border border-slate-800/60 space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Recommended Speech Cadence
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-medium text-slate-200">The Hook (0:00–0:30)</div>
                  <div>Define why this concept matters in production systems.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-medium text-slate-200">Mechanism & Trade-offs (0:30–2:00)</div>
                  <div>Break down the architectural constraint and design decisions.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-medium text-slate-200">Takeaway (2:00–2:45)</div>
                  <div>One concrete lesson for day-to-day software engineering.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTopic(drawnTopic)}
              className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg transition-colors border border-amber-400/20 cursor-pointer text-center block"
            >
              Select & Open Research Hub →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Topic Library & Filtering Controls */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Curated Engineering Curriculum
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredTopics.length} topics matching current filters · {allTopics.length} total in library
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-800 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Synthesize Custom Topics</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setUnrecordedOnly(true)}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  unrecordedOnly
                    ? "bg-slate-800 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Unrecorded Only
              </button>
              <button
                onClick={() => setUnrecordedOnly(false)}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  !unrecordedOnly
                    ? "bg-slate-800 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Show All
              </button>
            </div>
          </div>
        </div>

        {/* Domain Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
              activeCategory === "All"
                ? "bg-amber-400 text-slate-950 font-semibold"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Domains ({allTopics.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "bg-amber-400 text-slate-950 font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search across 2,300+ engineering topics, keywords, or research questions..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Topics Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTopics.map((topic) => {
            const isRecorded = recordedStates.get(topic.id)?.status === "recorded";
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="studio-surface hover:studio-surface-elevated rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer group hover:border-slate-700"
              >
                <div className="space-y-3">
                  {/* Zero-Pill Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{topic.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400/90">{topic.difficulty}</span>
                    </div>
                    {isRecorded && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Recorded</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.researchQuestion}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="truncate pr-2">
                    {topic.keywords.slice(0, 3).join(" · ")}
                  </div>
                  <span className="text-amber-400 font-medium group-hover:translate-x-1 transition-transform shrink-0 flex items-center gap-1">
                    Study <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredTopics.length === 0 && (
          <div className="p-12 text-center studio-surface rounded-xl border border-slate-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No topics found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query or switching from "Unrecorded Only" to "Show All".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
                setUnrecordedOnly(false);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
              <span className="font-semibold text-white">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* AI Topic Synthesizer Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Synthesize Custom Topics
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Generate 20 brand-new, non-repeated technical speaking topics tailored to your exact career focus or technology stack using Google Gemini 3.8 Flash.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Focus Area or Technology Stack:
              </label>
              <input
                type="text"
                value={customCategoryPrompt}
                onChange={(e) => setCustomCategoryPrompt(e.target.value)}
                placeholder="e.g. Linux Kernel & eBPF, Rust Memory Safety, Staff+ Leadership..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerAiSynthesis}
                disabled={isGeneratingCustom || !customCategoryPrompt.trim()}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {isGeneratingCustom ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing 20 Topics...</span>
                  </>
                ) : (
                  <>
                    <span>Generate & Append to Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
