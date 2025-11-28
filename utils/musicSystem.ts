import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type MusicStyle = 'traditional' | 'modern' | 'ambient';
export type SoundEffect = 'cardPlay' | 'cardDraw' | 'cardWin' | 'cardLose';

class AudioSystem {
  private currentVolume = 0.5;
  private musicEnabled = true;
  private soundObjects: { [key: string]: Audio.Sound } = {};
  private initialized = false;

  async initialize() {
    if (this.initialized || Platform.OS === 'web') return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      this.initialized = true;
    } catch (e) {
      console.log('Audio init skipped');
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
    if (Platform.OS === 'web') return;
    
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
    }
  }

  private async playCardPlaySound(volume: number) {
    try {
      if (volume > 0) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {
      // Fallback to haptics works
    }
  }

  private async playCardDrawSound(volume: number) {
    try {
      if (volume > 0) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 100);
      }
    } catch (e) {
      // Fallback
    }
  }

  private async playWinSound(volume: number) {
    try {
      if (volume > 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      // Fallback
    }
  }

  private async playLoseSound(volume: number) {
    try {
      if (volume > 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (e) {
      // Fallback
    }
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
      // Cleanup
    }
  }

  async cleanup() {
    await this.stop();
    this.soundObjects = {};
  }
}

export const audioSystem = new AudioSystem();
