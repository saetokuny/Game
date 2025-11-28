import React from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors } from "@/constants/theme";

interface GameButtonProps {
  onPress?: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "accent";
  size?: "small" | "medium" | "large";
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GameButton({
  onPress,
  title,
  style,
  disabled = false,
  variant = "primary",
  size = "medium",
}: GameButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const colors = isDark ? Colors.dark : Colors.light;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "danger":
        return colors.error;
      case "accent":
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === "accent") {
      return "#1A1A1A";
    }
    return "#FFFFFF";
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "small":
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          minWidth: 100,
        };
      case "large":
        return {
          paddingVertical: Spacing.xl,
          paddingHorizontal: Spacing["3xl"],
          minWidth: 200,
        };
      default:
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing["2xl"],
          minWidth: 150,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      <ThemedText
        style={[
          styles.buttonText,
          { color: getTextColor(), fontSize: getFontSize() },
        ]}
        lightColor={getTextColor()}
        darkColor={getTextColor()}
      >
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
});
