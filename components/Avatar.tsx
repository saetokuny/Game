import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors } from "@/constants/theme";

interface AvatarProps {
  index: number;
  size?: number;
  onPress?: () => void;
  selected?: boolean;
}

const AVATAR_CONFIGS = [
  { icon: "sun" as const, bgColor: "#C7243A", iconColor: "#D4AF37" },
  { icon: "moon" as const, bgColor: "#2D3561", iconColor: "#D4AF37" },
  { icon: "star" as const, bgColor: "#1B5E20", iconColor: "#D4AF37" },
  { icon: "hexagon" as const, bgColor: "#D4AF37", iconColor: "#2D3561" },
];

export function Avatar({ index, size = 60, onPress, selected = false }: AvatarProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const config = AVATAR_CONFIGS[index % AVATAR_CONFIGS.length];

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.bgColor,
          borderColor: selected ? colors.accent : "transparent",
          borderWidth: selected ? 3 : 0,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather
        name={config.icon}
        size={size * 0.5}
        color={config.iconColor}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
