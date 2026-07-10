import { Stack } from "expo-router";
import colors from "@/theme/colors";

export default function AccountSupportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="termsAndConditions" />
      <Stack.Screen name="about" />
      <Stack.Screen name="privacy" />
      {/* <Stack.Screen name="contact" /> */}
      <Stack.Screen name="helpAndSupport" />
      <Stack.Screen name="deleteAccount" />
    </Stack>

  );
}