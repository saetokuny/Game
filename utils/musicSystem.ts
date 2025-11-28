import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type MusicStyle = 'traditional' | 'modern' | 'ambient';
export type SoundEffect = 'cardPlay' | 'cardDraw' | 'cardWin' | 'cardLose';

class AudioSystem {
  private currentVolume = 0.5;
  private musicEnabled = true;

  async initialize() {
    // Audio setup if needed
  }

  playBackgroundMusic(style: MusicStyle, volume: number = 0.5) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.musicEnabled = true;
    
    // Play haptic feedback for music start
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  playSound(effect: SoundEffect, volume: number = 0.5) {
    if (Platform.OS === 'web') return;
    
    const effectVolume = volume * this.currentVolume;
    
    switch (effect) {
      case 'cardPlay':
        this.playCardPlaySound(effectVolume);
        break;
      case 'cardDraw':
        this.playCardDrawSound(effectVolume);
        break;
      case 'cardWin':
        this.playWinSound(effectVolume);
        break;
      case 'cardLose':
        this.playLoseSound(effectVolume);
        break;
    }
  }

  private playCardPlaySound(volume: number) {
    // Card play: quick, bright sound
    if (volume > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  private playCardDrawSound(volume: number) {
    // Card draw: softer, lower sound
    if (volume > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 100);
    }
  }

  private playWinSound(volume: number) {
    // Win: sequence of haptics
    if (volume > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  private playLoseSound(volume: number) {
    // Lose: warning haptic
    if (volume > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
  }

  stop() {
    // Stop any playing audio
  }

  cleanup() {
    // Cleanup resources
  }
}

export const audioSystem = new AudioSystem();
