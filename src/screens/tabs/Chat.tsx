import ChatBubble from "@components/chat/ChatBubble";
import ChatInput from "@components/chat/ChatInput";
import StreamingIndicator from "@components/chat/StreamingIndicator";
import { useTranslation } from "@i18n";
import useChatStore from "@services/zustand/chat.zustand";
import { LegendList } from "@legendapp/list";
import { Button } from "heroui-native/button";
import React, { useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIonicons } from "@components/common/Icons";
import type { Message } from "@services/zustand/chat.zustand";

function EmptyChat({
  onSuggest,
  suggestions,
  title,
  subtitle,
}: {
  onSuggest: (text: string) => void;
  suggestions: string[];
  title: string;
  subtitle: string;
}) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="size-16 bg-primary/10 rounded-3xl items-center justify-center mb-5">
        <SIonicons size={28} name="sparkles" className="text-primary" />
      </View>
      <Text className="text-xl font-bold text-default-foreground text-center mb-2">
        {title}
      </Text>
      <Text className="text-default-500 text-center text-sm leading-relaxed mb-8">
        {subtitle}
      </Text>
      <View className="w-full gap-y-2">
        {suggestions.map((s) => (
          <Pressable
            key={s}
            onPress={() => onSuggest(s)}
            className="flex-row items-center gap-x-3 bg-default-50 border border-default-100 rounded-2xl px-4 py-3 active:bg-default-100"
          >
            <SIonicons size={14} name="arrow-forward-circle-outline" className="text-primary" />
            <Text className="text-sm text-default-600 flex-1">{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearHistory = useChatStore((s) => s.clearHistory);
  const listRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const suggestions = t("chat.suggestions", { returnObjects: true }) as string[];

  // Filter out empty assistant placeholder — show StreamingIndicator instead
  const visibleMessages = messages.filter(
    (m) => !(m.role === "assistant" && m.content === "" && isStreaming)
  );

  const lastMsg = messages[messages.length - 1];
  const showIndicator =
    isStreaming && lastMsg?.role === "assistant" && lastMsg.content === "";

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const prev = visibleMessages[index - 1];
      const isConsecutive = !!prev && prev.role === item.role;
      return <ChatBubble message={item} isConsecutive={isConsecutive} />;
    },
    [visibleMessages]
  );

  function handleSend(text: string) {
    sendMessage(text);
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 120);
  }

  const hasMessages = messages.length > 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-default-100">
        <View className="flex-row items-center gap-x-2">
          <View className="size-8 bg-primary/10 rounded-xl items-center justify-center">
            <SIonicons size={16} name="sparkles" className="text-primary" />
          </View>
          <Text className="text-base font-semibold text-default-foreground">
            {t("chat.title")}
          </Text>
        </View>
        {hasMessages && (
          <Button size="sm" variant="ghost" onPress={clearHistory}>
            <SIonicons size={15} name="trash-outline" className="text-default-400" />
            <Button.Label className="text-default-400 text-xs">{t("chat.clear")}</Button.Label>
          </Button>
        )}
      </View>

      {/* Messages */}
      <View className="flex-1">
        {!hasMessages ? (
          <EmptyChat
            onSuggest={handleSend}
            suggestions={Array.isArray(suggestions) ? suggestions : []}
            title={t("chat.emptyTitle")}
            subtitle={t("chat.emptySubtitle")}
          />
        ) : (
          <LegendList
            ref={listRef}
            data={visibleMessages}
            renderItem={renderItem}
            keyExtractor={(item: Message) => item.id}
            estimatedItemSize={64}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
            recycleItems={false}
          />
        )}
        {showIndicator && <StreamingIndicator />}
      </View>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        placeholder={t("chat.placeholder")}
      />
    </View>
  );
}
