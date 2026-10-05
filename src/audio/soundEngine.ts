/**
 * 16-bit Synthesizer Sound Engine for Zelda: A Link to the Past Tribute
 * Built entirely with Web Audio API (zero external audio file dependencies)
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmActive: boolean = false;
  private bgmIntervalId: number | null = null;
  private masterVolume: number = 0.7;
  private lastLowHealthBeep: number = 0;

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(val: number): void {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0, volume: number = 0.2): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio fallback catch
    }
  }

  // Classic sword swing: frequency glide + snappy cut
  public sword(): void {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Spin attack charge whine
  public spinCharge(ratio: number): void {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const freq = 300 + ratio * 550;
    this.playTone(freq, 'sawtooth', 0.04, 0, 0.08);
  }

  // Spin attack release: full whoosh blast
  public spinRelease(): void {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    [300, 480, 720, 960].forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.15, idx * 0.03, 0.18);
    });

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Impact on enemy or player
  public hit(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(130, 'square', 0.12, 0, 0.28);
    this.playTone(70, 'sawtooth', 0.16, 0.02, 0.22);
  }

  // Enemy defeated pop
  public enemyDefeat(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const tones = [260, 200, 150, 90];
    tones.forEach((freq, i) => {
      this.playTone(freq, 'square', 0.08, i * 0.04, 0.2);
    });
  }

  // Ceramic pot smashing with noise simulation
  public smash(): void {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.12);

      this.playTone(180, 'square', 0.08, 0, 0.2);
      this.playTone(110, 'triangle', 0.14, 0.04, 0.25);
    } catch {
      this.playTone(150, 'square', 0.1, 0, 0.25);
    }
  }

  // Stone block push friction
  public pushBlock(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(95, 'sawtooth', 0.06, 0, 0.12);
  }

  // The iconic 8-note Zelda puzzle solved chime
  public secret(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const notes = [659.25, 622.25, 523.25, 440.0, 415.3, 329.63, 415.3, 523.25];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.13, idx * 0.09, 0.22);
    });
  }

  // Item get fanfare (e.g. Small Key)
  public itemGet(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.22, idx * 0.11, 0.25);
      this.playTone(freq * 1.5, 'square', 0.18, idx * 0.11, 0.08);
    });
  }

  // Bomb placed fuse sizzle & thud
  public bombPlace(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(180, 'square', 0.08, 0, 0.2);
    this.playTone(90, 'triangle', 0.12, 0.02, 0.25);
  }

  // Bomb Explosion: dynamic deep blast
  public bombExplosion(): void {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.36);

      // Deep bass rumble
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      this.playTone(80, 'square', 0.3, 0, 0.4);
    }
  }

  // Wall cracking and crumbling
  public wallCrumble(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(160, 'sawtooth', 0.2, 0, 0.3);
    this.playTone(100, 'square', 0.25, 0.05, 0.25);
    this.playTone(60, 'sawtooth', 0.3, 0.1, 0.3);
  }

  // Score bonus jingle
  public scoreBonus(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(880, 'triangle', 0.08, 0, 0.15);
    this.playTone(1174.66, 'triangle', 0.12, 0.06, 0.2);
  }

  // Rupee pickup ping
  public rupee(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(1200, 'square', 0.06, 0, 0.15);
    this.playTone(1600, 'triangle', 0.1, 0.04, 0.2);
  }

  // Heart pickup recovery chime
  public heart(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playTone(523.25, 'triangle', 0.12, 0, 0.2);
    this.playTone(659.25, 'triangle', 0.18, 0.08, 0.25);
    this.playTone(783.99, 'triangle', 0.25, 0.16, 0.25);
  }

  // Low health warning beep
  public lowHealthCheck(): void {
    const now = Date.now();
    if (now - this.lastLowHealthBeep > 800) {
      this.lastLowHealthBeep = now;
      this.playTone(493.88, 'square', 0.09, 0, 0.15);
    }
  }

  // Triforce Victory Fanfare
  public triforceFanfare(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const fanfare = [
      { f: 440, d: 0.16 },
      { f: 440, d: 0.16 },
      { f: 440, d: 0.16 },
      { f: 440, d: 0.48 },
      { f: 349.23, d: 0.48 },
      { f: 392.00, d: 0.48 },
      { f: 440.00, d: 0.48 },
      { f: 523.25, d: 0.9 }
    ];

    let time = 0;
    fanfare.forEach(note => {
      this.playTone(note.f, 'triangle', note.d, time, 0.3);
      this.playTone(note.f * 1.5, 'sine', note.d, time, 0.15);
      time += note.d + 0.06;
    });
  }

  // Game over sorrow melody
  public gameOver(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const notes = [
      { f: 330, d: 0.25 },
      { f: 311, d: 0.25 },
      { f: 293, d: 0.3 },
      { f: 247, d: 0.6 }
    ];
    let time = 0;
    notes.forEach(n => {
      this.playTone(n.f, 'sawtooth', n.d, time, 0.2);
      time += n.d + 0.05;
    });
  }

  // Ambient 16-bit Dungeon Synth Background Music Generator
  public toggleBGM(enable?: boolean): boolean {
    this.init();
    const shouldStart = enable !== undefined ? enable : !this.bgmActive;

    if (shouldStart && !this.bgmActive) {
      this.bgmActive = true;
      this.startDungeonBgmLoop();
    } else if (!shouldStart && this.bgmActive) {
      this.bgmActive = false;
      if (this.bgmIntervalId !== null) {
        clearInterval(this.bgmIntervalId);
        this.bgmIntervalId = null;
      }
    }
    return this.bgmActive;
  }

  public isBGMPlaying(): boolean {
    return this.bgmActive;
  }

  private startDungeonBgmLoop(): void {
    if (!this.ctx || !this.bgmGain) return;

    // Atmospheric D-minor dungeon progression: D2 -> F2 -> A2 -> C3 -> Bb2 -> G2 -> A2 -> D2
    const baseScale = [73.42, 87.31, 110.0, 130.81, 116.54, 98.0, 110.0, 73.42];
    const topMelody = [293.66, 349.23, 440.0, 392.0, 349.23, 329.63, 293.66, 261.63];
    let step = 0;

    const playBgmStep = () => {
      if (!this.bgmActive || !this.ctx || !this.bgmGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const bassFreq = baseScale[step % baseScale.length];
      const melodyFreq = topMelody[(step * 2) % topMelody.length];

      // Deep bass pulse
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + 0.48);

        // Periodic mysterious atmospheric pulse
        if (step % 2 === 0) {
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(melodyFreq, now + 0.05);

          gain2.gain.setValueAtTime(0.05, now + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.38);

          osc2.connect(gain2);
          gain2.connect(this.bgmGain);
          osc2.start(now + 0.05);
          osc2.stop(now + 0.4);
        }
      } catch {
        // Safe catch
      }

      step++;
    };

    playBgmStep();
    this.bgmIntervalId = window.setInterval(playBgmStep, 500);
  }
}

export const audioEngine = new SoundEngine();
