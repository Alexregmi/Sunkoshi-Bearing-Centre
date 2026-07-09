export type SoundType =
  | "tap"
  | "cart"
  | "favorite"
  | "success"
  | "error"
  | "notification"
  | "order"
  | "celebrate"
  | "search";

/**
 * Plays a synthesized sound effect using the Web Audio API.
 * High fidelity, zero dependencies, respects sound enabled preference.
 */
export function playSynthSound(type: SoundType) {
  if (typeof window === "undefined") return;
  
  // Check if sound is enabled (defaults to true)
  const enabled = localStorage.getItem("sound_enabled") !== "false";
  if (!enabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (
      freq: number,
      start: number,
      duration: number,
      oscType: OscillatorType = "sine",
      volume = 0.08
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;

    switch (type) {
      case "tap": {
        // High-pitch short click
        playTone(600, now, 0.05, "sine", 0.04);
        break;
      }
      case "cart": {
        // Double tone ascending (C5 -> E5)
        playTone(523.25, now, 0.08, "triangle", 0.06);
        playTone(659.25, now + 0.07, 0.14, "triangle", 0.06);
        break;
      }
      case "favorite": {
        // Warm fifth interval (G4 -> D5)
        playTone(392.00, now, 0.1, "sine", 0.08);
        playTone(587.33, now + 0.05, 0.16, "sine", 0.08);
        break;
      }
      case "success": {
        // Cheerful major chord triad (C5 -> E5 -> G5)
        playTone(523.25, now, 0.08, "sine", 0.06);
        playTone(659.25, now + 0.06, 0.08, "sine", 0.06);
        playTone(783.99, now + 0.12, 0.18, "sine", 0.06);
        break;
      }
      case "error": {
        // Downward saw pitch sweep buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.3);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case "notification": {
        // Sweet high chime ding-dong (A5 -> F5)
        playTone(880, now, 0.12, "sine", 0.05);
        playTone(698.46, now + 0.1, 0.22, "sine", 0.05);
        break;
      }
      case "order": {
        // Beautiful major arpeggio sweep (C4 -> E4 -> G4 -> C5)
        playTone(261.63, now, 0.12, "triangle", 0.05);
        playTone(329.63, now + 0.06, 0.12, "triangle", 0.05);
        playTone(392.00, now + 0.12, 0.12, "triangle", 0.05);
        playTone(523.25, now + 0.18, 0.25, "triangle", 0.05);
        break;
      }
      case "celebrate": {
        // Sparkly pentatonic run
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        notes.forEach((freq, idx) => {
          playTone(freq, now + idx * 0.05, 0.08, "sine", 0.04);
        });
        break;
      }
      case "search": {
        // Sweet upward whoosh sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  } catch (e) {
    console.warn("Failed to play synthesized sound effect:", e);
  }
}
