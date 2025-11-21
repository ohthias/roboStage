export const playSound = (type: "start" | "warning" | "end" | "tick") => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === "start") {
    // 3-2-1-GO sound
    osc.type = "square";
    osc.frequency.setValueAtTime(440, now); // 3
    osc.frequency.setValueAtTime(440, now + 0.5); // 2
    osc.frequency.setValueAtTime(440, now + 1.0); // 1
    osc.frequency.setValueAtTime(880, now + 1.5); // GO! (High pitch)

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0, now + 0.1);
    gain.gain.setValueAtTime(0.1, now + 0.5);
    gain.gain.setValueAtTime(0, now + 0.6);
    gain.gain.setValueAtTime(0.1, now + 1.0);
    gain.gain.setValueAtTime(0, now + 1.1);
    gain.gain.setValueAtTime(0.3, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.start(now);
    osc.stop(now + 2.5);
  } else if (type === "end") {
    // Buzzer
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 1.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.5);

    osc.start(now);
    osc.stop(now + 1.5);
  } else if (type === "warning") {
    // Warning blip
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === "tick") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
};
