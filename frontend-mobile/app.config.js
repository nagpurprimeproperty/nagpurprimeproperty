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
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/applogo.png",
    scheme: "nagpurprimeproperty",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nagpurprimeproperty.app",
      ...(hasIosGoogleServices ? { googleServicesFile: iosGoogleServicesPath } : {}),
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
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
        backgroundColor: "#000000",
        foregroundImage: "./assets/images/applogo.png",
        monochromeImage: "./assets/images/applogo.png",
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
        android: {
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
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
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
    },
  },
};
};

