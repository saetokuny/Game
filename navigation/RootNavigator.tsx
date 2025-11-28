import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import HomeScreen from "@/screens/HomeScreen";
import GameScreen from "@/screens/GameScreen";
import CardDeckSelectionScreen from "@/screens/CardDeckSelectionScreen";
import RulesScreen from "@/screens/RulesScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import StatisticsScreen from "@/screens/StatisticsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Language } from "@/utils/localization";
import { saveLanguage } from "@/utils/storage";

export type RootStackParamList = {
  Main: undefined;
  CardDeckSelection: undefined;
  Game: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Rules: undefined;
  Statistics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

interface CustomDrawerContentProps {
  navigation: any;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function CustomDrawerContent({ navigation, language, onLanguageChange }: CustomDrawerContentProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const menuItems = [
    { name: "Home", icon: "home" as const, route: "Home" },
    { name: "How to Play", icon: "book-open" as const, route: "Rules" },
    { name: "Statistics", icon: "bar-chart-2" as const, route: "Statistics" },
    { name: "Settings", icon: "settings" as const, route: "Settings" },
  ];

  const handleLanguageChange = async (newLanguage: Language) => {
    await saveLanguage(newLanguage);
    onLanguageChange(newLanguage);
  };

  return (
    <ThemedView style={[styles.drawerContainer, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={styles.drawerHeader}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Feather name="layers" size={32} color="#D4AF37" />
        </View>
        <ThemedText style={styles.drawerTitle}>Oicho-Kabu</ThemedText>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? colors.backgroundSecondary : "transparent" },
            ]}
          >
            <Feather name={item.icon} size={22} color={theme.text} />
            <ThemedText style={styles.menuItemText}>{item.name}</ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={[styles.languageSection, { backgroundColor: colors.backgroundDefault }]}>
        <ThemedText style={styles.languageSectionTitle}>Language</ThemedText>
        <View style={styles.languageOptions}>
          <Pressable
            onPress={() => handleLanguageChange('en')}
            style={({ pressed }) => [
              styles.languageOption,
              {
                backgroundColor: language === 'en' ? colors.primary : colors.backgroundSecondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ThemedText
              style={styles.languageOptionText}
              lightColor={language === 'en' ? '#FFFFFF' : undefined}
              darkColor={language === 'en' ? '#FFFFFF' : undefined}
            >
              English
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageChange('tr')}
            style={({ pressed }) => [
              styles.languageOption,
              {
                backgroundColor: language === 'tr' ? colors.primary : colors.backgroundSecondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ThemedText
              style={styles.languageOptionText}
              lightColor={language === 'tr' ? '#FFFFFF' : undefined}
              darkColor={language === 'tr' ? '#FFFFFF' : undefined}
            >
              Türkçe
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <ThemedText style={styles.footerText}>Version 1.0.0</ThemedText>
      </View>
    </ThemedView>
  );
}

interface DrawerNavigatorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function DrawerNavigator({ language, onLanguageChange }: DrawerNavigatorProps) {
  const { theme, isDark } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          language={language}
          onLanguageChange={onLanguageChange}
        />
      )}
      screenOptions={({ navigation }) => ({
        ...getCommonScreenOptions({ theme, isDark }),
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.toggleDrawer()}
            style={({ pressed }) => [styles.menuButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="menu" size={24} color={theme.text} />
          </Pressable>
        ),
        drawerType: "front",
        drawerStyle: {
          width: 280,
        },
      })}
    >
      <Drawer.Screen
        name="Home"
        options={{
          headerTitle: () => <HeaderTitle title="Oicho-Kabu" />,
        }}
      >
        {(props) => (
          <HomeScreen {...props} language={language} onLanguageChange={onLanguageChange} />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="Rules"
        component={RulesScreen}
        options={{
          headerTitle: "How to Play",
        }}
      />
      <Drawer.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerTitle: "Statistics",
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
    </Drawer.Navigator>
  );
}

interface RootNavigatorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function RootNavigator({
  language,
  onLanguageChange,
}: RootNavigatorProps) {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Main"
        options={{ headerShown: false }}
      >
        {(props) => (
          <DrawerNavigator
            {...props}
            language={language}
            onLanguageChange={onLanguageChange}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="CardDeckSelection"
        options={{
          headerTitle: "Select Deck",
        }}
      >
        {(props) => <CardDeckSelectionScreen {...props} language={language} />}
      </Stack.Screen>
      <Stack.Screen
        name="Game"
        options={{
          headerTitle: "Round 1",
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      >
        {(props) => <GameScreen {...props} language={language} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  languageSection: {
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  languageSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  languageOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  drawerContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: Spacing.lg,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    paddingTop: Spacing.lg,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "center",
  },
  menuButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
