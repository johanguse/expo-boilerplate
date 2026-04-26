import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { withUniwind } from "uniwind";

export const SIonicons = withUniwind(Ionicons);
export type SIoniconsName = ComponentProps<typeof Ionicons>["name"];
