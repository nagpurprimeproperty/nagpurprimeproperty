// ─── Listing Categories ──────────────────────────────────────────────────────
export type ListingCategory = 'resale' | 'rental' | 'new';

export const LISTING_CATEGORIES: { value: ListingCategory; label: string; emoji: string; color: string }[] = [
  { value: 'resale', label: 'Resale',       emoji: '🔴', color: '#ef4444' },
  { value: 'rental', label: 'Rental',       emoji: '🔵', color: '#3b82f6' },
  { value: 'new',    label: 'New (Project)', emoji: '🟢', color: '#22c55e' },
];

// ─── Property Types ───────────────────────────────────────────────────────────
export type PropertyType =
  // Residential
  | 'flat' | 'villa' | 'builder_floor' | 'penthouse'
  // Commercial
  | 'office' | 'shop' | 'showroom' | 'warehouse'
  // Land
  | 'res_plot' | 'agri_land';

export type PropertyGroup = 'residential' | 'commercial' | 'land';

export interface PropertyTypeConfig {
  value: PropertyType;
  label: string;
  emoji: string;
  group: PropertyGroup;
}

export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  // Residential
  { value: 'flat',          label: 'Flat / Apartment',      emoji: '🏢', group: 'residential' },
  { value: 'villa',         label: 'Villa / Indep. House',  emoji: '🏡', group: 'residential' },
  { value: 'builder_floor', label: 'Builder Floor',         emoji: '🏠', group: 'residential' },
  { value: 'penthouse',     label: 'Penthouse',             emoji: '🏙', group: 'residential' },
  // Commercial
  { value: 'office',        label: 'Office Space',          emoji: '💼', group: 'commercial'  },
  { value: 'shop',          label: 'Shop',                  emoji: '🛍', group: 'commercial'  },
  { value: 'showroom',      label: 'Showroom',              emoji: '🏬', group: 'commercial'  },
  { value: 'warehouse',     label: 'Warehouse / Godown',    emoji: '🏭', group: 'commercial'  },
  // Land
  { value: 'res_plot',      label: 'Residential Plot',      emoji: '🌍', group: 'land'        },
  { value: 'agri_land',     label: 'Agricultural Land',     emoji: '🌾', group: 'land'        },
];

// Groups for UI display
export const PROPERTY_GROUPS: { group: PropertyGroup; label: string }[] = [
  { group: 'residential', label: 'Residential' },
  { group: 'commercial',  label: 'Commercial'  },
  { group: 'land',        label: 'Land'        },
];

// ─── Valid 31-combination matrix ─────────────────────────────────────────────
export const VALID_COMBINATIONS: Record<PropertyType, ListingCategory[]> = {
  flat:          ['resale', 'rental', 'new'],
  villa:         ['resale', 'rental', 'new'],
  builder_floor: ['resale', 'rental', 'new'],
  penthouse:     ['resale', 'rental', 'new'],
  office:        ['resale', 'rental', 'new'],
  shop:          ['resale', 'rental', 'new'],
  showroom:      ['resale', 'rental', 'new'],
  warehouse:     ['resale', 'rental', 'new'],
  res_plot:      ['resale', 'rental', 'new'],
  agri_land:     ['resale', 'rental'],          // ❌ NOT 'new'
};

export function getValidCategories(type: PropertyType): ListingCategory[] {
  return VALID_COMBINATIONS[type];
}

export function isValidCombination(category: ListingCategory, type: PropertyType): boolean {
  return VALID_COMBINATIONS[type].includes(category);
}

export function getPropertyTypesByGroup(group: PropertyGroup): PropertyTypeConfig[] {
  return PROPERTY_TYPES.filter((p) => p.group === group);
}

export function getPropertyTypeConfig(type: PropertyType): PropertyTypeConfig | undefined {
  return PROPERTY_TYPES.find((p) => p.value === type);
}