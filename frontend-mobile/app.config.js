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

module.exports = ({ config }) => ({
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
    bundleIdentifier: "com.ayushbharne.nagpurPrimeProperty",
    googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST || "./GoogleService-Info.plist",
  },
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#000000",
      foregroundImage: "./assets/images/applogo.png",
      monochromeImage: "./assets/images/applogo.png",
    },
    config: {
      googleMaps: {
        // GOOGLE_MAPS_API_KEY is injected by EAS Build secrets at build time.
        // It is never bundled into JS — only written into AndroidManifest.xml.
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.ayushbharne.nagpurPrimeProperty",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
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
});

