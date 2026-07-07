const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// ── Web alias: redirect react-native-maps to a no-op stub ─────────────────────
// react-native-maps imports native codegen modules that don't exist on web.
// Metro's resolveRequest lets us intercept that import per platform.
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      filePath: path.resolve(__dirname, "mocks/react-native-maps.web.js"),
      type: "sourceFile",
    };
  }
  // Fall through to the default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });