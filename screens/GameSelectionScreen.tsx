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
import { Language } from "@/utils/localization";
import { saveCardDeck, saveGameType } from "@/utils/storage";

interface GameSelectionScreenProps {
  navigation: any;
  language: Language;
}

export default function GameSelectionScreen({
  navigation,
  language,
}: GameSelectionScreenProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [selectedGame, setSelectedGame] = useState<"oicho-kabu" | "66">("oicho-kabu");

  const handleSelectGame = async (game: "oicho-kabu" | "66") => {
    setSelectedGame(game);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartGame = async () => {
    await saveGameType(selectedGame);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("CardDeckSelection", { gameType: selectedGame });
  };

  const games = [
    {
      id: "oicho-kabu" as const,
      name: "Oicho-Kabu",
      icon: "layers" as const,
      desc: language === 'en' ? 'Get closest to 9' : 'Değeri 9\'a yakın al',
    },
    {
      id: "66" as const,
      name: "66",
      icon: "hash" as const,
      desc: language === 'en' ? 'Get closest to 6' : 'Değeri 6\'ya yakın al',
    },
  ];

  return (
    <ScreenScrollView>
      <ThemedText style={styles.title}>
        {language === 'en' ? 'Select Game' : 'Oyun Seç'}
      </ThemedText>

      <View style={styles.optionsContainer}>
        {games.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => handleSelectGame(game.id)}
            style={({ pressed }) => [
              styles.gameOption,
              {
                backgroundColor: colors.backgroundDefault,
                borderColor:
                  selectedGame === game.id ? colors.primary : colors.backgroundSecondary,
                borderWidth: selectedGame === game.id ? 3 : 1,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={[styles.gameIconContainer, { backgroundColor: colors.primary }]}>
              <Feather name={game.icon} size={40} color="#D4AF37" />
            </View>
            <ThemedText style={styles.gameName}>{game.name}</ThemedText>
            <ThemedText style={[styles.gameDescription, { color: colors.textSecondary }]}>
              {game.desc}
            </ThemedText>
            {selectedGame === game.id ? (
              <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      <GameButton
        title={language === 'en' ? 'Continue' : 'Devam Et'}
        onPress={handleStartGame}
        variant="primary"
        size="large"
        style={styles.continueButton}
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
  gameOption: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    position: "relative",
  },
  gameIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  gameName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  gameDescription: {
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
  continueButton: {
    marginBottom: Spacing.lg,
  },
  spacer: {
    height: Spacing["2xl"],
  },
});
