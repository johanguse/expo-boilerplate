import useAuthManage from "@services/zustand/auth.zustand";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SIonicons } from "@components/common/Icons";

export default function ProfileScreen() {
  const user = useAuthManage((state) => state.user);
  const signOut = useAuthManage((state) => state.signOut);

  return (
    <ScrollView contentContainerClassName="grow p-4 gap-y-4">
      {/* User Info Card */}
      <Card className="p-5">
        <View className="items-center gap-y-3">
          <View className="size-20 bg-primary/10 rounded-full items-center justify-center">
            <SIonicons
              size={36}
              name="person"
              className="text-primary"
            />
          </View>

          <View className="items-center gap-y-1">
            <Text className="text-default-foreground text-xl font-semibold">
              {user?.name ?? "User"}
            </Text>
            <Text className="text-default-500 text-sm">
              {user?.email ?? ""}
            </Text>
          </View>

          {user?.role && (
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-medium capitalize">
                {user.role}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Info Items */}
      <Card className="p-4 gap-y-3">
        {user?.company && (
          <View className="flex-row items-center gap-x-3">
            <SIonicons size={18} name="business-outline" className="text-default-400" />
            <Text className="text-default-foreground text-sm">{user.company}</Text>
          </View>
        )}
        {user?.phone && (
          <View className="flex-row items-center gap-x-3">
            <SIonicons size={18} name="call-outline" className="text-default-400" />
            <Text className="text-default-foreground text-sm">{user.phone}</Text>
          </View>
        )}
        {user?.country && (
          <View className="flex-row items-center gap-x-3">
            <SIonicons size={18} name="location-outline" className="text-default-400" />
            <Text className="text-default-foreground text-sm">{user.country}</Text>
          </View>
        )}
        <View className="flex-row items-center gap-x-3">
          <SIonicons size={18} name="calendar-outline" className="text-default-400" />
          <Text className="text-default-foreground text-sm">
            Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
          </Text>
        </View>
      </Card>

      {/* Logout */}
      <View className="mt-auto pb-8">
        <Button
          variant="ghost"
          onPress={signOut}
          className="w-full">
          <SIonicons size={20} name="log-out-outline" className="text-danger" />
          <Button.Label className="text-danger">Sign Out</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
