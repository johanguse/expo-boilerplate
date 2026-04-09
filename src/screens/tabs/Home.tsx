import { LegendList, type LegendListRenderItemProps } from "@legendapp/list";
import { Card } from "heroui-native/card";
import { useCallback } from "react";
import { Text, View } from "react-native";
import { SIonicons } from "@components/common/Icons";

interface ListItem {
  id: string;
  title: string;
  description: string;
  icon: "rocket-outline" | "bulb-outline" | "code-slash-outline" | "layers-outline" | "flash-outline" | "sparkles-outline";
}

const SAMPLE_DATA: ListItem[] = [
  { id: "1", title: "Legend List", description: "High-performance virtualized list with dynamic item sizes", icon: "rocket-outline" },
  { id: "2", title: "Expo Router", description: "File-based routing with nested layouts and type safety", icon: "layers-outline" },
  { id: "3", title: "HeroUI Native", description: "Beautiful, accessible UI components for React Native", icon: "sparkles-outline" },
  { id: "4", title: "Uniwind", description: "Tailwind CSS utility classes for React Native styling", icon: "bulb-outline" },
  { id: "5", title: "Zustand", description: "Lightweight state management with minimal boilerplate", icon: "flash-outline" },
  { id: "6", title: "TypeScript", description: "Strict type safety across the entire codebase", icon: "code-slash-outline" },
];

function ListItemCard({ item }: LegendListRenderItemProps<ListItem>) {
  return (
    <Card className="mx-4 mb-3 p-4">
      <View className="flex-row items-center gap-x-3">
        <View className="size-10 bg-primary/10 rounded-xl items-center justify-center">
          <SIonicons size={20} name={item.icon} className="text-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-default-foreground text-base font-semibold">
            {item.title}
          </Text>
          <Text className="text-default-500 text-sm mt-0.5">
            {item.description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  const renderItem = useCallback(
    (props: LegendListRenderItemProps<ListItem>) => <ListItemCard {...props} />,
    [],
  );

  return (
    <LegendList
      data={SAMPLE_DATA}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      estimatedItemSize={80}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      recycleItems
    />
  );
}
