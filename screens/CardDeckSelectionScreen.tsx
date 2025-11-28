import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { GameButton } from "@/components/GameButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { t, Language } from "@/utils/localization";
import { saveCardDeck } from "@/utils/storage";

interface CardDeckSelectionScreenProps {
  navigation: any;
  language: Language;
  route?: any;
}

export default function CardDeckSelectionScreen({
  navigation,
  language,
  route,
}: CardDeckSelectionScreenProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [selectedDeck, setSelectedDeck] = useState<"european" | "japanese">(
    "european"
  );

  const handleSelectDeck = async (deck: "european" | "japanese") => {
    setSelectedDeck(deck);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartGame = async () => {
    await saveCardDeck(selectedDeck);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const gameType = route?.params?.gameType || 'oicho-kabu';
    navigation.navigate("Game", { gameType });
  };

  return (
    <ScreenScrollView>
      <ThemedText style={styles.title}>{t("selectCardDeck", language)}</ThemedText>

      <View style={styles.optionsContainer}>
        <Pressable
          onPress={() => handleSelectDeck("european")}
          style={({ pressed }) => [
            styles.deckOption,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor:
                selectedDeck === "european" ? colors.primary : colors.backgroundSecondary,
              borderWidth: selectedDeck === "european" ? 3 : 1,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={[styles.deckIconContainer, { backgroundColor: colors.primary }]}>
            <Feather name="credit-card" size={32} color="#D4AF37" />
          </View>
          <ThemedText style={styles.deckName}>{t("europeanCards", language)}</ThemedText>
          <ThemedText style={[styles.deckDescription, { color: colors.textSecondary }]}>
            {t("europeanCardsDesc", language)}
          </ThemedText>
          {selectedDeck === "european" ? (
            <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => handleSelectDeck("japanese")}
          style={({ pressed }) => [
            styles.deckOption,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor:
                selectedDeck === "japanese" ? colors.primary : colors.backgroundSecondary,
              borderWidth: selectedDeck === "japanese" ? 3 : 1,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={[styles.deckIconContainer, { backgroundColor: colors.secondary }]}>
            <Feather name="layers" size={32} color="#D4AF37" />
          </View>
          <ThemedText style={styles.deckName}>{t("japaneseCards", language)}</ThemedText>
          <ThemedText style={[styles.deckDescription, { color: colors.textSecondary }]}>
            {t("japaneseCardsDesc", language)}
          </ThemedText>
          {selectedDeck === "japanese" ? (
            <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
          ) : null}
        </Pressable>
      </View>

      <GameButton
        title={t("startGame", language)}
        onPress={handleStartGame}
        variant="primary"
        size="large"
        style={styles.startButton}
      />

      <View style={styles.spacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  deckOption: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    position: "relative",
  },
  deckIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  deckName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  deckDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    marginBottom: Spacing.lg,
  },
  spacer: {
    height: Spacing["2xl"],
  },
});
