import { TechTopic } from "../data/topics";

export interface JournalEntry {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
  topicId: string;
  topicTitle: string;
  topicCategory: string;
  videoBlob: Blob;
  durationSeconds: number;
  tags: string[];
  researchNotes: string;
  fileName: string;
  savedToDisk?: boolean;
}

export interface TopicRecordState {
  topicId: string;
  status: "available" | "recorded";
  recordedAt?: string;
  journalEntryId?: string;
}

const DB_NAME = "SpeakUpDB";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("entries")) {
        const entriesStore = db.createObjectStore("entries", { keyPath: "id" });
        entriesStore.createIndex("date", "date", { unique: false });
        entriesStore.createIndex("topicId", "topicId", { unique: false });
        entriesStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("topics_state")) {
        db.createObjectStore("topics_state", { keyPath: "topicId" });
      }

      if (!db.objectStoreNames.contains("custom_topics")) {
        db.createObjectStore("custom_topics", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// Journal Entries Operations
// -------------------------------------------------------------

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["entries", "topics_state"], "readwrite");
    const entriesStore = tx.objectStore("entries");
    const topicsStore = tx.objectStore("topics_state");

    entriesStore.put(entry);

    // Lock topic out from future draws
    const topicState: TopicRecordState = {
      topicId: entry.topicId,
      status: "recorded",
      recordedAt: entry.date,
      journalEntryId: entry.id,
    };
    topicsStore.put(topicState);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("entries", "readonly");
    const store = tx.objectStore("entries");
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort newest first
      const entries: JournalEntry[] = request.result || [];
      entries.sort((a, b) => b.createdAt - a.createdAt);
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("entries", "readonly");
    const store = tx.objectStore("entries");
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteJournalEntry(id: string, topicId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["entries", "topics_state"], "readwrite");
    const entriesStore = tx.objectStore("entries");
    const topicsStore = tx.objectStore("topics_state");

    entriesStore.delete(id);

    // Unlock topic back to available if this was its linked entry
    const topicReq = topicsStore.get(topicId);
    topicReq.onsuccess = () => {
      if (topicReq.result && topicReq.result.journalEntryId === id) {
        topicsStore.delete(topicId);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateJournalEntryMetadata(
  id: string,
  updates: { tags?: string[]; title?: string; researchNotes?: string; savedToDisk?: boolean }
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("entries", "readwrite");
    const store = tx.objectStore("entries");
    const req = store.get(id);

    req.onsuccess = () => {
      const entry: JournalEntry = req.result;
      if (!entry) {
        return reject(new Error("Entry not found"));
      }

      if (updates.tags !== undefined) entry.tags = updates.tags;
      if (updates.title !== undefined) entry.title = updates.title;
      if (updates.researchNotes !== undefined) entry.researchNotes = updates.researchNotes;
      if (updates.savedToDisk !== undefined) entry.savedToDisk = updates.savedToDisk;

      store.put(entry);
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// Topic Record State Operations (Zero Repetition Enforcement)
// -------------------------------------------------------------

export async function getAllRecordedTopicStates(): Promise<Map<string, TopicRecordState>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("topics_state", "readonly");
    const store = tx.objectStore("topics_state");
    const request = store.getAll();

    request.onsuccess = () => {
      const states: TopicRecordState[] = request.result || [];
      const map = new Map<string, TopicRecordState>();
      for (const s of states) {
        map.set(s.topicId, s);
      }
      resolve(map);
    };
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// Custom Topics (Dynamically generated by AI)
// -------------------------------------------------------------

export async function saveCustomTopics(topics: TechTopic[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("custom_topics", "readwrite");
    const store = tx.objectStore("custom_topics");

    for (const t of topics) {
      store.put(t);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllCustomTopics(): Promise<TechTopic[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("custom_topics", "readonly");
    const store = tx.objectStore("custom_topics");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// File System Access API & Offline File Sync Helpers
// -------------------------------------------------------------

// In-memory directory handle reference for current session
let currentDirHandle: any = null;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function requestLocalFolderPermission(): Promise<{ name: string; handle: any } | null> {
  if (!isFileSystemAccessSupported()) return null;
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: "readwrite",
      startIn: "videos",
    });
    currentDirHandle = handle;
    return { name: handle.name, handle };
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.warn("Directory picker error:", err);
    }
    return null;
  }
}

export function getCurrentDirectoryHandle(): any {
  return currentDirHandle;
}

export async function saveVideoToFileSystem(
  dirHandle: any,
  fileName: string,
  blob: Blob
): Promise<boolean> {
  try {
    if (!dirHandle) return false;
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err) {
    console.error("Failed saving directly to filesystem:", err);
    return false;
  }
}

export function downloadVideoBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function generateDateFileName(dateStr: string, topicTitle: string): string {
  const slug = topicTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `TechJournal_${dateStr}_${slug}.webm`;
}
