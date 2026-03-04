import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { useThemeColor } from "heroui-native";
import { useUniwind } from "uniwind";

export const useTheme = (): Theme => {
  const { theme } = useUniwind();
  const [primary, background, text, border, card] = useThemeColor([
    "accent",
    "surface",
    "foreground",
    "border",
    "surface",
  ]);

  const themeType = theme === "light" ? DefaultTheme : DarkTheme;

  const themeVar = {
    ...themeType,
    colors: {
      ...themeType.colors,
      text,
      card,
      border,
      primary,
      background,
    },
  };

  return themeVar;
};
