import React, { useState, useMemo } from "react";
import {
  JournalEntry,
  deleteJournalEntry,
  downloadVideoBlob,
  getCurrentDirectoryHandle,
  saveVideoToFileSystem,
  updateJournalEntryMetadata,
} from "../db/journalDb";
import {
  Film,
  Calendar,
  Clock,
  Download,
  Trash2,
  Play,
  Search,
  HardDrive,
  CheckCircle2,
  X,
  FileText,
  Video,
} from "lucide-react";

interface JournalArchiveProps {
  entries: JournalEntry[];
  onEntriesUpdated: () => void;
  onOpenSyncModal: () => void;
}

export const JournalArchive: React.FC<JournalArchiveProps> = ({
  entries,
  onEntriesUpdated,
  onOpenSyncModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isSyncingEntryId, setIsSyncingEntryId] = useState<string | null>(null);

  // Compute all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => {
      e.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedTag !== "All" && !entry.tags.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesTopic = entry.topicTitle.toLowerCase().includes(q);
        const matchesDate = entry.date.toLowerCase().includes(q);
        const matchesNotes = entry.researchNotes.toLowerCase().includes(q);
        const matchesTags = entry.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesTopic || matchesDate || matchesNotes || matchesTags;
      }
      return true;
    });
  }, [entries, selectedTag, searchQuery]);

  // Aggregate stats
  const totalMinutes = useMemo(() => {
    const totalSecs = entries.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    return (totalSecs / 60).toFixed(1);
  }, [entries]);

  // Open entry for playback
  const handleOpenPlayback = (entry: JournalEntry) => {
    if (activeVideoUrl) {
      URL.revokeObjectURL(activeVideoUrl);
    }
    const url = URL.createObjectURL(entry.videoBlob);
    setActiveVideoUrl(url);
    setActiveEntry(entry);
  };

  const handleClosePlayback = () => {
    if (activeVideoUrl) {
      URL.revokeObjectURL(activeVideoUrl);
    }
    setActiveVideoUrl(null);
    setActiveEntry(null);
  };

  // Delete an entry
  const handleDelete = async (entry: JournalEntry) => {
    if (
      !confirm(
        `Are you sure you want to delete "${entry.title}" (${entry.date})? This will also unlock the topic "${entry.topicTitle}" so it can be drawn or recorded again.`
      )
    ) {
      return;
    }

    try {
      await deleteJournalEntry(entry.id, entry.topicId);
      if (activeEntry?.id === entry.id) {
        handleClosePlayback();
      }
      onEntriesUpdated();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || "IndexedDB error"}`);
    }
  };

  // Sync to laptop folder via File System Access API
  const handleSyncToFolder = async (entry: JournalEntry) => {
    const dirHandle = getCurrentDirectoryHandle();
    if (!dirHandle) {
      onOpenSyncModal();
      return;
    }

    setIsSyncingEntryId(entry.id);
    try {
      const ok = await saveVideoToFileSystem(dirHandle, entry.fileName, entry.videoBlob);
      if (ok) {
        await updateJournalEntryMetadata(entry.id, { savedToDisk: true });
        onEntriesUpdated();
        alert(`Successfully saved ${entry.fileName} directly to your laptop directory!`);
      } else {
        alert("Could not write to local directory. Please check permissions.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving to local folder.");
    } finally {
      setIsSyncingEntryId(null);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Overview & Metrics Bar */}
      <div className="studio-surface-elevated border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs text-amber-400 font-medium uppercase tracking-wider">
            Secure Local Database
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
            Technical Video Journal Archive
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            All videos are stored 100% locally and offline in browser IndexedDB, with automated date naming and local laptop folder export.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-6 bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">
              Total Entries
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {entries.length}
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">
              Speaking Time
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {totalMinutes} min
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">
              Local Vault
            </div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="studio-surface border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by date, title, tags, or research notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Tag Filter Strip */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedTag("All")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === "All"
                  ? "bg-amber-400 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? "bg-amber-400 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chronological Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="studio-surface border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          >
            {/* Left: Thumbnail & Meta Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Play preview thumbnail button */}
              <button
                onClick={() => handleOpenPlayback(entry)}
                className="w-24 h-16 bg-slate-900 rounded-lg border border-slate-800 hover:border-amber-400/50 flex flex-col items-center justify-center shrink-0 group cursor-pointer transition-colors"
              >
                <Play className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono text-slate-400 mt-1 tabular-nums">
                  {formatDuration(entry.durationSeconds)}
                </span>
              </button>

              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Zero-Pill Metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-amber-400 font-medium">{entry.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{entry.topicCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-300">
                    {formatDuration(entry.durationSeconds)}
                  </span>
                  {entry.savedToDisk && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Synced to Disk
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white truncate">
                  {entry.title}
                </h3>

                <div className="text-xs text-slate-400 truncate">
                  Topic: <span className="text-slate-300">{entry.topicTitle}</span>
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                    {entry.tags.map((t, idx) => (
                      <span key={t} className="text-slate-400">
                        #{t}
                        {idx < entry.tags.length - 1 && <span className="ml-1 text-slate-600">·</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleOpenPlayback(entry)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play</span>
              </button>

              <button
                onClick={() => handleSyncToFolder(entry)}
                disabled={isSyncingEntryId === entry.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Save directly into your laptop folder"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Sync to Disk</span>
              </button>

              <button
                onClick={() => downloadVideoBlob(entry.videoBlob, entry.fileName)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Download video file"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(entry)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Delete journal entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="py-20 text-center space-y-3 studio-surface border border-slate-800 rounded-xl">
            <Film className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-base font-semibold text-slate-300">No video journal entries found.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {entries.length === 0
                ? "You haven't recorded any entries yet. Click 'Start Daily Sprint' to record your first technical video journal!"
                : "No entries match your search query."}
            </p>
          </div>
        )}
      </div>

      {/* Playback Modal */}
      {activeEntry && activeVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1524] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs text-amber-400 font-medium">
                  Journal Entry · {activeEntry.date}
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white mt-0.5">
                  {activeEntry.title}
                </h2>
              </div>

              <button
                onClick={handleClosePlayback}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
              <video src={activeVideoUrl} controls autoPlay className="w-full h-full object-cover" />
            </div>

            {/* Video Details & Transcript */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Topic:</span>
                  <span>{activeEntry.topicTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-amber-400">{formatDuration(activeEntry.durationSeconds)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadVideoBlob(activeEntry.videoBlob, activeEntry.fileName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {activeEntry.fileName}</span>
                  </button>

                  <button
                    onClick={() => handleSyncToFolder(activeEntry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-lg text-xs cursor-pointer border border-amber-400/30"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Sync to Laptop Folder</span>
                  </button>
                </div>
              </div>

              {activeEntry.researchNotes && (
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Research Notes & Talking Points
                  </div>
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {activeEntry.researchNotes}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
