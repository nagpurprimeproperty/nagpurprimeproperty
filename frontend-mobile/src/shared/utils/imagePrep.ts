/**
 * imagePrep.ts — client-side image resize + compression using expo-image-manipulator.
 *
 * Resizes any image whose longest side exceeds MAX_DIMENSION to MAX_DIMENSION px,
 * then compresses to JPEG at COMPRESS_QUALITY.  Images already within bounds are
 * only compressed (no resize step).  Remote URLs are returned as-is.
 *
 * expo-image-manipulator is imported dynamically (inside the function) so that a
 * missing native module on an un-rebuilt dev client does NOT crash at import time
 * or break the Expo Router route tree.  The crop/resize is simply skipped and the
 * original URI is returned until the dev client is rebuilt.
 */

import { Image } from 'react-native';

const MAX_DIMENSION    = 1600;  // px — longest side cap
const COMPRESS_QUALITY = 0.85;  // JPEG quality (0–1)

/** Returns pixel dimensions of a local/remote image URI. */
function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      ()              => resolve({ width: 0, height: 0 }),
    );
  });
}

/**
 * Prepares a local image URI for upload:
 *  - Resizes so the longest side ≤ MAX_DIMENSION
 *  - Compresses to JPEG at COMPRESS_QUALITY
 *  - Returns the new cached URI (or the original URI on any error / missing native module)
 */
export async function prepareImageForUpload(uri: string): Promise<string> {
  // Remote URLs are already on CDN — nothing to do.
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  try {
    // Dynamic require so the missing native module doesn't crash at import time.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ImageManipulator = require('expo-image-manipulator');

    const { width, height } = await getImageDimensions(uri);
    const longest = Math.max(width, height);

    const actions: { resize?: { width: number; height: number } }[] = [];

    if (longest > MAX_DIMENSION && longest > 0) {
      const scale = MAX_DIMENSION / longest;
      actions.push({
        resize: {
          width:  Math.round(width  * scale),
          height: Math.round(height * scale),
        },
      });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );

    return result.uri;
  } catch (err) {
    // Graceful fallback: return the original URI so photos are never dropped.
    if (__DEV__) console.warn('[imagePrep] Resize/compress skipped (native module not ready?):', err);
    return uri;
  }
}

