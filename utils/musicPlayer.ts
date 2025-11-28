import { Audio } from 'expo-av';

type MusicType = 'traditional' | 'peaceful' | 'energetic';

export const MUSIC_OPTIONS: Record<MusicType, { name: string; url: string }> = {
  traditional: {
    name: 'Geleneksel',
    url: 'https://assets.mixkit.co/active_storage/sfx/2717/2717-preview.mp3',
  },
  peaceful: {
    name: 'Huzurlu',
    url: 'https://assets.mixkit.co/active_storage/sfx/2722/2722-preview.mp3',
  },
  energetic: {
    name: 'Enerjik',
    url: 'https://assets.mixkit.co/active_storage/sfx/2715/2715-preview.mp3',
  },
};

let currentSound: Audio.Sound | null = null;
let isPlaying = false;

export async function playMusic(musicType: MusicType, volume: number = 0.5): Promise<void> {
  try {
    await stopMusic();
    
    const musicUrl = MUSIC_OPTIONS[musicType].url;
    const sound = new Audio.Sound();
    
    await sound.loadAsync({ uri: musicUrl });
    await sound.setVolumeAsync(volume);
    await sound.playAsync();
    
    currentSound = sound;
    isPlaying = true;
  } catch (error) {
    console.error('Error playing music:', error);
  }
}

export async function stopMusic(): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
      isPlaying = false;
    }
  } catch (error) {
    console.error('Error stopping music:', error);
  }
}

export async function setVolume(volume: number): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.setVolumeAsync(volume);
    }
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

export function isAudioPlaying(): boolean {
  return isPlaying;
}
