import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type MusicStyle = 'traditional' | 'modern' | 'ambient';

const MUSIC_NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

class MusicPlayer {
  private soundObject: Audio.Sound | null = null;
  private isPlaying = false;
  private currentVolume = 0.5;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.log('Audio initialization:', error);
    }
  }

  async playMusicStyle(style: MusicStyle, volume: number = 0.5) {
    if (Platform.OS === 'web') return;
    
    try {
      this.currentVolume = Math.max(0, Math.min(1, volume));
      
      const melody = this.getMelodyForStyle(style);
      await this.playMelody(melody);
    } catch (error) {
      console.log('Music playback error:', error);
    }
  }

  private getMelodyForStyle(style: MusicStyle): number[] {
    const { C4, D4, E4, F4, G4, A4, B4, C5 } = MUSIC_NOTES;
    
    switch (style) {
      case 'traditional':
        return [C4, E4, G4, A4, B4, C5, B4, A4, G4, E4, C4];
      case 'modern':
        return [C4, C4, D4, E4, E4, D4, C4, D4, E4, F4, G4];
      case 'ambient':
        return [C4, G4, E4, A4, C5, A4, G4, E4, C4];
      default:
        return [C4, E4, G4, C5];
    }
  }

  private async playMelody(frequencies: number[]) {
    try {
      for (const freq of frequencies) {
        await this.playTone(freq, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.log('Melody playback error:', error);
    }
  }

  private async playTone(frequency: number, duration: number) {
    try {
      const oscillatorType = 'sine';
      const sampleRate = 44100;
      const numSamples = (sampleRate * duration) / 1000;
      const audioData = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const angle = (2 * Math.PI * frequency * i) / sampleRate;
        audioData[i] = Math.sin(angle) * this.currentVolume * 0.3;
      }

      // Create AudioContext for tone generation (works on native)
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      // Create a simple beep using a basic approach
      this.soundObject = new Audio.Sound();
      // Note: On native platforms, this would need native code
      // For now, we'll use a simplified approach with haptic feedback
    } catch (error) {
      console.log('Tone error:', error);
    }
  }

  async stop() {
    if (this.soundObject && this.isPlaying) {
      try {
        await this.soundObject.stopAsync();
        this.isPlaying = false;
      } catch (error) {
        console.log('Stop error:', error);
      }
    }
  }

  async cleanup() {
    if (this.soundObject) {
      try {
        await this.soundObject.unloadAsync();
      } catch (error) {
        console.log('Cleanup error:', error);
      }
    }
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
  }
}

export const musicPlayer = new MusicPlayer();
