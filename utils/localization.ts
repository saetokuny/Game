export type Language = 'en' | 'tr';
export type CardDeck = 'european' | 'japanese';

export const translations = {
  en: {
    // Navigation
    home: 'Oicho-Kabu',
    howToPlay: 'How to Play',
    statistics: 'Statistics',
    settings: 'Settings',
    
    // Home Screen
    playVsAI: 'Single Player',
    playVsFriend: 'Play vs Friend',
    comingSoon: 'Multiplayer coming soon',
    wins: 'Wins',
    losses: 'Losses',
    draws: 'Draws',
    
    // Card Deck Selection
    selectCardDeck: 'Select Card Deck',
    europeanCards: 'European Cards',
    japaneseCards: 'Japanese Cards',
    europeanCardsDesc: 'Standard international playing cards (Hearts, Diamonds, Clubs, Spades)',
    japaneseCardsDesc: 'Traditional Japanese hanafuda-inspired design',
    startGame: 'Start Game',
    
    // Language
    language: 'Language',
    english: 'English',
    turkish: 'Türkçe',
    
    // Game Screen
    round: 'Round',
    of: 'of',
    ai: 'AI',
    you: 'You',
    yourScore: 'Your Score',
    score: 'Score',
    draw: 'Draw',
    stand: 'Stand',
    pause: 'Pause',
    gamePaused: 'Game Paused',
    resume: 'Resume',
    quitGame: 'Quit Game',
    youWin: 'You Win!',
    aiWins: 'AI Wins',
    noPointsAward: 'No Points Awarded',
    nextRound: 'Next Round',
    playAgain: 'Play Again',
    mainMenu: 'Main Menu',
    finalScore: 'Final Score',
    youWinGame: 'You Win the Game!',
    aiWinsGame: 'AI Wins the Game',
    gameDrawn: 'Game is a Draw',
    remaining: 'Remaining',
    trump: 'Trump',
    exchange: 'Exchange with Trump',
    exchangeNineWithTrump: 'Exchange 9 with Trump',
    cardsPlayed: 'Cards Played',
    
    // 66 Game
    yourScore: 'Your Score',
    opponentScore: 'Opponent Score',
    
    // Rules Screen
    objective: 'Objective',
    cardValues: 'Card Values',
    calculatingHandValue: 'Calculating Hand Value',
    gameplay: 'Gameplay',
    specialHands: 'Special Hands',
    drawRules: 'Draw Rules',
    winningTheGame: 'Winning the Game',
    objectiveDesc: 'The objective is to have a hand with a value closest to 9. The player with the higher hand value wins the round.',
    cardValuesDesc: 'Cards 1-10 are used in this game. Each card is worth its face value.',
    handValueDesc: 'Add up all your card values. Only the last digit counts as your hand value.',
    example: 'Example:',
    handNames: 'Hand Names',
    handNamesNote: 'The name "Oicho-Kabu" comes from the hands 8 (Oicho) and 9 (Kabu).',
    stepDealt: 'Each player is dealt 2 cards face up.',
    stepTurn: 'On your turn, choose to Draw another card or Stand with your current hand.',
    stepAI: 'Once you Stand, the AI takes its turn.',
    stepWinner: 'The player with the hand value closest to 9 wins the round.',
    shippin: 'Shippin (4-1)',
    kuppin: 'Kuppin (9-1)',
    arashi: 'Arashi (Pair)',
    shippinDesc: 'A 4 and an Ace - beats normal hands',
    kuppinDesc: 'A 9 and an Ace - beats normal hands',
    arashiDesc: 'Any pair - the strongest hand type',
    drawDesc: 'When both players have the same hand value, the round is a draw. No points are awarded to either player.',
    winGameDesc: 'The game consists of 5 rounds. The player who wins the most rounds wins the game.',
    
    // Settings Screen
    profile: 'Profile',
    avatar: 'Avatar',
    displayName: 'Display Name',
    gameSettings: 'Game Settings',
    soundEffects: 'Sound Effects',
    vibration: 'Vibration',
    animationSpeed: 'Animation Speed',
    aiDifficulty: 'AI Difficulty',
    data: 'Data',
    resetStatistics: 'Reset Statistics',
    thisWillClear: 'This will clear all your win/loss records.',
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    enterYourName: 'Enter your name',
    
    // Statistics Screen
    winRate: 'Win Rate',
    noGamesYet: 'No Games Yet',
    playFirstGame: 'Play your first game to see your statistics here.',
    gamesPlayed: 'games played',
    
    // Common
    cancel: 'Cancel',
    reset: 'Reset',
    done: 'Done',
    close: 'Close',
  },
  
  tr: {
    // Navigation
    home: 'Oicho-Kabu',
    howToPlay: 'Nasıl Oynanır',
    statistics: 'İstatistikler',
    settings: 'Ayarlar',
    
    // Home Screen
    playVsAI: 'Tek Oyunculu',
    playVsFriend: 'Arkadaşa Karşı Oyna',
    comingSoon: 'Çoklu oyuncu yakında gelecek',
    wins: 'Kazanışlar',
    losses: 'Kayıplar',
    draws: 'Beraberlikler',
    
    // Card Deck Selection
    selectCardDeck: 'Kağıt Destesi Seç',
    europeanCards: 'Avrupa Kağıtları',
    japaneseCards: 'Japon Kağıtları',
    europeanCardsDesc: 'Standart uluslararası oyun kağıtları (Kalp, Karo, Sinek, Maça)',
    japaneseCardsDesc: 'Geleneksel Japon hanafuda-ilham alan tasarım',
    startGame: 'Oyuna Başla',
    
    // Language
    language: 'Dil',
    english: 'English',
    turkish: 'Türkçe',
    
    // Game Screen
    round: 'Tur',
    of: 'tanesi',
    ai: 'AI',
    you: 'Sen',
    yourScore: 'Senin Puanı',
    score: 'Puan',
    draw: 'Çek',
    stand: 'Dur',
    pause: 'Duraklat',
    gamePaused: 'Oyun Duraklatıldı',
    resume: 'Devam Et',
    quitGame: 'Oyundan Çık',
    youWin: 'Kazandın!',
    aiWins: 'AI Kazandı',
    noPointsAward: 'Puan Verilmedi',
    nextRound: 'Sonraki Tur',
    playAgain: 'Tekrar Oyna',
    mainMenu: 'Ana Menü',
    finalScore: 'Son Skor',
    youWinGame: 'Oyunu Kazandın!',
    aiWinsGame: 'AI Oyunu Kazandı',
    gameDrawn: 'Oyun Berabere',
    remaining: 'Kalan',
    trump: 'Koz',
    exchange: 'Kozla Değiştir',
    exchangeNineWithTrump: 'Dokuzu Kozla Değiştir',
    cardsPlayed: 'Oyunlanan Kartlar',
    
    // 66 Game
    yourScore: 'Senin Puanı',
    opponentScore: 'Rakip Puanı',
    
    // Rules Screen
    objective: 'Hedef',
    cardValues: 'Kağıt Değerleri',
    calculatingHandValue: 'El Değeri Hesaplama',
    gameplay: 'Oynanış',
    specialHands: 'Özel Eller',
    drawRules: 'Beraberlik Kuralları',
    winningTheGame: 'Oyunu Kazanma',
    objectiveDesc: 'Hedef, değeri 9\'a en yakın olan bir el oluşturmaktır. Daha yüksek el değerine sahip oyuncu turu kazanır.',
    cardValuesDesc: 'Bu oyunda 1-10 kağıtları kullanılır. Her kağıt yüz değerine eşittir.',
    handValueDesc: 'Tüm kağıt değerlerini toplayın. Sadece son rakam el değeri olarak sayılır.',
    example: 'Örnek:',
    handNames: 'El Adları',
    handNamesNote: '"Oicho-Kabu" adı 8 (Oicho) ve 9 (Kabu) ellerinden gelir.',
    stepDealt: 'Her oyuncuya 2 kağıt açık verilir.',
    stepTurn: 'Sıran geldiğinde, başka bir kağıt çekmek veya eldeki kağıtlarla durmak arasında seçim yap.',
    stepAI: 'Durduğunda, AI sırası gelir.',
    stepWinner: 'Değeri 9\'a en yakın olan oyuncu turu kazanır.',
    shippin: 'Shippin (4-1)',
    kuppin: 'Kuppin (9-1)',
    arashi: 'Arashi (Çift)',
    shippinDesc: 'Bir 4 ve bir As - normal elleri yener',
    kuppinDesc: 'Bir 9 ve bir As - normal elleri yener',
    arashiDesc: 'Herhangi bir çift - en güçlü el türü',
    drawDesc: 'Her iki oyuncunun da aynı el değeri olması durumunda, tur berabere biter. Hiçbir oyuncuya puan verilmez.',
    winGameDesc: 'Oyun 5 turdan oluşur. En fazla turu kazanan oyuncu oyunu kazanır.',
    
    // Settings Screen
    profile: 'Profil',
    avatar: 'Avatar',
    displayName: 'Görünen Ad',
    gameSettings: 'Oyun Ayarları',
    soundEffects: 'Ses Efektleri',
    vibration: 'Titreşim',
    animationSpeed: 'Animasyon Hızı',
    aiDifficulty: 'AI Zorluk Seviyesi',
    data: 'Veri',
    resetStatistics: 'İstatistikleri Sıfırla',
    thisWillClear: 'Bu, tüm kazanma/kayıp kayıtlarınızı silecektir.',
    slow: 'Yavaş',
    normal: 'Normal',
    fast: 'Hızlı',
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
    enterYourName: 'Adını gir',
    
    // Statistics Screen
    winRate: 'Kazanma Oranı',
    noGamesYet: 'Henüz Oyun Yok',
    playFirstGame: 'İstatistiklerini görmek için ilk oyununu oyna.',
    gamesPlayed: 'oyun oynadı',
    
    // Common
    cancel: 'İptal',
    reset: 'Sıfırla',
    done: 'Bitti',
    close: 'Kapat',
  },
};

export function t(key: keyof typeof translations.en, language: Language): string {
  return translations[language][key] || translations.en[key];
}
