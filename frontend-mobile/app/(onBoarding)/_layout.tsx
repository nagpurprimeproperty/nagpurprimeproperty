// app/(onboarding)/_layout.tsx
import { Stack } from "expo-router";

export default function OnBoardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="splash" options={{ animation: "none" }} />
    </Stack>
  );
}