// app/(onBoarding)/splash.tsx
//
// STYLING APPROACH:
//   ✅ NativeWind className  → layout, spacing, colors, radius, typography basics
//   ✅ StyleSheet            → shadows, elevation, letterSpacing, animated transforms
//   ✅ Inline style          → only for dynamic / JS-computed values on Animated.View

import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

export default function Splash() {
  const router = useRouter();

  // ── Animated values ──────────────────────────────────────────────────────
  const logoScale    = useRef(new Animated.Value(0.6)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const taglineY     = useRef(new Animated.Value(12)).current;
  const dotsOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Tagline
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, 400);

    // Dots
    setTimeout(() => {
      Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    const timer = setTimeout(() => router.replace("/(tabs)/home"), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    // ✅ NativeWind: flex layout + white background
    <View className="flex-1 items-center justify-center bg-white">

      {/* ── Glow blobs ── */}
      {/* ✅ NativeWind: size, radius, opacity */}
      {/* ✅ StyleSheet : absolute position with large numeric offsets */}
      <View className="absolute w-[400px] h-[400px] rounded-full bg-orange-100 opacity-80"
            style={styles.glowTop} />
      <View className="absolute w-[320px] h-[320px] rounded-full bg-orange-100 opacity-60"
            style={styles.glowBottom} />

      {/* ── Logo ── */}
      {/* ✅ Animated.View requires style= for the animated values */}
      <Animated.View
        className="items-center mb-7"
        style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
      >
        {/* ✅ NativeWind: ring size, radius, border, color */}
        <View className="w-[110px] h-[110px] rounded-full border-2 border-orange-100 bg-orange-100 items-center justify-center">
          {/* Shadow wrapper to avoid clipping the shadow in React Native */}
          <View style={styles.logoInner} className="w-[82px] h-[82px] rounded-full bg-orange-500">
            {/* Image mask container */}
            <View className="w-full h-full rounded-full overflow-hidden items-center justify-center">
              <Image
                source={require("@/assets/images/applogo.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                cachePolicy="memory"
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── App name ── */}
      <Animated.View style={{ opacity: logoOpacity }}>
        {/* ✅ NativeWind: size, weight, color, align */}
        {/* ✅ StyleSheet: letterSpacing (negative) */}
        <Text className="text-[28px] font-extrabold text-gray-900 text-center mb-2"
              style={styles.appName}>
          Nagpur Prime Property
        </Text>
      </Animated.View>

      {/* ── Tagline ── */}
      <Animated.View style={{ opacity: taglineOp, transform: [{ translateY: taglineY }] }}>
        {/* ✅ NativeWind: color, size, align */}
        {/* ✅ StyleSheet: letterSpacing (wide tracking) */}
        <Text className="text-[13px] font-medium text-gray-400 text-center"
              style={styles.tagline}>
          Nagpur Ka Apna Property App.
        </Text>
      </Animated.View>

      {/* ── Loading dots ── */}
      <Animated.View className="absolute bottom-[72px] flex-row items-center gap-1.5"
                     style={{ opacity: dotsOpacity }}>
        {/* ✅ NativeWind: base dot style */}
        {/* ✅ Inline style: conditional width on active dot (dynamic JS value) */}
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${i === 1 ? "bg-orange-500" : "bg-gray-300"}`}
            style={{ width: i === 1 ? 20 : 8 }}
          />
        ))}
      </Animated.View>
    </View>
  );
}

// ── StyleSheet: only what NativeWind cannot express ──────────────────────────
const styles = StyleSheet.create({
  // Numeric absolute offsets
  glowTop: {
    top:  -100,
  },
  glowBottom: {
    bottom: -120,
    right:  -80,
  },

  // Shadow — NativeWind v4 does NOT map shadowOffset/Opacity/Radius on RN
  logoInner: {
    shadowColor:   "#F97316",
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius:  16,
    elevation:     10,            // Android
  },

  appName: {
    letterSpacing: -0.5,          // negative tracking — no NW utility
  },
  tagline: {
    letterSpacing: 2,             // wide tracking — no NW utility
  },
});