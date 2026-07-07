import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PopularLocalityItem {
  locality: string;
  count: number;
}

const POPULAR_LOCALITIES_KEY = "nagpur-prime-popular-localities";
const SELECTED_LOCALITY_KEY = "nagpur-prime-selected-locality";

export const persistPopularLocalities = async (
  localities: PopularLocalityItem[] | null,
) => {
  if (!localities) {
    await AsyncStorage.removeItem(POPULAR_LOCALITIES_KEY);
    return;
  }

  await AsyncStorage.setItem(
    POPULAR_LOCALITIES_KEY,
    JSON.stringify(localities),
  );
};

export const loadPopularLocalities = async (): Promise<PopularLocalityItem[]> => {
  const storedLocalities = await AsyncStorage.getItem(POPULAR_LOCALITIES_KEY);

  if (!storedLocalities) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedLocalities) as PopularLocalityItem[];

    if (!Array.isArray(parsed)) {
      await AsyncStorage.removeItem(POPULAR_LOCALITIES_KEY);
      return [];
    }

    return parsed;
  } catch {
    await AsyncStorage.removeItem(POPULAR_LOCALITIES_KEY);
    return [];
  }
};

// ─── Selected Locality ────────────────────────────────────────────────────────

const SELECTED_LATITUDE_KEY = "nagpur-prime-selected-latitude";
const SELECTED_LONGITUDE_KEY = "nagpur-prime-selected-longitude";

export const persistSelectedLocality = async (
  locality: string | null,
  latitude?: number | null,
  longitude?: number | null,
): Promise<void> => {
  if (!locality) {
    await AsyncStorage.removeItem(SELECTED_LOCALITY_KEY);
    await AsyncStorage.removeItem(SELECTED_LATITUDE_KEY);
    await AsyncStorage.removeItem(SELECTED_LONGITUDE_KEY);
    return;
  }
  await AsyncStorage.setItem(SELECTED_LOCALITY_KEY, locality);
  if (latitude !== null && latitude !== undefined) {
    await AsyncStorage.setItem(SELECTED_LATITUDE_KEY, String(latitude));
  } else {
    await AsyncStorage.removeItem(SELECTED_LATITUDE_KEY);
  }
  if (longitude !== null && longitude !== undefined) {
    await AsyncStorage.setItem(SELECTED_LONGITUDE_KEY, String(longitude));
  } else {
    await AsyncStorage.removeItem(SELECTED_LONGITUDE_KEY);
  }
};

export const loadSelectedLocality = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SELECTED_LOCALITY_KEY);
  } catch {
    return null;
  }
};

export const loadSelectedLocalityCoordinates = async (): Promise<{
  latitude: number | null;
  longitude: number | null;
}> => {
  try {
    const lat = await AsyncStorage.getItem(SELECTED_LATITUDE_KEY);
    const lng = await AsyncStorage.getItem(SELECTED_LONGITUDE_KEY);
    return {
      latitude: lat ? Number(lat) : null,
      longitude: lng ? Number(lng) : null,
    };
  } catch {
    return { latitude: null, longitude: null };
  }
};

