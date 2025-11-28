export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface PlayingCard {
  suit: Suit;
  value: number;
  faceUp: boolean;
}

export interface Player {
  name: string;
  cards: PlayingCard[];
  score: number;
  isDealer: boolean;
  hasFolded: boolean;
  hasStood: boolean;
}

export interface GameState {
  deck: PlayingCard[];
  player: Player;
  opponent: Player;
  currentRound: number;
  maxRounds: number;
  gamePhase: 'betting' | 'dealing' | 'playerTurn' | 'opponentTurn' | 'showdown' | 'roundEnd' | 'gameEnd';
  playerTotalWins: number;
  opponentTotalWins: number;
  draws: number;
  gameType: 'oicho-kabu' | '66';
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 10; value++) {
      deck.push({ suit, value, faceUp: false });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateHandValue(cards: PlayingCard[]): number {
  // Oicho-Kabu: max 3 cards per hand
  if (cards.length > 3) {
    return NaN; // Invalid hand
  }
  const sum = cards.reduce((acc, card) => acc + card.value, 0);
  return sum % 10;
}

export function calculateHandValue66(cards: PlayingCard[]): number {
  const sum = cards.reduce((acc, card) => acc + card.value, 0);
  return sum;
}

export function getHandName(value: number): string {
  const names: Record<number, string> = {
    0: 'Buta (0)',
    1: 'Pin (1)',
    2: 'Nizou (2)',
    3: 'Santa (3)',
    4: 'Yotsuya (4)',
    5: 'Goke (5)',
    6: 'Roppou (6)',
    7: 'Naki (7)',
    8: 'Oicho (8)',
    9: 'Kabu (9)',
  };
  return names[value] || String(value);
}

export function isSpecialHand(cards: PlayingCard[]): { isSpecial: boolean; name: string; multiplier: number } {
  if (cards.length !== 2) {
    return { isSpecial: false, name: '', multiplier: 1 };
  }

  const [card1, card2] = cards;
  const sum = card1.value + card2.value;

  if (card1.value === 4 && card2.value === 1 || card1.value === 1 && card2.value === 4) {
    return { isSpecial: true, name: 'Shippin (4-1)', multiplier: 2 };
  }

  if (card1.value === 9 && card2.value === 1 || card1.value === 1 && card2.value === 9) {
    return { isSpecial: true, name: 'Kuppin (9-1)', multiplier: 2 };
  }

  if (card1.value === card2.value) {
    return { isSpecial: true, name: `Arashi (${card1.value}-${card2.value})`, multiplier: 3 };
  }

  return { isSpecial: false, name: '', multiplier: 1 };
}

export function determineWinner(playerCards: PlayingCard[], opponentCards: PlayingCard[]): 'player' | 'opponent' | 'draw' {
  const playerValue = calculateHandValue(playerCards);
  const opponentValue = calculateHandValue(opponentCards);

  const playerSpecial = isSpecialHand(playerCards);
  const opponentSpecial = isSpecialHand(opponentCards);

  if (playerSpecial.isSpecial && !opponentSpecial.isSpecial) {
    return 'player';
  }
  if (opponentSpecial.isSpecial && !playerSpecial.isSpecial) {
    return 'opponent';
  }

  if (playerSpecial.isSpecial && opponentSpecial.isSpecial) {
    if (playerSpecial.multiplier > opponentSpecial.multiplier) return 'player';
    if (opponentSpecial.multiplier > playerSpecial.multiplier) return 'opponent';
    if (playerValue > opponentValue) return 'player';
    if (opponentValue > playerValue) return 'opponent';
    return 'draw';
  }

  if (playerValue > opponentValue) return 'player';
  if (opponentValue > playerValue) return 'opponent';
  return 'draw';
}

export function determineWinner66(playerCards: PlayingCard[], opponentCards: PlayingCard[]): 'player' | 'opponent' | 'draw' {
  const playerValue = calculateHandValue66(playerCards);
  const opponentValue = calculateHandValue66(opponentCards);

  // En yakın değer 66'ya kazanır, ama 66'yı geçmemiş olması lazım
  const playerOver = playerValue > 66;
  const opponentOver = opponentValue > 66;

  if (!playerOver && !opponentOver) {
    if (playerValue > opponentValue) return 'player';
    if (opponentValue > playerValue) return 'opponent';
    return 'draw';
  }

  if (!playerOver && opponentOver) return 'player';
  if (!opponentOver && playerOver) return 'opponent';
  
  // Her ikisi de 66'yı geçerse en az geçen kazanır
  if (playerValue < opponentValue) return 'player';
  if (opponentValue < playerValue) return 'opponent';
  return 'draw';
}

export function dealCards(deck: PlayingCard[], count: number): { cards: PlayingCard[]; remainingDeck: PlayingCard[] } {
  const cards = deck.slice(0, count).map(card => ({ ...card, faceUp: true }));
  const remainingDeck = deck.slice(count);
  return { cards, remainingDeck };
}

export function drawCard(deck: PlayingCard[]): { card: PlayingCard | null; remainingDeck: PlayingCard[] } {
  if (deck.length === 0) {
    return { card: null, remainingDeck: deck };
  }
  const card = { ...deck[0], faceUp: true };
  const remainingDeck = deck.slice(1);
  return { card, remainingDeck };
}

export function aiDecision(cards: PlayingCard[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): 'draw' | 'stand' {
  const currentValue = calculateHandValue(cards);
  
  const thresholds = {
    easy: 4,
    medium: 5,
    hard: 6,
  };

  const threshold = thresholds[difficulty];

  if (currentValue >= threshold) {
    return 'stand';
  }

  const randomFactor = Math.random();
  if (difficulty === 'easy' && randomFactor < 0.3) {
    return 'stand';
  }
  if (difficulty === 'hard' && randomFactor < 0.1) {
    return 'draw';
  }

  return 'draw';
}

export function aiDecision66(cards: PlayingCard[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): 'draw' | 'stand' {
  const currentValue = calculateHandValue66(cards);
  
  const thresholds = {
    easy: 50,
    medium: 55,
    hard: 60,
  };

  const threshold = thresholds[difficulty];

  if (currentValue >= threshold) {
    return 'stand';
  }

  const randomFactor = Math.random();
  if (difficulty === 'easy' && randomFactor < 0.3) {
    return 'stand';
  }
  if (difficulty === 'hard' && randomFactor < 0.1) {
    return 'draw';
  }

  return 'draw';
}

export function initializeGame(playerName: string = 'Player', gameType: 'oicho-kabu' | '66' = 'oicho-kabu'): GameState {
  const deck = createDeck();
  
  return {
    deck,
    gameType,
    player: {
      name: playerName,
      cards: [],
      score: 0,
      isDealer: false,
      hasFolded: false,
      hasStood: false,
    },
    opponent: {
      name: 'AI',
      cards: [],
      score: 0,
      isDealer: true,
      hasFolded: false,
      hasStood: false,
    },
    currentRound: 1,
    maxRounds: 5,
    gamePhase: 'dealing',
    playerTotalWins: 0,
    opponentTotalWins: 0,
    draws: 0,
  };
}

export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: 'H',
    diamonds: 'D',
    clubs: 'C',
    spades: 'S',
  };
  return symbols[suit];
}

export function getSuitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? '#C7243A' : '#1A1A1A';
}
