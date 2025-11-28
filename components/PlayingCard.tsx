import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { PlayingCard as CardType, Suit } from "@/utils/gameLogic";

interface PlayingCardProps {
  card: CardType;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

const CARD_SIZES = {
  small: { width: 50, height: 70 },
  medium: { width: 70, height: 100 },
  large: { width: 90, height: 130 },
};

const getSuitIcon = (suit: Suit): keyof typeof Feather.glyphMap => {
  const icons: Record<Suit, keyof typeof Feather.glyphMap> = {
    hearts: "heart",
    diamonds: "square",
    clubs: "target",
    spades: "triangle",
  };
  return icons[suit];
};

const getSuitColor = (suit: Suit): string => {
  return suit === "hearts" || suit === "diamonds" ? "#C7243A" : "#1A1A1A";
};

const getDisplayValue = (value: number): string => {
  if (value === 1) return "A";
  if (value === 10) return "10";
  return String(value);
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PlayingCardComponent({
  card,
  onPress,
  size = "medium",
  disabled = false,
}: PlayingCardProps) {
  const scale = useSharedValue(1);
  const flipProgress = useSharedValue(card.faceUp ? 1 : 0);
  const dimensions = CARD_SIZES[size];

  React.useEffect(() => {
    flipProgress.value = withTiming(card.faceUp ? 1 : 0, { duration: 300 });
  }, [card.faceUp, flipProgress]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotateY: `${rotateY}deg` }, { scale: scale.value }],
      backfaceVisibility: "hidden" as const,
      opacity: flipProgress.value > 0.5 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [0, -180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotateY: `${rotateY}deg` }, { scale: scale.value }],
      backfaceVisibility: "hidden" as const,
      opacity: flipProgress.value <= 0.5 ? 1 : 0,
    };
  });

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1);
    }
  };

  const suitColor = getSuitColor(card.suit);
  const iconSize = size === "small" ? 12 : size === "medium" ? 16 : 20;
  const valueSize = size === "small" ? 14 : size === "medium" ? 18 : 24;

  return (
    <View style={[styles.cardContainer, dimensions]}>
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, styles.cardFront, dimensions, frontAnimatedStyle]}
        disabled={disabled || !onPress}
      >
        <View style={styles.cardCorner}>
          <ThemedText
            style={[styles.cardValue, { color: suitColor, fontSize: valueSize }]}
            lightColor={suitColor}
            darkColor={suitColor}
          >
            {getDisplayValue(card.value)}
          </ThemedText>
          <Feather name={getSuitIcon(card.suit)} size={iconSize} color={suitColor} />
        </View>
        <View style={styles.cardCenter}>
          <Feather
            name={getSuitIcon(card.suit)}
            size={iconSize * 2}
            color={suitColor}
          />
        </View>
        <View style={[styles.cardCorner, styles.cardCornerBottom]}>
          <Feather name={getSuitIcon(card.suit)} size={iconSize} color={suitColor} />
          <ThemedText
            style={[styles.cardValue, { color: suitColor, fontSize: valueSize }]}
            lightColor={suitColor}
            darkColor={suitColor}
          >
            {getDisplayValue(card.value)}
          </ThemedText>
        </View>
      </AnimatedPressable>

      <Animated.View
        style={[styles.card, styles.cardBack, dimensions, backAnimatedStyle]}
        pointerEvents="none"
      >
        <View style={styles.cardBackPattern}>
          <View style={styles.backPatternInner} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
  },
  card: {
    position: "absolute",
    borderRadius: BorderRadius.xs,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFront: {
    padding: Spacing.xs,
    justifyContent: "space-between",
  },
  cardBack: {
    backgroundColor: "#2D3561",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xs,
  },
  cardBackPattern: {
    flex: 1,
    width: "100%",
    borderRadius: BorderRadius.xs - 2,
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  backPatternInner: {
    width: "70%",
    height: "70%",
    borderRadius: BorderRadius.xs - 4,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  cardCorner: {
    alignItems: "flex-start",
  },
  cardCornerBottom: {
    alignItems: "flex-end",
    transform: [{ rotate: "180deg" }],
  },
  cardValue: {
    fontWeight: "700",
  },
  cardCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
});
