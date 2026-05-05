// Audio engine using Web Audio API.
// To add real audio, place .mp3/.ogg files in client/src/assets/audio/
// and uncomment the loadAudio() calls below.
//
// Supported tracks (BGM):
//   'menu' | 'exploration' | 'combat' | 'boss' | 'dialogue'
//
// Supported SFX:
//   'attack' | 'hit' | 'weakness' | 'death' | 'victory' | 'guard' | 'heal' | 'skill'

export type BGMTrack = 'menu' | 'exploration' | 'combat' | 'boss' | 'dialogue';
export type SFXSound = 'attack' | 'hit' | 'weakness' | 'death' | 'victory' | 'guard' | 'heal' | 'skill';

type SoundMap = Record<BGMTrack | SFXSound, string>;

const ASSET_BASE = '/attached_assets/audio/';

const TRACKS: SoundMap = {
  menu: 'menu.mp3',
  exploration: 'exploration.mp3',
  combat: 'combat.mp3',
  boss: 'boss.mp3',
  dialogue: 'dialogue.mp3',
  attack: 'sfx_attack.mp3',
  hit: 'sfx_hit.mp3',
  weakness: 'sfx_weakness.mp3',
  death: 'sfx_death.mp3',
  victory: 'sfx_victory.mp3',
  guard: 'sfx_guard.mp3',
  heal: 'sfx_heal.mp3',
  skill: 'sfx_skill.mp3',
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentBGM: AudioBufferSourceNode | null = null;
  private currentBGMGain: GainNode | null = null;
  private muted = false;
  private volume = 0.8;
  private loadedBuffers: Map<string, AudioBuffer> = new Map();
  private initPromise: Promise<void> | null = null;

  private async init() {
    if (this.ctx) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);

      // Pre-load all sound buffers
      await Promise.allSettled(
        Object.values(TRACKS).map((file) => this.loadBuffer(`${ASSET_BASE}${file}`))
      );
    })();

    return this.initPromise;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch {
      // File not found or decode error — expected until assets are added
      return null;
    }
  }

  private getBuffer(key: BGMTrack | SFXSound): AudioBuffer | null {
    const url = `${ASSET_BASE}${TRACKS[key]}`;
    return this.loadedBuffers.get(url) ?? null;
  }

  private ensureContext() {
    if (!this.ctx || !this.masterGain) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  async playBGM(track: BGMTrack) {
    await this.init();
    if (!this.ensureContext()) return;

    const buffer = this.getBuffer(track);
    if (!buffer) {
      console.log(`[Audio] BGM "${track}" — no audio file loaded yet (add ${ASSET_BASE}${TRACKS[track]})`);
      return;
    }

    // Crossfade to new track
    const now = this.ctx!.currentTime;
    const newGain = this.ctx!.createGain();
    const oldGain = this.currentBGMGain;
    newGain.gain.setValueAtTime(0, now);
    newGain.gain.linearRampToValueAtTime(this.muted ? 0 : this.volume, now + 2);
    newGain.connect(this.masterGain!);

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(newGain);
    source.start(now);

    if (oldGain) {
      oldGain.gain.linearRampToValueAtTime(0, now + 2);
      // eslint-disable-next-line no-inner-declarations
      function stopAfterFade(src: AudioBufferSourceNode) {
        src.stop(now + 2.5);
      }
      stopAfterFade(this.currentBGM!);
    }

    this.currentBGM = source;
    this.currentBGMGain = newGain;
  }

  async playSFX(sound: SFXSound) {
    await this.init();
    if (!this.ensureContext()) return;

    const buffer = this.getBuffer(sound);
    if (!buffer) {
      console.log(`[Audio] SFX "${sound}" — no audio file loaded yet (add ${ASSET_BASE}${TRACKS[sound]})`);
      return;
    }

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx!.createGain();
    gainNode.gain.value = this.muted ? 0 : this.volume;

    source.connect(gainNode);
    gainNode.connect(this.masterGain!);
    source.start(this.ctx!.currentTime);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx!.currentTime);
    }
  }

  mute(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx!.currentTime);
    }
  }

  isMuted() {
    return this.muted;
  }

  getVolume() {
    return this.volume;
  }
}

// Singleton instance
let engine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engine) {
    engine = new AudioEngine();
  }
  return engine;
}
