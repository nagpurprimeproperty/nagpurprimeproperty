import { AuthModal } from "@/features/auth";
import NativeHotToast from "@/shared/components/NativeHotToast";
import NoInternetModal from "@/shared/components/NoInternetModal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { configureNotificationHandler, setupNotificationResponseListener } from "@/lib/pushNotifications";
import { useSocket } from "@/hooks/useSocket";
import { ModalProvider } from "@/context/ModalContext";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { useEffect, lazy, Suspense } from "react";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Platform, Text, TextInput, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";

// Hide native splash instantly at module level — the earliest possible point.
// Now that native splash background is #FFF4EC (cream) and logo is transparent,
// the cream fallback <View> below matches it perfectly → zero visible flash.
SplashScreen.hideAsync();

// Set static default font properties once at module initialization without patching internals
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = { fontFamily: "Inter_400Regular" };

if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.style = { fontFamily: "Inter_400Regular" };
// ─────────────────────────────────────────────────────────────────────────────

// ─── Dev-only tooling ─────────────────────────────────────────────────────────
const ReactQueryDevtools = __DEV__ && Platform.OS === "web"
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : null;
// ─────────────────────────────────────────────────────────────────────────────


// Configure how foreground notifications are displayed (once at module load)
configureNotificationHandler();

import { initRevenueCat } from "@/services/revenueCatService";

function AppContent() {
  useSocket();

  useEffect(() => {
    initRevenueCat();
    const cleanup = setupNotificationResponseListener();
    return cleanup;
  }, []);

  return (
    <ModalProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <AuthModal />
      <NoInternetModal />
    </ModalProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Fonts still loading — show cream screen that matches native splash bg (#FFF4EC).
  // Native splash is already hidden. User sees: cream → cream → custom splash ✅
  // No native splash visible at all.
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#FFF4EC" }} />;
  }

  return (
    <GlobalErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
            <NativeHotToast />
            {/* ReactQueryDevtools is lazily loaded and guarded by __DEV__.
                Metro replaces __DEV__ with `false` in production, making this
                entire subtree statically unreachable → zero bytes in the bundle. */}
            {__DEV__ && Platform.OS === "web" && ReactQueryDevtools ? (
              <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
              </Suspense>
            ) : null}
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </GlobalErrorBoundary>
  );
}
