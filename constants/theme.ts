import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#555555",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#2D3561",
    link: "#2D3561",
    backgroundRoot: "#F5F3EE",
    backgroundDefault: "#EDEAE3",
    backgroundSecondary: "#E5E2DB",
    backgroundTertiary: "#DDD9D0",
    primary: "#2D3561",
    secondary: "#C7243A",
    accent: "#D4AF37",
    cardTable: "#1B5E20",
    success: "#388E3C",
    error: "#D32F2F",
    draw: "#757575",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#7A8BC4",
    link: "#7A8BC4",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#252525",
    backgroundSecondary: "#303030",
    backgroundTertiary: "#3B3B3B",
    primary: "#4A5A8F",
    secondary: "#E04A5E",
    accent: "#E8C04A",
    cardTable: "#2E7D32",
    success: "#4CAF50",
    error: "#EF5350",
    draw: "#9E9E9E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
