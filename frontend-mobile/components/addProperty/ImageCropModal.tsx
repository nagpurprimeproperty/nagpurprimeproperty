/**
 * ImageCropModal — smooth, native-thread crop UI
 *
 * Uses react-native-gesture-handler (Gesture.Pan) + react-native-reanimated
 * (useSharedValue / useAnimatedStyle) so all resize/move logic runs on the
 * UI thread via worklets — zero JS-bridge latency, true 60/120 fps.
 *
 * Key design decisions:
 *  - expo-image-manipulator is used to NORMALISE the image on open:
 *    this bakes EXIF rotation into the pixel data (critical for Android gallery
 *    photos which carry EXIF orientation flags).  Without this step,
 *    expo-image honours the flag and displays a portrait photo correctly, but
 *    RNImage.getSize returns the raw (landscape) dimensions, causing the
 *    display-rect and crop coordinates to be in the wrong space.
 *  - The normalised URI (and its pixel-accurate dimensions from the manipulator)
 *    are used for display, display-rect calculation, AND the final crop.
 *    All three are guaranteed to share the same coordinate space.
 *  - 9 dedicated Pan gestures (tl, tr, bl, br, l, r, t, b, move).
 *    Each attaches to its own invisible hit-target Animated.View.
 *  - All shared values are read inside UI-thread worklets — no JS-bridge round
 *    trips during gesture handling.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Crop } from "lucide-react-native";
import colors from "@/theme/colors";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

// ── Types ─────────────────────────────────────────────────────────────────────

type AspectRatioMode = "free" | "4:3" | "16:9" | "1:1";

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DisplayRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Props {
  visible: boolean;
  uri: string;
  onCrop: (croppedUri: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Visible corner arm length (px) */
const CORNER_ARM = 24;
/** Corner handle stroke thickness (px) */
const CORNER_THK = 4;
/** Touch target radius around a corner (px) — generous for fingertip */
const CORNER_HIT = 44;
/** Visible side-handle bar length (px) */
const EDGE_BAR = 36;
/** Side-handle stroke thickness (px) */
const EDGE_THK = 5;
/** Touch band for side edges (px) */
const EDGE_HIT = 38;
/** Minimum crop box dimension (px) */
const MIN_BOX = 60;
/** Initial box inset as a fraction of the display rect */
const INIT_MARGIN = 0.08;

const RATIOS: Record<AspectRatioMode, number | null> = {
  free: null,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "1:1": 1,
};

const RATIO_LABELS: AspectRatioMode[] = ["free", "4:3", "16:9", "1:1"];

// ── Pure helpers ──────────────────────────────────────────────────────────────

function clampJS(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function calcDisplayRect(
  cW: number,
  cH: number,
  nW: number,
  nH: number
): DisplayRect {
  if (nW === 0 || nH === 0) return { x: 0, y: 0, width: cW, height: cH };
  const nAsp = nW / nH;
  const cAsp = cW / cH;
  if (nAsp > cAsp) {
    const dH = cW / nAsp;
    return { x: 0, y: (cH - dH) / 2, width: cW, height: dH };
  }
  const dW = cH * nAsp;
  return { x: (cW - dW) / 2, y: 0, width: dW, height: cH };
}

function initialBox(rect: DisplayRect): CropBox {
  return {
    x: rect.x + rect.width * INIT_MARGIN,
    y: rect.y + rect.height * INIT_MARGIN,
    w: rect.width * (1 - 2 * INIT_MARGIN),
    h: rect.height * (1 - 2 * INIT_MARGIN),
  };
}

function applyRatio(
  box: CropBox,
  ratio: number | null,
  rect: DisplayRect
): CropBox {
  if (ratio === null) return box;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  let nW = box.w;
  let nH = nW / ratio;
  if (nH > rect.height * 0.9) {
    nH = rect.height * 0.9;
    nW = nH * ratio;
  }
  if (nW > rect.width * 0.9) {
    nW = rect.width * 0.9;
    nH = nW / ratio;
  }
  const nx = clampJS(cx - nW / 2, rect.x, rect.x + rect.width - nW);
  const ny = clampJS(cy - nH / 2, rect.y, rect.y + rect.height - nH);
  return { x: nx, y: ny, w: nW, h: nH };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImageCropModal({
  visible,
  uri,
  onCrop,
  onSkip,
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();

  // ── React state ────────────────────────────────────────────────────────────
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [displayRect, setDisplayRect] = useState<DisplayRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("free");
  const [isCropping, setIsCropping] = useState(false);
  const [isReady, setIsReady] = useState(false);

  /**
   * normalizedUri  — the URI we pass to expo-image-manipulator for the final
   *                  crop.  Set from a no-op manipulate() call on open so that
   *                  EXIF rotation is baked into the pixel data.
   * normalizedSize — pixel dimensions as seen by expo-image-manipulator after
   *                  EXIF normalisation; guaranteed to match what crop() uses.
   */
  const [normalizedUri,  setNormalizedUri]  = useState<string | null>(null);
  const [normalizedSize, setNormalizedSize] = useState({ width: 0, height: 0 });

  // Stable refs (read in handleCrop, no stale-closure risk)
  const displayRectRef   = useRef<DisplayRect>({ x: 0, y: 0, width: 0, height: 0 });
  const normalizedUriRef = useRef<string | null>(null);
  const normalizedSizeRef = useRef({ width: 0, height: 0 });
  const containerRef     = useRef({ width: 0, height: 0 });

  // ── Shared values — live crop box on UI thread ─────────────────────────────
  const boxX = useSharedValue(0);
  const boxY = useSharedValue(0);
  const boxW = useSharedValue(200);
  const boxH = useSharedValue(200);

  // Rect bounds shared with UI thread (updated synchronously on JS thread)
  const rectX = useSharedValue(0);
  const rectY = useSharedValue(0);
  const rectW = useSharedValue(1);
  const rectH = useSharedValue(1);
  // Aspect ratio as number | 0 for free (0 means free)
  const ratioSV = useSharedValue(0);

  // Gesture start snapshots
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startW = useSharedValue(0);
  const startH = useSharedValue(0);

  // ── Normalise image on open ────────────────────────────────────────────────
  //
  // Problem: expo-image displays gallery photos correctly by reading the EXIF
  // orientation flag.  On Android, RNImage.getSize() returns the RAW pixel
  // dimensions (before EXIF rotation), so the display rect and crop coords
  // end up in the wrong coordinate space — producing "wrong corner" crops.
  //
  // Fix: run a no-op ImageManipulator pass which bakes the EXIF rotation into
  // the pixel data and returns correct width/height.  We then use:
  //   • normalizedUri  — shown in the expo-image view (correct orientation)
  //   • normalizedSize — for display-rect calculation and crop scaling
  //   • normalizedUri  — passed to ImageManipulator.crop() (same pixel space)
  //
  // All three are now guaranteed to share the same coordinate space.
  useEffect(() => {
    if (!visible || !uri) return;

    // Reset everything
    setIsReady(false);
    setNormalizedUri(null);
    normalizedUriRef.current = null;
    setNormalizedSize({ width: 0, height: 0 });
    normalizedSizeRef.current = { width: 0, height: 0 };
    setAspectRatio("free");
    ratioSV.value = 0;

    let cancelled = false;

    (async () => {
      try {
        // Render with no transforms — this normalises EXIF orientation and
        // gives us pixel dimensions consistent with what crop() will use.
        const ctx      = ImageManipulator.manipulate(uri);
        const imageRef = await ctx.renderAsync();
        const normW    = imageRef.width;
        const normH    = imageRef.height;

        // Save the normalised copy so expo-image displays it correctly AND
        // expo-image-manipulator.crop() can reference the same pixel data.
        const saved    = await imageRef.saveAsync({
          format:   SaveFormat.JPEG,
          compress: 1.0, // lossless intermediate — final compress happens at crop
        });

        if (cancelled) return;

        normalizedUriRef.current  = saved.uri;
        normalizedSizeRef.current = { width: normW, height: normH };
        setNormalizedUri(saved.uri);
        setNormalizedSize({ width: normW, height: normH });
      } catch (err) {
        if (__DEV__) console.warn("[ImageCropModal] EXIF normalisation failed, using original URI:", err);
        if (cancelled) return;
        // Graceful fallback: use original URI + dimensions from header
        normalizedUriRef.current  = uri;
        setNormalizedUri(uri);
        // Attempt to get dimensions from the original
        // (may still be wrong on some Android devices, but best we can do)
        try {
          const ctx      = ImageManipulator.manipulate(uri);
          const imageRef = await ctx.renderAsync();
          const fallW    = imageRef.width;
          const fallH    = imageRef.height;
          if (!cancelled) {
            normalizedSizeRef.current = { width: fallW, height: fallH };
            setNormalizedSize({ width: fallW, height: fallH });
          }
        } catch {
          if (!cancelled) {
            normalizedSizeRef.current = { width: 0, height: 0 };
            setNormalizedSize({ width: 0, height: 0 });
          }
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, uri]);

  // ── Recalculate display rect + place initial crop box ─────────────────────
  useEffect(() => {
    if (
      containerSize.width === 0 ||
      normalizedSize.width === 0 ||
      normalizedSize.height === 0 ||
      !visible
    ) return;

    const rect = calcDisplayRect(
      containerSize.width,
      containerSize.height,
      normalizedSize.width,
      normalizedSize.height,
    );

    displayRectRef.current = rect;
    setDisplayRect(rect);

    // Push rect bounds to UI thread shared values
    rectX.value = rect.x;
    rectY.value = rect.y;
    rectW.value = rect.width;
    rectH.value = rect.height;

    const box = initialBox(rect);

    // Set crop box immediately (no animation) so isReady is accurate.
    // A withTiming animation would create a race: isReady becomes true before
    // the animation completes, letting the user crop with intermediate values.
    boxX.value = box.x;
    boxY.value = box.y;
    boxW.value = box.w;
    boxH.value = box.h;

    setIsReady(true);
  }, [containerSize, normalizedSize, visible]);

  // ── Aspect ratio toggle ────────────────────────────────────────────────────
  const handleAspectRatioChange = useCallback(
    (mode: AspectRatioMode) => {
      setAspectRatio(mode);
      const r = RATIOS[mode];
      ratioSV.value = r ?? 0;

      const currentBox: CropBox = {
        x: boxX.value,
        y: boxY.value,
        w: boxW.value,
        h: boxH.value,
      };
      const newBox = applyRatio(currentBox, r, displayRectRef.current);
      boxX.value = newBox.x;
      boxY.value = newBox.y;
      boxW.value = newBox.w;
      boxH.value = newBox.h;
    },
    [boxX, boxY, boxW, boxH, ratioSV]
  );

  // ── Worklet helpers ────────────────────────────────────────────────────────

  const snapshotStart = () => {
    "worklet";
    startX.value = boxX.value;
    startY.value = boxY.value;
    startW.value = boxW.value;
    startH.value = boxH.value;
  };

  /**
   * Clamp and write box into shared values — runs on UI thread.
   * ratioSV == 0 means "free" (no ratio enforcement).
   */
  const applyBox = (x: number, y: number, w: number, h: number) => {
    "worklet";
    // Enforce aspect ratio if set
    const ratio = ratioSV.value;
    if (ratio !== 0) {
      h = w / ratio;
    }
    // Enforce minimum size
    w = Math.max(w, MIN_BOX);
    h = Math.max(h, MIN_BOX);
    if (ratio !== 0) {
      // Re-derive after MIN_BOX clamping
      if (w < MIN_BOX) { w = MIN_BOX; h = w / ratio; }
      if (h < MIN_BOX) { h = MIN_BOX; w = h * ratio; }
    }
    // Clamp to display rect
    const rx = rectX.value;
    const ry = rectY.value;
    const rw = rectW.value;
    const rh = rectH.value;
    x = Math.min(Math.max(x, rx), rx + rw - w);
    y = Math.min(Math.max(y, ry), ry + rh - h);
    w = Math.min(w, rx + rw - x);
    h = Math.min(h, ry + rh - y);
    boxX.value = x;
    boxY.value = y;
    boxW.value = w;
    boxH.value = h;
  };

  // ── Individual Pan gestures for each handle ────────────────────────────────

  const gestureTL = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nW = Math.max(startW.value - e.translationX, MIN_BOX);
      const nH = Math.max(startH.value - e.translationY, MIN_BOX);
      const nx = startX.value + startW.value - nW;
      const ny = startY.value + startH.value - nH;
      applyBox(nx, ny, nW, nH);
    });

  const gestureTR = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nW = Math.max(startW.value + e.translationX, MIN_BOX);
      const nH = Math.max(startH.value - e.translationY, MIN_BOX);
      const ny = startY.value + startH.value - nH;
      applyBox(startX.value, ny, nW, nH);
    });

  const gestureBL = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nW = Math.max(startW.value - e.translationX, MIN_BOX);
      const nH = Math.max(startH.value + e.translationY, MIN_BOX);
      const nx = startX.value + startW.value - nW;
      applyBox(nx, startY.value, nW, nH);
    });

  const gestureBR = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nW = Math.max(startW.value + e.translationX, MIN_BOX);
      const nH = Math.max(startH.value + e.translationY, MIN_BOX);
      applyBox(startX.value, startY.value, nW, nH);
    });

  const gestureL = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nW = Math.max(startW.value - e.translationX, MIN_BOX);
      const nx = startX.value + startW.value - nW;
      applyBox(nx, startY.value, nW, startH.value);
    });

  const gestureR = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nW = Math.max(startW.value + e.translationX, MIN_BOX);
      applyBox(startX.value, startY.value, nW, startH.value);
    });

  const gestureT = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nH = Math.max(startH.value - e.translationY, MIN_BOX);
      const ny = startY.value + startH.value - nH;
      applyBox(startX.value, ny, startW.value, nH);
    });

  const gestureB = Gesture.Pan()
    .minDistance(0)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const nH = Math.max(startH.value + e.translationY, MIN_BOX);
      applyBox(startX.value, startY.value, startW.value, nH);
    });

  const gestureMove = Gesture.Pan()
    .minDistance(2)
    .onBegin(snapshotStart)
    .onUpdate((e) => {
      "worklet";
      const rx = rectX.value;
      const ry = rectY.value;
      const rw = rectW.value;
      const rh = rectH.value;
      const nx = Math.min(Math.max(startX.value + e.translationX, rx), rx + rw - boxW.value);
      const ny = Math.min(Math.max(startY.value + e.translationY, ry), ry + rh - boxH.value);
      boxX.value = nx;
      boxY.value = ny;
    });

  // ── Animated styles ────────────────────────────────────────────────────────

  const cropBorderStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left:   boxX.value,
    top:    boxY.value,
    width:  boxW.value,
    height: boxH.value,
  }));

  const overlayTopStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left:     rectX.value,
    top:      rectY.value,
    width:    rectW.value,
    height:   Math.max(0, boxY.value - rectY.value),
    backgroundColor: "rgba(0,0,0,0.62)",
  }));

  const overlayBotStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left:     rectX.value,
    top:      boxY.value + boxH.value,
    width:    rectW.value,
    height:   Math.max(0, rectY.value + rectH.value - boxY.value - boxH.value),
    backgroundColor: "rgba(0,0,0,0.62)",
  }));

  const overlayLftStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left:     rectX.value,
    top:      boxY.value,
    width:    Math.max(0, boxX.value - rectX.value),
    height:   boxH.value,
    backgroundColor: "rgba(0,0,0,0.62)",
  }));

  const overlayRgtStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left:     boxX.value + boxW.value,
    top:      boxY.value,
    width:    Math.max(0, rectX.value + rectW.value - boxX.value - boxW.value),
    height:   boxH.value,
    backgroundColor: "rgba(0,0,0,0.62)",
  }));

  // Corner visual handles (pointer-events: none)
  const cornerTLStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value - 1,                           top: boxY.value - 1 }));
  const cornerTRStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value - CORNER_ARM + 1, top: boxY.value - 1 }));
  const cornerBLStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value - 1,                           top: boxY.value + boxH.value - CORNER_ARM + 1 }));
  const cornerBRStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value - CORNER_ARM + 1, top: boxY.value + boxH.value - CORNER_ARM + 1 }));

  // Edge visual handles (Free mode)
  const edgeLStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value - EDGE_THK / 2,              top: boxY.value + boxH.value / 2 - EDGE_BAR / 2, width: EDGE_THK, height: EDGE_BAR, borderRadius: EDGE_THK / 2, backgroundColor: colors.primary }));
  const edgeRStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value - EDGE_THK / 2, top: boxY.value + boxH.value / 2 - EDGE_BAR / 2, width: EDGE_THK, height: EDGE_BAR, borderRadius: EDGE_THK / 2, backgroundColor: colors.primary }));
  const edgeTStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value / 2 - EDGE_BAR / 2, top: boxY.value - EDGE_THK / 2,              width: EDGE_BAR, height: EDGE_THK, borderRadius: EDGE_THK / 2, backgroundColor: colors.primary }));
  const edgeBStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value / 2 - EDGE_BAR / 2, top: boxY.value + boxH.value - EDGE_THK / 2, width: EDGE_BAR, height: EDGE_THK, borderRadius: EDGE_THK / 2, backgroundColor: colors.primary }));

  // Invisible hit-target styles — corners (square, centred on the corner point)
  const hitTLStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value - CORNER_HIT / 2,                top: boxY.value - CORNER_HIT / 2,                width: CORNER_HIT, height: CORNER_HIT }));
  const hitTRStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value - CORNER_HIT / 2,   top: boxY.value - CORNER_HIT / 2,                width: CORNER_HIT, height: CORNER_HIT }));
  const hitBLStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value - CORNER_HIT / 2,                top: boxY.value + boxH.value - CORNER_HIT / 2,   width: CORNER_HIT, height: CORNER_HIT }));
  const hitBRStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value - CORNER_HIT / 2,   top: boxY.value + boxH.value - CORNER_HIT / 2,   width: CORNER_HIT, height: CORNER_HIT }));

  // Edge hit strips (excludes corner zones to prevent conflict)
  const hitLStyle    = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value - EDGE_HIT / 2,                top: boxY.value + CORNER_HIT / 2,                width: EDGE_HIT, height: Math.max(0, boxH.value - CORNER_HIT) }));
  const hitRStyle    = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + boxW.value - EDGE_HIT / 2,   top: boxY.value + CORNER_HIT / 2,                width: EDGE_HIT, height: Math.max(0, boxH.value - CORNER_HIT) }));
  const hitTStyle    = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + CORNER_HIT / 2,              top: boxY.value - EDGE_HIT / 2,                  width: Math.max(0, boxW.value - CORNER_HIT), height: EDGE_HIT }));
  const hitBStyle    = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + CORNER_HIT / 2,              top: boxY.value + boxH.value - EDGE_HIT / 2,     width: Math.max(0, boxW.value - CORNER_HIT), height: EDGE_HIT }));
  const hitMoveStyle = useAnimatedStyle(() => ({ position: "absolute", left: boxX.value + CORNER_HIT / 2,              top: boxY.value + CORNER_HIT / 2,                width: Math.max(0, boxW.value - CORNER_HIT), height: Math.max(0, boxH.value - CORNER_HIT) }));

  // ── Crop action ────────────────────────────────────────────────────────────
  const handleCrop = useCallback(async () => {
    if (isCropping || !isReady) return;
    setIsCropping(true);
    try {
      const rect    = displayRectRef.current;
      const normUri = normalizedUriRef.current;
      const ns      = normalizedSizeRef.current;

      const bx = boxX.value;
      const by = boxY.value;
      const bw = boxW.value;
      const bh = boxH.value;

      if (!normUri || rect.width === 0 || rect.height === 0 || ns.width === 0 || ns.height === 0) {
        onSkip();
        return;
      }

      // Scale from display-rect logical coords → normalised image pixel coords.
      // Both use the SAME coordinate space because:
      //   • rect       is computed from normalizedSize (pixels from manipulator)
      //   • ns.width/h are the normalised pixel dimensions
      //   • the crop is applied to normUri (the same normalised image)
      const scaleX  = ns.width  / rect.width;
      const scaleY  = ns.height / rect.height;
      const originX = Math.max(0, Math.round((bx - rect.x) * scaleX));
      const originY = Math.max(0, Math.round((by - rect.y) * scaleY));
      const cropW   = Math.min(Math.max(Math.round(bw * scaleX), 1), ns.width  - originX);
      const cropH   = Math.min(Math.max(Math.round(bh * scaleY), 1), ns.height - originY);

      if (originX >= ns.width || originY >= ns.height || cropW <= 0 || cropH <= 0) {
        if (__DEV__)
          console.warn("[ImageCropModal] Crop bounds invalid:", { originX, originY, cropW, cropH, ns });
        onSkip();
        return;
      }

      // Crop the normalised image (EXIF already baked in) — same pixel space ✓
      const ctx      = ImageManipulator.manipulate(normUri);
      ctx.crop({ originX, originY, width: cropW, height: cropH });
      const imageRef = await ctx.renderAsync();
      const saved    = await imageRef.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
      onCrop(saved.uri);
    } catch (err) {
      if (__DEV__) console.warn("[ImageCropModal] Crop failed:", err);
      onSkip();
    } finally {
      setIsCropping(false);
    }
  }, [isCropping, isReady, onCrop, onSkip, boxX, boxY, boxW, boxH]);

  const isFree = aspectRatio === "free";

  // Whether we're still waiting for normalisation to finish
  const isNormalising = normalizedUri === null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onCancel}
    >
      <GestureHandlerRootView style={s.root}>
        <View style={[s.inner, { paddingTop: insets.top }]}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onCancel} style={s.headerIconBtn} activeOpacity={0.7}>
              <X size={22} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Crop Photo</Text>
            <View style={s.headerIconBtn} />
          </View>

          {/* Image + Overlay */}
          <View
            style={s.imageContainer}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setContainerSize({ width, height });
              containerRef.current = { width, height };
            }}
          >
            {/* Loading / normalising spinner */}
            {(!isReady || isNormalising) && (
              <View style={[StyleSheet.absoluteFill, s.loadingCenter]}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
                {isNormalising && (
                  <Text style={s.loadingText}>Preparing image…</Text>
                )}
              </View>
            )}

            {isReady && normalizedUri && (
              <>
                {/* Display the normalised image — EXIF baked in, correct orientation */}
                <Image
                  source={{ uri: normalizedUri }}
                  style={{
                    position: "absolute",
                    left:   displayRect.x,
                    top:    displayRect.y,
                    width:  displayRect.width,
                    height: displayRect.height,
                  }}
                  contentFit="fill"
                  cachePolicy="memory"
                />

                {/* Dark overlays — driven by shared values */}
                <Animated.View pointerEvents="none" style={overlayTopStyle} />
                <Animated.View pointerEvents="none" style={overlayBotStyle} />
                <Animated.View pointerEvents="none" style={overlayLftStyle} />
                <Animated.View pointerEvents="none" style={overlayRgtStyle} />

                {/* Crop box border + rule-of-thirds grid */}
                <Animated.View pointerEvents="none" style={[s.cropBorder, cropBorderStyle]}>
                  <View style={[s.gridLine, s.gridV, { left: "33.33%" }]} />
                  <View style={[s.gridLine, s.gridV, { left: "66.66%" }]} />
                  <View style={[s.gridLine, s.gridH, { top: "33.33%" }]} />
                  <View style={[s.gridLine, s.gridH, { top: "66.66%" }]} />
                </Animated.View>

                {/* Corner handle visuals */}
                <Animated.View pointerEvents="none" style={[s.corner, s.cornerTL, cornerTLStyle]} />
                <Animated.View pointerEvents="none" style={[s.corner, s.cornerTR, cornerTRStyle]} />
                <Animated.View pointerEvents="none" style={[s.corner, s.cornerBL, cornerBLStyle]} />
                <Animated.View pointerEvents="none" style={[s.corner, s.cornerBR, cornerBRStyle]} />

                {/* Edge handle visuals — Free mode only */}
                {isFree && (
                  <>
                    <Animated.View pointerEvents="none" style={edgeLStyle} />
                    <Animated.View pointerEvents="none" style={edgeRStyle} />
                    <Animated.View pointerEvents="none" style={edgeTStyle} />
                    <Animated.View pointerEvents="none" style={edgeBStyle} />
                  </>
                )}

                {/* ── Invisible gesture hit targets ── */}
                {/* Corners always active */}
                <GestureDetector gesture={gestureTL}>
                  <Animated.View style={hitTLStyle} />
                </GestureDetector>
                <GestureDetector gesture={gestureTR}>
                  <Animated.View style={hitTRStyle} />
                </GestureDetector>
                <GestureDetector gesture={gestureBL}>
                  <Animated.View style={hitBLStyle} />
                </GestureDetector>
                <GestureDetector gesture={gestureBR}>
                  <Animated.View style={hitBRStyle} />
                </GestureDetector>

                {/* Edge strips — Free mode only */}
                {isFree && (
                  <>
                    <GestureDetector gesture={gestureL}>
                      <Animated.View style={hitLStyle} />
                    </GestureDetector>
                    <GestureDetector gesture={gestureR}>
                      <Animated.View style={hitRStyle} />
                    </GestureDetector>
                    <GestureDetector gesture={gestureT}>
                      <Animated.View style={hitTStyle} />
                    </GestureDetector>
                    <GestureDetector gesture={gestureB}>
                      <Animated.View style={hitBStyle} />
                    </GestureDetector>
                  </>
                )}

                {/* Interior move */}
                <GestureDetector gesture={gestureMove}>
                  <Animated.View style={hitMoveStyle} />
                </GestureDetector>
              </>
            )}
          </View>

          {/* Aspect Ratio Buttons */}
          <View style={s.ratioRow}>
            {RATIO_LABELS.map((mode) => {
              const active = aspectRatio === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleAspectRatioChange(mode)}
                  activeOpacity={0.75}
                  disabled={!isReady}
                  style={[s.ratioBtn, active && s.ratioBtnActive]}
                >
                  <Text style={[s.ratioBtnText, active && s.ratioBtnTextActive]}>
                    {mode === "free" ? "FREE" : mode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hint text shown only in free mode */}
          {isFree && (
            <View style={s.hintRow}>
              <Text style={s.hintText}>Drag corners or edges to resize freely</Text>
            </View>
          )}

          {/* Skip / Crop actions */}
          <View style={[s.bottomRow, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity
              onPress={onSkip}
              activeOpacity={0.75}
              disabled={isCropping}
              style={s.skipBtn}
            >
              <Text style={s.skipBtnText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCrop}
              activeOpacity={0.85}
              disabled={isCropping || !isReady || isNormalising}
              style={[s.cropBtn, (!isReady || isCropping || isNormalising) && { opacity: 0.6 }]}
            >
              {isCropping ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Crop size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={s.cropBtnText}>Crop &amp; Use</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:               { flex: 1, backgroundColor: "#111" },
  inner:              { flex: 1 },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  headerIconBtn:      { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle:        { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  imageContainer:     { flex: 1, backgroundColor: "#000", overflow: "hidden" },
  loadingCenter:      { alignItems: "center", justifyContent: "center" },
  loadingText:        { color: "#aaa", fontSize: 13, fontWeight: "600", marginTop: 12 },
  cropBorder:         { borderWidth: 1.5, borderColor: "rgba(255,255,255,0.85)" },
  gridLine:           { position: "absolute", backgroundColor: "rgba(255,255,255,0.22)" },
  gridV:              { width: 1, top: 0, bottom: 0 },
  gridH:              { height: 1, left: 0, right: 0 },
  // Corner handles
  corner:             { position: "absolute", width: CORNER_ARM, height: CORNER_ARM },
  cornerTL:           { borderTopWidth: CORNER_THK, borderLeftWidth:   CORNER_THK, borderColor: colors.primary },
  cornerTR:           { borderTopWidth: CORNER_THK, borderRightWidth:  CORNER_THK, borderColor: colors.primary },
  cornerBL:           { borderBottomWidth: CORNER_THK, borderLeftWidth:  CORNER_THK, borderColor: colors.primary },
  cornerBR:           { borderBottomWidth: CORNER_THK, borderRightWidth: CORNER_THK, borderColor: colors.primary },
  // Ratio bar
  ratioRow:           { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "#1C1C1C" },
  ratioBtn:           { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#3A3A3A" },
  ratioBtnActive:     { borderColor: colors.primary, backgroundColor: "rgba(249,115,22,0.15)" },
  ratioBtnText:       { color: "#888", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  ratioBtnTextActive: { color: colors.primary },
  // Hint
  hintRow:            { alignItems: "center", paddingVertical: 6, backgroundColor: "#1C1C1C" },
  hintText:           { color: "#666", fontSize: 11, fontWeight: "600" },
  // Bottom bar
  bottomRow:          { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 14, backgroundColor: "#1C1C1C" },
  skipBtn:            { flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: "#3A3A3A", alignItems: "center", justifyContent: "center" },
  skipBtnText:        { color: "#ccc", fontSize: 13, fontWeight: "800" },
  cropBtn:            { flex: 2, height: 52, borderRadius: 14, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  cropBtnText:        { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 0.3 },
});
