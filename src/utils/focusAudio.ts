/**
 * Focus audio utility:
 * Provides offline Web Audio synthesizer (binaural beats + warm ambient pad)
 * and plays Lyria-generated music clips.
 */

let audioCtx: AudioContext | null = null;
let ambientOscillators: OscillatorNode[] = [];
let ambientGainNode: GainNode | null = null;
let isOfflineAmbientPlaying = false;

export function playOfflineBinauralFocus(): void {
  if (isOfflineAmbientPlaying) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();

    ambientGainNode = audioCtx.createGain();
    ambientGainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 2);
    ambientGainNode.connect(audioCtx.destination);

    // Warm ambient chords (C minor 9th: C, Eb, G, Bb, D) with gentle detuning
    const freqs = [130.81, 155.56, 196.0, 233.08, 293.66];

    ambientOscillators = freqs.map((freq, i) => {
      const osc = audioCtx!.createOscillator();
      let panner: StereoPannerNode | null = null;
      try {
        panner = audioCtx!.createStereoPanner();
      } catch {
        panner = null;
      }

      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq + (i === 0 ? 0.5 : -0.5), audioCtx!.currentTime);

      if (panner) {
        panner.pan.value = (i - 2) * 0.3;
        osc.connect(panner);
        panner.connect(ambientGainNode!);
      } else {
        osc.connect(ambientGainNode!);
      }

      osc.start();
      return osc;
    });

    isOfflineAmbientPlaying = true;
  } catch (err) {
    console.error("Web Audio focus generation failed:", err);
  }
}

export function stopOfflineBinauralFocus(): void {
  if (!isOfflineAmbientPlaying || !ambientGainNode || !audioCtx) return;

  try {
    ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, audioCtx.currentTime);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);

    setTimeout(() => {
      ambientOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      ambientOscillators = [];
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
      }
      audioCtx = null;
      isOfflineAmbientPlaying = false;
    }, 1100);
  } catch {
    isOfflineAmbientPlaying = false;
  }
}

export function isAmbientPlaying(): boolean {
  return isOfflineAmbientPlaying;
}
