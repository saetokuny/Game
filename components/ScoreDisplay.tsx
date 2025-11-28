import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors } from "@/constants/theme";
import { getHandName } from "@/utils/gameLogic";

interface ScoreDisplayProps {
  value: number;
  label: string;
  showHandName?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  isDraw?: boolean;
}

export function ScoreDisplay({
  value,
  label,
  showHandName = false,
  isWinner = false,
  isLoser = false,
  isDraw = false,
}: ScoreDisplayProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const getBorderColor = () => {
    if (isWinner) return colors.success;
    if (isLoser) return colors.error;
    if (isDraw) return colors.draw;
    return colors.primary;
  };

  const getBackgroundColor = () => {
    if (isWinner) return isDark ? "rgba(76, 175, 80, 0.2)" : "rgba(56, 142, 60, 0.1)";
    if (isLoser) return isDark ? "rgba(239, 83, 80, 0.2)" : "rgba(211, 47, 47, 0.1)";
    if (isDraw) return isDark ? "rgba(158, 158, 158, 0.2)" : "rgba(117, 117, 117, 0.1)";
    return isDark ? "rgba(74, 90, 143, 0.2)" : "rgba(45, 53, 97, 0.1)";
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText
        style={[styles.value, { color: getBorderColor() }]}
        lightColor={getBorderColor()}
        darkColor={getBorderColor()}
      >
        {value}
      </ThemedText>
      {showHandName ? (
        <ThemedText style={styles.handName}>{getHandName(value)}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    minWidth: 80,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
  },
  handName: {
    fontSize: 11,
    marginTop: Spacing.xs,
    opacity: 0.6,
  },
});
