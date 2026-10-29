import React, { useState, useEffect, useRef } from "react";
import { TechTopic } from "../data/topics";
import {
  JournalEntry,
  saveJournalEntry,
  generateDateFileName,
  getCurrentDirectoryHandle,
  saveVideoToFileSystem,
  downloadVideoBlob,
} from "../db/journalDb";
import {
  Video,
  Mic,
  Square,
  Play,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Volume2,
  ChevronDown,
  X,
  Plus,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface CameraStudioProps {
  topic: TechTopic;
  initialNotes: string;
  onEntrySaved: (entry: JournalEntry) => void;
  onBackToResearch: () => void;
}

export const CameraStudio: React.FC<CameraStudioProps> = ({
  topic,
  initialNotes,
  onEntrySaved,
  onBackToResearch,
}) => {
  // Device & Stream States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");

  // Recording State Machine: 'ready' | 'countdown' | 'recording' | 'review'
  const [recordState, setRecordState] = useState<"ready" | "countdown" | "recording" | "review">("ready");
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Teleprompter States
  const [prompterText, setPrompterText] = useState<string>(initialNotes);
  const [showPrompter, setShowPrompter] = useState<boolean>(true);
  const [prompterFontSize, setPrompterFontSize] = useState<number>(14);

  // Completed Recording Preview Data
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // Form State in Review Modal
  const [todayDateStr, setTodayDateStr] = useState<string>("");
  const [entryTitle, setEntryTitle] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize date on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayDateStr(today);
    setEntryTitle(`TechJournal_${today}_${topic.title.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 30)}`);
    setTags([...topic.keywords, topic.category.toLowerCase().split(" ")[0]]);
  }, [topic]);

  // Request Camera & Microphone access
  useEffect(() => {
    async function initCamera() {
      setDeviceError(null);
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedVideoDevice
            ? { deviceId: { exact: selectedVideoDevice }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: selectedAudioDevice
            ? { deviceId: { exact: selectedAudioDevice }, echoCancellation: true, noiseSuppression: true }
            : { echoCancellation: true, noiseSuppression: true },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = mediaStream;
        }

        // Set up real-time audio volume VU meter
        setupAudioAnalyser(mediaStream);

        // Enumerate devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(allDevices.filter((d) => d.kind === "videoinput"));
        setAudioDevices(allDevices.filter((d) => d.kind === "audioinput"));
      } catch (err: any) {
        console.error("Camera access failed:", err);
        setDeviceError(
          err.name === "NotAllowedError"
            ? "Camera and microphone permission denied. Please allow permissions in your browser to record your journal."
            : `Hardware access error: ${err.message || "Unknown error"}`
        );
      }
    }

    if (recordState !== "review") {
      initCamera();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [selectedVideoDevice, selectedAudioDevice, recordState]);

  // Audio level meter
  const setupAudioAnalyser = (mediaStream: MediaStream) => {
    try {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const src = ctx.createMediaStreamSource(mediaStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      console.warn("Audio meter setup skipped:", e);
    }
  };

  // Recording Timer
  useEffect(() => {
    let interval: any = null;
    if (recordState === "recording") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordState]);

  // Countdown handler
  useEffect(() => {
    if (recordState === "countdown") {
      if (countdownValue > 1) {
        const timer = setTimeout(() => {
          setCountdownValue((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setRecordState("recording");
          startMediaRecorder();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [recordState, countdownValue]);

  // Start 3-2-1 Countdown
  const handleInitiateRecording = () => {
    setCountdownValue(3);
    setElapsedSeconds(0);
    setRecordState("countdown");
  };

  // MediaRecorder core implementation
  const startMediaRecorder = () => {
    if (!stream) return;

    recordedChunksRef.current = [];

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    let selectedMime = "";
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    try {
      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, {
          type: selectedMime || "video/webm",
        });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedVideoUrl(url);
        setRecordState("review");
      };

      recorder.start(1000);
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      setDeviceError("Failed to initiate video recorder. Check browser codec support.");
      setRecordState("ready");
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Speech pacing phase
  const getPacingInfo = (secs: number) => {
    if (secs < 120) {
      return {
        phase: "Framing & Core Mechanism (0:00 - 2:00)",
        color: "text-slate-300",
        barColor: "bg-amber-400",
        message: "Introduce the problem and explain the underlying system trade-offs.",
        percent: Math.min(100, Math.round((secs / 120) * 50)),
      };
    } else if (secs <= 180) {
      return {
        phase: "Target Zone (2:00 - 3:00)",
        color: "text-emerald-400 font-semibold",
        barColor: "bg-emerald-500",
        message: "Optimal zone! Detail production takeaways and conclusions.",
        percent: 50 + Math.round(((secs - 120) / 60) * 50),
      };
    } else {
      return {
        phase: "Wrap Up (> 3:00)",
        color: "text-amber-400 font-semibold",
        barColor: "bg-amber-500",
        message: "Over 3 minutes. Deliver your concluding sentence and wrap up.",
        percent: 100,
      };
    }
  };

  const pacing = getPacingInfo(elapsedSeconds);

  // Tag manipulation
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save to Local Database & File System
  const handleSaveEntry = async () => {
    if (!recordedBlob) return;
    setIsSaving(true);
    setSaveSuccessMessage(null);

    const fileName = generateDateFileName(todayDateStr, topic.title);
    const newEntry: JournalEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`,
      title: entryTitle.trim() || topic.title,
      date: todayDateStr,
      createdAt: Date.now(),
      topicId: topic.id,
      topicTitle: topic.title,
      topicCategory: topic.category,
      videoBlob: recordedBlob,
      durationSeconds: elapsedSeconds,
      tags,
      researchNotes: prompterText,
      fileName,
      savedToDisk: false,
    };

    try {
      const dirHandle = getCurrentDirectoryHandle();
      if (dirHandle) {
        const saved = await saveVideoToFileSystem(dirHandle, fileName, recordedBlob);
        if (saved) {
          newEntry.savedToDisk = true;
        }
      }

      await saveJournalEntry(newEntry);

      setSaveSuccessMessage("Saved successfully to local database & disk archive!");
      setTimeout(() => {
        onEntrySaved(newEntry);
      }, 1000);
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(`Save failed: ${err.message || "IndexedDB error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct download button
  const handleDownloadFile = () => {
    if (!recordedBlob) return;
    const fileName = generateDateFileName(todayDateStr, topic.title);
    downloadVideoBlob(recordedBlob, fileName);
  };

  // Discard & re-record
  const handleDiscardAndRetry = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setElapsedSeconds(0);
    setRecordState("ready");
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="studio-surface-elevated rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
            <span>{topic.category}</span>
            <span aria-hidden="true">·</span>
            <span>2–3 Minute Speech Studio</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
            {topic.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToResearch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research</span>
          </button>

          <button
            onClick={() => setShowPrompter(!showPrompter)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
              showPrompter
                ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                : "bg-slate-800 text-slate-400 hover:text-white border-slate-700/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Teleprompter ({showPrompter ? "Visible" : "Hidden"})</span>
          </button>
        </div>
      </div>

      {deviceError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Camera Hardware Warning</p>
            <p className="mt-1">{deviceError}</p>
          </div>
        </div>
      )}

      {/* Main Studio Viewport (Camera + Teleprompter overlay) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Camera Viewfinder with HUD (8 cols) */}
        <div className={`${showPrompter ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Live Camera View */}
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover transform scale-x-[-1] ${
                recordState === "review" ? "hidden" : "block"
              }`}
            />

            {/* Countdown Overlay (3 - 2 - 1) */}
            {recordState === "countdown" && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                <div className="text-8xl font-mono font-bold text-amber-400 animate-ping">
                  {countdownValue}
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-6 uppercase tracking-widest">
                  Look at the lens. Speak clearly.
                </div>
              </div>
            )}

            {/* Studio HUD Overlays during Recording */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              {/* Recording indicator & timer */}
              <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10">
                {recordState === "recording" ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-red-400 tracking-wider">REC</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-400">STANDBY</span>
                )}
                <span className="text-sm font-mono font-bold text-white tabular-nums">
                  {formatTime(elapsedSeconds)}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 03:00</span>
              </div>

              {/* Audio VU meter */}
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      audioLevel > 75 ? "bg-red-400" : audioLevel > 20 ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Pacing Guide Strip (Floating on Viewfinder) */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 z-20">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`font-semibold ${pacing.color}`}>{pacing.phase}</span>
                <span className="text-slate-300 font-mono tabular-nums">{elapsedSeconds}s</span>
              </div>

              {/* Pacing Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                {/* 2:00 Target marker */}
                <div className="absolute left-[66%] top-0 bottom-0 w-0.5 bg-white/40 z-10" title="2:00 Target" />
                <div
                  className={`h-full transition-all duration-300 ${pacing.barColor}`}
                  style={{ width: `${pacing.percent}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{pacing.message}</span>
                <span className="text-emerald-400 font-mono font-medium">Sweet Spot: 2m – 3m</span>
              </div>
            </div>
          </div>

          {/* Camera Controls Bar */}
          <div className="studio-surface rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
            {/* Device Selectors */}
            <div className="flex items-center gap-3 text-xs">
              {videoDevices.length > 1 && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                  >
                    {videoDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || "Camera"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {audioDevices.length > 1 && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Mic className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedAudioDevice}
                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                  >
                    {audioDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || "Microphone"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Primary Recording Action Buttons */}
            <div className="flex items-center gap-3">
              {recordState === "ready" && (
                <button
                  onClick={handleInitiateRecording}
                  disabled={!!deviceError}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs md:text-sm rounded-lg transition-colors shadow-lg cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  <span>Start Recording (2–3 min)</span>
                </button>
              )}

              {recordState === "recording" && (
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs md:text-sm rounded-lg transition-colors shadow-lg cursor-pointer active:scale-95"
                >
                  <Square className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Finish & Review Entry</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Resizable Teleprompter Drawer (4 cols) */}
        {showPrompter && (
          <div className="lg:col-span-4 studio-surface rounded-2xl p-5 flex flex-col h-[520px] border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Teleprompter</h3>
              </div>

              {/* Font Sizer Controls */}
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs text-slate-300">
                <button
                  onClick={() => setPrompterFontSize((prev) => Math.max(12, prev - 2))}
                  className="px-1 hover:text-white cursor-pointer font-bold"
                  title="Smaller Font"
                >
                  A-
                </button>
                <span className="text-[10px] text-slate-500">|</span>
                <button
                  onClick={() => setPrompterFontSize((prev) => Math.min(24, prev + 2))}
                  className="px-1 hover:text-white cursor-pointer font-bold"
                  title="Larger Font"
                >
                  A+
                </button>
              </div>
            </div>

            <div className="flex-1 mt-3 overflow-y-auto pr-1">
              <textarea
                value={prompterText}
                onChange={(e) => setPrompterText(e.target.value)}
                style={{ fontSize: `${prompterFontSize}px` }}
                placeholder="Bullet points appear here..."
                className="w-full h-full bg-transparent text-slate-200 placeholder-slate-500 font-sans leading-relaxed resize-none focus:outline-none"
              />
            </div>

            <div className="pt-3 mt-2 border-t border-slate-800 text-[11px] text-slate-500">
              Tip: Position your browser window near your webcam lens for natural eye contact.
            </div>
          </div>
        )}
      </div>

      {/* Review & Save Modal */}
      {recordState === "review" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1524] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs text-emerald-400 font-medium">
                  Recording Completed
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Review & Archive: {topic.title}
                </h2>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-white text-sm tabular-nums">
                  {formatTime(elapsedSeconds)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{topic.category}</span>
              </div>
            </div>

            {/* Playback preview & Metadata form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Player */}
              <div className="space-y-3">
                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
                  {recordedVideoUrl && (
                    <video
                      ref={reviewVideoRef}
                      src={recordedVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Pacing: {elapsedSeconds >= 120 && elapsedSeconds <= 180 ? "Optimal (2–3 min)" : elapsedSeconds > 180 ? "Exceeded 3 min" : "Under 2 min"}</span>
                  <button
                    onClick={handleDownloadFile}
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .webm</span>
                  </button>
                </div>
              </div>

              {/* Form Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Entry Title
                  </label>
                  <input
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={todayDateStr}
                    onChange={(e) => setTodayDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tags & Technical Keywords
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-xs text-slate-300 rounded-md"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag (e.g. distributed-systems)..."
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Research Notes Transcript
                  </label>
                  <textarea
                    value={prompterText}
                    onChange={(e) => setPrompterText(e.target.value)}
                    rows={4}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  />
                </div>
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handleDiscardAndRetry}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Discard & Re-Record</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-700/60"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>

                <button
                  onClick={handleSaveEntry}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 text-xs md:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save to Local Journal"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
