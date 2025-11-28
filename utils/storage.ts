import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PLAYER_PROFILE: '@oicho_kabu_profile',
  GAME_STATS: '@oicho_kabu_stats',
  SETTINGS: '@oicho_kabu_settings',
  LANGUAGE: '@oicho_kabu_language',
  CARD_DECK: '@oicho_kabu_card_deck',
};

export interface PlayerProfile {
  displayName: string;
  avatarIndex: number;
}

export interface GameStats {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  gamesPlayed: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  aiDifficulty: 'easy' | 'medium' | 'hard';
  musicEnabled: boolean;
  musicVolume: number;
  selectedMusic: 'traditional' | 'peaceful' | 'energetic';
}

const DEFAULT_PROFILE: PlayerProfile = {
  displayName: 'Player',
  avatarIndex: 0,
};

const DEFAULT_STATS: GameStats = {
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  gamesPlayed: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  animationSpeed: 'normal',
  aiDifficulty: 'medium',
  musicEnabled: true,
  musicVolume: 0.5,
  selectedMusic: 'traditional',
};

export async function getPlayerProfile(): Promise<PlayerProfile> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch (error) {
    console.error('Error reading player profile:', error);
    return DEFAULT_PROFILE;
  }
}

export async function savePlayerProfile(profile: PlayerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving player profile:', error);
  }
}

export async function getGameStats(): Promise<GameStats> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATS);
    return data ? JSON.parse(data) : DEFAULT_STATS;
  } catch (error) {
    console.error('Error reading game stats:', error);
    return DEFAULT_STATS;
  }
}

export async function saveGameStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving game stats:', error);
  }
}

export async function updateGameStats(result: 'win' | 'loss' | 'draw'): Promise<GameStats> {
  const stats = await getGameStats();
  
  stats.gamesPlayed += 1;
  if (result === 'win') {
    stats.totalWins += 1;
  } else if (result === 'loss') {
    stats.totalLosses += 1;
  } else {
    stats.totalDraws += 1;
  }
  
  await saveGameStats(stats);
  return stats;
}

export async function resetGameStats(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(DEFAULT_STATS));
  } catch (error) {
    console.error('Error resetting game stats:', error);
  }
}

export async function getSettings(): Promise<GameSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PLAYER_PROFILE,
      STORAGE_KEYS.GAME_STATS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.LANGUAGE,
      STORAGE_KEYS.CARD_DECK,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

export async function getLanguage(): Promise<'en' | 'tr'> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (data as 'en' | 'tr') || 'en';
  } catch (error) {
    console.error('Error reading language:', error);
    return 'en';
  }
}

export async function saveLanguage(language: 'en' | 'tr'): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
}

export async function getCardDeck(): Promise<'european' | 'japanese'> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CARD_DECK);
    return (data as 'european' | 'japanese') || 'european';
  } catch (error) {
    console.error('Error reading card deck:', error);
    return 'european';
  }
}

export async function saveCardDeck(deck: 'european' | 'japanese'): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CARD_DECK, deck);
  } catch (error) {
    console.error('Error saving card deck:', error);
  }
}

export async function saveGameType(gameType: 'oicho-kabu' | '66'): Promise<void> {
  try {
    await AsyncStorage.setItem('GAME_TYPE', gameType);
  } catch (error) {
    console.error('Error saving game type:', error);
  }
}
