import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
} as const;

// Detect device language; normalise "pt-BR" → "pt", fallback to "en"
const rawLang = getLocales()[0]?.languageCode ?? "en";
const supportedLangs = Object.keys(resources);
const lng = supportedLangs.includes(rawLang) ? rawLang : "en";

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const changeLanguage = (lang: keyof typeof resources) =>
  i18n.changeLanguage(lang);

export const supportedLanguages = Object.keys(resources) as Array<
  keyof typeof resources
>;

// Re-export hook so screens import from one place
export { useTranslation } from "react-i18next";
