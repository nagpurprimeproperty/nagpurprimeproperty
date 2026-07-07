import AuthModal from "@/components/auth/AuthModal";
import NativeHotToast from "@/components/common/NativeHotToast";
import NoInternetModal from "@/components/common/NoInternetModal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/queryClient";
import { configureNotificationHandler, setupNotificationResponseListener } from "@/lib/pushNotifications";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, lazy, Suspense } from "react";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";
import "../global.css";

// ─── Dev-only tooling ─────────────────────────────────────────────────────────
// __DEV__ is replaced by `false` in production builds by Metro, so the entire
// branch below is statically dead code and tree-shaken from the bundle.
// The dynamic import() prevents Metro from following the module graph even in
// development unless this branch is actually entered at runtime.
const ReactQueryDevtools = __DEV__ && Platform.OS === "web"
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : null;
// ─────────────────────────────────────────────────────────────────────────────

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Configure how foreground notifications are displayed (once at module load)
configureNotificationHandler();

function AppContent() {
  // Listen to Socket.IO events and keep notification cache in sync
  useSocket();

  // Navigate to notification screen when user taps a push notification
  useEffect(() => {
    const cleanup = setupNotificationResponseListener();
    return cleanup;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <AuthModal />
      <NoInternetModal />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
  );
}
