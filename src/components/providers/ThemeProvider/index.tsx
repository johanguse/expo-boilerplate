import { ThemeProvider } from "@react-navigation/native";
import { useTheme } from "./hook";

type ThemeProviderComponentProps = {
  children: React.ReactNode;
};

export default function ThemeProviderComponent({
  children,
}: Readonly<ThemeProviderComponentProps>) {
  const theme = useTheme();

  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}
