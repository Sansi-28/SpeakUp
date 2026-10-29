import React, { useState, useEffect } from "react";
import {
  isFileSystemAccessSupported,
  requestLocalFolderPermission,
  getCurrentDirectoryHandle,
  JournalEntry,
} from "../db/journalDb";
import {
  HardDrive,
  FolderCheck,
  FolderPlus,
  ShieldCheck,
  Download,
  AlertTriangle,
  X,
} from "lucide-react";

interface StorageSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

export const StorageSyncModal: React.FC<StorageSyncModalProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{ usedMB: string; quotaMB: string } | null>(
    null
  );

  useEffect(() => {
    setIsSupported(isFileSystemAccessSupported());
    const existingHandle = getCurrentDirectoryHandle();
    if (existingHandle) {
      setFolderName(existingHandle.name);
    }

    // Query browser storage quota
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        const used = ((est.usage || 0) / (1024 * 1024)).toFixed(1);
        const quota = ((est.quota || 0) / (1024 * 1024)).toFixed(0);
        setStorageEstimate({ usedMB: used, quotaMB: quota });
      });
    }
  }, [isOpen]);

  const handlePickFolder = async () => {
    const res = await requestLocalFolderPermission();
    if (res) {
      setFolderName(res.name);
      alert(`Linked directory "${res.name}"! Future recordings can save directly to this folder on your laptop.`);
    }
  };

  const handleExportJsonBackup = () => {
    const exportData = {
      app: "SpeakUp",
      exportedAt: new Date().toISOString(),
      entriesCount: entries.length,
      entries: entries.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        createdAt: e.createdAt,
        topicId: e.topicId,
        topicTitle: e.topicTitle,
        topicCategory: e.topicCategory,
        durationSeconds: e.durationSeconds,
        tags: e.tags,
        researchNotes: e.researchNotes,
        fileName: e.fileName,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SpeakUp_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0E1524] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              Local Vault & Directory Sync
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Offline Box */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <p className="font-semibold text-white">100% Client-Side Private Storage</p>
            <p className="mt-1">
              Your video recordings, voice data, and notes are stored locally in your laptop browser&apos;s IndexedDB. Zero video files are uploaded to cloud servers.
            </p>
          </div>
        </div>

        {/* Direct Laptop Folder Integration (File System Access API) */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Direct Folder Synchronization
          </div>

          {isSupported ? (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Linked Laptop Directory:
                  </div>
                  <div className="text-sm font-mono text-amber-400 font-semibold mt-0.5">
                    {folderName ? `📁 /${folderName}` : "No folder linked yet"}
                  </div>
                </div>

                <button
                  onClick={handlePickFolder}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-amber-400/30"
                >
                  {folderName ? <FolderCheck className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
                  <span>{folderName ? "Change Directory" : "Link Directory"}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                When a folder is selected (e.g. <span className="font-mono text-slate-300">~/Videos/TechJournal</span>), saving an entry writes the <span className="font-mono text-slate-300">.webm</span> video file directly onto your laptop hard drive with automated date naming.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Your current browser does not support the File System Access API. Videos are still safely stored in IndexedDB and can be downloaded anytime.
              </span>
            </div>
          )}
        </div>

        {/* Database Stats & Backup */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">
              IndexedDB Storage
            </div>
            <div className="text-sm font-mono text-white font-bold mt-1 tabular-nums">
              {storageEstimate ? `${storageEstimate.usedMB} MB used` : "Calculating..."}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {entries.length} video entries stored
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                Database Manifest
              </div>
              <div className="text-xs text-slate-300 mt-1">Export JSON metadata</div>
            </div>
            <button
              onClick={handleExportJsonBackup}
              className="flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer mt-2 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
