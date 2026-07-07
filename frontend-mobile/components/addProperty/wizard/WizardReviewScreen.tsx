import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, useWindowDimensions,
  FlatList, Modal, ActivityIndicator, Pressable, StyleSheet,
} from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { Image } from 'expo-image';
import {
  Edit2, CheckCircle, MapPin, CircleDollarSign,
  Sparkles, List, Play, Pause, Camera, Video,
  BedDouble, Bath, Layers, Maximize, Building2,
  Compass, Car, Landmark, Ruler, Trees, Warehouse,
  Store, ShoppingBag, MapPinned, Navigation, Tag,
  User, Briefcase, HardHat,
} from 'lucide-react-native';
import colors from '@/theme/colors';
import { getStep3Fields, getStep4Fields } from '@/lib/fieldMatrix';
import type { ListingCategory, PropertyType } from '@/lib/propertyTypes';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Label Helpers ────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  resale: 'Resale',
  rental: 'Rental',
  new: 'New Project',
};

const TYPE_LABELS: Record<string, string> = {
  flat: 'Flat / Apartment',
  villa: 'Villa / Independent House',
  builder_floor: 'Builder Floor',
  penthouse: 'Penthouse',
  office: 'Office Space',
  shop: 'Shop',
  showroom: 'Showroom',
  warehouse: 'Warehouse / Godown',
  res_plot: 'Residential Plot',
  agri_land: 'Agricultural Land',
};

// ─── isEmpty: decides which values to suppress ────────────────────────────────

function isEmptyValue(v: any): boolean {
  if (v === undefined || v === null || v === '') return true;
  if (typeof v === 'boolean') return false; // booleans are never empty
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmtPrice(v: any): string {
  const num = Number(v);
  if (isNaN(num)) return String(v);
  return `₹${num.toLocaleString('en-IN')}`;
}

function fmtBool(v: boolean): string {
  return v ? 'Yes' : 'No';
}

function fmtValue(v: any, key: string): string {
  if (typeof v === 'boolean') return fmtBool(v);
  if (Array.isArray(v)) return v.join(', ');
  const priceKeys = [
    'totalPrice', 'startingPrice', 'monthlyRent', 'annualLease',
    'securityDeposit', 'maintenance', 'bookingAmount', 'pricePerSqft',
  ];
  if (priceKeys.includes(key)) return fmtPrice(v);
  return String(v);
}

// ─── Key spec builder (type-aware) ────────────────────────────────────────────

interface SpecItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

function getKeySpecs(type: PropertyType | null, step3: Record<string, any>): SpecItem[] {
  const specs: SpecItem[] = [];
  if (!type) return specs;

  switch (type) {
    case 'flat':
    case 'penthouse':
    case 'builder_floor':
      if (step3.bhk !== undefined && step3.bhk !== null) specs.push({ label: 'BHK', value: `${step3.bhk} BHK`, icon: BedDouble });
      if (step3.carpetArea) specs.push({ label: 'Carpet Area', value: `${step3.carpetArea} sq.ft`, icon: Maximize });
      if (step3.floorNumber !== undefined && step3.floorNumber !== null)
        specs.push({ label: 'Floor', value: `${step3.floorNumber}${step3.totalFloors ? ` / ${step3.totalFloors}` : ''}`, icon: Building2 });
      if (step3.bathrooms !== undefined && step3.bathrooms !== null) specs.push({ label: 'Bathrooms', value: `${step3.bathrooms}`, icon: Bath });
      break;
    case 'villa':
      if (step3.bhk !== undefined && step3.bhk !== null) specs.push({ label: 'BHK', value: `${step3.bhk} BHK`, icon: BedDouble });
      if (step3.plotArea) specs.push({ label: 'Plot Area', value: `${step3.plotArea} sq.ft`, icon: Maximize });
      if (step3.builtUpArea) specs.push({ label: 'Built-up', value: `${step3.builtUpArea} sq.ft`, icon: Layers });
      if (step3.bathrooms !== undefined && step3.bathrooms !== null) specs.push({ label: 'Bathrooms', value: `${step3.bathrooms}`, icon: Bath });
      break;
    case 'office':
      if (step3.carpetArea) specs.push({ label: 'Carpet Area', value: `${step3.carpetArea} sq.ft`, icon: Maximize });
      if (step3.floorNumber !== undefined && step3.floorNumber !== null)
        specs.push({ label: 'Floor', value: `${step3.floorNumber}`, icon: Building2 });
      if (step3.cabinCount) specs.push({ label: 'Cabins', value: `${step3.cabinCount}`, icon: Landmark });
      if (step3.washrooms) specs.push({ label: 'Washrooms', value: `${step3.washrooms}`, icon: Bath });
      break;
    case 'shop':
      if (step3.carpetArea) specs.push({ label: 'Shop Area', value: `${step3.carpetArea} sq.ft`, icon: Maximize });
      if (step3.shopFloor !== undefined && step3.shopFloor !== null)
        specs.push({ label: 'Floor', value: `${step3.shopFloor}`, icon: Building2 });
      if (step3.frontage) specs.push({ label: 'Frontage', value: `${step3.frontage} ft`, icon: Ruler });
      if (step3.ceilingHeight) specs.push({ label: 'Ceiling', value: `${step3.ceilingHeight} ft`, icon: Layers });
      break;
    case 'showroom':
      if (step3.showroomArea) specs.push({ label: 'Area', value: `${step3.showroomArea} sq.ft`, icon: Maximize });
      if (step3.numberOfFloors) specs.push({ label: 'Floors', value: `${step3.numberOfFloors}`, icon: Building2 });
      if (step3.frontage) specs.push({ label: 'Frontage', value: `${step3.frontage} ft`, icon: Ruler });
      specs.push({ label: 'Parking', value: step3.parkingAvailable ? 'Yes' : 'No', icon: Car });
      break;
    case 'warehouse':
      if (step3.warehouseArea) specs.push({ label: 'Area', value: `${step3.warehouseArea} sq.ft`, icon: Maximize });
      if (step3.warehouseHeight) specs.push({ label: 'Height', value: `${step3.warehouseHeight} ft`, icon: Layers });
      specs.push({ label: 'Truck Access', value: step3.truckAccess ? 'Yes' : 'No', icon: Car });
      if (step3.powerLoad) specs.push({ label: 'Power', value: `${step3.powerLoad} KVA`, icon: Landmark });
      break;
    case 'res_plot':
      if (step3.plotAreaSqFt) specs.push({ label: 'Plot Area', value: `${step3.plotAreaSqFt} sq.ft`, icon: Maximize });
      if (step3.plotLength && step3.plotWidth) specs.push({ label: 'Dimensions', value: `${step3.plotLength} × ${step3.plotWidth} ft`, icon: Ruler });
      if (step3.facing) specs.push({ label: 'Facing', value: step3.facing, icon: Compass });
      if (step3.roadWidth) specs.push({ label: 'Road Width', value: `${step3.roadWidth} ft`, icon: Navigation });
      break;
    case 'agri_land':
      if (step3.areaAcres) specs.push({ label: 'Area', value: `${step3.areaAcres} Acres`, icon: Maximize });
      if (step3.soilType) specs.push({ label: 'Soil Type', value: step3.soilType, icon: Trees });
      specs.push({ label: 'Road Access', value: step3.roadAccess || 'N/A', icon: Navigation });
      specs.push({ label: 'Electricity', value: step3.electricity ? 'Yes' : 'No', icon: Landmark });
      break;
  }

  return specs.slice(0, 4); // max 4
}

// ─── Build label map from fieldMatrix ─────────────────────────────────────────

function buildLabelMap(
  category: ListingCategory | null,
  type: PropertyType | null,
): Record<string, string> {
  if (!category || !type) return {};
  const map: Record<string, string> = {
    builderName: 'Builder/Developer',
    reraNumber: 'Agent RERA',
    projectReraNumber: 'Project RERA ID',
  };
  try {
    const step3Sections = getStep3Fields(category, type);
    for (const s of step3Sections) {
      for (const f of s.fields) {
        map[f.key] = f.label;
      }
    }
    const step4Sections = getStep4Fields(category, type);
    for (const s of step4Sections) {
      for (const f of s.fields) {
        map[f.key] = f.label;
      }
    }
  } catch { /* fallback gracefully */ }
  // Ensure the explicit overrides aren't overwritten
  map.builderName = 'Builder/Developer';
  map.reraNumber = 'Agent RERA';
  map.projectReraNumber = 'Project RERA ID';
  return map;
}

// ─── Fullscreen Video Player ──────────────────────────────────────────────────

function ReviewFullscreenVideoPlayer({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const safeUri = videoUrl ? decodeURIComponent(videoUrl) : null;
  const player = useVideoPlayer(safeUri ? { uri: safeUri } : null, (p) => {
    p.loop = false;
    p.bufferOptions = {
      maxBufferBytes: 2 * 1024 * 1024, // 2MB buffer limit to prevent Android OOM
      prioritizeTimeOverSizeThreshold: false,
    };
    p.play();
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        setLoading(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [player]);

  if (!safeUri || !player) return null;

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          nativeControls={true}
        />

        {loading && (
          <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            player.pause();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: 40,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Video Slide ──────────────────────────────────────────────────────────────

function ReviewVideoSlide({ videoUrl, width, height }: { videoUrl: string; width: number; height: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const safeUri = videoUrl ? decodeURIComponent(videoUrl) : null;
  const player = useVideoPlayer(safeUri ? { uri: safeUri } : null, (p) => {
    p.loop = true;
    p.bufferOptions = {
      maxBufferBytes: 2 * 1024 * 1024, // 2MB buffer limit to prevent Android OOM
      prioritizeTimeOverSizeThreshold: false,
    };
  });

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const openFullscreen = () => {
    if (player) player.pause();
    setIsPlaying(false);
    setIsFullscreen(true);
  };

  if (!safeUri || !player) return null;

  return (
    <View style={{ width, height }}>
      <Pressable onPress={openFullscreen} style={{ width, height }}>
        <VideoView
          player={player}
          style={{ width, height }}
          contentFit="cover"
          nativeControls={false}
        />
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={togglePlay}
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.924)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPlaying ? (
              <Pause size={22} color="white" fill="white" />
            ) : (
              <Play size={22} color="white" fill="white" />
            )}
          </TouchableOpacity>
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Play size={8} color="white" fill="white" />
            <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
              Tap for Fullscreen
            </Text>
          </View>
        </View>
      </Pressable>

      {isFullscreen && (
        <ReviewFullscreenVideoPlayer
          videoUrl={videoUrl}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  editPhase,
  onEdit,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  editPhase: string;
  onEdit: (phase: string) => void;
}) {
  return (
    <View style={S.sectionHeaderRow}>
      <View className="flex-row items-center flex-1">
        <View style={S.sectionIconWrap}>
          <Icon size={16} color={colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={S.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onEdit(editPhase)}
        activeOpacity={0.7}
        style={S.editBtn}
      >
        <Edit2 size={12} color={colors.primary} strokeWidth={2.5} />
        <Text style={S.editBtnText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[S.detailRow, !isLast && S.detailRowBorder]}>
      <Text style={S.detailLabel} numberOfLines={1}>{label}</Text>
      <Text style={S.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function WizardReviewScreen({ onSubmit }: { onSubmit: () => void }) {
  const step0 = useAddPropertyStore((s) => s.step0);
  const step1 = useAddPropertyStore((s) => s.step1);
  const step2 = useAddPropertyStore((s) => s.step2);
  const step3 = useAddPropertyStore((s) => s.step3);
  const step4 = useAddPropertyStore((s) => s.step4);
  const step5 = useAddPropertyStore((s) => s.step5);
  const step6 = useAddPropertyStore((s) => s.step6);
  const isSubmitting = useAddPropertyStore((s) => s.isSubmitting);
  const editingPropertyId = useAddPropertyStore((s) => s.editingPropertyId);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);
  const { width } = useWindowDimensions();

  const [activeSlide, setActiveSlide] = useState(0);

  const handleEdit = (phase: string) => goToPhase(phase as any);

  const categoryLabel = CATEGORY_LABELS[step1.listingCategory || ''] || '';
  const typeLabel = TYPE_LABELS[step1.propertyType || ''] || '';

  const keySpecs = useMemo(
    () => getKeySpecs(step1.propertyType, step3),
    [step1.propertyType, step3],
  );

  const labelMap = useMemo(
    () => buildLabelMap(step1.listingCategory, step1.propertyType),
    [step1.listingCategory, step1.propertyType],
  );

  // Build hero slides: photos + optional video
  const heroSlides = useMemo(() => {
    const slides: string[] = [...step5.photos];
    if (step5.video) slides.push('__video__');
    return slides;
  }, [step5.photos, step5.video]);

  // ─── Filter detail rows (step3, skip keys already in keySpecs + empty) ────
  const keySpecKeys = useMemo(
    () => new Set(keySpecs.map((s) => {
      // Map spec label back to key; find keys that have that value
      const map: Record<string, string[]> = {
        'BHK': ['bhk'], 'Carpet Area': ['carpetArea'], 'Floor': ['floorNumber', 'totalFloors'],
        'Bathrooms': ['bathrooms'], 'Plot Area': ['plotArea', 'plotAreaSqFt'],
        'Built-up': ['builtUpArea'], 'Shop Area': ['carpetArea'], 'Frontage': ['frontage'],
        'Ceiling': ['ceilingHeight'], 'Area': ['showroomArea', 'warehouseArea', 'areaAcres'],
        'Height': ['warehouseHeight'], 'Truck Access': ['truckAccess'],
        'Power': ['powerLoad'], 'Dimensions': ['plotLength', 'plotWidth'],
        'Facing': ['facing'], 'Road Width': ['roadWidth'], 'Soil Type': ['soilType'],
        'Road Access': ['roadAccess'], 'Electricity': ['electricity'],
        'Cabins': ['cabinCount'], 'Washrooms': ['washrooms'], 'Parking': ['parkingAvailable'],
        'Floors': ['numberOfFloors'],
      };
      return map[s.label] || [];
    }).flat()),
    [keySpecs],
  );

  const detailRows = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    for (const [key, value] of Object.entries(step3)) {
      if (isEmptyValue(value)) continue;
      if (keySpecKeys.has(key)) continue;
      // Skip auto-calc display fields
      if (key === 'plotAreaSqm' || key === 'areaHectares') continue;
      const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
      rows.push({ label, value: fmtValue(value, key) });
    }
    return rows;
  }, [step3, keySpecKeys, labelMap]);

  // ─── Pricing rows ──────────────────────────────────────────────────────────
  const primaryPrice = useMemo(() => {
    if (step1.listingCategory === 'rental') {
      if (step4.monthlyRent) return { label: 'Monthly Rent', value: fmtPrice(step4.monthlyRent) };
      if (step4.annualLease) return { label: 'Annual Lease', value: fmtPrice(step4.annualLease) };
    }
    if (step1.listingCategory === 'new') {
      if (step4.startingPrice) return { label: 'Starting Price', value: fmtPrice(step4.startingPrice) };
    }
    if (step4.totalPrice) return { label: 'Total Price', value: fmtPrice(step4.totalPrice) };
    return null;
  }, [step1.listingCategory, step4]);

  const pricingRows = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    const primaryKeys = ['totalPrice', 'monthlyRent', 'annualLease', 'startingPrice'];
    const skipKeys = ['priceRangeMin', 'priceRangeMax', 'priceRange'];
    for (const [key, value] of Object.entries(step4)) {
      if (isEmptyValue(value)) continue;
      if (primaryKeys.includes(key)) continue;
      if (skipKeys.includes(key)) continue;
      const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
      rows.push({ label, value: fmtValue(value, key) });
    }
    return rows;
  }, [step4, labelMap]);

  // ─── Amenities ──────────────────────────────────────────────────────────────
  const allAmenities = useMemo(() => {
    const combined = [...step6.amenities];
    if (step6.customAmenities) {
      for (const ca of step6.customAmenities) {
        if (!combined.includes(ca)) combined.push(ca);
      }
    }
    return combined;
  }, [step6]);

  const heroHeight = 260;
  const heroWidth = width;

  const handleHeroScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / heroWidth);
    if (index !== activeSlide) setActiveSlide(index);
  };

  return (
    <View style={{ backgroundColor: '#FFFDFA', flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ═══ HERO IMAGE CAROUSEL ═══ */}
        {heroSlides.length > 0 ? (
          <View style={{ height: heroHeight, position: 'relative' }}>
            <FlatList
              data={heroSlides}
              keyExtractor={(_, i) => i.toString()}
              horizontal
              pagingEnabled
              bounces={heroSlides.length > 1}
              showsHorizontalScrollIndicator={false}
              onScroll={handleHeroScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) =>
                item === '__video__' ? (
                  <ReviewVideoSlide
                    videoUrl={step5.video || ''}
                    width={heroWidth}
                    height={heroHeight}
                  />
                ) : (
                  <Image
                    source={{ uri: item }}
                    style={{ width: heroWidth, height: heroHeight }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                )
              }
            />

            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={S.heroGradient}
              pointerEvents="none"
            />

            {/* Badges overlay */}
            <View style={S.heroBadgeRow} pointerEvents="none">
              <View style={S.heroBadge}>
                <Camera size={12} color="#FFF" strokeWidth={2.5} />
                <Text style={S.heroBadgeText}>{step5.photos.length} Photos</Text>
              </View>
              {step5.video && (
                <View style={[S.heroBadge, { backgroundColor: 'rgba(249,115,22,0.9)' }]}>
                  <Video size={12} color="#FFF" strokeWidth={2.5} />
                  <Text style={S.heroBadgeText}>Video</Text>
                </View>
              )}
            </View>

            {/* Dot indicators */}
            {heroSlides.length > 1 && (
              <View style={S.dotRow} pointerEvents="none">
                {heroSlides.map((slide, i) => {
                  const isActive = activeSlide === i;
                  const isVideo = slide === '__video__';
                  if (isVideo) {
                    return (
                      <View key={i} style={[S.dotVideo, isActive && S.dotVideoActive]}>
                        <Play size={7} color={isActive ? colors.primary : '#FFF'} fill={isActive ? colors.primary : '#FFF'} />
                      </View>
                    );
                  }
                  return (
                    <View
                      key={i}
                      style={[S.dot, isActive && S.dotActive]}
                    />
                  );
                })}
              </View>
            )}

            {/* Step badge on hero */}
            <View style={S.heroStepBadge}>
              <List size={11} color="#FFF" strokeWidth={2.5} />
              <Text style={S.heroStepText}>
                {editingPropertyId ? 'Edit Preview' : 'Step 11 of 11'}
              </Text>
            </View>
          </View>
        ) : (
          /* No photos placeholder */
          <View style={[S.heroPlaceholder, { height: heroHeight }]}>
            <Camera size={40} color={colors.textLight} strokeWidth={1.5} />
            <Text style={S.heroPlaceholderText}>No photos uploaded</Text>
            <TouchableOpacity onPress={() => handleEdit('photos')} style={S.heroPlaceholderBtn}>
              <Text style={S.heroPlaceholderBtnText}>Add Photos</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>

          {/* ═══ PROPERTY OVERVIEW ═══ */}
          <View style={{ marginBottom: 8 }}>
            {/* Category + Type + Listed By badges */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row flex-wrap gap-2 flex-1 pr-2">
                {categoryLabel ? (
                  <View style={S.typeBadge}>
                    <Tag size={11} color={colors.primary} strokeWidth={2.5} />
                    <Text style={S.typeBadgeText}>{categoryLabel}</Text>
                  </View>
                ) : null}
                {typeLabel ? (
                  <View style={[S.typeBadge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                    <Building2 size={11} color="#475569" strokeWidth={2.5} />
                    <Text style={[S.typeBadgeText, { color: '#475569' }]}>{typeLabel}</Text>
                  </View>
                ) : null}
                {step0.propertyListedBy ? (
                  <View style={[S.typeBadge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    {step0.propertyListedBy === 'Owner' && <User size={11} color="#16A34A" strokeWidth={2.5} />}
                    {step0.propertyListedBy === 'Broker' && <Briefcase size={11} color="#16A34A" strokeWidth={2.5} />}
                    {step0.propertyListedBy === 'Builder' && <HardHat size={11} color="#16A34A" strokeWidth={2.5} />}
                    <Text style={[S.typeBadgeText, { color: '#16A34A' }]}>{step0.propertyListedBy}</Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => handleEdit('listed_by')}
                activeOpacity={0.7}
                style={S.editBtn}
              >
                <Edit2 size={12} color={colors.primary} strokeWidth={2.5} />
                <Text style={S.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={S.propertyTitle} numberOfLines={3}>
              {step1.title || 'Untitled Property'}
            </Text>

            {/* Location subtitle */}
            {step2.locality ? (
              <View className="flex-row items-center mt-2">
                <MapPin size={14} color={colors.primary} strokeWidth={2.5} />
                <Text style={S.locationSubtitle} numberOfLines={1}>
                  {[step2.locality, step2.subLocality].filter(Boolean).join(', ')}
                  {step2.pinCode ? ` - ${step2.pinCode}` : ''}
                </Text>
              </View>
            ) : null}

            {/* Price prominent */}
            {primaryPrice && (
              <View style={S.priceBlock}>
                <Text style={S.priceValue}>{primaryPrice.value}</Text>
                <Text style={S.priceLabel}>{primaryPrice.label}</Text>
              </View>
            )}
          </View>

          {/* ═══ KEY SPECS GRID ═══ */}
          {keySpecs.length > 0 && (
            <View style={S.specGrid}>
              {keySpecs.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <View key={i} style={S.specCard}>
                    <Icon size={18} color={colors.primary} strokeWidth={2.5} />
                    <Text style={S.specLabel}>{spec.label}</Text>
                    <Text style={S.specValue}>{spec.value}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* ═══ DESCRIPTION ═══ */}
          {step1.description ? (
            <View style={S.section}>
              <SectionHeader icon={Layers} title="About Property" editPhase="basic_info" onEdit={handleEdit} />
              <Text style={S.descriptionText}>{step1.description}</Text>
            </View>
          ) : null}

          {/* ═══ PROPERTY DETAILS ═══ */}
          {detailRows.length > 0 && (
            <View style={S.section}>
              <SectionHeader icon={Layers} title="Property Details" editPhase="details_a" onEdit={handleEdit} />
              <View style={S.detailCard}>
                {detailRows.map((row, i) => (
                  <DetailRow
                    key={row.label + i}
                    label={row.label}
                    value={row.value}
                    isLast={i === detailRows.length - 1}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ═══ LOCATION ═══ */}
          <View style={S.section}>
            <SectionHeader icon={MapPinned} title="Location" editPhase="locality" onEdit={handleEdit} />
            <View style={S.detailCard}>
              {step2.locality ? (
                <DetailRow label="Locality" value={step2.locality} />
              ) : null}
              {step2.subLocality ? (
                <DetailRow label="Sub-Locality" value={step2.subLocality} />
              ) : null}
              {step2.landmark ? (
                <DetailRow label="Landmark" value={step2.landmark} />
              ) : null}
              {step2.pinCode ? (
                <DetailRow label="PIN Code" value={step2.pinCode} isLast={!step2.latitude} />
              ) : null}
              {step2.latitude && step2.longitude ? (
                <View style={S.mapBadge}>
                  <CheckCircle size={14} color={colors.success} strokeWidth={2.5} />
                  <Text style={S.mapBadgeText}>Map coordinates pinned</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ═══ PRICING & AVAILABILITY ═══ */}
          {(primaryPrice || pricingRows.length > 0) && (
            <View style={S.section}>
              <SectionHeader icon={CircleDollarSign} title="Pricing & Availability" editPhase="pricing" onEdit={handleEdit} />
              <View style={S.detailCard}>
                {primaryPrice && (
                  <View style={[S.detailRow, S.detailRowBorder]}>
                    <Text style={S.detailLabel}>{primaryPrice.label}</Text>
                    <Text style={[S.detailValue, { color: colors.primary, fontWeight: '900' }]}>
                      {primaryPrice.value}
                    </Text>
                  </View>
                )}
                {pricingRows.map((row, i) => (
                  <DetailRow
                    key={row.label + i}
                    label={row.label}
                    value={row.value}
                    isLast={i === pricingRows.length - 1}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ═══ AMENITIES ═══ */}
          {allAmenities.length > 0 && (
            <View style={S.section}>
              <SectionHeader icon={Sparkles} title={`Amenities (${allAmenities.length})`} editPhase="photos" onEdit={handleEdit} />
              <View className="flex-row flex-wrap gap-2">
                {allAmenities.map((am) => (
                  <View key={am} style={S.amenityChip}>
                    <CheckCircle size={12} color={colors.primary} strokeWidth={2.5} />
                    <Text style={S.amenityText}>{am}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ═══ MEDIA GALLERY (thumbnail strip) ═══ */}
          {step5.photos.length > 0 && (
            <View style={[S.section, { marginBottom: 0 }]}>
              <SectionHeader icon={Camera} title={`Media (${step5.photos.length} photos${step5.video ? ' + video' : ''})`} editPhase="photos" onEdit={handleEdit} />
              <FlatList
                data={heroSlides}
                keyExtractor={(_, i) => `thumb-${i}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item, index }) => {
                  if (item === '__video__') {
                    return (
                      <View style={S.thumbWrap}>
                        <ReviewVideoSlide videoUrl={step5.video || ''} width={110} height={90} />
                        <View style={S.thumbVideoOverlay}>
                          <Play size={16} color="#FFF" fill="#FFF" />
                        </View>
                      </View>
                    );
                  }
                  return (
                    <View style={S.thumbWrap}>
                      <Image
                        source={{ uri: item }}
                        style={S.thumbImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                      {index === 0 && (
                        <View style={S.coverBadge}>
                          <Text style={S.coverBadgeText}>Cover</Text>
                        </View>
                      )}
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ═══ STICKY SUBMIT BUTTON ═══ */}
      <View style={S.stickyFooter}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={[S.submitBtn, isSubmitting && { opacity: 0.7 }]}
        >
          <View style={S.submitBtnSheen} />
          <CheckCircle size={20} color="#FFF" strokeWidth={2.5} />
          <Text style={S.submitBtnText}>
            {isSubmitting
              ? editingPropertyId ? 'Updating...' : 'Uploading & Listing...'
              : editingPropertyId ? 'Update Listing' : 'Publish Listing'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════

const S = StyleSheet.create({
  // Hero
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
  },
  heroBadgeRow: {
    position: 'absolute', bottom: 14, left: 16,
    flexDirection: 'row', gap: 8,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  heroBadgeText: {
    color: '#FFF', fontSize: 11, fontWeight: '700',
  },
  heroStepBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(249,115,22,0.85)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  heroStepText: {
    color: '#FFF', fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  dotRow: {
    position: 'absolute', bottom: 14, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 20, backgroundColor: colors.primary,
  },
  dotVideo: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  dotVideoActive: {
    backgroundColor: '#FFF',
  },
  heroPlaceholder: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  heroPlaceholderText: {
    color: colors.textLight, fontSize: 14, fontWeight: '600', marginTop: 10,
  },
  heroPlaceholderBtn: {
    marginTop: 12, backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
  },
  heroPlaceholderBtnText: {
    color: '#FFF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Overview
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FCF5EC', borderColor: 'rgba(249,115,22,0.15)',
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  typeBadgeText: {
    color: colors.primaryDark, fontSize: 11, fontWeight: '700',
  },
  propertyTitle: {
    fontSize: 22, fontWeight: '900', color: '#1A1A1A',
    letterSpacing: -0.4, lineHeight: 30,
  },
  locationSubtitle: {
    fontSize: 14, fontWeight: '500', color: colors.textMuted, marginLeft: 6, flex: 1,
  },
  priceBlock: {
    marginTop: 16, flexDirection: 'row', alignItems: 'baseline', gap: 8,
  },
  priceValue: {
    fontSize: 28, fontWeight: '900', color: colors.primary, letterSpacing: -0.5,
  },
  priceLabel: {
    fontSize: 13, fontWeight: '600', color: colors.textMuted,
  },

  // Specs grid
  specGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    marginTop: 20, marginBottom: 8,
  },
  specCard: {
    width: '48%',
    backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1,
    borderRadius: 16, padding: 16, marginBottom: 10,
  },
  specLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 10,
  },
  specValue: {
    fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginTop: 3,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FCF5EC',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.2,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FCF5EC', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 11, fontWeight: '700', color: colors.primary,
  },

  // Description
  descriptionText: {
    fontSize: 14, fontWeight: '500', color: '#475569', lineHeight: 22,
  },

  // Detail card
  detailCard: {
    backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1,
    borderRadius: 16, padding: 4, overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  detailRowBorder: {
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12, fontWeight: '600', color: colors.textMuted,
    flex: 1, marginRight: 12,
  },
  detailValue: {
    fontSize: 13, fontWeight: '800', color: '#1A1A1A',
    textAlign: 'right', flexShrink: 1, maxWidth: '55%',
  },

  // Map badge
  mapBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ECFDF5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    margin: 4, marginTop: 0,
  },
  mapBadgeText: {
    fontSize: 12, fontWeight: '700', color: '#065F46',
  },

  // Amenities
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  amenityText: {
    fontSize: 12, fontWeight: '600', color: '#334155',
  },

  // Thumbnails
  thumbWrap: {
    width: 110, height: 90, borderRadius: 14, overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbImage: {
    width: 110, height: 90,
  },
  thumbVideoOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(249,115,22,0.9)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  coverBadgeText: {
    color: '#FFF', fontSize: 9, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Footer
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(241,245,249,0.8)',
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    height: 56, borderRadius: 16,
    backgroundColor: '#10B981',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, overflow: 'hidden',
  },
  submitBtnSheen: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  submitBtnText: {
    color: '#FFF', fontSize: 14, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
});
