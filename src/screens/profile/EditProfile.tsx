import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import { useTranslation } from "@i18n";
import useAuthManage from "@services/zustand/auth.zustand";
import useProfileStore from "@services/zustand/profile.zustand";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import { useRouter } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { object, string } from "zod";

const validationSchema = object({
  name: string().optional(),
  bio: string().optional(),
  company: string().optional(),
  job_title: string().optional(),
  phone: string().optional(),
  website: string().optional(),
  country: string().optional(),
  timezone: string().optional(),
});

export default function EditProfileScreen() {
  const user = useAuthManage((s) => s.user);
  const { updateProfile, isUpdating } = useProfileStore();
  const { toast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const Form = useAppForm({
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
    validators: { onChange: validationSchema },
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
      } catch (err: any) {
        toast.show({
          label: t("editProfile.errorTitle"),
          variant: "danger",
          description: err?.detail ?? err?.message ?? t("editProfile.errorMessage"),
        });
      }
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        className="flex-row items-center gap-x-3 px-4 border-b border-default-100"
        style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
      >
        <Button isIconOnly variant="ghost" size="sm" onPress={() => router.back()}>
          <SIonicons size={20} name="arrow-back" className="text-default-foreground" />
        </Button>
        <Text className="text-lg font-semibold text-default-foreground flex-1">
          {t("editProfile.title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-2 mb-1">
          {t("editProfile.basic")}
        </Text>

        <Form.AppField name="name">
          {() => (
            <FormInput label={t("editProfile.fullName")} autoCapitalize="words">
              <InputGroup.Prefix isDecorative>
                <SIonicons size={18} name="person-outline" className="text-default-400" />
              </InputGroup.Prefix>
            </FormInput>
          )}
        </Form.AppField>

        <Form.AppField name="bio">
          {() => <FormInput label={t("editProfile.bio")} autoCapitalize="sentences" />}
        </Form.AppField>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-4 mb-1">
          {t("editProfile.work")}
        </Text>

        <Form.AppField name="company">
          {() => <FormInput label={t("editProfile.company")} autoCapitalize="words" />}
        </Form.AppField>

        <Form.AppField name="job_title">
          {() => <FormInput label={t("editProfile.jobTitle")} autoCapitalize="words" />}
        </Form.AppField>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-4 mb-1">
          {t("editProfile.contact")}
        </Text>

        <Form.AppField name="phone">
          {() => <FormInput label={t("editProfile.phone")} keyboardType="phone-pad" autoCapitalize="none" />}
        </Form.AppField>

        <Form.AppField name="website">
          {() => <FormInput label={t("editProfile.website")} keyboardType="url" autoCapitalize="none" />}
        </Form.AppField>

        <Form.AppField name="country">
          {() => <FormInput label={t("editProfile.country")} autoCapitalize="words" />}
        </Form.AppField>

        <Form.AppField name="timezone">
          {() => (
            <FormInput
              label={t("editProfile.timezone")}
              placeholder={t("editProfile.timezonePlaceholder")}
              autoCapitalize="none"
            />
          )}
        </Form.AppField>

        <View className="mt-4">
          <Form.AppForm>
            <FormButton>
              <Button.Label>{t("editProfile.submit")}</Button.Label>
            </FormButton>
          </Form.AppForm>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
