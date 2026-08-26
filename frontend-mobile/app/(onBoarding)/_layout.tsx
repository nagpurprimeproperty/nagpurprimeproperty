// app/(onboarding)/_layout.tsx
import { Stack } from "expo-router";

export default function OnBoardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: "#FFF4EC" },
      }}
    >
      <Stack.Screen name="splash" options={{ animation: "none" }} />
    </Stack>
  );
}