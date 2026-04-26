import { useTranslation } from "@i18n";
import type { Message } from "@stores/chat.zustand";
import { SafeText, TruncatedText, useStreamingLayout } from "expo-pretext";
import { useThemeColor } from "heroui-native/hooks";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const CHAT_FONT_SIZE = 14;
const CHAT_LINE_HEIGHT = 22;
const PREVIEW_MAX_LINES = 8;

function useChatSystemFont(): string {
  return (
    Platform.select({ ios: "System", default: "sans-serif" }) ?? "sans-serif"
  );
}

function useChatInnerTextWidths() {
  const { width: screenW } = useWindowDimensions();
  return useMemo(() => {
    const hPad = 32;
    const rowW = Math.max(0, screenW - hPad);
    const userBubble = 0.8 * rowW;
    const userText = Math.max(1, userBubble - 32);
    const assistantBubble = Math.min(0.8 * rowW, rowW - 28 - 8);
    const assistantText = Math.max(1, assistantBubble - 32);
    return { user: userText, assistant: assistantText };
  }, [screenW]);
}

function UserBubbleText({
  content,
  maxTextWidth,
  color,
}: {
  content: string;
  maxTextWidth: number;
  color: string;
}) {
  const fontFamily = useChatSystemFont();
  const textStyle = useMemo(
    () => ({
      fontFamily,
      fontSize: CHAT_FONT_SIZE,
      lineHeight: CHAT_LINE_HEIGHT,
      color,
    }),
    [fontFamily, color],
  );

  return (
    <SafeText style={textStyle} maxWidth={maxTextWidth}>
      {content}
    </SafeText>
  );
}

function AssistantBubbleText({
  content,
  maxTextWidth,
  color,
  isStreaming,
}: {
  content: string;
  maxTextWidth: number;
  color: string;
  isStreaming: boolean;
}) {
  const { t } = useTranslation();
  const linkColor = useThemeColor("link");
  const fontFamily = useChatSystemFont();
  const textStyle = useMemo(
    () => ({
      fontFamily,
      fontSize: CHAT_FONT_SIZE,
      lineHeight: CHAT_LINE_HEIGHT,
      color,
    }),
    [fontFamily, color],
  );

  const { height, lineCount } = useStreamingLayout(
    content,
    textStyle,
    maxTextWidth,
  );
  const [expanded, setExpanded] = useState(false);

  const showPreview =
    !isStreaming && !expanded && lineCount > PREVIEW_MAX_LINES;

  const body = showPreview ? (
    <TruncatedText
      style={textStyle}
      maxWidth={maxTextWidth}
      maxLines={PREVIEW_MAX_LINES}
      mode="tail"
    >
      {content}
    </TruncatedText>
  ) : (
    <View style={isStreaming ? { minHeight: height } : undefined}>
      <SafeText style={textStyle} maxWidth={maxTextWidth}>
        {content}
      </SafeText>
    </View>
  );

  return (
    <View>
      {body}
      {showPreview && (
        <Pressable
          onPress={() => setExpanded(true)}
          className="pt-1 self-start"
          hitSlop={8}
        >
          <Text className="text-sm font-semibold" style={{ color: linkColor }}>
            {t("chat.readMore")}
          </Text>
        </Pressable>
      )}
      {!isStreaming && expanded && lineCount > PREVIEW_MAX_LINES && (
        <Pressable
          onPress={() => setExpanded(false)}
          className="pt-1 self-start"
          hitSlop={8}
        >
          <Text className="text-sm font-semibold" style={{ color: linkColor }}>
            {t("chat.readLess")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface ChatBubbleProps {
  message: Message;
  isConsecutive?: boolean;
  isStreaming?: boolean;
}

export default function ChatBubble({
  message,
  isConsecutive = false,
  isStreaming = false,
}: ChatBubbleProps) {
  const { user, assistant } = useChatInnerTextWidths();
  const onAccent = useThemeColor("accent-foreground");
  const onDefault = useThemeColor("default-foreground");
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View className={`px-4 items-end ${isConsecutive ? "pt-0.5" : "pt-2"}`}>
        <View className="max-w-[80%] bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
          <UserBubbleText
            content={message.content}
            maxTextWidth={user}
            color={onAccent}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      className={`px-4 flex-row items-end gap-x-2 ${isConsecutive ? "pt-0.5" : "pt-2"}`}
    >
      {!isConsecutive ? (
        <View className="size-7 rounded-full bg-primary/10 items-center justify-center flex-shrink-0 mb-0.5">
          <View className="size-3 bg-primary/50 rounded-full" />
        </View>
      ) : (
        <View className="w-7 flex-shrink-0" />
      )}
      <View className="max-w-[80%] bg-default-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <AssistantBubbleText
          content={message.content}
          maxTextWidth={assistant}
          color={onDefault}
          isStreaming={isStreaming}
        />
      </View>
    </View>
  );
}
