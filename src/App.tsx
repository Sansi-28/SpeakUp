import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ALL_CURATED_TOPICS, TechTopic } from "./data/topics";
import {
  JournalEntry,
  TopicRecordState,
  getAllJournalEntries,
  getAllRecordedTopicStates,
  getAllCustomTopics,
  saveCustomTopics,
} from "./db/journalDb";
import { TopNavigation, ActiveTab } from "./components/TopNavigation";
import { TopicsExplorer } from "./components/TopicsExplorer";
import { ResearchHub } from "./components/ResearchHub";
import { CameraStudio } from "./components/CameraStudio";
import { JournalArchive } from "./components/JournalArchive";
import { CoachPanel } from "./components/CoachPanel";
import { StorageSyncModal } from "./components/StorageSyncModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("studio");
  const [studioPhase, setStudioPhase] = useState<"research" | "record">("research");

  // Topics and Recorded States
  const [customTopics, setCustomTopics] = useState<TechTopic[]>([]);
  const [recordedStates, setRecordedStates] = useState<Map<string, TopicRecordState>>(new Map());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeTopic, setActiveTopic] = useState<TechTopic>(ALL_CURATED_TOPICS[0]);
  const [researchNotes, setResearchNotes] = useState<string>("");

  // Modals & Async States
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState<boolean>(false);

  // Combine built-in 2,560 topics with any AI-synthesized custom topics
  const combinedTopics = useMemo(() => {
    return [...ALL_CURATED_TOPICS, ...customTopics];
  }, [customTopics]);

  // Load IndexedDB data on startup
  const loadDatabaseState = useCallback(async () => {
    try {
      const [loadedEntries, loadedStates, loadedCustom] = await Promise.all([
        getAllJournalEntries(),
        getAllRecordedTopicStates(),
        getAllCustomTopics(),
      ]);

      setEntries(loadedEntries);
      setRecordedStates(loadedStates);
      setCustomTopics(loadedCustom);

      // Select first unrecorded topic as default active topic
      const all = [...ALL_CURATED_TOPICS, ...loadedCustom];
      const firstUnrecorded = all.find((t) => loadedStates.get(t.id)?.status !== "recorded");
      if (firstUnrecorded) {
        setActiveTopic(firstUnrecorded);
      }
    } catch (err) {
      console.error("Failed initializing database:", err);
    }
  }, []);

  useEffect(() => {
    loadDatabaseState();
  }, [loadDatabaseState]);

  // Handle topic selection from Explorer or Random Drawer
  const handleSelectTopic = (topic: TechTopic) => {
    setActiveTopic(topic);
    setStudioPhase("research");
    setResearchNotes("");
    setActiveTab("studio");
  };

  // Quick Daily Sprint: draw unrecorded topic and jump straight to study/studio
  const handleStartDailySprint = () => {
    const unrecorded = combinedTopics.filter(
      (t) => recordedStates.get(t.id)?.status !== "recorded"
    );

    if (unrecorded.length === 0) {
      alert("Incredible work! You have recorded all topics in the library.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * unrecorded.length);
    const chosen = unrecorded[randomIndex];
    setActiveTopic(chosen);
    setStudioPhase("research");
    setResearchNotes("");
    setActiveTab("studio");
  };

  // Trigger AI Topic Synthesizer (Gemini 3.8 Flash)
  const handleGenerateCustomTopics = async (categoryFocus: string) => {
    setIsGeneratingCustom(true);
    try {
      const existingTitles = combinedTopics.slice(-100).map((t) => t.title);
      const res = await fetch("/api/gemini/generate-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryFocus,
          count: 20,
          existingTitles,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const generatedRaw: Array<{
        title: string;
        category: string;
        difficulty: "Fundamental" | "Intermediate" | "Advanced" | "Beginner" | "Reflective";
        researchQuestion: string;
        keywords: string[];
      }> = data.topics || [];

      if (generatedRaw.length === 0) {
        alert("No topics were returned by AI. Please try again.");
        return;
      }

      const startIndex = customTopics.length + 1;
      const formatted: TechTopic[] = generatedRaw.map((raw, idx) => ({
        id: `ai-custom-${String(startIndex + idx).padStart(3, "0")}`,
        title: raw.title,
        category: (raw.category as any) || "Self-Growth & Habits",
        difficulty: raw.difficulty || "Intermediate",
        researchQuestion: raw.researchQuestion,
        keywords: raw.keywords || ["growth", "reflection"],
      }));

      // Save into IndexedDB
      await saveCustomTopics(formatted);
      setCustomTopics((prev) => [...prev, ...formatted]);
      alert(`Successfully added ${formatted.length} brand-new topics to your library!`);
    } catch (err: any) {
      console.error("AI Topic synthesis failed:", err);
      alert(`Synthesis failed: ${err.message || "Network error"}`);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Called when video entry is saved in CameraStudio
  const handleEntrySaved = (newEntry: JournalEntry) => {
    // Refresh records
    loadDatabaseState();
    // Switch to Archive so user can view their new recording immediately
    setActiveTab("archive");
    setStudioPhase("research");
  };

  return (
    <div className="min-h-screen bg-[#080D16] text-slate-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* Strict Top Bar Contract */}
      <TopNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "storage") {
            setIsSyncModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        recordedCount={entries.length}
        totalTopicsCount={combinedTopics.length}
        onStartDailySprint={handleStartDailySprint}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === "studio" && (
          <div className="space-y-6">
            {/* Phase Mode Toggle Strip */}
            <div className="flex items-center justify-between studio-surface px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg">
                <button
                  onClick={() => setStudioPhase("research")}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                    studioPhase === "research"
                      ? "bg-amber-400 text-slate-950 font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  1. Research (5–10 min)
                </button>
                <button
                  onClick={() => setStudioPhase("record")}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                    studioPhase === "record"
                      ? "bg-amber-400 text-slate-950 font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  2. Video Studio (2–3 min)
                </button>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <span className="hidden md:inline">Topic: <span className="text-white font-medium truncate">{activeTopic.title}</span></span>
                <button
                  onClick={() => setActiveTab("topics")}
                  className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  Switch Topic →
                </button>
              </div>
            </div>

            {studioPhase === "research" ? (
              <ResearchHub
                topic={activeTopic}
                notes={researchNotes}
                onNotesChange={setResearchNotes}
                onProceedToStudio={() => setStudioPhase("record")}
                onOpenCoach={() => setIsCoachDrawerOpen(true)}
              />
            ) : (
              <CameraStudio
                topic={activeTopic}
                initialNotes={researchNotes}
                onEntrySaved={handleEntrySaved}
                onBackToResearch={() => setStudioPhase("research")}
              />
            )}
          </div>
        )}

        {activeTab === "topics" && (
          <TopicsExplorer
            allTopics={combinedTopics}
            recordedStates={recordedStates}
            onSelectTopic={handleSelectTopic}
            onGenerateCustomTopics={handleGenerateCustomTopics}
            isGeneratingCustom={isGeneratingCustom}
          />
        )}

        {activeTab === "archive" && (
          <JournalArchive
            entries={entries}
            onEntriesUpdated={loadDatabaseState}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
          />
        )}

        {activeTab === "coach" && (
          <div className="max-w-3xl mx-auto">
            <CoachPanel
              currentTopicTitle={activeTopic.title}
              currentNotes={researchNotes}
            />
          </div>
        )}
      </main>

      {/* Slide-over or Modal AI Coach Drawer (when in Studio/Research) */}
      {isCoachDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-0 md:p-4">
          <div className="w-full max-w-xl h-full md:h-[680px]">
            <CoachPanel
              currentTopicTitle={activeTopic.title}
              currentNotes={researchNotes}
              onClose={() => setIsCoachDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Local Storage & Folder Sync Modal */}
      <StorageSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        entries={entries}
      />
    </div>
  );
}
