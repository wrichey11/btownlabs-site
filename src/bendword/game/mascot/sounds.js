// Bendit's sound effects (the same files as the iOS app). Browsers only allow audio after the
// player has interacted with the page, so `unlock()` runs on the first tap or key press; until the
// files have loaded, sounds are skipped rather than delaying the animation that asked for them.

const NAMES = ['pop', 'land', 'boing', 'step', 'whoosh', 'chime', 'sad'];
const VOLUME = { step: 0.45, whoosh: 0.55, boing: 0.55, chime: 0.6, sad: 0.6, pop: 0.65, land: 0.65 };

class MascotSounds {
  enabled = true;
  context = null;
  buffers = {};
  loading = null;

  unlock() {
    if (!this.enabled) return;
    if (!this.context) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return;
      try { this.context = new AudioContext(); } catch { return; }
    }
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    this.load();
  }

  load() {
    if (this.loading || !this.context) return;
    this.loading = Promise.all(NAMES.map(async (name) => {
      try {
        const response = await fetch(`/bendword/sounds/mascot_${name}.wav`);
        if (!response.ok) return;
        this.buffers[name] = await this.context.decodeAudioData(await response.arrayBuffer());
      } catch {
        // A missing sound just stays silent.
      }
    }));
  }

  play(name) {
    const buffer = this.buffers[name];
    if (!this.enabled || !buffer || this.context?.state !== 'running') return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const gain = this.context.createGain();
    gain.gain.value = VOLUME[name] ?? 0.6;
    source.connect(gain).connect(this.context.destination);
    source.start();
  }
}

export const mascotSounds = new MascotSounds();
