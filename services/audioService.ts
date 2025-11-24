
export const playSound = (type: 'correct' | 'wrong' | 'click' | 'success' | 'levelUp') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'correct') {
    // High pitched happy ding
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'wrong') {
    // Low pitched wobble
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'click') {
    // Short pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'success' || type === 'levelUp') {
    // Major chord arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      const start = now + i * 0.1;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.2, start + 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, start + 0.5);
      o.start(start);
      o.stop(start + 0.6);
    });
  }
};
