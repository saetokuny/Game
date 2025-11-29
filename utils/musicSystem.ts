import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type MusicStyle = 'traditional' | 'modern' | 'ambient';
export type SoundEffect = 'cardPlay' | 'cardDraw' | 'cardWin' | 'cardLose' | 'triumph' | 'defeat';

class AudioSystem {
  private currentVolume = 0.5;
  private musicEnabled = true;
  private soundObjects: { [key: string]: Audio.Sound } = {};
  private initialized = false;
  private audioContext: AudioContext | null = null;

  async initialize() {
    if (this.initialized) return;
    
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } else {
        // Web: Initialize AudioContext
        if (typeof window !== 'undefined' && !this.audioContext) {
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
          }
        }
      }
      this.initialized = true;
    } catch (e) {
      console.log('Audio init skipped:', e);
    }
  }

  playBackgroundMusic(style: MusicStyle, volume: number = 0.5) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.musicEnabled = true;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async playSound(effect: SoundEffect, volume: number = 0.5) {
    const effectVolume = volume * this.currentVolume;
    if (effectVolume <= 0) return;
    
    switch (effect) {
      case 'cardPlay':
        await this.playCardPlaySound(effectVolume);
        break;
      case 'cardDraw':
        await this.playCardDrawSound(effectVolume);
        break;
      case 'cardWin':
        await this.playWinSound(effectVolume);
        break;
      case 'cardLose':
        await this.playLoseSound(effectVolume);
        break;
      case 'triumph':
        await this.playTriumphSound(effectVolume);
        break;
      case 'defeat':
        await this.playDefeatSound(effectVolume);
        break;
    }
  }

  private async playCardPlaySound(volume: number) {
    try {
      if (Platform.OS === 'web') {
        // Web: Play using Web Audio API
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        this.generateCardPlayTone(volume);
      } else {
        // Native: Use haptics
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {
      console.log('Card play sound error:', e);
    }
  }

  private async playCardDrawSound(volume: number) {
    try {
      if (Platform.OS === 'web') {
        // Web: Play using Web Audio API
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        this.generateCardDrawTone(volume);
      } else {
        // Native: Use haptics
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 100);
      }
    } catch (e) {
      console.log('Card draw sound error:', e);
    }
  }

  private async playWinSound(volume: number) {
    try {
      if (Platform.OS === 'web') {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        this.generateWinTone(volume);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.log('Win sound error:', e);
    }
  }

  private async playLoseSound(volume: number) {
    try {
      if (Platform.OS === 'web') {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        this.generateLoseTone(volume);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (e) {
      console.log('Lose sound error:', e);
    }
  }

  private async playTriumphSound(volume: number) {
    try {
      if (Platform.OS === 'web') {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        this.generateTriumphTone(volume);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      }
    } catch (e) {
      console.log('Triumph sound error:', e);
    }
  }

  private async playDefeatSound(volume: number) {
    try {
      if (Platform.OS === 'web') {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        this.generateDefeatTone(volume);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 200);
      }
    } catch (e) {
      console.log('Defeat sound error:', e);
    }
  }

  // Web Audio API tone generators
  private generateCardPlayTone(volume: number) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private generateCardDrawTone(volume: number) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // First note
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.frequency.value = 600;
    gain1.gain.setValueAtTime(volume * 0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc1.start(now);
    osc1.stop(now + 0.08);
    
    // Second note
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.frequency.value = 900;
    gain2.gain.setValueAtTime(volume * 0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.18);
  }

  private generateWinTone(volume: number) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const notes = [659, 784, 1047]; // E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume * 0.25, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.15);
    });
  }

  private generateLoseTone(volume: number) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const notes = [392, 330, 262]; // G4, E4, C4
    
    notes.forEach((freq, idx) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume * 0.25, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.15);
    });
  }

  private generateTriumphTone(volume: number) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume * 0.3, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.2);
      
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.2);
    });
  }

  private generateDefeatTone(volume: number) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
  }

  async stop() {
    try {
      for (const key in this.soundObjects) {
        await this.soundObjects[key].stopAsync();
      }
    } catch (e) {
      console.log('Stop error:', e);
    }
  }

  async cleanup() {
    await this.stop();
    this.soundObjects = {};
  }
}

export const audioSystem = new AudioSystem();
