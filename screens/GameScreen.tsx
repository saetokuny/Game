import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, View, Modal, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PlayingCardComponent } from "@/components/PlayingCard";
import { GameButton } from "@/components/GameButton";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import {
  GameState,
  initializeGame,
  createDeck,
  dealCards,
  drawCard,
  calculateHandValue,
  determineWinner,
  aiDecision,
  PlayingCard,
} from "@/utils/gameLogic";
import {
  Game66State,
  Card66,
  initializeGame66,
  aiChooseCard66,
  determineTrickWinner,
  calculateTrickPoints,
  canPlayCard,
  drawCard66,
  calculateMarriageBonus,
  canExchangeTrumpWithNine,
} from "@/utils/gameLogic66";
import { updateGameStats, getSettings, GameSettings } from "@/utils/storage";
import { t, Language } from "@/utils/localization";

interface GameScreenProps {
  navigation: any;
  language?: Language;
  route?: any;
}

type RoundResult = "player" | "opponent" | "draw" | null;

export default function GameScreen({ navigation, language = "en", route }: GameScreenProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const gameType = route?.params?.gameType || 'oicho-kabu';
  const [gameState, setGameState] = useState<GameState>(() => initializeGame('Player', gameType as 'oicho-kabu' | '66'));
  const [gameState66, setGameState66] = useState<Game66State | null>(gameType === '66' ? initializeGame66() : null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (gameState.gamePhase === "dealing") {
      startNewRound();
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Round ${gameState.currentRound}`,
    });
  }, [gameState.currentRound, navigation]);

  useEffect(() => {
    if (gameType === '66' && gameState66?.gamePhase === "opponentTurn" && !isProcessing) {
      runAITurn();
    } else if (gameType !== '66' && gameState.gamePhase === "opponentTurn" && !isProcessing) {
      runAITurn();
    }
  }, [gameState.gamePhase, gameState66?.gamePhase, isProcessing]);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  const triggerHaptic = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (settings?.vibrationEnabled && Platform.OS !== "web") {
      await Haptics.impactAsync(style);
    }
  };

  const startNewRound = () => {
    const deck = createDeck();
    const { cards: playerCards, remainingDeck: deck1 } = dealCards(deck, 2);
    const { cards: opponentCards, remainingDeck: finalDeck } = dealCards(deck1, 2);

    const opponentCardsHidden = opponentCards.map((c) => ({ ...c, faceUp: false }));

    setGameState((prev) => ({
      ...prev,
      deck: finalDeck,
      player: {
        ...prev.player,
        cards: playerCards,
        hasFolded: false,
        hasStood: false,
      },
      opponent: {
        ...prev.opponent,
        cards: opponentCardsHidden,
        hasFolded: false,
        hasStood: false,
      },
      gamePhase: "playerTurn",
    }));

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDraw = async () => {
    if (gameType === '66') {
      // 66 game: Play card (handled in playCard)
      return;
    }
    
    if (gameState.gamePhase !== "playerTurn" || isProcessing) return;

    setIsProcessing(true);
    await triggerHaptic();

    const { card, remainingDeck } = drawCard(gameState.deck);
    if (!card) {
      setIsProcessing(false);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      deck: remainingDeck,
      player: {
        ...prev.player,
        cards: [...prev.player.cards, card],
      },
    }));

    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  const exchangeNineWithTrump = async () => {
    if (!gameState66 || isProcessing || !gameState66.trump) return;
    setIsProcessing(true);
    await triggerHaptic();

    const nineIndex = gameState66.player.hand.findIndex(c => c.rank === '9' && c.suit === gameState66.trump!.suit);
    if (nineIndex === -1) {
      setIsProcessing(false);
      return;
    }

    const newHand = [...gameState66.player.hand];
    newHand.splice(nineIndex, 1);

    setGameState66(prev => prev ? {
      ...prev,
      player: { ...prev.player, hand: newHand },
      trump: { ...gameState66.player.hand[nineIndex] },
      deck: [gameState66.trump, ...prev.deck.slice(1)],
    } : null);

    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  const playCard66 = async (card: Card66) => {
    if (!gameState66 || isProcessing || gameState66.gamePhase !== 'playerTurn') return;
    setIsProcessing(true);
    await triggerHaptic();

    const newHand = gameState66.player.hand.filter((c, idx) => {
      return !(c.suit === card.suit && c.rank === card.rank && gameState66.player.hand.indexOf(c) === idx);
    });

    // Calculate marriage bonus if applicable
    let marriageBonus = 0;
    if (!gameState66.currentTrick.player && gameState66.roundNumber > 1) {
      marriageBonus = calculateMarriageBonus(gameState66.player.hand, card, gameState66.trump);
    }

    setGameState66(prev => prev ? {
      ...prev,
      currentTrick: { player: card, opponent: null },
      player: { ...prev.player, hand: newHand, score: prev.player.score + marriageBonus },
      playerMarriageBonus: marriageBonus,
      gamePhase: 'opponentTurn',
    } : null);

    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  const handleStand = async () => {
    if (gameState.gamePhase !== "playerTurn" || isProcessing) return;

    await triggerHaptic();

    setGameState((prev) => ({
      ...prev,
      player: { ...prev.player, hasStood: true },
      gamePhase: "opponentTurn",
    }));
  };

  const runAITurn = () => {
    if (gameType === '66' && gameState66) {
      runAITurn66();
      return;
    }

    setIsProcessing(true);

    const revealedOpponentCards = gameState.opponent.cards.map((c) => ({
      ...c,
      faceUp: true,
    }));

    setGameState((prev) => ({
      ...prev,
      opponent: { ...prev.opponent, cards: revealedOpponentCards },
    }));

    const aiLoop = (currentCards: PlayingCard[], currentDeck: PlayingCard[]) => {
      const decision = aiDecision(currentCards, settings?.aiDifficulty || "medium");

      if (decision === "draw" && currentDeck.length > 0) {
        aiTimerRef.current = setTimeout(() => {
          const { card, remainingDeck } = drawCard(currentDeck);
          if (card) {
            const newCards = [...currentCards, card];
            setGameState((prev) => ({
              ...prev,
              deck: remainingDeck,
              opponent: { ...prev.opponent, cards: newCards },
            }));
            triggerHaptic();
            aiLoop(newCards, remainingDeck);
          } else {
            finishRound();
          }
        }, 800);
      } else {
        aiTimerRef.current = setTimeout(() => {
          finishRound();
        }, 500);
      }
    };

    setTimeout(() => {
      aiLoop(revealedOpponentCards, gameState.deck);
    }, 600);
  };

  const runAITurn66 = () => {
    if (!gameState66) return;
    
    // First turn: AI leads with a card
    if (!gameState66.currentTrick.player && !gameState66.currentTrick.opponent) {
      setIsProcessing(true);
      aiTimerRef.current = setTimeout(() => {
        const aiCard = aiChooseCard66(gameState66.opponent.hand, null, settings?.aiDifficulty || 'medium');
        if (!aiCard) {
          setIsProcessing(false);
          return;
        }

        const newOpponentHand = gameState66.opponent.hand.filter((c, idx) => {
          return !(c.suit === aiCard.suit && c.rank === aiCard.rank && gameState66.opponent.hand.indexOf(c) === idx);
        });

        // Calculate marriage bonus for first move (if round > 1)
        let aiMarriageBonus = 0;
        if (gameState66.roundNumber > 1) {
          aiMarriageBonus = calculateMarriageBonus(gameState66.opponent.hand, aiCard, gameState66.trump);
        }

        setGameState66(prev => prev ? {
          ...prev,
          opponent: { ...prev.opponent, hand: newOpponentHand },
          currentTrick: { player: null, opponent: aiCard },
          opponentMarriageBonus: aiMarriageBonus,
          gamePhase: 'playerTurn',
        } : null);

        setIsProcessing(false);
      }, 800);
      return;
    }
    
    // Response turn: Player led, AI responds
    if (!gameState66.currentTrick.player) return;
    setIsProcessing(true);

    aiTimerRef.current = setTimeout(() => {
      const aiCard = aiChooseCard66(
        gameState66.opponent.hand,
        gameState66.currentTrick.player,
        settings?.aiDifficulty || 'medium'
      );

      if (!aiCard) {
        setIsProcessing(false);
        return;
      }

      const newOpponentHand = gameState66.opponent.hand.filter((c, idx) => {
        return !(c.suit === aiCard.suit && c.rank === aiCard.rank && gameState66.opponent.hand.indexOf(c) === idx);
      });

      const winner = determineTrickWinner(gameState66.currentTrick.player, aiCard, gameState66.trump);
      const trickCards = [gameState66.currentTrick.player, aiCard];
      const trickPoints = calculateTrickPoints(trickCards);
      
      let newPlayerScore = gameState66.player.score;
      let newOpponentScore = gameState66.opponent.score;
      let newPlayerTricks = gameState66.player.tricksWon;
      let newOpponentTricks = gameState66.opponent.tricksWon;
      
      if (winner === 'player') {
        newPlayerScore += trickPoints;
        newPlayerTricks = [...newPlayerTricks, trickCards];
      } else {
        newOpponentScore += trickPoints;
        newOpponentTricks = [...newOpponentTricks, trickCards];
      }

      const gameEnded66 = newPlayerScore >= 66 || newOpponentScore >= 66;
      const nextPhase = gameEnded66 ? 'gameEnd' : (winner === 'player' ? 'playerTurn' : 'opponentTurn');

      setGameState66(prev => prev ? {
        ...prev,
        opponent: { ...prev.opponent, hand: newOpponentHand, tricksWon: newOpponentTricks, score: newOpponentScore },
        player: { ...prev.player, tricksWon: newPlayerTricks, score: newPlayerScore },
        currentTrick: { player: gameState66.currentTrick.player, opponent: aiCard },
        trickWinner: winner,
        lastTrickWinner: winner,
        gamePhase: nextPhase,
      } : null);

      setIsProcessing(false);
      
      // Delay before clearing to let player see the cards
      aiTimerRef.current = setTimeout(() => {
        setGameState66(prev => prev ? {
          ...prev,
          currentTrick: { player: null, opponent: null },
          gamePhase: nextPhase,
        } : null);
        if (gameEnded66) setShowResultModal(true);
      }, 1500);
    }, 800);
  };

  const finishRound = () => {
    if (gameType === '66') {
      // 66 game ends when someone reaches 66 points
      return;
    }

    const playerValue = calculateHandValue(gameState.player.cards);
    const opponentCards = gameState.opponent.cards.map((c) => ({ ...c, faceUp: true }));
    const opponentValue = calculateHandValue(opponentCards);

    const result = determineWinner(gameState.player.cards, opponentCards);
    setRoundResult(result);

    let newPlayerWins = gameState.playerTotalWins;
    let newOpponentWins = gameState.opponentTotalWins;
    let newDraws = gameState.draws;

    if (result === "player") {
      newPlayerWins += 1;
    } else if (result === "opponent") {
      newOpponentWins += 1;
    } else {
      newDraws += 1;
    }

    const isLastRound = gameState.currentRound >= gameState.maxRounds;

    setGameState((prev) => ({
      ...prev,
      opponent: { ...prev.opponent, cards: opponentCards },
      playerTotalWins: newPlayerWins,
      opponentTotalWins: newOpponentWins,
      draws: newDraws,
      gamePhase: isLastRound ? "gameEnd" : "roundEnd",
    }));

    if (isLastRound) {
      setGameEnded(true);
      const finalResult =
        newPlayerWins > newOpponentWins
          ? "win"
          : newPlayerWins < newOpponentWins
          ? "loss"
          : "draw";
      updateGameStats(finalResult);
    }

    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setShowResultModal(true);
    setIsProcessing(false);
  };

  const handleNextRound = () => {
    setShowResultModal(false);
    setRoundResult(null);

    setGameState((prev) => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      gamePhase: "dealing",
    }));

    setTimeout(startNewRound, 300);
  };

  const handlePlayAgain = () => {
    setShowResultModal(false);
    setRoundResult(null);
    setGameEnded(false);
    const newGame = initializeGame();
    setGameState(newGame);
    setTimeout(startNewRound, 300);
  };

  const handleQuit = () => {
    setShowPauseModal(false);
    navigation.goBack();
  };

  const playerValue = gameType === '66' && gameState66 ? gameState66.player.score : calculateHandValue(gameState.player.cards);
  const opponentValue = gameType === '66' && gameState66 ? gameState66.opponent.score : calculateHandValue(
    gameState.opponent.cards.filter((c) => c.faceUp)
  );

  const getResultTitle = () => {
    if (gameType === '66' && gameState66?.gamePhase === 'gameEnd') {
      if (playerValue >= 66 && opponentValue < 66) return t('youWin', language);
      if (opponentValue >= 66 && playerValue < 66) return t('aiWins', language);
      if (playerValue >= 66 && opponentValue >= 66) {
        return playerValue > opponentValue ? t('youWin', language) : t('aiWins', language);
      }
    }
    if (gameEnded) {
      const { playerTotalWins, opponentTotalWins } = gameState;
      if (playerTotalWins > opponentTotalWins) return t('youWinGame', language);
      if (opponentTotalWins > playerTotalWins) return t('aiWinsGame', language);
      return t('gameDrawn', language);
    }
    if (roundResult === "player") return t('youWin', language);
    if (roundResult === "opponent") return t('aiWins', language);
    return t('noPointsAward', language);
  };

  const getResultColor = () => {
    if (gameEnded) {
      const { playerTotalWins, opponentTotalWins } = gameState;
      if (playerTotalWins > opponentTotalWins) return colors.success;
      if (opponentTotalWins > playerTotalWins) return colors.error;
      return colors.draw;
    }
    if (roundResult === "player") return colors.success;
    if (roundResult === "opponent") return colors.error;
    return colors.draw;
  };

  if (gameType === '66' && gameState66) {
    return (
      <ThemedView
        style={[
          styles.container,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Pressable
          onPress={() => setShowPauseModal(true)}
          style={({ pressed }) => [
            styles.pauseButton,
            {
              backgroundColor: colors.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
              top: headerHeight + Spacing.sm,
            },
          ]}
        >
          <Feather name="pause" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.gameArea}>
          <View style={styles.opponentSection}>
            <ThemedText style={styles.playerLabel}>{t('ai', language)}</ThemedText>
            <View style={styles.cardsRow}>
              {gameState66.opponent.hand.map((card, index) => (
                <View key={`opp-${index}`} style={styles.cardWrapper}>
                  <View style={[styles.card66, { backgroundColor: '#1A5F7A', borderColor: '#0D3A4A' }]}>
                    <View style={styles.cardBackPattern}>
                      <View style={styles.backPatternLine} />
                      <View style={styles.backPatternLine} />
                      <View style={styles.backPatternLine} />
                      <View style={styles.backPatternCircle} />
                      <View style={styles.backPatternCircle} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <ScoreDisplay
              value={gameState66.opponent.score}
              label={t('score', language)}
              isWinner={gameState66.gamePhase === 'gameEnd' && gameState66.opponent.score > gameState66.player.score}
              isLoser={gameState66.gamePhase === 'gameEnd' && gameState66.opponent.score < gameState66.player.score}
              isDraw={gameState66.gamePhase === 'gameEnd' && gameState66.opponent.score === gameState66.player.score}
            />
          </View>

          <View style={[styles.tableCenter, { backgroundColor: colors.cardTable }]}>
            <View style={styles.scoreBoard66}>
              <View style={styles.scorePair}>
                <ThemedText style={styles.scoreLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
                  {t('you', language)}
                </ThemedText>
                <ThemedText style={styles.scoreValue} lightColor="#FFD700" darkColor="#FFD700">
                  {gameState66.player.score}
                </ThemedText>
              </View>
              
              <View style={styles.divider} />
              
              <ThemedText style={styles.vsText} lightColor="#FFFFFF" darkColor="#FFFFFF">/66</ThemedText>
              
              <View style={styles.divider} />
              
              <View style={styles.scorePair}>
                <ThemedText style={styles.scoreLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
                  {t('ai', language)}
                </ThemedText>
                <ThemedText style={styles.scoreValue} lightColor="#FFD700" darkColor="#FFD700">
                  {gameState66.opponent.score}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.gameInfo}>
              <View style={styles.trumpDisplaySmall}>
                {gameState66.trump ? (
                  <>
                    <ThemedText style={styles.infoLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">{t('trump', language)}</ThemedText>
                    <View style={[styles.trumpCardSmall, { backgroundColor: '#FFFFFF', borderColor: '#333333', borderWidth: 1.5 }]}>
                      <ThemedText style={[styles.trumpCardTextSmall, { color: gameState66.trump.suit === 'hearts' || gameState66.trump.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                        {gameState66.trump.rank}{gameState66.trump.suit === 'hearts' ? '♥' : gameState66.trump.suit === 'diamonds' ? '♦' : gameState66.trump.suit === 'clubs' ? '♣' : '♠'}
                      </ThemedText>
                    </View>
                  </>
                ) : null}
              </View>
              
              <View style={styles.deckDisplaySmall}>
                <ThemedText style={styles.infoLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">{t('remaining', language)}</ThemedText>
                <ThemedText style={styles.deckCountSmall} lightColor="#FFD700" darkColor="#FFD700">
                  {gameState66.deck.length}
                </ThemedText>
              </View>
            </View>
            
            {gameState66.currentTrick.player || gameState66.currentTrick.opponent ? (
              <View style={styles.trickDisplay66}>
                <ThemedText style={styles.playedLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">Oyunlanan Kartlar</ThemedText>
                <View style={styles.cardsPlayedRow}>
                  {gameState66.currentTrick.player && (
                    <View style={[styles.trickCardDisplay, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.trickCardText66}>{gameState66.currentTrick.player.rank}</ThemedText>
                      <ThemedText style={styles.trickCardSuit66}>{gameState66.currentTrick.player.suit === 'hearts' ? '♥' : gameState66.currentTrick.player.suit === 'diamonds' ? '♦' : gameState66.currentTrick.player.suit === 'clubs' ? '♣' : '♠'}</ThemedText>
                    </View>
                  )}
                  {gameState66.currentTrick.opponent && (
                    <View style={[styles.trickCardDisplay, { backgroundColor: '#C0A080' }]}>
                      <ThemedText style={styles.trickCardText66}>{gameState66.currentTrick.opponent.rank}</ThemedText>
                      <ThemedText style={styles.trickCardSuit66}>{gameState66.currentTrick.opponent.suit === 'hearts' ? '♥' : gameState66.currentTrick.opponent.suit === 'diamonds' ? '♦' : gameState66.currentTrick.opponent.suit === 'clubs' ? '♣' : '♠'}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.playerSection}>
            <ScoreDisplay
              value={gameState66.player.score}
              label={t('yourScore', language)}
              isWinner={gameState66.gamePhase === 'gameEnd' && gameState66.player.score > gameState66.opponent.score}
              isLoser={gameState66.gamePhase === 'gameEnd' && gameState66.player.score < gameState66.opponent.score}
              isDraw={gameState66.gamePhase === 'gameEnd' && gameState66.player.score === gameState66.opponent.score}
            />
            <View style={styles.cardsRow}>
              {gameState66.player.hand.map((card, index) => (
                <Pressable
                  key={`player-${index}`}
                  onPress={() => {
                    if (gameState66?.gamePhase === 'playerTurn' && !isProcessing) {
                      playCard66(card);
                    }
                  }}
                  disabled={gameState66.gamePhase !== 'playerTurn' || isProcessing}
                  style={({ pressed }) => [
                    styles.cardWrapper,
                    {
                      opacity: pressed ? 0.7 : gameState66.gamePhase === 'playerTurn' ? 1 : 0.5,
                      transform: [{ scale: pressed && gameState66?.gamePhase === 'playerTurn' ? 0.95 : 1 }],
                    },
                  ]}
                >
                  {['J', 'Q', 'K'].includes(card.rank) ? (
                    <View style={[styles.card66, { backgroundColor: '#FFFFFF', borderColor: '#333333', borderWidth: 2, justifyContent: 'flex-start', paddingTop: 2 }]}>
                      <View style={styles.card66TopLeft}>
                        <ThemedText style={[styles.card66Corner, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                        </ThemedText>
                        <ThemedText style={[styles.card66Corner, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          {card.rank}
                        </ThemedText>
                      </View>
                      {card.rank === 'J' && (
                        <View style={[styles.faceCardFigure, { borderColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          <View style={[styles.figureHead, { backgroundColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]} />
                          <View style={[styles.figureBody, { borderColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]} />
                        </View>
                      )}
                      {card.rank === 'Q' && (
                        <View style={[styles.faceCardFigure, { borderColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          <View style={[styles.figureHeadLarge, { backgroundColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]} />
                          <View style={[styles.figureCrown, { borderTopColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]} />
                        </View>
                      )}
                      {card.rank === 'K' && (
                        <View style={[styles.faceCardFigure, { borderColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          <View style={[styles.figureHeadLarge, { backgroundColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]} />
                          <View style={[styles.kingCrown, { borderTopColor: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]} />
                        </View>
                      )}
                      <ThemedText style={[styles.card66FaceRank, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000', marginTop: 1 }]}>
                        {card.rank}
                      </ThemedText>
                    </View>
                  ) : (
                    <View style={[styles.card66, { backgroundColor: '#FFFFFF', borderColor: '#333333', borderWidth: 2 }]}>
                      <View style={styles.card66TopLeft}>
                        <ThemedText style={[styles.card66Corner, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                        </ThemedText>
                        <ThemedText style={[styles.card66Corner, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          {card.rank}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.card66Middle, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                        {card.rank}
                      </ThemedText>
                      <View style={[styles.card66BottomRight, { transform: [{ rotate: '180deg' }] }]}>
                        <ThemedText style={[styles.card66Corner, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                        </ThemedText>
                        <ThemedText style={[styles.card66Corner, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#FF0000' : '#000000' }]}>
                          {card.rank}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            <ThemedText style={styles.playerLabel}>{t('you', language)}</ThemedText>
            
            {gameState66.trump && gameState66.player.hand.some(c => c.rank === '9' && c.suit === gameState66.trump!.suit) && gameState66.gamePhase === 'playerTurn' ? (
              <Pressable
                onPress={exchangeNineWithTrump}
                disabled={isProcessing}
                style={({ pressed }) => [
                  styles.exchangeButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText style={styles.exchangeButtonText}>{t('exchangeNineWithTrump', language)}</ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Modal
          visible={showPauseModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPauseModal(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.pauseModalContent}>
              <ThemedText style={styles.modalTitle}>{t('gamePaused', language)}</ThemedText>
              <GameButton
                title={t('resume', language)}
                onPress={() => setShowPauseModal(false)}
                variant="primary"
                style={styles.modalButton}
              />
              <GameButton
                title={t('quitGame', language)}
                onPress={handleQuit}
                variant="danger"
                style={styles.modalButton}
              />
            </ThemedView>
          </View>
        </Modal>

        <Modal
          visible={showResultModal}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.resultModalContent}>
              <ThemedText
                style={[styles.resultTitle, { color: getResultColor() }]}
                lightColor={getResultColor()}
                darkColor={getResultColor()}
              >
                {getResultTitle()}
              </ThemedText>

              <View style={styles.resultScores}>
                <View style={styles.resultScoreItem}>
                  <ThemedText style={styles.resultScoreLabel}>{t('you', language)}</ThemedText>
                  <ThemedText style={styles.resultScoreValue}>{gameState66.player.score}</ThemedText>
                </View>
                <ThemedText style={styles.resultVs}>vs</ThemedText>
                <View style={styles.resultScoreItem}>
                  <ThemedText style={styles.resultScoreLabel}>{t('ai', language)}</ThemedText>
                  <ThemedText style={styles.resultScoreValue}>{gameState66.opponent.score}</ThemedText>
                </View>
              </View>

              <GameButton
                title={t('mainMenu', language)}
                onPress={handleQuit}
                variant="secondary"
                style={styles.modalButton}
              />
            </ThemedView>
          </View>
        </Modal>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <Pressable
        onPress={() => setShowPauseModal(true)}
        style={({ pressed }) => [
          styles.pauseButton,
          {
            backgroundColor: colors.backgroundSecondary,
            opacity: pressed ? 0.7 : 1,
            top: headerHeight + Spacing.sm,
          },
        ]}
      >
        <Feather name="pause" size={24} color={theme.text} />
      </Pressable>

      <View style={styles.gameArea}>
        <View style={styles.opponentSection}>
          <ThemedText style={styles.playerLabel}>{t('ai', language)}</ThemedText>
          <View style={styles.cardsRow}>
            {gameState.opponent.cards.map((card, index) => (
              <View key={`opp-${index}`} style={styles.cardWrapper}>
                <PlayingCardComponent card={card} size="medium" />
              </View>
            ))}
          </View>
          {gameState.opponent.cards.some((c) => c.faceUp) ? (
            <ScoreDisplay
              value={calculateHandValue(gameState.opponent.cards)}
              label={t('score', language)}
              showHandName
              isWinner={roundResult === "opponent"}
              isLoser={roundResult === "player"}
              isDraw={roundResult === "draw"}
            />
          ) : null}
        </View>

        <View style={[styles.tableCenter, { backgroundColor: colors.cardTable }]}>
          <View style={styles.roundInfo}>
            <ThemedText style={styles.roundText} lightColor="#FFFFFF" darkColor="#FFFFFF">
              {t('round', language)} {gameState.currentRound} {t('of', language)} {gameState.maxRounds}
            </ThemedText>
            <View style={styles.scoreBoard}>
              <ThemedText style={styles.scoreBoardText} lightColor="#D4AF37" darkColor="#D4AF37">
                {t('you', language)}: {gameState.playerTotalWins}
              </ThemedText>
              <ThemedText style={styles.scoreBoardText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {" - "}
              </ThemedText>
              <ThemedText style={styles.scoreBoardText} lightColor="#D4AF37" darkColor="#D4AF37">
                {t('ai', language)}: {gameState.opponentTotalWins}
              </ThemedText>
            </View>
          </View>
          <View style={styles.deckPile}>
            <View style={[styles.deckCard, { backgroundColor: colors.primary }]}>
              <Feather name="layers" size={24} color="#D4AF37" />
            </View>
            <ThemedText style={styles.deckCount} lightColor="#FFFFFF" darkColor="#FFFFFF">
              {gameState.deck.length}
            </ThemedText>
          </View>
        </View>

        <View style={styles.playerSection}>
          <ScoreDisplay
            value={playerValue}
            label={t('yourScore', language)}
            showHandName
            isWinner={roundResult === "player"}
            isLoser={roundResult === "opponent"}
            isDraw={roundResult === "draw"}
          />
          <View style={styles.cardsRow}>
            {gameState.player.cards.map((card, index) => (
              <View key={`player-${index}`} style={styles.cardWrapper}>
                <PlayingCardComponent card={card} size="medium" />
              </View>
            ))}
          </View>
          <ThemedText style={styles.playerLabel}>{t('you', language)}</ThemedText>
        </View>
      </View>

      <View style={styles.actionBar}>
        <GameButton
          title={t('draw', language)}
          onPress={handleDraw}
          variant="primary"
          size="medium"
          disabled={
            gameState.gamePhase !== "playerTurn" ||
            isProcessing ||
            gameState.deck.length === 0
          }
          style={styles.actionButton}
        />
        <GameButton
          title={t('stand', language)}
          onPress={handleStand}
          variant="accent"
          size="medium"
          disabled={gameState.gamePhase !== "playerTurn" || isProcessing}
          style={styles.actionButton}
        />
      </View>

      <Modal
        visible={showPauseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPauseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.pauseModalContent}>
            <ThemedText style={styles.modalTitle}>{t('gamePaused', language)}</ThemedText>
            <GameButton
              title={t('resume', language)}
              onPress={() => setShowPauseModal(false)}
              variant="primary"
              style={styles.modalButton}
            />
            <GameButton
              title={t('howToPlay', language)}
              onPress={() => {
                setShowPauseModal(false);
                navigation.navigate("Main", { screen: "Rules" });
              }}
              variant="accent"
              style={styles.modalButton}
            />
            <GameButton
              title={t('quitGame', language)}
              onPress={handleQuit}
              variant="danger"
              style={styles.modalButton}
            />
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.resultModalContent}>
            <ThemedText
              style={[styles.resultTitle, { color: getResultColor() }]}
              lightColor={getResultColor()}
              darkColor={getResultColor()}
            >
              {getResultTitle()}
            </ThemedText>

            {roundResult === "draw" && !gameEnded ? (
              <ThemedText style={styles.noPointsText}>
                {t('noPointsAward', language)}
              </ThemedText>
            ) : null}

            <View style={styles.resultScores}>
              <View style={styles.resultScoreItem}>
                <ThemedText style={styles.resultScoreLabel}>{t('you', language)}</ThemedText>
                <ThemedText style={styles.resultScoreValue}>{playerValue}</ThemedText>
              </View>
              <ThemedText style={styles.resultVs}>vs</ThemedText>
              <View style={styles.resultScoreItem}>
                <ThemedText style={styles.resultScoreLabel}>{t('ai', language)}</ThemedText>
                <ThemedText style={styles.resultScoreValue}>
                  {calculateHandValue(gameState.opponent.cards)}
                </ThemedText>
              </View>
            </View>

            {gameEnded ? (
              <View style={styles.finalScore}>
                <ThemedText style={styles.finalScoreText}>
                  {t('finalScore', language)}: {gameState.playerTotalWins} - {gameState.opponentTotalWins}
                </ThemedText>
                {gameState.draws > 0 ? (
                  <ThemedText style={[styles.drawsText, { color: colors.textSecondary }]}>
                    ({gameState.draws} {t('draws', language)})
                  </ThemedText>
                ) : null}
              </View>
            ) : null}

            <GameButton
              title={gameEnded ? t('playAgain', language) : t('nextRound', language)}
              onPress={gameEnded ? handlePlayAgain : handleNextRound}
              variant="primary"
              style={styles.modalButton}
            />
            <GameButton
              title={t('mainMenu', language)}
              onPress={handleQuit}
              variant="secondary"
              style={styles.modalButton}
            />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  pauseButton: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  opponentSection: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  playerSection: {
    alignItems: "center",
    paddingBottom: Spacing.sm,
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: Spacing.sm,
    opacity: 0.7,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: Spacing.md,
    minHeight: 100,
  },
  cardWrapper: {
    marginHorizontal: Spacing.xs,
  },
  card66: {
    width: 50,
    height: 85,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  card66Text: {
    fontSize: 12,
    fontWeight: '600',
  },
  card66TopLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card66Corner: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  card66Middle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card66BottomRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card66FaceCardPattern: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 2,
  },
  faceCardFigure: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  figureHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  figureHeadLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  figureBody: {
    width: 8,
    height: 10,
    borderWidth: 1,
    borderRadius: 1,
  },
  figureCrown: {
    width: 14,
    height: 6,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  kingCrown: {
    width: 14,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  card66FaceRank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreBoard66: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  scorePair: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: Spacing.sm,
  },
  divider: {
    width: 1.5,
    height: 40,
    backgroundColor: '#D4AF37',
    marginHorizontal: Spacing.md,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  trumpDisplaySmall: {
    alignItems: 'center',
  },
  trumpCardSmall: {
    width: 35,
    height: 55,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trumpCardTextSmall: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  deckDisplaySmall: {
    alignItems: 'center',
  },
  deckCountSmall: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  trickDisplay66: {
    alignItems: 'center',
  },
  cardsPlayedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  trickCardDisplay: {
    width: 45,
    height: 65,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trickCardText66: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trickCardSuit66: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  playedLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  exchangeButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBackPattern: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  backPatternLine: {
    width: 35,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    borderRadius: 1,
  },
  backPatternCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
    marginVertical: 1,
  },
  trickDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  trickCard: {
    width: 60,
    height: 85,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  trickCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  tableCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
  },
  roundInfo: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  roundText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scoreBoard: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  scoreBoardText: {
    fontSize: 16,
    fontWeight: "700",
  },
  deckPile: {
    alignItems: "center",
  },
  deckCard: {
    width: 60,
    height: 85,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  deckCount: {
    fontSize: 12,
    marginTop: Spacing.xs,
    opacity: 0.8,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    maxWidth: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  pauseModalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  resultModalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xl,
  },
  modalButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  noPointsText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  resultScores: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  resultScoreItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  resultScoreLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  resultScoreValue: {
    fontSize: 36,
    fontWeight: "700",
  },
  resultVs: {
    fontSize: 16,
    opacity: 0.5,
  },
  finalScore: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  finalScoreText: {
    fontSize: 18,
    fontWeight: "600",
  },
  drawsText: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
});
