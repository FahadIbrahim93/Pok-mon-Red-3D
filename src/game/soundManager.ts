import { useGameStore } from '../store/gameStore';

// Dynamic chiptune music frequencies dictionary
const NOTE_FREQS: Record<string, number> = {
  // Octave 3
  'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // Octave 4
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  // Octave 5
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  // Octave 6
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98
};

// Joyful 8-bit Overworld walking theme melody
const OVERWORLD_MELODY = [
  'C5', 'E5', 'G5', 'C6', 'B5', 'G5', 'A5', 'G5',
  'F5', 'A5', 'D6', 'B5', 'C6', 'G5', 'E5', 'G5',
  'C5', 'E5', 'G5', 'C6', 'B5', 'G5', 'A5', 'C6',
  'D6', 'B5', 'G5', 'B5', 'C6', 'C6', 'G5', 'E5'
];

// Fast-paced, tense 8-bit Battle theme melody
const BATTLE_MELODY = [
  'E4', 'E4', 'G4', 'E4', 'A4', 'E4', 'B4', 'E4',
  'C5', 'B4', 'A4', 'G4', 'F#4', 'E4', 'D#4', 'E4',
  'E4', 'E4', 'G4', 'E4', 'A4', 'E4', 'B4', 'E4',
  'D5', 'C5', 'B4', 'A4', 'G4', 'F#4', 'E4', 'B4'
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private currentBgmType: 'OVERWORLD' | 'BATTLE' | null = null;
  private bgmIndex = 0;
  private bgmIntervalId: any = null;
  private masterGain: GainNode | null = null;
  
  // Lazy init AudioContext on user interaction to obey browser security rules
  private ensureInit() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        
        // Sync master volume with state
        const state = useGameStore.getState();
        const soundEnabled = (state as any).soundEnabled ?? true;
        this.masterGain.gain.setValueAtTime(soundEnabled ? 0.35 : 0, this.ctx.currentTime);

        // Pre-build white noise buffer for grass rustle & battle hits
        const bufferLen = this.ctx.sampleRate * 1.5; // 1.5 seconds length
        this.noiseBuffer = this.ctx.createBuffer(1, bufferLen, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferLen; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    }
    
    // Resume context if suspended (common browser lock state)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Update volume gain node dynamically based on Zustand preferences
  public updateVolumeSettings() {
    this.ensureInit();
    if (!this.ctx || !this.masterGain) return;
    const state = useGameStore.getState();
    const soundEnabled = (state as any).soundEnabled ?? true;
    const bgmEnabled = (state as any).bgmEnabled ?? true;
    
    // Slowly ease master gain to prevent speaker pop artifacts
    const targetValue = soundEnabled ? 0.35 : 0;
    this.masterGain.gain.setTargetAtTime(targetValue, this.ctx.currentTime, 0.08);

    // If BGM was disabled, shut down sequencer, else make sure BGM matches current mode
    if (!soundEnabled || !bgmEnabled) {
      this.pauseSequencer();
    } else {
      this.syncBGMWithState();
    }
  }

  // Automatically start or switch BGMs to match overworld vs combat state
  public syncBGMWithState() {
    this.ensureInit();
    const state = useGameStore.getState();
    const bgmEnabled = (state as any).bgmEnabled ?? true;
    const soundEnabled = (state as any).soundEnabled ?? true;

    if (!bgmEnabled || !soundEnabled) {
      this.pauseSequencer();
      return;
    }

    if (state.mode === 'BATTLE') {
      this.startSequencer('BATTLE');
    } else {
      this.startSequencer('OVERWORLD');
    }
  }

  private startSequencer(bgmType: 'OVERWORLD' | 'BATTLE') {
    this.ensureInit();
    if (!this.ctx) return;

    // Avoid restarting BGM of the exact same type
    if (this.currentBgmType === bgmType && this.bgmIntervalId) {
      return;
    }

    this.pauseSequencer();
    this.currentBgmType = bgmType;
    this.bgmIndex = 0;

    const tempoMs = bgmType === 'BATTLE' ? 120 : 180; // Battle is faster
    
    // Scheduler runner loop built on precise ticks
    this.bgmIntervalId = setInterval(() => {
      this.playSequencerTick();
    }, tempoMs);
  }

  private pauseSequencer() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentBgmType = null;
  }

  private playSequencerTick() {
    if (!this.ctx || !this.masterGain) return;
    
    const state = useGameStore.getState();
    const soundEnabled = (state as any).soundEnabled ?? true;
    const bgmEnabled = (state as any).bgmEnabled ?? true;

    if (!soundEnabled || !bgmEnabled) {
      this.pauseSequencer();
      return;
    }

    const melody = this.currentBgmType === 'BATTLE' ? BATTLE_MELODY : OVERWORLD_MELODY;
    const noteName = melody[this.bgmIndex % melody.length];
    this.bgmIndex++;

    if (!noteName) return;
    const freq = NOTE_FREQS[noteName];
    if (!freq) return;

    try {
      // 8-bit tone generator (pulse/square is the authentic hardware sound!)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = this.currentBgmType === 'BATTLE' ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Extremely quick decay envelope for cute crisp staccato chiptune notes
      gain.gain.setValueAtTime(this.currentBgmType === 'BATTLE' ? 0.12 : 0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {
      // Gracefully handle browser sound block exceptions
    }
  }

  // Plays custom procedural sound effects instantaneously
  public playSFX(type: 'click' | 'bump' | 'rustle' | 'hit' | 'heal' | 'capture_shake' | 'capture_success' | 'capture_fail' | 'level_up') {
    this.ensureInit();
    if (!this.ctx || !this.masterGain) return;
    
    const state = useGameStore.getState();
    if (!((state as any).soundEnabled ?? true)) return;

    try {
      const now = this.ctx.currentTime;

      if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.1);
      } 
      
      else if (type === 'bump') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.12);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.14);
      } 
      
      else if (type === 'rustle') {
        // High-pass filtered noise to simulate foliage brushing
        if (!this.noiseBuffer) return;
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1800, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        source.start(now, Math.random() * 0.5, 0.15);
      } 
      
      else if (type === 'hit') {
        // High fidelity hybrid tackle hit effect
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.25);

        // Overlay a small gravel burst from white noise
        if (this.noiseBuffer) {
          const noiseSrc = this.ctx.createBufferSource();
          noiseSrc.buffer = this.noiseBuffer;
          
          const noiseFilter = this.ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(250, now);

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.15, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          noiseSrc.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.masterGain);
          noiseSrc.start(now, Math.random() * 0.4, 0.15);
        }
      } 
      
      else if (type === 'heal') {
        // Uplifting ascending magical chiptune sweep
        const chord = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];
        chord.forEach((note, index) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(NOTE_FREQS[note], now + index * 0.05);
          
          gain.gain.setValueAtTime(0, now + index * 0.05);
          gain.gain.linearRampToValueAtTime(0.08, now + index * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.15);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + index * 0.05);
          osc.stop(now + index * 0.05 + 0.2);
        });
      } 
      
      else if (type === 'capture_shake') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        // Modulate frequency to wobble
        osc.frequency.linearRampToValueAtTime(400, now + 0.07);
        osc.frequency.linearRampToValueAtTime(200, now + 0.14);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.18);
      } 
      
      else if (type === 'capture_success') {
        // Triumphant Pokeball lock click followed by happy ditty
        const releaseNotes = ['C5', 'F5', 'A5', 'C6'];
        this.playSequencerTick(); // sound click
        releaseNotes.forEach((note, index) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(NOTE_FREQS[note], now + 0.1 + index * 0.07);
          
          gain.gain.setValueAtTime(0, now + 0.1 + index * 0.07);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.1 + index * 0.07 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + index * 0.07 + 0.18);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + 0.1 + index * 0.07);
          osc.stop(now + 0.1 + index * 0.07 + 0.22);
        });
      } 
      
      else if (type === 'capture_fail') {
        // Deflating boowump frequency sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.22);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.26);
      } 
      
      else if (type === 'level_up') {
        // Grand level-up trumpet brass chiptune chord progression
        const notes = ['G4', 'B4', 'D5', 'G5', 'A5', 'B5', 'C6', 'D6', 'G6'];
        notes.forEach((note, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(NOTE_FREQS[note], now + i * 0.04);
          
          gain.gain.setValueAtTime(0, now + i * 0.04);
          gain.gain.linearRampToValueAtTime(0.08, now + i * 0.04 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.22);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.3);
        });
      }
    } catch (e) {
      // Safety block for browser audio limits
    }
  }
}

export const soundManager = new SoundEngine();
