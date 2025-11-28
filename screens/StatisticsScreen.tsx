import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { getGameStats, getPlayerProfile, GameStats, PlayerProfile } from "@/utils/storage";

export default function StatisticsScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [stats, setStats] = useState<GameStats | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [gameStats, playerProfile] = await Promise.all([
          getGameStats(),
          getPlayerProfile(),
        ]);
        setStats(gameStats);
        setProfile(playerProfile);
      };
      loadData();
    }, [])
  );

  const getWinRate = () => {
    if (!stats || stats.gamesPlayed === 0) return 0;
    return Math.round((stats.totalWins / stats.gamesPlayed) * 100);
  };

  const getWinRateColor = () => {
    const rate = getWinRate();
    if (rate >= 60) return colors.success;
    if (rate >= 40) return colors.accent;
    return colors.error;
  };

  if (!stats || !profile) {
    return null;
  }

  return (
    <ScreenScrollView>
      <View style={[styles.profileCard, { backgroundColor: colors.backgroundDefault }]}>
        <Avatar index={profile.avatarIndex} size={80} />
        <ThemedText style={styles.playerName}>{profile.displayName}</ThemedText>
        <ThemedText style={[styles.gamesPlayed, { color: colors.textSecondary }]}>
          {stats.gamesPlayed} games played
        </ThemedText>
      </View>

      <View style={[styles.winRateCard, { backgroundColor: colors.primary }]}>
        <ThemedText style={styles.winRateLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Win Rate
        </ThemedText>
        <ThemedText
          style={[styles.winRateValue, { color: "#D4AF37" }]}
          lightColor="#D4AF37"
          darkColor="#D4AF37"
        >
          {getWinRate()}%
        </ThemedText>
        <View style={styles.winRateBar}>
          <View
            style={[
              styles.winRateBarFill,
              {
                width: `${getWinRate()}%`,
                backgroundColor: "#D4AF37",
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault }]}>
          <View style={[styles.statIconContainer, { backgroundColor: colors.success + "20" }]}>
            <Feather name="check-circle" size={24} color={colors.success} />
          </View>
          <ThemedText style={[styles.statValue, { color: colors.success }]}>
            {stats.totalWins}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Wins
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault }]}>
          <View style={[styles.statIconContainer, { backgroundColor: colors.error + "20" }]}>
            <Feather name="x-circle" size={24} color={colors.error} />
          </View>
          <ThemedText style={[styles.statValue, { color: colors.error }]}>
            {stats.totalLosses}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Losses
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault }]}>
          <View style={[styles.statIconContainer, { backgroundColor: colors.draw + "20" }]}>
            <Feather name="minus-circle" size={24} color={colors.draw} />
          </View>
          <ThemedText style={[styles.statValue, { color: colors.draw }]}>
            {stats.totalDraws}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Draws
          </ThemedText>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.infoRow}>
          <Feather name="info" size={18} color={colors.textSecondary} />
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            Draws do not count towards your win rate. Keep playing to improve your statistics!
          </ThemedText>
        </View>
      </View>

      {stats.gamesPlayed === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.backgroundDefault }]}>
          <Feather name="bar-chart-2" size={48} color={colors.textSecondary} />
          <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            No Games Yet
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            Play your first game to see your statistics here.
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.spacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  playerName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.lg,
  },
  gamesPlayed: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  winRateCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  winRateLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  winRateValue: {
    fontSize: 48,
    fontWeight: "700",
  },
  winRateBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginTop: Spacing.lg,
    overflow: "hidden",
  },
  winRateBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  spacer: {
    height: Spacing["2xl"],
  },
});
