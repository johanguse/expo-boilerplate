import React from "react";
import { Text, View } from "react-native";
import type { Message } from "@services/zustand/chat.zustand";

interface ChatBubbleProps {
  message: Message;
  isConsecutive?: boolean;
}

export default function ChatBubble({ message, isConsecutive = false }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View className={`px-4 items-end ${isConsecutive ? "pt-0.5" : "pt-2"}`}>
        <View className="max-w-[80%] bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
          <Text className="text-sm leading-[22px] text-primary-foreground">
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={`px-4 flex-row items-end gap-x-2 ${isConsecutive ? "pt-0.5" : "pt-2"}`}>
      {!isConsecutive ? (
        <View className="size-7 rounded-full bg-primary/10 items-center justify-center flex-shrink-0 mb-0.5">
          <View className="size-3 bg-primary/50 rounded-full" />
        </View>
      ) : (
        <View className="w-7 flex-shrink-0" />
      )}
      <View className="max-w-[80%] bg-default-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <Text className="text-sm leading-[22px] text-default-foreground">
          {message.content}
        </Text>
      </View>
    </View>
  );
}
