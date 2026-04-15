import { SIonicons } from "@components/common/Icons";
import useAuthManage from "@services/zustand/auth.zustand";
import { Card } from "heroui-native/card";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

function InfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <View className="flex-row items-center gap-x-3 py-2">
      <SIonicons size={16} name={icon as any} className="text-default-400" />
      <Text className="text-default-foreground text-sm flex-1">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthManage((s) => s.user);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  const hasExtraInfo =
    user?.company || user?.phone || user?.country || user?.bio || user?.website;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header bar */}
      <View
        className="px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text className="text-2xl font-bold text-default-foreground">Profile</Text>
        <Pressable
          onPress={() => router.push("/profile/edit" as any)}
          className="flex-row items-center gap-x-1.5 bg-default-100 rounded-full px-3 py-1.5 active:bg-default-200"
        >
          <SIonicons size={14} name="pencil-outline" className="text-default-600" />
          <Text className="text-default-600 text-sm font-medium">Edit</Text>
        </Pressable>
      </View>

      {/* Avatar hero */}
      <View className="items-center pb-6 px-4">
        <View className="mb-4 relative">
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{ width: 96, height: 96, borderRadius: 48 }}
              className="bg-primary/15 items-center justify-center"
            >
              <Text className="text-primary text-3xl font-bold">{initials}</Text>
            </View>
          )}
          {/* Verified badge */}
          {user?.is_verified && (
            <View className="absolute bottom-0 right-0 size-6 bg-success rounded-full border-2 border-background items-center justify-center">
              <SIonicons size={12} name="checkmark" className="text-white" />
            </View>
          )}
        </View>

        <Text className="text-xl font-bold text-default-foreground">
          {user?.name ?? "No name set"}
        </Text>
        <Text className="text-default-400 text-sm mt-0.5">{user?.email}</Text>

        {user?.role && (
          <View className="bg-primary/10 px-3 py-1 rounded-full mt-3">
            <Text className="text-primary text-xs font-medium capitalize">{user.role}</Text>
          </View>
        )}
      </View>

      {/* Account info */}
      <View className="px-4 gap-y-3">
        {user?.bio && (
          <Card className="p-4">
            <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mb-2">
              About
            </Text>
            <Text className="text-default-foreground text-sm leading-relaxed">{user.bio}</Text>
          </Card>
        )}

        {hasExtraInfo && (
          <Card className="p-4">
            <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mb-2">
              Details
            </Text>
            {user?.company && <InfoRow icon="business-outline" value={user.company} />}
            {user?.job_title && <InfoRow icon="briefcase-outline" value={user.job_title} />}
            {user?.phone && <InfoRow icon="call-outline" value={user.phone} />}
            {user?.country && <InfoRow icon="location-outline" value={user.country} />}
            {user?.website && <InfoRow icon="globe-outline" value={user.website} />}
          </Card>
        )}

        <Card className="p-4">
          <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mb-2">
            Account
          </Text>
          <View className="flex-row items-center gap-x-3 py-2">
            <SIonicons
              size={16}
              name={user?.is_verified ? "shield-checkmark-outline" : "shield-outline"}
              className={user?.is_verified ? "text-success" : "text-warning"}
            />
            <Text className="text-default-foreground text-sm flex-1">
              {user?.is_verified ? "Email verified" : "Email not verified"}
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${user?.is_verified ? "bg-success/10" : "bg-warning/10"}`}>
              <Text className={`text-xs font-medium ${user?.is_verified ? "text-success" : "text-warning"}`}>
                {user?.is_verified ? "Verified" : "Pending"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-x-3 py-2">
            <SIonicons size={16} name="calendar-outline" className="text-default-400" />
            <Text className="text-default-foreground text-sm">
              Joined{" "}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })
                : "—"}
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
