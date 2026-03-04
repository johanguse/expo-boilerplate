import useAuthManage from "@services/zustand/auth.zustand";
import { Button } from "heroui-native/button";
import { View } from "react-native";

export default function ExploreScreen() {
  const signOut = useAuthManage((state) => state.signOut);

  return (
    <View className="flex-1 items-center justify-center">
      <Button onPress={() => signOut()}>LogOut</Button>
    </View>
  );
}
