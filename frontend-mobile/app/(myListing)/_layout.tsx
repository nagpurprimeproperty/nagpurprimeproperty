import { Stack } from "expo-router";
import colors from "@/theme/colors";

export default function MyListingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="myProperties" />
      <Stack.Screen name="leads" />
      <Stack.Screen name="leads/[id]" />
    </Stack>
  );
}