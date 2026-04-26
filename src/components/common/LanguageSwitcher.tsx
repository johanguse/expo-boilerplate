import { changeLanguage, supportedLanguages, useTranslation } from "@i18n";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SIonicons } from "./Icons";

const FLAG: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇧🇷",
};

type Lang = (typeof supportedLanguages)[number];
type LanguageLabelKey = `languages.${Lang}`;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = i18n.language as (typeof supportedLanguages)[number];

  const handleSelect = (lang: (typeof supportedLanguages)[number]) => {
    changeLanguage(lang);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-x-1.5 px-3 py-1.5 rounded-full bg-default-100 active:bg-default-200"
      >
        <Text className="text-sm">{FLAG[current] ?? "🌐"}</Text>
        <Text className="text-default-600 text-xs font-medium">
          {t(`languages.${current}` as LanguageLabelKey)}
        </Text>
        <SIonicons size={12} name="chevron-down" className="text-default-400" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-8"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="w-full bg-background rounded-2xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-4 pt-4 pb-2">
              <Text className="text-default-foreground font-semibold text-base">
                {t("common.language")}
              </Text>
            </View>

            {supportedLanguages.map((lang, i) => {
              const isSelected = lang === current;
              const isLast = i === supportedLanguages.length - 1;
              return (
                <Pressable
                  key={lang}
                  onPress={() => handleSelect(lang)}
                  className={`flex-row items-center px-4 py-3.5 active:bg-default-100 ${
                    !isLast ? "border-b border-default-100" : ""
                  }`}
                >
                  <Text className="text-xl mr-3">{FLAG[lang] ?? "🌐"}</Text>
                  <Text
                    className={`flex-1 text-sm ${
                      isSelected
                        ? "text-primary font-semibold"
                        : "text-default-foreground"
                    }`}
                  >
                    {t(`languages.${lang}` as LanguageLabelKey)}
                  </Text>
                  {isSelected && (
                    <SIonicons
                      size={16}
                      name="checkmark"
                      className="text-primary"
                    />
                  )}
                </Pressable>
              );
            })}

            <View className="h-4" />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
