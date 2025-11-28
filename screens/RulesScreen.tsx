import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { t, Language } from "@/utils/localization";

interface RuleSectionProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}

function RuleSection({ title, icon, children }: RuleSectionProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Feather name={icon} size={18} color="#D4AF37" />
        </View>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

interface RulesScreenProps {
  language?: Language;
}

export default function RulesScreen({ language = "en" }: RulesScreenProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ScreenScrollView>
      <ThemedText style={styles.intro}>
        {language === 'en' ? 'Oicho-Kabu is a traditional Japanese card game. The goal is to get a hand value as close to 9 as possible.' : 'Oicho-Kabu geleneksel bir Japon kart oyunudur. Amaç, el değerini 9\'a mümkün olduğunca yakın almaktır.'}
      </ThemedText>

      <RuleSection title={t('objective', language)} icon="target">
        <ThemedText style={styles.text}>
          {t('objectiveDesc', language)}
        </ThemedText>
      </RuleSection>

      <RuleSection title={t('cardValues', language)} icon="layers">
        <ThemedText style={styles.text}>
          {t('cardValuesDesc', language)}
        </ThemedText>
        <View style={[styles.valueTable, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.valueRow}>
            <ThemedText style={styles.valueCard}>A</ThemedText>
            <ThemedText style={styles.valueEquals}>=</ThemedText>
            <ThemedText style={styles.valueNum}>1</ThemedText>
          </View>
          <View style={styles.valueRow}>
            <ThemedText style={styles.valueCard}>2-9</ThemedText>
            <ThemedText style={styles.valueEquals}>=</ThemedText>
            <ThemedText style={styles.valueNum}>Face Value</ThemedText>
          </View>
          <View style={styles.valueRow}>
            <ThemedText style={styles.valueCard}>10</ThemedText>
            <ThemedText style={styles.valueEquals}>=</ThemedText>
            <ThemedText style={styles.valueNum}>10 (counts as 0)</ThemedText>
          </View>
        </View>
      </RuleSection>

      <RuleSection title={t('calculatingHandValue', language)} icon="hash">
        <ThemedText style={styles.text}>
          {t('handValueDesc', language)}
        </ThemedText>
        <View style={[styles.exampleBox, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={styles.exampleTitle}>{t('example', language)}:</ThemedText>
          <ThemedText style={styles.exampleText}>
            Cards: 7 + 5 = 12
          </ThemedText>
          <ThemedText style={styles.exampleText}>
            Hand Value: 2 (only the last digit)
          </ThemedText>
        </View>
        <View style={[styles.exampleBox, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={styles.exampleTitle}>Example:</ThemedText>
          <ThemedText style={styles.exampleText}>
            Cards: 4 + 5 = 9
          </ThemedText>
          <ThemedText style={styles.exampleText}>
            Hand Value: 9 (Kabu - the best hand!)
          </ThemedText>
        </View>
      </RuleSection>

      <RuleSection title="Hand Names" icon="book-open">
        <View style={styles.handNamesGrid}>
          {[
            { value: 0, name: "Buta" },
            { value: 1, name: "Pin" },
            { value: 2, name: "Nizou" },
            { value: 3, name: "Santa" },
            { value: 4, name: "Yotsuya" },
            { value: 5, name: "Goke" },
            { value: 6, name: "Roppou" },
            { value: 7, name: "Naki" },
            { value: 8, name: "Oicho" },
            { value: 9, name: "Kabu" },
          ].map((hand) => (
            <View
              key={hand.value}
              style={[styles.handNameItem, { backgroundColor: colors.backgroundSecondary }]}
            >
              <ThemedText style={styles.handValue}>{hand.value}</ThemedText>
              <ThemedText style={styles.handName}>{hand.name}</ThemedText>
            </View>
          ))}
        </View>
        <ThemedText style={[styles.note, { color: colors.textSecondary }]}>
          The name "Oicho-Kabu" comes from the hands 8 (Oicho) and 9 (Kabu).
        </ThemedText>
      </RuleSection>

      <RuleSection title="Gameplay" icon="play">
        <View style={styles.stepList}>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.stepNumberText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                1
              </ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Each player is dealt 2 cards face up.
            </ThemedText>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.stepNumberText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                2
              </ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              On your turn, choose to Draw another card or Stand with your current hand.
            </ThemedText>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.stepNumberText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                3
              </ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Once you Stand, the AI takes its turn.
            </ThemedText>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.stepNumberText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                4
              </ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              The player with the hand value closest to 9 wins the round.
            </ThemedText>
          </View>
        </View>
      </RuleSection>

      <RuleSection title="Special Hands" icon="star">
        <ThemedText style={styles.text}>
          Some two-card combinations have special significance:
        </ThemedText>
        <View style={[styles.specialHandItem, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={styles.specialHandName}>Shippin (4-1)</ThemedText>
          <ThemedText style={styles.specialHandDesc}>A 4 and an Ace - beats normal hands</ThemedText>
        </View>
        <View style={[styles.specialHandItem, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={styles.specialHandName}>Kuppin (9-1)</ThemedText>
          <ThemedText style={styles.specialHandDesc}>A 9 and an Ace - beats normal hands</ThemedText>
        </View>
        <View style={[styles.specialHandItem, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={styles.specialHandName}>Arashi (Pair)</ThemedText>
          <ThemedText style={styles.specialHandDesc}>Any pair - the strongest hand type</ThemedText>
        </View>
      </RuleSection>

      <RuleSection title="Draw Rules" icon="minus">
        <View style={[styles.drawBox, { borderColor: colors.draw }]}>
          <Feather name="alert-circle" size={24} color={colors.draw} />
          <ThemedText style={[styles.drawText, { color: colors.draw }]}>
            When both players have the same hand value, the round is a draw. 
            No points are awarded to either player.
          </ThemedText>
        </View>
      </RuleSection>

      <RuleSection title="Winning the Game" icon="award">
        <ThemedText style={styles.text}>
          The game consists of 5 rounds. The player who wins the most rounds wins the game. 
          If both players win the same number of rounds, the game is a draw.
        </ThemedText>
      </RuleSection>

      <View style={styles.spacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 16,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionContent: {},
  text: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: Spacing.md,
  },
  valueTable: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  valueCard: {
    width: 50,
    fontWeight: "600",
    fontSize: 16,
  },
  valueEquals: {
    width: 30,
    textAlign: "center",
    opacity: 0.5,
  },
  valueNum: {
    flex: 1,
    fontSize: 15,
  },
  exampleBox: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  exampleTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  exampleText: {
    fontSize: 14,
    opacity: 0.8,
  },
  handNamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  handNameItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  handValue: {
    fontWeight: "700",
    fontSize: 18,
    marginRight: Spacing.sm,
    width: 24,
  },
  handName: {
    fontSize: 14,
  },
  note: {
    fontSize: 13,
    fontStyle: "italic",
  },
  stepList: {
    gap: Spacing.md,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontWeight: "600",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    paddingTop: 4,
  },
  specialHandItem: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  specialHandName: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  specialHandDesc: {
    fontSize: 14,
    opacity: 0.7,
  },
  drawBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    gap: Spacing.md,
  },
  drawText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  spacer: {
    height: Spacing["2xl"],
  },
});
