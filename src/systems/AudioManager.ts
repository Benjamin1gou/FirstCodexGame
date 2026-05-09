import type { Scene } from 'phaser';

type BgmTrack = 'title' | 'dungeon' | 'resultWin' | 'resultLose';

type Note = {
  frequency: number;
  beats: number;
  gain: number;
  wave: OscillatorType;
};

const STORAGE_KEY_MUTED = 'firstcodexgame_audio_muted';
const DEFAULT_BPM = 128;
const SECONDS_PER_BEAT = 60 / DEFAULT_BPM;

class AudioManagerImpl {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: BgmTrack | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private volume = 0.18;
  private muted = false;
  private unlocked = false;

  constructor() {
    this.muted = this.readMutedState();
  }

  unlock(): Promise<boolean> {
    return this.ensureContextReady();
  }

  async playTitleBgm(): Promise<void> { await this.playTrack('title', true); }
  async playDungeonBgm(): Promise<void> { await this.playTrack('dungeon', true); }
  async playResultBgm(win: boolean): Promise<void> { await this.playTrack(win ? 'resultWin' : 'resultLose', false); }

  stopBgm(): void {
    this.currentTrack = null;
    if (!this.currentSource) return;
    try { this.currentSource.stop(); } catch { /* noop */ }
    this.currentSource.disconnect();
    this.currentSource = null;
  }

  pauseBgm(): void {
    if (!this.context || this.context.state !== 'running') return;
    this.context.suspend().catch(() => undefined);
  }

  resumeBgm(): Promise<boolean> {
    return this.ensureContextReady();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    this.saveMutedState(this.muted);
    this.applyVolume();
    return this.muted;
  }

  isMuted(): boolean { return this.muted; }

  setVolume(value: number): void {
    const nextValue = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : this.volume;
    this.volume = nextValue;
    this.applyVolume();
  }

  bindGlobalUnlock(scene: Scene): void {
    scene.input.once('pointerdown', () => { this.unlock().catch(() => undefined); });
    scene.input.keyboard?.once('keydown', () => { this.unlock().catch(() => undefined); });
  }

  private async playTrack(track: BgmTrack, loop: boolean): Promise<void> {
    if (this.currentTrack === track && this.currentSource) return;
    const ready = await this.ensureContextReady();
    if (!ready || !this.context || !this.masterGain) return;

    this.stopBgm();
    const buffer = this.generateTrackBuffer(track);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.masterGain);
    source.onended = () => {
      if (this.currentSource === source) {
        this.currentSource = null;
        this.currentTrack = null;
      }
    };
    source.start(0);
    this.currentSource = source;
    this.currentTrack = track;
  }

  private async ensureContextReady(): Promise<boolean> {
    if (!this.context) {
      const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.applyVolume();
    }

    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch {
        return false;
      }
    }

    this.unlocked = this.context.state === 'running';
    return this.unlocked;
  }

  private applyVolume(): void {
    if (!this.masterGain || !this.context) return;
    const target = this.muted ? 0 : this.volume;
    this.masterGain.gain.setTargetAtTime(target, this.context.currentTime, 0.01);
  }

  private generateTrackBuffer(track: BgmTrack): AudioBuffer {
    if (!this.context) throw new Error('AudioContext is not initialized.');
    switch (track) {
      case 'title':
        return this.renderPattern([
          { melody: [{ frequency: 392, beats: 1, gain: 0.18, wave: 'square' }, { frequency: 523.25, beats: 1, gain: 0.16, wave: 'square' }, { frequency: 659.25, beats: 2, gain: 0.17, wave: 'square' }, { frequency: 523.25, beats: 2, gain: 0.15, wave: 'square' }, { frequency: 440, beats: 2, gain: 0.16, wave: 'square' }], bass: [130.81, 146.83, 164.81, 146.83] }
        ], 8);
      case 'dungeon':
        return this.renderPattern([
          { melody: [{ frequency: 293.66, beats: 1, gain: 0.13, wave: 'square' }, { frequency: 349.23, beats: 1, gain: 0.13, wave: 'square' }, { frequency: 392, beats: 2, gain: 0.14, wave: 'square' }, { frequency: 349.23, beats: 2, gain: 0.12, wave: 'square' }, { frequency: 329.63, beats: 2, gain: 0.13, wave: 'square' }], bass: [98, 110, 123.47, 110] },
          { melody: [{ frequency: 293.66, beats: 1, gain: 0.13, wave: 'square' }, { frequency: 349.23, beats: 1, gain: 0.13, wave: 'square' }, { frequency: 440, beats: 2, gain: 0.14, wave: 'square' }, { frequency: 392, beats: 2, gain: 0.12, wave: 'square' }, { frequency: 349.23, beats: 2, gain: 0.13, wave: 'square' }], bass: [98, 116.54, 123.47, 116.54] }
        ], 8, true);
      case 'resultWin':
        return this.renderJingle([523.25, 659.25, 783.99, 1046.5], [130.81, 164.81, 196, 261.63]);
      case 'resultLose':
        return this.renderJingle([392, 349.23, 293.66, 220], [98, 87.31, 73.42, 55]);
    }
  }

  private renderPattern(parts: Array<{ melody: Note[]; bass: number[] }>, beatsPerMeasure: number, addNoise = false): AudioBuffer {
    if (!this.context) throw new Error('AudioContext is not initialized.');
    const measures = parts.length;
    const duration = measures * beatsPerMeasure * SECONDS_PER_BEAT;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, Math.floor(duration * sampleRate), sampleRate);
    const data = buffer.getChannelData(0);

    parts.forEach((part, measureIdx) => {
      let cursor = measureIdx * beatsPerMeasure * SECONDS_PER_BEAT;
      part.melody.forEach((note) => {
        this.mixOscillator(data, sampleRate, cursor, note.beats * SECONDS_PER_BEAT, note.frequency, note.gain, note.wave);
        cursor += note.beats * SECONDS_PER_BEAT;
      });

      part.bass.forEach((freq, step) => {
        const start = measureIdx * beatsPerMeasure * SECONDS_PER_BEAT + step * 2 * SECONDS_PER_BEAT;
        this.mixOscillator(data, sampleRate, start, 2 * SECONDS_PER_BEAT, freq, 0.08, 'triangle');
        if (addNoise) this.mixNoise(data, sampleRate, start, 0.04, 0.03);
      });
    });

    return buffer;
  }

  private renderJingle(topLine: number[], bassLine: number[]): AudioBuffer {
    if (!this.context) throw new Error('AudioContext is not initialized.');
    const duration = topLine.length * SECONDS_PER_BEAT;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, Math.floor(duration * sampleRate), sampleRate);
    const data = buffer.getChannelData(0);

    topLine.forEach((freq, i) => {
      const start = i * SECONDS_PER_BEAT;
      this.mixOscillator(data, sampleRate, start, SECONDS_PER_BEAT * 0.95, freq, 0.16, 'square');
      this.mixOscillator(data, sampleRate, start, SECONDS_PER_BEAT * 0.95, bassLine[i] ?? bassLine[0], 0.09, 'triangle');
    });

    return buffer;
  }

  private mixOscillator(data: Float32Array, sampleRate: number, start: number, duration: number, frequency: number, gain: number, wave: OscillatorType): void {
    const startIndex = Math.floor(start * sampleRate);
    const totalSamples = Math.floor(duration * sampleRate);
    for (let i = 0; i < totalSamples; i += 1) {
      const sampleIndex = startIndex + i;
      if (sampleIndex >= data.length) break;
      const time = i / sampleRate;
      const phase = 2 * Math.PI * frequency * time;
      const env = 1 - i / totalSamples;
      const amp = gain * env;
      const sample = wave === 'triangle'
        ? (2 / Math.PI) * Math.asin(Math.sin(phase))
        : Math.sign(Math.sin(phase));
      data[sampleIndex] += sample * amp;
    }
  }

  private mixNoise(data: Float32Array, sampleRate: number, start: number, duration: number, gain: number): void {
    const startIndex = Math.floor(start * sampleRate);
    const totalSamples = Math.floor(duration * sampleRate);
    for (let i = 0; i < totalSamples; i += 1) {
      const sampleIndex = startIndex + i;
      if (sampleIndex >= data.length) break;
      const env = 1 - i / totalSamples;
      data[sampleIndex] += (Math.random() * 2 - 1) * gain * env;
    }
  }

  private readMutedState(): boolean {
    try { return localStorage.getItem(STORAGE_KEY_MUTED) === '1'; } catch { return false; }
  }

  private saveMutedState(muted: boolean): void {
    try { localStorage.setItem(STORAGE_KEY_MUTED, muted ? '1' : '0'); } catch { /* noop */ }
  }
}

export const AudioManager = new AudioManagerImpl();

// 将来、外部音源ファイルへ移行する場合:
// 1) PreloadScene で this.load.audio を使って public/assets/audio/*.ogg 等を読み込む
// 2) src/assets/assetKeys.ts / assetManifest.ts へ audio キーを追加
// 3) AudioManager の playTrack 実装を Phaser.Sound ベースへ差し替える
