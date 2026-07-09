import { Stack } from "expo-router";
import colors from "@/theme/colors";

export default function MyEnquiriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="enquiries/index" />
      <Stack.Screen name="enquiries/[id]" />
    </Stack>

  );
}