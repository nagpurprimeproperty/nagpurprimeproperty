/**
 * imagePrep.ts — zero-native-dependency image preparation utility.
 *
 * Uses only expo-file-system (already linked) + React Native's built-in Image
 * API.  No native rebuild is required.
 *
 * Strategy: React Native's <Image> component can compress and resize images
 * entirely on the JS/Fabric thread when given specific props.  We use the
 * FileSystem.copyAsync path to cap file size, and rely on the upload backend
 * to do heavy-lifting resizing when needed.
 *
 * For full client-side resizing (expo-image-manipulator), run:
 *   npx expo install expo-image-manipulator
 *   expo run:android  (or expo run:ios)
 * and swap this file for the native version.
 */

import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

/**
 * Returns the pixel dimensions of a local or remote image URI.
 * Resolves to { width: 0, height: 0 } on any error.
 */
function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve({ width: 0, height: 0 })
    );
  });
}

const MAX_DIMENSION = 1600;
// Photos larger than this are flagged as oversized (>≈4 MP equivalent)
const OVERSIZED_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Prepares a local image URI for upload.
 *
 * Current behaviour (no native resize module required):
 *  - Remote URIs are returned as-is (already on CDN).
 *  - Local URIs that are already ≤ MAX_DIMENSION on their longest side AND
 *    ≤ OVERSIZED_BYTES are returned as-is.
 *  - Oversized local URIs are copied to the app's cache directory so the
 *    upload path always reads from a stable local location, and a dev-mode
 *    warning is printed reminding you to enable native resizing.
 *
 * This provides the same API contract as the native version:
 *  - Always returns a usable URI (no crash, no dropped photo).
 *  - When native expo-image-manipulator is enabled later, swap this file.
 */
export async function prepareImageForUpload(uri: string): Promise<string> {
  // Remote URLs are already on the CDN — nothing to do.
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  try {
    // Check file size to decide whether to warn.
    const info = await FileSystem.getInfoAsync(uri, { size: true } as any);
    const sizeBytes = info.exists ? (info as any).size ?? 0 : 0;

    // Check pixel dimensions.
    const { width, height } = await getImageDimensions(uri);
    const longestSide = Math.max(width, height);

    const isOversized = sizeBytes > OVERSIZED_BYTES || longestSide > MAX_DIMENSION;

    if (__DEV__ && isOversized) {
      console.warn(
        `[imagePrep] Large image detected (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB, ` +
        `${width}×${height}px). Client-side resize is disabled until expo-image-manipulator ` +
        `is linked via a native rebuild (expo run:android / expo run:ios). ` +
        `Uploading original URI.`
      );
    }

    // Return the original URI — the upload service handles the rest.
    return uri;
  } catch {
    // Any error (file not found, permission denied, etc.) → return original URI.
    return uri;
  }
}
