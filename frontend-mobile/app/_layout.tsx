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
import { useEffect, lazy, Suspense } from "react";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { Platform, Text, TextInput } from "react-native";
import "../global.css";

// ─── Global Inter font injection ──────────────────────────────────────────────
// React Native does NOT cascade fontFamily like CSS on the web.
// Additionally, fontWeight alone won't pick the right Inter variant file —
// we must map each weight to its named font asset explicitly.
//
// Strategy: override Text & TextInput render via defaultProps so that
// every component in the entire app automatically gets the correct
// Inter variant (Regular / Medium / SemiBold / Bold) based on fontWeight.

const INTER_WEIGHT_MAP: Record<string, string> = {
  "100": "Inter_400Regular",
  "200": "Inter_400Regular",
  "300": "Inter_400Regular",
  "400": "Inter_400Regular",
  normal: "Inter_400Regular",
  "500": "Inter_500Medium",
  "600": "Inter_600SemiBold",
  "700": "Inter_700Bold",
  bold: "Inter_700Bold",
  "800": "Inter_700Bold",
  "900": "Inter_700Bold",
};

function resolveInterFamily(weight?: string | number): string {
  if (!weight) return "Inter_400Regular";
  return INTER_WEIGHT_MAP[String(weight)] ?? "Inter_400Regular";
}

// Patch Text
// Cache: fontWeight string -> fontFamily string. Computed once per weight, then reused.
const _fontFamilyCache: Record<string, string> = {};
const _cachedInterFamily = (weight?: string | number): string => {
  const key = String(weight ?? '');
  if (!_fontFamilyCache[key]) {
    _fontFamilyCache[key] = resolveInterFamily(weight);
  }
  return _fontFamilyCache[key];
};

const OriginalTextRender = (Text as any).render;
if (OriginalTextRender && !(Text as any).__interPatched) {
  (Text as any).__interPatched = true;
  (Text as any).render = function (props: any, ref: any) {
    const flatStyle = props.style
      ? Array.isArray(props.style)
        ? Object.assign({}, ...props.style.filter(Boolean))
        : props.style
      : {};
    const fontFamily =
      flatStyle.fontFamily ?? _cachedInterFamily(flatStyle.fontWeight);
    const patchedStyle = { fontFamily, ...flatStyle };
    return OriginalTextRender({ ...props, style: patchedStyle }, ref);
  };
} else {
  // Fallback for RN versions without .render
  if (Text.defaultProps == null) (Text as any).defaultProps = {};
  (Text.defaultProps as any).style = { fontFamily: "Inter_400Regular" };
}

// Patch TextInput
if (TextInput.defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput.defaultProps as any).style = { fontFamily: "Inter_400Regular" };
// ─────────────────────────────────────────────────────────────────────────────

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
