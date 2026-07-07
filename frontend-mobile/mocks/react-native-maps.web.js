/**
 * mocks/react-native-maps.web.js
 * Web stub for react-native-maps.
 * Metro resolves this file instead of the real library when bundling for web,
 * preventing the native codegen import crash.
 * All exports the app uses are mocked as no-op React Native Views.
 */
import React from "react";
import { View } from "react-native";

// MapView — renders nothing on web
const MapView = React.forwardRef((_props, _ref) => React.createElement(View, null));
MapView.displayName = "MapView";
export default MapView;

// Marker — no-op
export const Marker = () => null;

// Google provider constant (null is fine for web — it's never used)
export const PROVIDER_GOOGLE = null;
export const PROVIDER_DEFAULT = null;

// No-op animated region
export class AnimatedRegion {
  constructor(region) { this.region = region; }
  timing() { return { start: () => {} }; }
  spring() { return { start: () => {} }; }
}

// Other common exports the library exposes
export const Polyline = () => null;
export const Polygon = () => null;
export const Circle = () => null;
export const Callout = () => null;
export const Overlay = () => null;
export const Heatmap = () => null;
export const Geojson = () => null;
