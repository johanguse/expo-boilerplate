import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { SIonicons } from "@components/common/Icons";

interface ChatInputProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  isStreaming,
  placeholder = "Message…",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const canSend = text.trim().length > 0 && !isStreaming;

  function handleSend() {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText("");
  }

  return (
    <View className="px-4 py-3 border-t border-default-100 bg-background">
      <View className="flex-row items-end gap-x-2">
        <View className="flex-1 bg-default-100 rounded-2xl px-4 min-h-[48px] max-h-[120px] justify-center">
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColorClassName="accent-default-400"
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit
            className="text-sm text-default-foreground py-3"
          />
        </View>

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          className={`size-11 rounded-full items-center justify-center active:opacity-70 ${
            isStreaming ? "bg-primary/60" : canSend ? "bg-primary" : "bg-default-200"
          }`}
        >
          {isStreaming ? (
            <ActivityIndicator
              size="small"
              colorClassName="accent-white"
            />
          ) : (
            <SIonicons
              size={18}
              name="arrow-up"
              className={canSend ? "text-primary-foreground" : "text-default-400"}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}
