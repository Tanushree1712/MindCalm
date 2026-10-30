/**
 * Pure Web Audio API Ambient Sound Synthesizer & Meditation Chime
 * Provides offline, zero-latency calming sounds without external audio dependencies.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private oceanNode: AudioNode | null = null;
  private bowlNodes: AudioNode[] = [];
  private activeSounds: Set<string> = new Set();
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isPlaying(sound: string): boolean {
    return this.activeSounds.has(sound);
  }

  public getActiveSounds(): string[] {
    return Array.from(this.activeSounds);
  }

  // --- Gentle Tibetan / Crystal Singing Bowl Chime ---
  public playSingingBowlChime(freq = 432) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // Fundamental + harmonic overtones
      const partials = [
        { mult: 1, gain: 0.6, decay: 4.5 },
        { mult: 2.76, gain: 0.25, decay: 3.5 },
        { mult: 5.4, gain: 0.12, decay: 2.2 },
        { mult: 8.9, gain: 0.05, decay: 1.5 },
      ];

      partials.forEach(p => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * p.mult, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(p.gain * 0.4, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + p.decay);
      });
    } catch (e) {
      console.warn('Audio chime could not play:', e);
    }
  }

  // --- Rain Generator (Filtered Pink Noise with soft low-pass) ---
  public startRain() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.rainNode) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.rainNode = gain;
    this.activeSounds.add('rain');
  }

  public stopRain() {
    if (this.rainNode && this.masterGain && this.ctx) {
      try {
        (this.rainNode as GainNode).gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.2);
        setTimeout(() => {
          this.rainNode?.disconnect();
          this.rainNode = null;
        }, 300);
      } catch {
        this.rainNode = null;
      }
    }
    this.activeSounds.delete('rain');
  }

  // --- Ocean Wave Swell Generator ---
  public startOcean() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.oceanNode) return;

    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // LFO to create oceanic rhythmic swell
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 second wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(260, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    lfo.start();
    noise.start();
    this.oceanNode = gain;
    this.activeSounds.add('ocean');
  }

  public stopOcean() {
    if (this.oceanNode && this.ctx) {
      try {
        (this.oceanNode as GainNode).gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.2);
        setTimeout(() => {
          this.oceanNode?.disconnect();
          this.oceanNode = null;
        }, 300);
      } catch {
        this.oceanNode = null;
      }
    }
    this.activeSounds.delete('ocean');
  }

  // --- Tibetan Singing Bowl Resonant Drone (432Hz + 528Hz Love Frequency) ---
  public startSingingBowl() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.bowlNodes.length > 0) return;

    const freqs = [216, 432, 528];
    const nodes: AudioNode[] = [];

    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      // Subtle vibrato
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      lfo.start();
      osc.start();
      nodes.push(osc, lfo, gain);
    });

    this.bowlNodes = nodes;
    this.activeSounds.add('bowl');
  }

  public stopSingingBowl() {
    if (this.bowlNodes.length > 0) {
      this.bowlNodes.forEach(n => {
        try {
          n.disconnect();
        } catch {
          // ignore
        }
      });
      this.bowlNodes = [];
    }
    this.activeSounds.delete('bowl');
  }

  public toggleSound(sound: 'rain' | 'ocean' | 'bowl') {
    if (this.isPlaying(sound)) {
      if (sound === 'rain') this.stopRain();
      else if (sound === 'ocean') this.stopOcean();
      else if (sound === 'bowl') this.stopSingingBowl();
    } else {
      if (sound === 'rain') this.startRain();
      else if (sound === 'ocean') this.startOcean();
      else if (sound === 'bowl') this.startSingingBowl();
    }
  }

  public stopAll() {
    this.stopRain();
    this.stopOcean();
    this.stopSingingBowl();
  }
}

export const audioSynth = new AudioSynthesizer();
