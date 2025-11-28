// Mariagespiel / Sixty-Six / Altmışaltı Card Game
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card66 {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Player66 {
  name: string;
  hand: Card66[];
  tricksWon: Card66[][];
  score: number;
  gamePoints: number;
}

export interface Game66State {
  player: Player66;
  opponent: Player66;
  deck: Card66[];
  trump: Card66 | null;
  currentTrick: { player: Card66 | null; opponent: Card66 | null };
  trickWinner: 'player' | 'opponent' | null;
  phase: 'dealing' | 'playing' | 'gameEnd';
  gamePhase: 'playerTurn' | 'opponentTurn' | 'trickResult' | 'roundEnd' | 'gameEnd';
  roundNumber: number;
  stockClosed: boolean;
  lastTrickWinner: 'player' | 'opponent' | null;
  gameStartsWith: 'player' | 'opponent';
  playerMarriageBonus: number;
  opponentMarriageBonus: number;
}

// Card values for points
export const CARD_VALUES: Record<Rank, number> = {
  'A': 11,
  '10': 10,
  'K': 4,
  'Q': 3,
  'J': 2,
  '9': 0,
};

const RANKS: Rank[] = ['A', '10', 'K', 'Q', 'J', '9'];
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

// Rank order for trick winning (high to low)
const RANK_ORDER: Record<Rank, number> = {
  'A': 6,
  '10': 5,
  'K': 4,
  'Q': 3,
  'J': 2,
  '9': 1,
};

export function createDeck66(): Card66[] {
  const deck: Card66[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return shuffleDeck66(deck);
}

export function shuffleDeck66(deck: Card66[]): Card66[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards66(deck: Card66[], count: number): { cards: Card66[]; remainingDeck: Card66[] } {
  const cards = deck.slice(0, count).map(card => ({ ...card, faceUp: true }));
  const remainingDeck = deck.slice(count);
  return { cards, remainingDeck };
}

export function drawCard66(deck: Card66[]): { card: Card66 | null; remainingDeck: Card66[] } {
  if (deck.length === 0) return { card: null, remainingDeck: deck };
  const card = { ...deck[0], faceUp: true };
  return { card, remainingDeck: deck.slice(1) };
}

export function calculateTrickPoints(trick: Card66[]): number {
  return trick.reduce((sum, card) => sum + CARD_VALUES[card.rank], 0);
}

export function determineTrickWinner(ledCard: Card66, responseCard: Card66, trump: Card66 | null, playerLed: boolean): 'player' | 'opponent' {
  // If same suit, highest rank wins
  if (ledCard.suit === responseCard.suit) {
    return RANK_ORDER[ledCard.rank] > RANK_ORDER[responseCard.rank] ? (playerLed ? 'player' : 'opponent') : (playerLed ? 'opponent' : 'player');
  }
  
  // If one is trump, trump wins
  if (trump) {
    if (ledCard.suit === trump.suit) return playerLed ? 'player' : 'opponent';
    if (responseCard.suit === trump.suit) return playerLed ? 'opponent' : 'player';
  }
  
  // Otherwise, led card suit wins (who led wins)
  return playerLed ? 'player' : 'opponent';
}

export function canPlayCard(card: Card66, hand: Card66[], ledCard: Card66 | null, trump: Card66 | null, deckEmpty: boolean = false): boolean {
  // If no card led yet (first trick), can play any card
  if (!ledCard) return true;
  
  // If deck is empty, must play trump if you have it
  if (deckEmpty && trump) {
    const hasTrump = hand.some(c => c.suit === trump.suit);
    if (hasTrump && card.suit !== trump.suit) return false;
  }
  
  // Must follow suit if possible
  const canFollowSuit = hand.some(c => c.suit === ledCard.suit);
  if (canFollowSuit) {
    return card.suit === ledCard.suit;
  }
  
  // If can't follow suit, can play any card (including trump)
  return true;
}

export function aiChooseCard66(hand: Card66[], ledCard: Card66 | null, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Card66 {
  const validCards = hand.filter(card => canPlayCard(card, hand, ledCard, null));
  
  if (validCards.length === 0) {
    return hand[0];
  }
  
  if (difficulty === 'easy') {
    // Random valid card
    return validCards[Math.floor(Math.random() * validCards.length)];
  }
  
  if (difficulty === 'medium') {
    // Try to win if possible, otherwise play low card
    if (ledCard) {
      const winningCards = validCards.filter(card => 
        RANK_ORDER[card.rank] > RANK_ORDER[ledCard.rank]
      );
      if (winningCards.length > 0) {
        // Play lowest winning card
        return winningCards.reduce((min, card) => 
          RANK_ORDER[card.rank] < RANK_ORDER[min.rank] ? card : min
        );
      }
    }
    // Play lowest card
    return validCards.reduce((min, card) => 
      RANK_ORDER[card.rank] < RANK_ORDER[min.rank] ? card : min
    );
  }
  
  // Hard: Strategic play
  if (ledCard) {
    const winningCards = validCards.filter(card => 
      RANK_ORDER[card.rank] > RANK_ORDER[ledCard.rank]
    );
    if (winningCards.length > 0) {
      return winningCards.reduce((min, card) => 
        RANK_ORDER[card.rank] < RANK_ORDER[min.rank] ? card : min
      );
    }
  }
  
  // Play lowest card
  return validCards.reduce((min, card) => 
    RANK_ORDER[card.rank] < RANK_ORDER[min.rank] ? card : min
  );
}

export function initializeGame66(): Game66State {
  const deck = createDeck66();
  const { cards: playerCards, remainingDeck: deck1 } = dealCards66(deck, 6);
  const { cards: opponentCards, remainingDeck: deck2 } = dealCards66(deck1, 6);
  const trump = deck2.length > 0 ? { ...deck2[0], faceUp: true } : null;
  const remainingDeck = trump ? deck2.slice(1) : deck2;
  const startsWithPlayer = Math.random() > 0.5;
  
  return {
    player: {
      name: 'Player',
      hand: playerCards,
      tricksWon: [],
      score: 0,
      gamePoints: 0,
    },
    opponent: {
      name: 'AI',
      hand: opponentCards.map(c => ({ ...c, faceUp: false })),
      tricksWon: [],
      score: 0,
      gamePoints: 0,
    },
    deck: remainingDeck,
    trump,
    currentTrick: { player: null, opponent: null },
    trickWinner: null,
    phase: 'playing',
    gamePhase: startsWithPlayer ? 'playerTurn' : 'opponentTurn',
    roundNumber: 1,
    stockClosed: false,
    lastTrickWinner: null,
    gameStartsWith: startsWithPlayer ? 'player' : 'opponent',
    playerMarriageBonus: 0,
    opponentMarriageBonus: 0,
  };
}

export function calculateMarriageBonus(hand: Card66[], playedCard: Card66, trump: Card66 | null): number {
  if (!trump) return 0;
  
  const suitCards = hand.filter(c => c.suit === playedCard.suit);
  const hasQAndK = suitCards.some(c => c.rank === 'Q') && suitCards.some(c => c.rank === 'K');
  
  if (!hasQAndK) return 0;
  
  const playedQOrK = playedCard.rank === 'Q' || playedCard.rank === 'K';
  if (!playedQOrK) return 0;
  
  if (playedCard.suit === trump.suit) return 40; // Royal marriage
  return 20; // Common marriage
}

export function canExchangeTrumpWithNine(hand: Card66[], trump: Card66 | null, trickNumber: number): Card66 | null {
  if (!trump || trickNumber === 1) return null;
  
  const nineCard = hand.find(c => c.rank === '9' && c.suit === trump.suit);
  return nineCard || null;
}

export function getCardName(rank: Rank): string {
  const names: Record<Rank, string> = {
    'A': 'Ace',
    '10': '10',
    'K': 'King',
    'Q': 'Queen',
    'J': 'Jack',
    '9': '9',
  };
  return names[rank];
}
