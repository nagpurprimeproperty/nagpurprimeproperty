import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  StyleSheet,
  Image as RNImage,
} from 'react-native';
import { Image } from 'expo-image';
// expo-image-manipulator is required dynamically inside handleCrop so that a
// missing native module (un-rebuilt dev client) does not crash at import time
// and break the Expo Router route tree.
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Crop } from 'lucide-react-native';
import colors from '@/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────

type AspectRatioMode = 'free' | '4:3' | '16:9' | '1:1';
type GestureMode = 'move' | 'tl' | 'tr' | 'bl' | 'br' | null;

interface CropBox {
  x: number; // left edge in container coords
  y: number; // top edge in container coords
  w: number; // width in container coords
  h: number; // height in container coords
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

const HANDLE_HIT  = 38; // px — corner touch target radius
const CORNER_ARM  = 22; // px — visible corner handle arm
const CORNER_THK  = 3;  // px — corner handle thickness
const MIN_BOX     = 60; // px — minimum crop dimension
const INIT_MARGIN = 0.08; // 8 % margin → 84 % initial box

const RATIOS: Record<AspectRatioMode, number | null> = {
  free: null,
  '4:3':  4 / 3,
  '16:9': 16 / 9,
  '1:1':  1,
};

const RATIO_LABELS: AspectRatioMode[] = ['free', '4:3', '16:9', '1:1'];

// ── Pure helpers ──────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function calcDisplayRect(
  cW: number, cH: number, nW: number, nH: number,
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
    x: rect.x + rect.width  * INIT_MARGIN,
    y: rect.y + rect.height * INIT_MARGIN,
    w: rect.width  * (1 - 2 * INIT_MARGIN),
    h: rect.height * (1 - 2 * INIT_MARGIN),
  };
}

function applyRatio(
  box: CropBox, ratio: number | null, rect: DisplayRect,
): CropBox {
  if (ratio === null) return box;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  let nW = box.w;
  let nH = nW / ratio;
  if (nH > rect.height * 0.9) { nH = rect.height * 0.9; nW = nH * ratio; }
  if (nW > rect.width  * 0.9) { nW = rect.width  * 0.9; nH = nW / ratio; }
  const nx = clamp(cx - nW / 2, rect.x, rect.x + rect.width  - nW);
  const ny = clamp(cy - nH / 2, rect.y, rect.y + rect.height - nH);
  return { x: nx, y: ny, w: nW, h: nH };
}

function clampBox(box: CropBox, rect: DisplayRect): CropBox {
  let { x, y, w, h } = box;
  w = Math.max(w, MIN_BOX);
  h = Math.max(h, MIN_BOX);
  x = clamp(x, rect.x, rect.x + rect.width  - w);
  y = clamp(y, rect.y, rect.y + rect.height - h);
  w = Math.min(w, rect.x + rect.width  - x);
  h = Math.min(h, rect.y + rect.height - y);
  return { x, y, w, h };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImageCropModal({
  visible, uri, onCrop, onSkip, onCancel,
}: Props) {
  const insets = useSafeAreaInsets();

  // ── State ──────────────────────────────────────────────────────────────────
  const [containerSize,   setContainerSize]   = useState({ width: 0, height: 0 });
  const [nativeSize,      setNativeSize]      = useState({ width: 0, height: 0 });
  const [nativeSizeReady, setNativeSizeReady] = useState(false);
  const [displayRect,     setDisplayRect]     = useState<DisplayRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [cropBox,         setCropBox]         = useState<CropBox>({ x: 0, y: 0, w: 200, h: 200 });
  const [aspectRatio,     setAspectRatio]     = useState<AspectRatioMode>('free');
  const [isCropping,      setIsCropping]      = useState(false);
  const [isReady,         setIsReady]         = useState(false);

  // ── Refs (stable references inside PanResponder) ───────────────────────────
  const cropBoxRef      = useRef<CropBox>({ x: 0, y: 0, w: 200, h: 200 });
  const displayRectRef  = useRef<DisplayRect>({ x: 0, y: 0, width: 0, height: 0 });
  const gestureModeRef  = useRef<GestureMode>(null);
  const gestureStartRef = useRef<CropBox | null>(null);
  const aspectRatioRef  = useRef<AspectRatioMode>('free');

  // ── Get native image dimensions when modal opens ───────────────────────────
  useEffect(() => {
    if (!visible || !uri) return;
    setIsReady(false);
    setNativeSizeReady(false);
    setAspectRatio('free');
    aspectRatioRef.current = 'free';

    RNImage.getSize(
      uri,
      (w, h) => { setNativeSize({ width: w, height: h }); setNativeSizeReady(true); },
      ()      => { setNativeSize({ width: 0, height: 0 }); setNativeSizeReady(true); },
    );
  }, [visible, uri]);

  // ── Recalculate display rect + initial crop box ────────────────────────────
  useEffect(() => {
    if (containerSize.width === 0 || !nativeSizeReady || !visible) return;

    const fallW = nativeSize.width  || containerSize.width;
    const fallH = nativeSize.height || containerSize.height;
    const rect  = calcDisplayRect(containerSize.width, containerSize.height, fallW, fallH);

    displayRectRef.current = rect;
    setDisplayRect(rect);

    const box = initialBox(rect);
    cropBoxRef.current = box;
    setCropBox(box);
    setIsReady(true);
  }, [containerSize, nativeSize, nativeSizeReady, visible]);

  // ── Aspect ratio toggle ────────────────────────────────────────────────────
  const handleAspectRatioChange = useCallback((mode: AspectRatioMode) => {
    setAspectRatio(mode);
    aspectRatioRef.current = mode;
    const newBox = applyRatio(cropBoxRef.current, RATIOS[mode], displayRectRef.current);
    cropBoxRef.current = newBox;
    setCropBox(newBox);
  }, []);

  // ── PanResponder (created once; all live state read via refs) ─────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const { locationX: lx, locationY: ly } = evt.nativeEvent;
        const { x, y, w, h } = cropBoxRef.current;
        const HS = HANDLE_HIT;
        return (
          lx >= x - HS / 2 && lx <= x + w + HS / 2 &&
          ly >= y - HS / 2 && ly <= y + h + HS / 2
        );
      },
      onMoveShouldSetPanResponder: () => gestureModeRef.current !== null,

      onPanResponderGrant: (evt) => {
        const { locationX: lx, locationY: ly } = evt.nativeEvent;
        const { x, y, w, h } = cropBoxRef.current;
        const HS = HANDLE_HIT;
        let mode: GestureMode = null;

        if      (lx <= x + HS      && ly <= y + HS)       mode = 'tl';
        else if (lx >= x + w - HS  && ly <= y + HS)       mode = 'tr';
        else if (lx <= x + HS      && ly >= y + h - HS)   mode = 'bl';
        else if (lx >= x + w - HS  && ly >= y + h - HS)   mode = 'br';
        else if (lx >= x && lx <= x + w && ly >= y && ly <= y + h) mode = 'move';

        gestureModeRef.current  = mode;
        gestureStartRef.current = { ...cropBoxRef.current };
      },

      onPanResponderMove: (_, gs) => {
        const mode  = gestureModeRef.current;
        const start = gestureStartRef.current;
        if (!mode || !start) return;

        const { dx, dy } = gs;
        const rect  = displayRectRef.current;
        const ratio = RATIOS[aspectRatioRef.current];
        let { x, y, w, h } = start;

        switch (mode) {
          case 'move':
            x = clamp(x + dx, rect.x, rect.x + rect.width  - w);
            y = clamp(y + dy, rect.y, rect.y + rect.height - h);
            break;
          case 'br':
            w = Math.max(w + dx, MIN_BOX);
            h = ratio !== null ? w / ratio : Math.max(h + dy, MIN_BOX);
            break;
          case 'bl': {
            const nW = Math.max(w - dx, MIN_BOX);
            x = start.x + start.w - nW; w = nW;
            h = ratio !== null ? nW / ratio : Math.max(h + dy, MIN_BOX);
            break;
          }
          case 'tr': {
            w = Math.max(w + dx, MIN_BOX);
            const nH = ratio !== null ? w / ratio : Math.max(h - dy, MIN_BOX);
            y = start.y + start.h - nH; h = nH;
            break;
          }
          case 'tl': {
            const nW = Math.max(w - dx, MIN_BOX);
            x = start.x + start.w - nW; w = nW;
            const nH = ratio !== null ? nW / ratio : Math.max(h - dy, MIN_BOX);
            y = start.y + start.h - nH; h = nH;
            break;
          }
        }

        const newBox = clampBox({ x, y, w, h }, rect);
        cropBoxRef.current = newBox;
        setCropBox({ ...newBox });
      },

      onPanResponderRelease:   () => { gestureModeRef.current = null; gestureStartRef.current = null; },
      onPanResponderTerminate: () => { gestureModeRef.current = null; gestureStartRef.current = null; },
    })
  ).current;

  // ── Crop action ───────────────────────────────────────────────────────────
  const handleCrop = useCallback(async () => {
    if (isCropping || !isReady) return;
    setIsCropping(true);
    try {
      const rect = displayRectRef.current;
      const box  = cropBoxRef.current;
      const imgW = nativeSize.width  || containerSize.width;
      const imgH = nativeSize.height || containerSize.height;

      if (rect.width === 0 || rect.height === 0) { onSkip(); return; }

      const scaleX = imgW / rect.width;
      const scaleY = imgH / rect.height;

      const originX = Math.max(0, Math.round((box.x - rect.x) * scaleX));
      const originY = Math.max(0, Math.round((box.y - rect.y) * scaleY));
      const cropW   = Math.min(Math.max(Math.round(box.w * scaleX), 1), imgW - originX);
      const cropH   = Math.min(Math.max(Math.round(box.h * scaleY), 1), imgH - originY);

      // Dynamic require — avoids crashing at import time when native module is
      // not yet compiled into the dev client (requires expo run:android rebuild).
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImageManipulator = require('expo-image-manipulator');

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX, originY, width: cropW, height: cropH } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      onCrop(result.uri);
    } catch (err) {
      if (__DEV__) console.warn('[ImageCropModal] Crop failed (native module ready?):', err);
      onSkip();
    } finally {
      setIsCropping(false);
    }
  }, [isCropping, isReady, uri, nativeSize, containerSize, onCrop, onSkip]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onCancel}
    >
      <View style={[s.root, { paddingTop: insets.top }]}>

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
          onLayout={(e) =>
            setContainerSize({
              width:  e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            })
          }
          {...panResponder.panHandlers}
        >
          {!isReady && (
            <ActivityIndicator size="large" color={colors.primary} style={s.loader} />
          )}

          {isReady && (
            <>
              {/* Image at calculated display rect */}
              <Image
                source={{ uri }}
                style={{
                  position: 'absolute',
                  left: displayRect.x, top: displayRect.y,
                  width: displayRect.width, height: displayRect.height,
                }}
                contentFit="fill"
                cachePolicy="memory"
              />

              {/* Dark overlays outside crop area */}
              {/* Top */}
              <View pointerEvents="none" style={[s.overlay, {
                left: displayRect.x, top: displayRect.y,
                width: displayRect.width,
                height: Math.max(0, cropBox.y - displayRect.y),
              }]} />
              {/* Bottom */}
              <View pointerEvents="none" style={[s.overlay, {
                left: displayRect.x, top: cropBox.y + cropBox.h,
                width: displayRect.width,
                height: Math.max(0, displayRect.y + displayRect.height - cropBox.y - cropBox.h),
              }]} />
              {/* Left */}
              <View pointerEvents="none" style={[s.overlay, {
                left: displayRect.x, top: cropBox.y,
                width: Math.max(0, cropBox.x - displayRect.x), height: cropBox.h,
              }]} />
              {/* Right */}
              <View pointerEvents="none" style={[s.overlay, {
                left: cropBox.x + cropBox.w, top: cropBox.y,
                width: Math.max(0, displayRect.x + displayRect.width - cropBox.x - cropBox.w),
                height: cropBox.h,
              }]} />

              {/* Crop box border + rule-of-thirds grid */}
              <View pointerEvents="none" style={[s.cropBorder, {
                left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h,
              }]}>
                <View style={[s.gridLine, s.gridV, { left: '33.33%' }]} />
                <View style={[s.gridLine, s.gridV, { left: '66.66%' }]} />
                <View style={[s.gridLine, s.gridH, { top:  '33.33%' }]} />
                <View style={[s.gridLine, s.gridH, { top:  '66.66%' }]} />
              </View>

              {/* Orange L-shaped corner handles */}
              <View pointerEvents="none" style={[s.corner, s.cornerTL, { left: cropBox.x - 1, top: cropBox.y - 1 }]} />
              <View pointerEvents="none" style={[s.corner, s.cornerTR, { left: cropBox.x + cropBox.w - CORNER_ARM, top: cropBox.y - 1 }]} />
              <View pointerEvents="none" style={[s.corner, s.cornerBL, { left: cropBox.x - 1, top: cropBox.y + cropBox.h - CORNER_ARM }]} />
              <View pointerEvents="none" style={[s.corner, s.cornerBR, { left: cropBox.x + cropBox.w - CORNER_ARM, top: cropBox.y + cropBox.h - CORNER_ARM }]} />
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
                style={[s.ratioBtn, active && s.ratioBtnActive]}
              >
                <Text style={[s.ratioBtnText, active && s.ratioBtnTextActive]}>
                  {mode === 'free' ? 'FREE' : mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Skip / Crop actions */}
        <View style={[s.bottomRow, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.75} disabled={isCropping} style={s.skipBtn}>
            <Text style={s.skipBtnText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCrop}
            activeOpacity={0.85}
            disabled={isCropping || !isReady}
            style={[s.cropBtn, (!isReady || isCropping) && { opacity: 0.6 }]}
          >
            {isCropping
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Crop size={16} color="#fff" strokeWidth={2.5} /><Text style={s.cropBtnText}>Crop &amp; Use</Text></>
            }
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:               { flex: 1, backgroundColor: '#111' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  headerIconBtn:      { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle:        { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  imageContainer:     { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  loader:             { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  overlay:            { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.62)' },
  cropBorder:         { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)' },
  gridLine:           { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)' },
  gridV:              { width: 1, top: 0, bottom: 0 },
  gridH:              { height: 1, left: 0, right: 0 },
  corner:             { position: 'absolute', width: CORNER_ARM, height: CORNER_ARM },
  cornerTL:           { borderTopWidth: CORNER_THK, borderLeftWidth:   CORNER_THK, borderColor: colors.primary },
  cornerTR:           { borderTopWidth: CORNER_THK, borderRightWidth:  CORNER_THK, borderColor: colors.primary },
  cornerBL:           { borderBottomWidth: CORNER_THK, borderLeftWidth:  CORNER_THK, borderColor: colors.primary },
  cornerBR:           { borderBottomWidth: CORNER_THK, borderRightWidth: CORNER_THK, borderColor: colors.primary },
  ratioRow:           { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#1C1C1C' },
  ratioBtn:           { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#3A3A3A' },
  ratioBtnActive:     { borderColor: colors.primary, backgroundColor: 'rgba(249,115,22,0.15)' },
  ratioBtnText:       { color: '#888', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  ratioBtnTextActive: { color: colors.primary },
  bottomRow:          { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14, backgroundColor: '#1C1C1C' },
  skipBtn:            { flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#3A3A3A', alignItems: 'center', justifyContent: 'center' },
  skipBtnText:        { color: '#ccc', fontSize: 13, fontWeight: '800' },
  cropBtn:            { flex: 2, height: 52, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  cropBtnText:        { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.3 },
});
