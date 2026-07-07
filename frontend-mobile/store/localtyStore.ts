import { create } from "zustand";
import type { PopularLocalityItem } from "@/services/localtyService";
import {
  loadPopularLocalities,
  persistPopularLocalities,
  loadSelectedLocality,
  persistSelectedLocality,
  loadSelectedLocalityCoordinates,
} from "@/lib/localityStorage";

interface LocaltyState {
  popularLocalities: PopularLocalityItem[];
  isHydrated: boolean;
  selectedLocality: string | null;
  selectedLatitude: number | null;
  selectedLongitude: number | null;
  setPopularLocalities: (localities: PopularLocalityItem[]) => Promise<void>;
  setSelectedLocality: (
    locality: string | null,
    latitude?: number | null,
    longitude?: number | null
  ) => Promise<void>;
}

const initialState = {
  popularLocalities: [] as PopularLocalityItem[],
  isHydrated: false,
  selectedLocality: null as string | null,
  selectedLatitude: null as number | null,
  selectedLongitude: null as number | null,
};

const hydrateLocalities = async (
  set: (partial: Partial<LocaltyState>) => void,
) => {
  try {
    const [storedLocalities, storedLocality, storedCoords] = await Promise.all([
      loadPopularLocalities(),
      loadSelectedLocality(),
      loadSelectedLocalityCoordinates(),
    ]);

    set({
      popularLocalities: storedLocalities,
      selectedLocality: storedLocality,
      selectedLatitude: storedCoords.latitude,
      selectedLongitude: storedCoords.longitude,
      isHydrated: true,
    });
  } catch {
    set({
      popularLocalities: [],
      selectedLocality: null,
      selectedLatitude: null,
      selectedLongitude: null,
      isHydrated: true,
    });
  }
};

export const useLocaltyStore = create<LocaltyState>((set) => ({
  ...initialState,

  setPopularLocalities: async (localities) => {
    set({ popularLocalities: localities });
    await persistPopularLocalities(localities);
  },

  setSelectedLocality: async (locality, latitude = null, longitude = null) => {
    set({
      selectedLocality: locality,
      selectedLatitude: latitude,
      selectedLongitude: longitude,
    });
    await persistSelectedLocality(locality, latitude, longitude);
  },
}));

hydrateLocalities(useLocaltyStore.setState);
