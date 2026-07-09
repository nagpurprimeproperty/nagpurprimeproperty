import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/theme/colors";
import { useAddPropertyStore } from "../../store/addPropertyStore";
import { useLocalityStore } from "@/store/localityStore";

// ─── Config ───────────────────────────────────────────────────────────────────
// ⚠️  The Google Maps API key is NOT available in JS at all.
//    It lives only in the native AndroidManifest.xml / Info.plist (written by
//    app.config.js at build time from the GOOGLE_MAPS_API_KEY EAS secret).
//
//    All calls that require the key (Geocoding, Places Autocomplete, Place
//    Details) are proxied through the app's own backend so the key is never
//    present in the JS bundle.  See backend/src/routes/maps.ts.

const MAPS_PROXY_BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressDetails {
  area: string;
  subArea: string;
  city: string;
  district: string;
  pinCode: string;
  state: string;
  fullDisplay: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAGPUR: Region = {
  latitude: 21.1458,
  longitude: 79.0882,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGeocodingResult(result: any): AddressDetails {
  const components: { types: string[]; long_name: string }[] =
    result.address_components || [];

  const get = (...types: string[]) =>
    components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || "";

  const rawCity = get("locality");
  const district = get("administrative_area_level_2");

  const isNagpur =
    rawCity.toLowerCase().includes("nagpur") ||
    district.toLowerCase().includes("nagpur");

  return {
    area:
      get("sublocality_level_1", "sublocality", "neighborhood") ||
      get("locality"),
    subArea:
      get("sublocality_level_2", "neighborhood", "route") ||
      get("premise"),
    city: rawCity || (isNagpur ? "Nagpur" : ""),
    district: district,
    pinCode: get("postal_code"),
    state: get("administrative_area_level_1") || "Maharashtra",
    fullDisplay: result.formatted_address || "",
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MapPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const step2 = useAddPropertyStore((s) => s.step2);
  const updateStep2 = useAddPropertyStore((s) => s.updateStep2);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const setSelectedLocality = useLocalityStore((s) => s.setSelectedLocality);

  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(
    step2.latitude && step2.longitude && mode !== "search"
      ? { latitude: step2.latitude, longitude: step2.longitude }
      : null,
  );
  const [details, setDetails] = useState<AddressDetails | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);

  const initRegion: Region =
    step2.latitude && step2.longitude && mode !== "search"
      ? {
          latitude: step2.latitude,
          longitude: step2.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : NAGPUR;

  // Slide-up bottom panel
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: pin ? 0 : 320,
      useNativeDriver: true,
      tension: 60,
      friction: 11,
    }).start();
  }, [pin]);

  // ── Reverse geocode using Google Geocoding API ──────────────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    setDetails(null);
    try {
      // Key-free: the backend proxy calls Google server-side.
      const url = `${MAPS_PROXY_BASE}/maps/reverse-geocode?latlng=${lat},${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results.length > 0) {
        const parsed = parseGeocodingResult(data.results[0]);
        const cityLower = (parsed.city || "").toLowerCase();
        const districtLower = (parsed.district || "").toLowerCase();
        
        if (!cityLower.includes("nagpur") && !districtLower.includes("nagpur")) {
          Alert.alert(
            "Invalid Location",
            "not valid locality pls select nagpurs locality"
          );
          setPin(null);
          setDetails(null);
        } else {
          setDetails(parsed);
        }
      } else {
        if (__DEV__) {
          console.error("Google Geocoding API error (reverseGeocode):", data.error_message || data.status);
        }
        setDetails(null);
      }
    } catch {
      setDetails(null);
    } finally {
      setGeocoding(false);
    }
  }, []);

  useEffect(() => {
    if (pin) reverseGeocode(pin.latitude, pin.longitude);
  }, [pin]);

  useEffect(() => {
    if (mode !== "search" && (!step2.latitude || !step2.longitude) && step2.locality) {
      const geocodeLocality = async () => {
        setGeocoding(true);
        try {
          const addressQuery = `${step2.locality}, Nagpur, Maharashtra, India`;
          // Key-free: routed through backend proxy.
          const url = `${MAPS_PROXY_BASE}/maps/geocode?address=${encodeURIComponent(addressQuery)}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === "OK" && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            const p = { latitude: loc.lat, longitude: loc.lng };
            const parsed = parseGeocodingResult(data.results[0]);
            
            const cityLower = (parsed.city || "").toLowerCase();
            const districtLower = (parsed.district || "").toLowerCase();
            const isNagpur = cityLower.includes("nagpur") || districtLower.includes("nagpur");
            
            if (isNagpur) {
              setPin(p);
              setDetails(parsed);
              mapRef.current?.animateToRegion(
                { ...p, latitudeDelta: 0.015, longitudeDelta: 0.015 },
                700
              );
            }
          } else {
            if (__DEV__) {
              console.error("Google Geocoding API error (geocodeLocality):", data.error_message || data.status);
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.error("Error geocoding locality:", error);
          }
        } finally {
          setGeocoding(false);
        }
      };
      geocodeLocality();
    }
  }, [step2.locality, step2.latitude, step2.longitude, mode]);

  // ── Google Places Autocomplete search ──────────────────────────────────────
  const onQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setPredictions([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Key-free: routed through backend proxy.
        const url =
          `${MAPS_PROXY_BASE}/maps/autocomplete` +
          `?input=${encodeURIComponent(text)}` +
          `&language=en` +
          `&components=country:in` +
          `&location=21.1458,79.0882` +
          `&radius=50000` +
          `&strictbounds=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "OK" || data.status === "ZERO_RESULTS") {
          setPredictions(data.predictions || []);
          setShowDrop((data.predictions || []).length > 0);
        } else {
          if (__DEV__) {
            console.error("Google Places Autocomplete API error:", data.error_message || data.status);
          }
          setPredictions([]);
          setShowDrop(false);
        }
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  // ── Pick a place from autocomplete ─────────────────────────────────────────
  const pickPrediction = async (item: PlacePrediction) => {
    Keyboard.dismiss();
    setQuery(item.structured_formatting.main_text);
    setPredictions([]);
    setShowDrop(false);
    try {
      // Key-free: routed through backend proxy.
      const url =
        `${MAPS_PROXY_BASE}/maps/place-details` +
        `?place_id=${item.place_id}` +
        `&fields=geometry,address_components,formatted_address` +
        `&language=en`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK") {
        const loc = data.result.geometry.location;
        const p = { latitude: loc.lat, longitude: loc.lng };
        const parsed = parseGeocodingResult(data.result);
        const cityLower = (parsed.city || "").toLowerCase();
        const districtLower = (parsed.district || "").toLowerCase();
        
        if (!cityLower.includes("nagpur") && !districtLower.includes("nagpur")) {
          Alert.alert(
            "Invalid Location",
            "not valid locality pls select nagpurs locality"
          );
        } else {
          setPin(p);
          setDetails(parsed);
          setGeocoding(false); // already have details
          mapRef.current?.animateToRegion(
            { ...p, latitudeDelta: 0.015, longitudeDelta: 0.015 },
            700,
          );
        }
      } else {
        if (__DEV__) {
          console.error("Google Place Details API error:", data.error_message || data.status);
        }
      }
    } catch {
      // silently fall back — pin stays where it is
    }
  };

  // ── GPS locate ─────────────────────────────────────────────────────────────
  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Enable location access to use this feature.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const p = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setPin(p);
      mapRef.current?.animateToRegion(
        { ...p, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        600,
      );
    } catch {
      Alert.alert("Error", "Could not get your current location.");
    } finally {
      setLocating(false);
    }
  };

  // ── Confirm & save to store ────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!pin) return;
    
    const cityLower = (details?.city || "").toLowerCase();
    const districtLower = (details?.district || "").toLowerCase();
    
    if (details && !cityLower.includes("nagpur") && !districtLower.includes("nagpur")) {
      Alert.alert(
        "Invalid Location",
        "not valid locality pls select nagpurs locality"
      );
      setPin(null);
      setDetails(null);
      return;
    }

    const localityName = details?.area || "Nagpur";

    if (mode === "search" && pin) {
      await setSelectedLocality(localityName, pin.latitude, pin.longitude);
      router.navigate("/(tabs)/home" as any);
    } else {
      updateStep2({
        latitude: pin.latitude,
        longitude: pin.longitude,
        locality: details?.area || step2.locality,
        subLocality: details?.subArea || step2.subLocality,
        pinCode: details?.pinCode || step2.pinCode,
      });
      useAddPropertyStore.getState().goToPhase('locality');
      router.navigate("/(tabs)/addProperty" as any);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Google Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initRegion}
        onPress={(e: MapPressEvent) => {
          setPin(e.nativeEvent.coordinate);
          setShowDrop(false);
          Keyboard.dismiss();
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsTraffic={false}
        mapType="standard"
      >
        {pin && (
          <Marker
            coordinate={pin}
            draggable
            anchor={{ x: 0.5, y: 1 }}
            pinColor={colors.primary}
            onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      {/* Top fade gradient */}
      <LinearGradient
        colors={["rgba(0,0,0,0.28)", "transparent"]}
        style={[S.topGradient, { height: insets.top + 130 }]}
        pointerEvents="none"
      />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <View style={[S.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={S.iconBtn}
          onPress={() => {
            if (mode === "search") {
              router.navigate("/(screens)/location" as any);
            } else {
              router.navigate("/(tabs)/addProperty" as any);
            }
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={S.titlePill}>
          <Ionicons name="map-outline" size={14} color={colors.primary} />
          <Text style={S.titleText}>Pick Location</Text>
        </View>

        <TouchableOpacity
          style={S.iconBtn}
          onPress={handleLocate}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Search bar ───────────────────────────────────────────────────────── */}
      <View style={[S.searchRow, { top: insets.top + 66 }]}>
        <View style={[S.searchBar, query.length > 0 && S.searchBarFocused]}>
          <Ionicons
            name="search-outline"
            size={16}
            color={query.length > 0 ? colors.primary : colors.inactive}
          />
          <TextInput
            ref={searchRef}
            style={S.searchInput}
            placeholder="Search locality, landmark, area…"
            placeholderTextColor={colors.inactive}
            value={query}
            onChangeText={onQueryChange}
            returnKeyType="search"
            onFocus={() => query.length > 0 && setShowDrop(true)}
          />
          {searching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : query.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setPredictions([]);
                setShowDrop(false);
              }}
            >
              <Ionicons name="close-circle" size={17} color="#d1d5db" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Autocomplete dropdown ─────────────────────────────────────────────── */}
      {showDrop && predictions.length > 0 && (
        <View style={[S.dropdown, { top: insets.top + 120 }]}>
          <FlatList
            data={predictions}
            keyExtractor={(i) => i.place_id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={predictions.length > 4}
            style={{ maxHeight: 260 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  S.dropItem,
                  index === predictions.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => pickPrediction(item)}
                activeOpacity={0.7}
              >
                <View style={S.dropIcon}>
                  <Ionicons name="location-outline" size={13} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.dropMainText} numberOfLines={1}>
                    {item.structured_formatting.main_text}
                  </Text>
                  <Text style={S.dropSubText} numberOfLines={1}>
                    {item.structured_formatting.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* ── No-pin instruction ───────────────────────────────────────────────── */}
      {!pin && (
        <View style={S.instruction}>
          <View style={S.instructionIcon}>
            <Ionicons name="hand-left-outline" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={S.instructionTitle}>Drop a Pin</Text>
            <Text style={S.instructionSub}>Tap the map or search above</Text>
          </View>
        </View>
      )}

      {/* ── Bottom panel ─────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          S.panel,
          {
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        {/* Handle */}
        <View style={S.handle} />

        {/* Header row */}
        <View style={S.panelHeader}>
          <View style={S.panelHeaderIcon}>
            <Ionicons name="location" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.panelTitle}>Location Details</Text>
            {pin && (
              <Text style={S.panelCoords}>
                {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
              </Text>
            )}
          </View>
          <TouchableOpacity style={S.clearBtn} onPress={() => { setPin(null); setDetails(null); }}>
            <Ionicons name="close" size={15} color="#6b7280" />
            <Text style={S.clearBtnTxt}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Address cards */}
        {geocoding ? (
          <View style={S.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={S.loadingTxt}>Fetching address details…</Text>
          </View>
        ) : details ? (
          <>
            <View style={S.cardRow}>
              <View style={[S.addrCard, { flex: 1.3 }]}>
                <View style={S.addrCardIcon}>
                  <Ionicons name="business-outline" size={13} color={colors.primary} />
                </View>
                <Text style={S.addrCardLabel}>Area / Locality</Text>
                <Text style={S.addrCardValue} numberOfLines={2}>
                  {details.area || "—"}
                </Text>
              </View>
              <View style={[S.addrCard, { flex: 0.9 }]}>
                <View style={S.addrCardIcon}>
                  <Ionicons name="mail-outline" size={13} color={colors.primary} />
                </View>
                <Text style={S.addrCardLabel}>PIN Code</Text>
                <Text style={S.addrCardValue}>{details.pinCode || "—"}</Text>
              </View>
            </View>

            <View style={S.cardRow}>
              <View style={[S.addrCard, { flex: 1 }]}>
                <View style={S.addrCardIcon}>
                  <Ionicons name="map-outline" size={13} color={colors.primary} />
                </View>
                <Text style={S.addrCardLabel}>Sub-Area</Text>
                <Text style={S.addrCardValue} numberOfLines={1}>
                  {details.subArea || "—"}
                </Text>
              </View>
              <View style={[S.addrCard, { flex: 1 }]}>
                <View style={S.addrCardIcon}>
                  <Ionicons name="location-outline" size={13} color={colors.primary} />
                </View>
                <Text style={S.addrCardLabel}>City</Text>
                <Text style={S.addrCardValue}>{details.city}</Text>
              </View>
            </View>

            <Text style={S.dragHint}>
              {"  "}Drag the pin to fine-tune the exact position
            </Text>
          </>
        ) : pin ? (
          <View style={S.loadingRow}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.inactive} />
            <Text style={S.loadingTxt}>Could not fetch address details</Text>
          </View>
        ) : null}

        {/* Confirm */}
        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.87}
          disabled={!pin}
          style={{ borderRadius: 18, overflow: "hidden", marginTop: 12, opacity: pin ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={["#fb923c", colors.primary, "#ea6c05"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={S.confirmBtn}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={S.confirmTxt}>
              {mode === "search" ? "Confirm Location" : "Confirm & Continue"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={17}
              color="rgba(255,255,255,0.65)"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  topGradient: { position: "absolute", top: 0, left: 0, right: 0 },

  topBar: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  titlePill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  titleText: { fontSize: 14, fontWeight: "700", color: colors.text },

  searchRow: { position: "absolute", left: 14, right: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: "transparent",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchBarFocused: { borderColor: colors.primary },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, height: 48 },

  dropdown: {
    position: "absolute",
    left: 14,
    right: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  dropMainText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  dropSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },

  instruction: {
    position: "absolute",
    bottom: 52,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingLeft: 14,
    paddingRight: 20,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  instructionSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 18,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  panelHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  panelTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  panelCoords: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearBtnTxt: { fontSize: 13, fontWeight: "600", color: colors.textMuted },

  cardRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  addrCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
  },
  addrCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  addrCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  addrCardValue: { fontSize: 14, fontWeight: "700", color: colors.text },

  dragHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
    justifyContent: "center",
  },
  loadingTxt: { fontSize: 13, color: colors.inactive },

  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 18,
  },
  confirmTxt: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
});
