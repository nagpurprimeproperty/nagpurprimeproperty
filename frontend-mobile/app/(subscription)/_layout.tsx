import { Stack } from "expo-router";
import colors from "@/theme/colors";

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="subscription" />
      <Stack.Screen name="subscriptionDetail" />
      <Stack.Screen name="mySubscription" />
      <Stack.Screen name="purchaseHistory" />
      <Stack.Screen name="purchaseDetail" />
    </Stack>
  );
}
