// ─── 25 Nagpur Localities ────────────────────────────────────────────────────
export const NAGPUR_LOCALITIES: string[] = [
  'Dharampeth', 'Sitabuldi', 'Sadar', 'Civil Lines', 'Ramdaspeth',
  'Bajaj Nagar', 'Pratap Nagar', 'Laxmi Nagar', 'Manish Nagar', 'Trimurti Nagar',
  'Somalwada', 'Nandanvan', 'Wardhaman Nagar', 'Bhandara Road', 'Kamptee Road',
  'Hingna Road', 'Amravati Road', 'Wardha Road', 'Katol Road', 'MIDC Hingna',
  'Butibori', 'Wadi', 'Kalamna', 'Gondia Road', 'Umred Road',
];

// ─── 22 Amenities ────────────────────────────────────────────────────────────
export interface Amenity {
  id: string;
  label: string;
  emoji: string;
}

export const AMENITIES: Amenity[] = [
  { id: 'parking_2w',         label: 'Parking (2-Wheeler)',    emoji: '🛵' },
  { id: 'parking_4w',         label: 'Parking (4-Wheeler)',    emoji: '🚗' },
  { id: 'lift',               label: 'Lift / Elevator',        emoji: '🛗' },
  { id: 'security_24x7',      label: '24×7 Security',          emoji: '💂' },
  { id: 'cctv',               label: 'CCTV Surveillance',      emoji: '📹' },
  { id: 'gym',                label: 'Gym / Fitness Centre',   emoji: '🏋️' },
  { id: 'swimming_pool',      label: 'Swimming Pool',          emoji: '🏊' },
  { id: 'garden',             label: 'Garden / Park',          emoji: '🌳' },
  { id: 'play_area',          label: "Children's Play Area",   emoji: '🛝' },
  { id: 'clubhouse',          label: 'Clubhouse',              emoji: '🏛️' },
  { id: 'power_backup',       label: 'Power Backup',           emoji: '⚡' },
  { id: 'rainwater',          label: 'Rainwater Harvesting',   emoji: '🌧️' },
  { id: 'fire_safety',        label: 'Fire Safety',            emoji: '🚒' },
  { id: 'intercom',           label: 'Intercom',               emoji: '📞' },
  { id: 'visitor_parking',    label: 'Visitor Parking',        emoji: '🅿️' },
  { id: 'water_storage',      label: 'Water Storage',          emoji: '🪣' },
  { id: 'piped_gas',          label: 'Piped Gas',              emoji: '🔥' },
  { id: 'sewage_treatment',   label: 'Sewage Treatment',       emoji: '♻️' },
  { id: 'gas_connection',     label: 'Gas Connection',         emoji: '⛽' },
  { id: 'water_connection',   label: 'Water Connection',       emoji: '💧' },
  { id: 'electricity_conn',   label: 'Electricity Connection', emoji: '🔌' },
  { id: 'water_supply',       label: 'Water Supply',           emoji: '🚿' },
];

// ─── Dropdown Options ─────────────────────────────────────────────────────────
export const FURNISHING_OPTIONS = [
  'Unfurnished', 'Semi-Furnished', 'Fully Furnished', 'Bare Shell', 'Warm Shell',
];

export const FURNISHING_OPTIONS_SIMPLE = [
  'Unfurnished', 'Semi-Furnished', 'Fully Furnished',
];

export const FACING_OPTIONS = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];

export const OWNERSHIP_OPTIONS = [
  'Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney',
];

export const OWNERSHIP_OPTIONS_SIMPLE = [
  'Freehold', 'Leasehold', 'Power of Attorney',
];

export const OWNERSHIP_AGRI = [
  'Individual', 'Joint', 'Family',
];

export const AGE_OF_PROPERTY = [
  'New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years',
];

export const FLOOR_TYPE_OPTIONS = [
  'Marble', 'Vitrified', 'Wooden', 'Granite', 'Ceramic',
];

export const WATER_SUPPLY_OPTIONS = ['Municipal', 'Borewell', 'Both'];

export const ELECTRICITY_OPTIONS = ['Metered', 'Non-metered', 'Pre-paid'];

export const POSSESSION_TIMELINE_OPTIONS = [
  'Immediate', 'Within 1 Month', '1–3 Months', '3–6 Months',
];

export const PREFERRED_TENANTS_OPTIONS = [
  'Family', 'Bachelors', 'Female Tenants', 'Any',
];

export const APPROVED_BY_OPTIONS = ['NIT', 'NMC', 'NMRDA', 'MHADA'];

export const ZONE_TYPE_OPTIONS = ['Residential', 'Commercial', 'Industrial', 'Mixed'];

export const WATER_SOURCE_OPTIONS = [
  'Borewell', 'Canal', 'River', 'Rain-fed', 'Well',
];

export const ROAD_ACCESS_OPTIONS = ['Pucca Road', 'Kutcha Road', 'No Road'];

export const IRRIGATION_OPTIONS = ['Drip', 'Sprinkler', 'Flood', 'None'];

export const SUITABLE_FOR_OPTIONS = [
  'Retail', 'Food & Beverage', 'Medical', 'Electronics', 'Clothing',
  'Salon', 'Pharmacy', 'Bakery', 'Footwear', 'Other',
];

export const NA_ORDER_STATUS_OPTIONS = ['Received', 'Applied', 'Not Applied'];

export const CONSTRUCTION_STATUS_OPTIONS = [
  'Under Construction', 'Ready to Move', 'New Launch',
];

export const LEASE_DURATION_OPTIONS = [
  '6 Months', '11 Months', '1 Year', '2 Years', '3 Years', 'Negotiable',
];

export const LOCKIN_PERIOD_OPTIONS = [
  '1 Month', '3 Months', '6 Months', '1 Year', 'None',
];