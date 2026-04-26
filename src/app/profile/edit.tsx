import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import { useTranslation } from "@i18n";
import useAuthManage from "@stores/auth.zustand";
import useProfileStore from "@stores/profile.zustand";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const editProfileSchema = z.object({
  name: z.string(),
  bio: z.string(),
  company: z.string(),
  job_title: z.string(),
  phone: z.string(),
  website: z.string(),
  country: z.string(),
  timezone: z.string(),
});

export default function EditProfile() {
  const user = useAuthManage((s) => s.user);
  const { updateProfile } = useProfileStore();
  const { toast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      company: user?.company ?? "",
      job_title: user?.job_title ?? "",
      phone: user?.phone ?? "",
      website: user?.website ?? "",
      country: user?.country ?? "",
      timezone: user?.timezone ?? "",
    },
    validators: { onSubmit: editProfileSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile({
          name: value.name || undefined,
          bio: value.bio || undefined,
          company: value.company || undefined,
          job_title: value.job_title || undefined,
          phone: value.phone || undefined,
          website: value.website || undefined,
          country: value.country || undefined,
          timezone: value.timezone || undefined,
        });
        toast.show({
          label: t("editProfile.successTitle"),
          variant: "success",
          description: t("editProfile.successMessage"),
        });
        router.back();
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string };
        toast.show({
          label: t("editProfile.errorTitle"),
          variant: "danger",
          description: e?.detail ?? e?.message ?? t("editProfile.errorMessage"),
        });
      }
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        className="flex-row items-center gap-x-3 px-4 border-b border-default-100"
        style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
      >
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        >
          <SIonicons
            size={20}
            name="arrow-back"
            className="text-default-foreground"
          />
        </Button>
        <Text className="text-lg font-semibold text-default-foreground flex-1">
          {t("editProfile.title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-2 mb-1">
          {t("editProfile.basic")}
        </Text>

        <form.Field name="name">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.fullName")}
              autoCapitalize="words"
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons
                  size={18}
                  name="person-outline"
                  className="text-default-400"
                />
              </InputGroup.Prefix>
            </FormInput>
          )}
        </form.Field>

        <form.Field name="bio">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.bio")}
              autoCapitalize="sentences"
            />
          )}
        </form.Field>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-4 mb-1">
          {t("editProfile.work")}
        </Text>

        <form.Field name="company">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.company")}
              autoCapitalize="words"
            />
          )}
        </form.Field>

        <form.Field name="job_title">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.jobTitle")}
              autoCapitalize="words"
            />
          )}
        </form.Field>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-4 mb-1">
          {t("editProfile.contact")}
        </Text>

        <form.Field name="phone">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.phone")}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          )}
        </form.Field>

        <form.Field name="website">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.website")}
              keyboardType="url"
              autoCapitalize="none"
            />
          )}
        </form.Field>

        <form.Field name="country">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.country")}
              autoCapitalize="words"
            />
          )}
        </form.Field>

        <form.Field name="timezone">
          {(field) => (
            <FormInput
              field={field}
              label={t("editProfile.timezone")}
              placeholder={t("editProfile.timezonePlaceholder")}
              autoCapitalize="none"
            />
          )}
        </form.Field>

        <View className="mt-4">
          <FormButton form={form}>
            <Button.Label>{t("editProfile.submit")}</Button.Label>
          </FormButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
