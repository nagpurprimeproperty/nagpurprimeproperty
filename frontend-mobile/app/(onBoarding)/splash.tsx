// app/(onboarding)/splash.tsx
//
// STYLING APPROACH:
//   ✅ NativeWind className  → layout, spacing, colors, radius, typography basics
//   ✅ StyleSheet            → shadows, elevation, letterSpacing, animated transforms
//   ✅ Inline style          → only for dynamic / JS-computed values on Animated.View

import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, Dimensions } from "react-native";
import { Image } from "expo-image";
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  G,
  Line,
  Polygon,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** ── Nagpur landmark skyline as inline SVG ──────────────────────────────── */
function NagpurSkyline() {
  const stroke = "#E8621A";
  const sw = 1.6; // stroke width
  const fill = "none";

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={140}
      viewBox={`0 0 ${SCREEN_WIDTH} 140`}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* ── Left minaret tower ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        {/* Left slim tower */}
        <Rect x="18" y="60" width="14" height="78" />
        <Polygon points="18,60 25,40 32,60" />
        <Rect x="21" y="70" width="8" height="10" />
        <Rect x="21" y="90" width="8" height="10" />
        <Rect x="21" y="110" width="8" height="10" />
        {/* Ball on top */}
        <Circle cx="25" cy="38" r="4" />
      </G>

      {/* ── Second tower ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        <Rect x="42" y="75" width="12" height="63" />
        <Polygon points="42,75 48,58 54,75" />
        <Circle cx="48" cy="56" r="3.5" />
        <Rect x="44" y="83" width="8" height="8" />
        <Rect x="44" y="100" width="8" height="8" />
      </G>

      {/* ── Left gate arch structure ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        <Rect x="60" y="80" width="60" height="58" />
        {/* Main arch */}
        <Path d="M 66 138 L 66 90 Q 90 62 114 90 L 114 138" />
        {/* Decorative top */}
        <Path d="M 60 80 Q 90 50 120 80" />
        {/* Side pillars detail */}
        <Rect x="63" y="85" width="8" height="53" />
        <Rect x="109" y="85" width="8" height="53" />
        {/* Gate grill */}
        <Line x1="78" y1="110" x2="78" y2="138" />
        <Line x1="90" y1="100" x2="90" y2="138" />
        <Line x1="102" y1="110" x2="102" y2="138" />
        <Line x1="70" y1="118" x2="110" y2="118" />
        <Line x1="70" y1="128" x2="110" y2="128" />
        {/* Top crenellations */}
        {[60, 70, 80, 90, 100, 110].map((x, i) => (
          <Rect key={i} x={x} y="73" width="8" height="8" />
        ))}
      </G>

      {/* ── Central dome building (Vidhan Bhavan style) ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        {/* Base body */}
        <Rect x="148" y="88" width="110" height="50" />
        {/* Main large dome */}
        <Path d="M 163 88 Q 203 30 243 88" />
        {/* Dome lantern */}
        <Rect x="198" y="32" width="10" height="14" />
        <Circle cx="203" cy="28" r="5" />
        {/* Smaller side domes */}
        <Path d="M 148 88 Q 163 68 178 88" />
        <Path d="M 228 88 Q 243 68 258 88" />
        {/* Columns */}
        {[155, 168, 181, 225, 238, 251].map((x, i) => (
          <Rect key={i} x={x} y="88" width="7" height="50" />
        ))}
        {/* Windows in dome */}
        <Path d="M 188 88 Q 203 72 218 88" />
        {/* Horizontal band */}
        <Line x1="148" y1="98" x2="258" y2="98" />
        {/* Ground steps */}
        <Rect x="140" y="138" width="126" height="5" />
        <Rect x="133" y="136" width="140" height="4" />
        {/* Side wings */}
        <Rect x="258" y="100" width="28" height="38" />
        <Path d="M 258 100 Q 272 85 286 100" />
        <Rect x="120" y="100" width="28" height="38" />
        <Path d="M 120 100 Q 134 85 148 100" />
      </G>

      {/* ── Right gate arch structure ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        <Rect x="286" y="80" width="60" height="58" />
        {/* Main arch */}
        <Path d="M 292 138 L 292 90 Q 316 62 340 90 L 340 138" />
        {/* Decorative top */}
        <Path d="M 286 80 Q 316 50 346 80" />
        {/* Side pillars */}
        <Rect x="289" y="85" width="8" height="53" />
        <Rect x="335" y="85" width="8" height="53" />
        {/* Gate grill */}
        <Line x1="304" y1="110" x2="304" y2="138" />
        <Line x1="316" y1="100" x2="316" y2="138" />
        <Line x1="328" y1="110" x2="328" y2="138" />
        <Line x1="296" y1="118" x2="336" y2="118" />
        <Line x1="296" y1="128" x2="336" y2="128" />
        {/* Top crenellations */}
        {[286, 296, 306, 316, 326, 336].map((x, i) => (
          <Rect key={i} x={x} y="73" width="8" height="8" />
        ))}
      </G>

      {/* ── Right second tower ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        <Rect x={SCREEN_WIDTH - 56} y="75" width="12" height="63" />
        <Polygon
          points={`${SCREEN_WIDTH - 56},75 ${SCREEN_WIDTH - 50},58 ${SCREEN_WIDTH - 44},75`}
        />
        <Circle cx={SCREEN_WIDTH - 50} cy="56" r="3.5" />
        <Rect x={SCREEN_WIDTH - 54} y="83" width="8" height="8" />
        <Rect x={SCREEN_WIDTH - 54} y="100" width="8" height="8" />
      </G>

      {/* ── Right slim minaret ── */}
      <G stroke={stroke} strokeWidth={sw} fill={fill}>
        <Rect x={SCREEN_WIDTH - 32} y="60" width="14" height="78" />
        <Polygon
          points={`${SCREEN_WIDTH - 32},60 ${SCREEN_WIDTH - 25},40 ${SCREEN_WIDTH - 18},60`}
        />
        <Circle cx={SCREEN_WIDTH - 25} cy="38" r="4" />
        <Rect x={SCREEN_WIDTH - 29} y="70" width="8" height="10" />
        <Rect x={SCREEN_WIDTH - 29} y="90" width="8" height="10" />
        <Rect x={SCREEN_WIDTH - 29} y="110" width="8" height="10" />
      </G>

      {/* ── Ground baseline ── */}
      <Line
        x1="0"
        y1="138"
        x2={SCREEN_WIDTH}
        y2="138"
        stroke={stroke}
        strokeWidth={sw}
      />

      {/* ── Flying birds ── */}
      <G stroke={stroke} strokeWidth={1.4} fill={fill}>
        {/* Bird 1 */}
        <Path d="M 80 20 Q 84 16 88 20" />
        <Path d="M 88 20 Q 92 16 96 20" />
        {/* Bird 2 */}
        <Path d="M 260 30 Q 264 26 268 30" />
        <Path d="M 268 30 Q 272 26 276 30" />
        {/* Bird 3 */}
        <Path d="M 300 18 Q 303 15 306 18" />
        <Path d="M 306 18 Q 309 15 312 18" />
      </G>
    </Svg>
  );
}

/** ── Main Splash Screen ─────────────────────────────────────────────────── */
export default function Splash() {
  const router = useRouter();

  // ── Animated values ──────────────────────────────────────────────────────
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(16)).current;
  const skylineOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 55,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();

    // Text slide up
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 350);

    // Skyline fade in
    setTimeout(() => {
      Animated.timing(skylineOp, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);

    const timer = setTimeout(() => router.replace("/(tabs)/home"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* ── Peach gradient background blobs ── */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobTopRight} />

      {/* ── Content area (top ~65%) ── */}
      <View style={styles.contentArea}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require("@/assets/images/nppicon.png")}
            style={styles.logoImage}
            contentFit="contain"
            cachePolicy="memory"
          />
        </Animated.View>

        {/* App name block */}
        <Animated.View
          style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}
        >
          <Text style={styles.nagpur}>Nagpur</Text>
          <Text style={styles.primeProp}>Prime Property</Text>
          <Text style={styles.tagline}>Nagpur Ka Apna Property App.</Text>
        </Animated.View>
      </View>

      {/* ── Bottom section ── */}
      <Animated.View style={[styles.bottomSection, { opacity: skylineOp }]}>
        {/* Skyline sits just above the orange bar */}
        <View style={styles.skylineContainer}>
          <NagpurSkyline />
        </View>
        {/* Orange bar */}
        <View style={styles.orangeBar} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4EC", // warm cream/peach
  },

  // Soft background blobs
  blobTopLeft: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#FFDFC4",
    opacity: 0.55,
  },
  blobTopRight: {
    position: "absolute",
    top: -60,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#FFE8D6",
    opacity: 0.5,
  },

  // Upper content area
  contentArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  // Logo
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: "#E8621A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },

  // Text
  nagpur: {
    fontFamily: "System",
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A2E",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  primeProp: {
    fontFamily: "System",
    fontSize: 32,
    fontWeight: "800",
    color: "#E8621A",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: "System",
    fontSize: 13.5,
    fontWeight: "400",
    color: "#9A8C85",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Bottom skyline + orange strip
  bottomSection: {
    width: "100%",
  },
  skylineContainer: {
    width: "100%",
    backgroundColor: "#FFF4EC",
    overflow: "hidden",
  },
  orangeBar: {
    width: "100%",
    height: 52,
    backgroundColor: "#E8621A",
  },
});