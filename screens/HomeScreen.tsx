import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameButton } from "@/components/GameButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { getGameStats, GameStats, getSettings } from "@/utils/storage";

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [gameStats, settings] = await Promise.all([
          getGameStats(),
          getSettings(),
        ]);
        setStats(gameStats);
        setVibrationEnabled(settings.vibrationEnabled);
      };
      loadData();
    }, [])
  );

  const handlePlayAI = async () => {
    if (vibrationEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("Game");
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.logoSection}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.title}>Oicho-Kabu</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Traditional Japanese Card Game
        </ThemedText>
      </View>

      <View style={styles.buttonSection}>
        <GameButton
          title="Play vs AI"
          onPress={handlePlayAI}
          variant="primary"
          size="large"
          style={styles.mainButton}
        />
        <GameButton
          title="Play vs Friend"
          onPress={() => {}}
          variant="secondary"
          size="large"
          style={styles.mainButton}
          disabled
        />
        <ThemedText style={[styles.comingSoon, { color: colors.textSecondary }]}>
          Multiplayer coming soon
        </ThemedText>
      </View>

      {stats ? (
        <View style={[styles.statsContainer, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.success }]}>
              {stats.totalWins}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Wins
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.backgroundTertiary }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.error }]}>
              {stats.totalLosses}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Losses
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.backgroundTertiary }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.draw }]}>
              {stats.totalDraws}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Draws
            </ThemedText>
          </View>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonSection: {
    alignItems: "center",
  },
  mainButton: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  comingSoon: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: Spacing.lg,
  },
});
