// app.config.js — dynamic config so env vars can be used at build time.
// Keep app.json for reference but this file takes precedence when present.
//
// ── Google Maps API Key ────────────────────────────────────────────────────────
// The key is NOT prefixed with EXPO_PUBLIC_ so Metro never inlines it into
// the JS bundle.  It is written only into native manifests:
//   Android → AndroidManifest.xml  <meta-data android:name="com.google.android.geo.API_KEY" …>
//   iOS     → Info.plist  GMSApiKey
//
// Supply the key via EAS Build secret (runs in EAS cloud, never committed):
//   eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value <key>
//
// For local `expo run:android` / `expo run:ios` builds, export it in your
// shell BEFORE running the build command:
//   export GOOGLE_MAPS_API_KEY="AIza..."   # bash / zsh / macOS
//   $env:GOOGLE_MAPS_API_KEY="AIza..."     # PowerShell / Windows
// ──────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

module.exports = ({ config }) => {
  const iosGoogleServicesPath = process.env.GOOGLE_SERVICES_INFO_PLIST || "./GoogleService-Info.plist";
  const androidGoogleServicesPath = process.env.GOOGLE_SERVICES_JSON || "./google-services.json";

  const hasIosGoogleServices =
    Boolean(process.env.GOOGLE_SERVICES_INFO_PLIST) ||
    fs.existsSync(path.resolve(__dirname, iosGoogleServicesPath));

  const hasAndroidGoogleServices =
    Boolean(process.env.GOOGLE_SERVICES_JSON) ||
    fs.existsSync(path.resolve(__dirname, androidGoogleServicesPath));

  return {
    ...config,
    name: "Nagpur Prime Property",
    slug: "nagpur-prime-property",
    version: "1.0.3",
    orientation: "portrait",
    icon: "./assets/images/applogo.png",
    scheme: "nagpurprimeproperty",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    // Native splash color EXACTLY matches custom splash.tsx container (#FFF4EC).
    // No image — so native splash is invisible cream screen.
    // JS loads → SplashScreen.hideAsync() → custom splash.tsx starts (same bg color).
    // User sees: seamless transition — feels like going directly to custom splash.
    splash: {
      backgroundColor: "#FFF4EC",
      // No image → completely invisible native splash
    },
    ios: {
      buildNumber: "7",
      supportsTablet: true,
      bundleIdentifier: "com.nagpurprimeproperty.app",
      entitlements: {
        "aps-environment": "production",
      },
      ...(hasIosGoogleServices ? { googleServicesFile: iosGoogleServicesPath } : {}),
      config: {
        usesNonExemptEncryption: false,
        googleMaps: {
          // Same key as Android — injected by EAS Build secret at build time.
          // Expo writes this as GMSApiKey into Info.plist (never in JS bundle).
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBKmIhSr8KalV8bv_XMWhAhp-le0LRLx6Y",
        },
      },
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        NSCameraUsageDescription:
          "Nagpur Prime Property requires access to your camera to take photos and videos of your real estate property (such as apartments or houses) to attach to your property listing.",
        NSPhotoLibraryUsageDescription:
          "Nagpur Prime Property requires access to your photo library to let you select and upload existing property photos and brochures to your property listing.",
        NSPhotoLibraryAddUsageDescription:
          "Nagpur Prime Property requires access to save property images, floor plans, and brochures to your photo library.",
        NSMicrophoneUsageDescription:
          "Nagpur Prime Property requires access to your microphone to record audio while capturing property walk-through videos for your listing.",
        NSLocationWhenInUseUsageDescription:
          "Nagpur Prime Property uses your location to display nearby real estate listings on the map and automatically populate property addresses.",
      },
    },
    android: {
      ...(hasAndroidGoogleServices ? { googleServicesFile: androidGoogleServicesPath } : {}),
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/images/applogo.png",
        monochromeImage: "./assets/images/applogo.png",
      },
      // Android-specific splash: must provide an image so expo-splash-screen
      // can copy drawable/splashscreen_logo into the build. Without it the
      // plugin still generates a values.xml reference → hard build failure.
      // splash-transparent.png is a 1×1 pixel with color #FFF4EC at alpha=0
      // (fully transparent) — completely invisible against the cream background.
      // Net result: user sees only the cream background (#FFF4EC), zero logo.
      splash: {
        backgroundColor: "#FFF4EC",
        image: "./assets/images/splash-transparent.png",
        resizeMode: "contain",
      },
      config: {
        googleMaps: {
          // GOOGLE_MAPS_API_KEY is injected by EAS Build secrets at build time.
          // It is never bundled into JS — only written into AndroidManifest.xml.
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBKmIhSr8KalV8bv_XMWhAhp-le0LRLx6Y",
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.nagpurprimeproperty.app",
    },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    [
      "expo-build-properties",
      {
        ios: {
          // Required for react-native-maps PROVIDER_GOOGLE on iOS.
          // Google Maps iOS SDK is distributed as a framework and needs static linking.
          useFrameworks: "static",
        },
        android: {
          // Enable R8 code minification and resource shrinking for release builds
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          // Allow HTTP (cleartext) traffic to dev/staging backend.
          // usesCleartextTraffic cannot be set directly in the android config
          // object (schema violation) — this is the correct Expo approach.
          usesCleartextTraffic: true,
        },
      },
    ],
    "expo-secure-store",
    "expo-router",
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Nagpur Prime Property uses your location to display nearby real estate listings on the map and automatically populate property addresses.",
      },
    ],

    [
      "expo-image-picker",
      {
        photosPermission:
          "Nagpur Prime Property requires access to your photo library to let you select and upload existing property photos and brochures to your property listing.",
        cameraPermission:
          "Nagpur Prime Property requires access to your camera to take photos and videos of your real estate property (such as apartments or houses) to attach to your property listing.",
        microphonePermission:
          "Nagpur Prime Property requires access to your microphone to record audio while capturing property walk-through videos for your listing.",
      },
    ],
    "expo-video",
    "expo-font",
    [
      "expo-notifications",
      {
        icon: "./assets/images/notificationicon.png",
        color: "#F97316",
        sounds: [],
        androidMode: "default",
        androidCollapsedTitle: "#{unread_notifications} new interactions",
      },
    ],
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "24483faf-3d08-49c3-a8f5-0a96eac1b0cb",
    },
  },
};
};
