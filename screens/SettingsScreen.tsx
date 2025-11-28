import React, { useState, useEffect } from "react";
import { StyleSheet, View, Switch, Pressable, Alert, TextInput, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { Avatar } from "@/components/Avatar";
import { GameButton } from "@/components/GameButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import {
  getPlayerProfile,
  savePlayerProfile,
  getSettings,
  saveSettings,
  resetGameStats,
  PlayerProfile,
  GameSettings,
} from "@/utils/storage";

type AnimationSpeed = "slow" | "normal" | "fast";
type AIDifficulty = "easy" | "medium" | "hard";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [profile, setProfile] = useState<PlayerProfile>({
    displayName: "Player",
    avatarIndex: 0,
  });
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    animationSpeed: "normal",
    aiDifficulty: "medium",
    musicEnabled: true,
    musicVolume: 0.5,
    selectedMusic: "traditional",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [savedProfile, savedSettings] = await Promise.all([
        getPlayerProfile(),
        getSettings(),
      ]);
      setProfile(savedProfile);
      setSettings(savedSettings);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleProfileChange = async (updates: Partial<PlayerProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    await savePlayerProfile(newProfile);
    if (settings.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSettingsChange = async (updates: Partial<GameSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
    if (newSettings.vibrationEnabled && updates.vibrationEnabled !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleResetStats = () => {
    Alert.alert(
      "Reset Statistics",
      "Are you sure you want to reset all your game statistics? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetGameStats();
            if (settings.vibrationEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("Done", "Your statistics have been reset.");
          },
        },
      ]
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <ThemedText style={styles.sectionTitle}>Profile</ThemedText>

        <View style={styles.avatarSection}>
          <ThemedText style={styles.label}>Avatar</ThemedText>
          <View style={styles.avatarRow}>
            {[0, 1, 2, 3].map((index) => (
              <Avatar
                key={index}
                index={index}
                size={60}
                selected={profile.avatarIndex === index}
                onPress={() => handleProfileChange({ avatarIndex: index })}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Display Name</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.backgroundSecondary,
                color: theme.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            value={profile.displayName}
            onChangeText={(text) => handleProfileChange({ displayName: text })}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
            maxLength={20}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <ThemedText style={styles.sectionTitle}>Game Settings</ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="volume-2" size={20} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Sound Effects</ThemedText>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => handleSettingsChange({ soundEnabled: value })}
            trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="smartphone" size={20} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Vibration</ThemedText>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => handleSettingsChange({ vibrationEnabled: value })}
            trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingGroup}>
          <View style={styles.settingInfo}>
            <Feather name="zap" size={20} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Animation Speed</ThemedText>
          </View>
          <View style={styles.optionButtons}>
            {(["slow", "normal", "fast"] as AnimationSpeed[]).map((speed) => (
              <Pressable
                key={speed}
                onPress={() => handleSettingsChange({ animationSpeed: speed })}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor:
                      settings.animationSpeed === speed
                        ? colors.primary
                        : colors.backgroundSecondary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    {
                      color:
                        settings.animationSpeed === speed ? "#FFFFFF" : theme.text,
                    },
                  ]}
                  lightColor={settings.animationSpeed === speed ? "#FFFFFF" : theme.text}
                  darkColor={settings.animationSpeed === speed ? "#FFFFFF" : theme.text}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.settingGroup}>
          <View style={styles.settingInfo}>
            <Feather name="music" size={20} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Müzik</ThemedText>
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.label}>Müzik Aç/Kapat</ThemedText>
            <Switch
              value={settings.musicEnabled}
              onValueChange={(value) => handleSettingsChange({ musicEnabled: value })}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
            />
          </View>
          {settings.musicEnabled && (
            <>
              <View style={styles.volumeContainer}>
                <ThemedText style={styles.label}>Ses Seviyesi: {Math.round(settings.musicVolume * 100)}%</ThemedText>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={settings.musicVolume}
                  onValueChange={(value) => handleSettingsChange({ musicVolume: value })}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.backgroundTertiary}
                />
              </View>
              <View style={styles.musicButtons}>
                {(["traditional", "peaceful", "energetic"] as const).map((music) => (
                  <Pressable
                    key={music}
                    onPress={() => handleSettingsChange({ selectedMusic: music })}
                    style={({ pressed }) => [
                      styles.musicButton,
                      {
                        backgroundColor:
                          settings.selectedMusic === music
                            ? colors.primary
                            : colors.backgroundSecondary,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.musicButtonText,
                        {
                          color: settings.selectedMusic === music ? "#FFFFFF" : theme.text,
                        },
                      ]}
                    >
                      {music === "traditional" ? "Geleneksel" : music === "peaceful" ? "Huzurlu" : "Enerjik"}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.settingGroup}>
          <View style={styles.settingInfo}>
            <Feather name="cpu" size={20} color={theme.text} />
            <ThemedText style={styles.settingLabel}>AI Difficulty</ThemedText>
          </View>
          <View style={styles.optionButtons}>
            {(["easy", "medium", "hard"] as AIDifficulty[]).map((difficulty) => (
              <Pressable
                key={difficulty}
                onPress={() => handleSettingsChange({ aiDifficulty: difficulty })}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor:
                      settings.aiDifficulty === difficulty
                        ? colors.primary
                        : colors.backgroundSecondary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    {
                      color:
                        settings.aiDifficulty === difficulty ? "#FFFFFF" : theme.text,
                    },
                  ]}
                  lightColor={settings.aiDifficulty === difficulty ? "#FFFFFF" : theme.text}
                  darkColor={settings.aiDifficulty === difficulty ? "#FFFFFF" : theme.text}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <ThemedText style={styles.sectionTitle}>Data</ThemedText>
        <GameButton
          title="Reset Statistics"
          onPress={handleResetStats}
          variant="danger"
          style={styles.resetButton}
        />
        <ThemedText style={[styles.warningText, { color: colors.textSecondary }]}>
          This will clear all your win/loss records.
        </ThemedText>
      </View>

      <View style={styles.spacer} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  avatarSection: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.md,
    opacity: 0.7,
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  textInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingGroup: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  volumeContainer: {
    paddingVertical: Spacing.md,
  },
  slider: {
    height: 40,
    marginVertical: Spacing.md,
  },
  musicButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  musicButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  musicButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  optionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resetButton: {
    marginBottom: Spacing.md,
  },
  warningText: {
    fontSize: 13,
    textAlign: "center",
  },
  spacer: {
    height: Spacing["2xl"],
  },
});
