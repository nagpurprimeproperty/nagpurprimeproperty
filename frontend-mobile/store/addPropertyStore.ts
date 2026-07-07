import { create } from 'zustand';
import type { ListingCategory, PropertyType } from '../lib/propertyTypes';

// ─── Property Listed By ───────────────────────────────────────────────────────
export type PropertyListedBy = 'Owner' | 'Broker' | 'Builder';

export const PREDEFINED_AMENITIES = [
  'Parking (2-wheeler)',
  'Parking (4-wheeler)',
  'Lift/Elevator',
  '24x7 Security',
  'CCTV Surveillance',
  'Gym/Fitness Centre',
  'Swimming Pool',
  'Garden/Park',
  "Children's Play Area",
  'Clubhouse',
  'Power Backup',
  'Rainwater Harvesting',
  'Fire Safety',
  'Intercom',
  'Visitor Parking',
  'Water Storage',
  'Piped Gas',
  'Sewage Treatment',
  'Gas Connection',
  'Water Connection',
  'Electricity Connection',
  'Water Supply',
  'Other Amenities',
];

// ─── Step Data Types ──────────────────────────────────────────────────────────

export interface Step0Data {
  propertyListedBy: PropertyListedBy | null;
}

export interface Step1Data {
  title: string;
  listingCategory: ListingCategory | null;
  propertyType: PropertyType | null;
  description: string;
}

export interface Step2Data {
  city: string;            // always 'Nagpur'
  locality: string;
  subLocality: string;
  landmark: string;
  pinCode: string;
  latitude: number | null;
  longitude: number | null;
}

// Step 3 is a free-form record — fields differ per all 31 combos
export type Step3Data = Record<string, any>;

// Step 4 is category-driven
export type Step4Data = Record<string, any>;

export interface Step5Data {
  photos: string[];        // local URIs; index 0 = cover photo
  video: string | null;
}

// Upload cache — maps local URI → uploaded CDN URL
export interface UploadCache {
  // key = local file URI, value = CDN URL returned by the upload API
  photoUrls: Record<string, string>;
  videoUrl: string | null;  // CDN URL of the uploaded video
  isUploading: boolean;     // true while any upload is in-flight
}

export interface Step6Data {
  amenities: string[];     // array of amenity IDs
  customAmenities: string[]; // array of custom created amenity names
}

// ─── Validation State ─────────────────────────────────────────────────────────

export type StepErrors = Record<string, string>;

export type WizardPhase =
  | 'listed_by'
  | 'category'
  | 'type'
  | 'basic_info'
  | 'locality'
  | 'map'
  | 'details_a'
  | 'details_b'
  | 'pricing'
  | 'photos'
  | 'review';

// ─── Full Store Type ──────────────────────────────────────────────────────────

export interface AddPropertyStore {
  // Navigation
  currentStep: number; // Keep for backward compatibility
  wizardPhase: WizardPhase;

  // Form data
  step0: Step0Data;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;

  // Validation errors per step
  errors: StepErrors;

  // Submission state
  isSubmitting: boolean;
  isDraft: boolean;

  // Edit state
  editingPropertyId: string | null;
  editOrigin: string | null;

  // ─── Actions ───────────────────────────────────────────────────────────────

  // Navigation
  goToStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;

  setWizardPhase: (phase: WizardPhase) => void;
  goToPhase: (phase: WizardPhase) => void;

  // Step updaters
  updateStep0: (data: Partial<Step0Data>) => void;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep3: (key: string, value: any) => void;
  updateStep3Batch: (data: Partial<Step3Data>) => void;
  updateStep4: (key: string, value: any) => void;
  updateStep4Batch: (data: Partial<Step4Data>) => void;
  updateStep5: (data: Partial<Step5Data>) => void;
  updateStep6: (data: Partial<Step6Data>) => void;

  // Listing category change — must reset step3 + step4
  setListingCategory: (category: ListingCategory) => void;

  // Property type change
  setPropertyType: (type: PropertyType) => void;

  // Photo management
  addPhoto: (uri: string) => void;
  removePhoto: (uri: string) => void;
  reorderPhotos: (from: number, to: number) => void;

  // Amenity toggle
  toggleAmenity: (id: string) => void;
  addCustomAmenity: (name: string) => void;

  // Errors
  setErrors: (errors: StepErrors) => void;
  clearErrors: () => void;

  // Submission
  setSubmitting: (val: boolean) => void;

  // ─── Eager upload cache ────────────────────────────────────────────────────
  uploadCache: UploadCache;
  setUploadedPhotoUrl: (localUri: string, cdnUrl: string) => void;
  removeUploadedPhotoUrl: (localUri: string) => void;
  setUploadedVideoUrl: (cdnUrl: string | null) => void;
  setUploadingMedia: (val: boolean) => void;

  // Payload builder
  buildSubmitPayload: (uploadedPhotos?: string[], uploadedVideoUrl?: string | null) => any;

  // Edit Actions
  loadPropertyForEdit: (property: any, origin?: string) => void;
  clearEdit: () => void;

  // Reset
  resetAll: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialStep0: Step0Data = {
  propertyListedBy: null,
};

const initialStep1: Step1Data = {
  title: '',
  listingCategory: null,
  propertyType: null,
  description: '',
};

const initialStep2: Step2Data = {
  city: 'Nagpur',
  locality: '',
  subLocality: '',
  landmark: '',
  pinCode: '',
  latitude: null,
  longitude: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAddPropertyStore = create<AddPropertyStore>((set, get) => ({
  currentStep: 1,
  wizardPhase: 'listed_by',
  step0: initialStep0,
  step1: initialStep1,
  step2: initialStep2,
  step3: {},
  step4: {},
  step5: { photos: [], video: null },
  step6: { amenities: [], customAmenities: [] },
  errors: {},
  isSubmitting: false,
  isDraft: false,
  editingPropertyId: null,
  editOrigin: null,
  uploadCache: { photoUrls: {}, videoUrl: null, isUploading: false },

  // ─── Navigation ────────────────────────────────────────────────────────────

  goToStep: (step) => set({ currentStep: step, errors: {} }),

  goNext: () =>
    set((s) => ({
      currentStep: Math.min(s.currentStep + 1, 6),
      errors: {},
    })),

  goPrev: () =>
    set((s) => ({
      currentStep: Math.max(s.currentStep - 1, 1),
      errors: {},
    })),

  setWizardPhase: (phase) => set({ wizardPhase: phase, errors: {} }),
  goToPhase: (phase) => set({ wizardPhase: phase, errors: {} }),

  // ─── Step Updaters ─────────────────────────────────────────────────────────

  updateStep0: (data) =>
    set((s) => ({ step0: { ...s.step0, ...data } })),

  updateStep1: (data) =>
    set((s) => ({ step1: { ...s.step1, ...data } })),

  updateStep2: (data) =>
    set((s) => ({ step2: { ...s.step2, ...data } })),

  updateStep3: (key, value) =>
    set((s) => ({ step3: { ...s.step3, [key]: value } })),

  updateStep3Batch: (data) =>
    set((s) => ({ step3: { ...s.step3, ...data } })),

  updateStep4: (key, value) =>
    set((s) => ({ step4: { ...s.step4, [key]: value } })),

  updateStep4Batch: (data) =>
    set((s) => ({ step4: { ...s.step4, ...data } })),

  updateStep5: (data) =>
    set((s) => ({ step5: { ...s.step5, ...data } })),

  updateStep6: (data) =>
    set((s) => ({ step6: { ...s.step6, ...data } })),

  // ─── Category change → MUST reset step3 + step4 (per spec) ───────────────

  setListingCategory: (category) =>
    set((s) => {
      if (s.step1.listingCategory === category) {
        return {
          wizardPhase: 'type',
        };
      }
      return {
        step1: { ...s.step1, listingCategory: category, propertyType: null },
        step3: {},
        step4: {},
        errors: {},
        wizardPhase: 'type',
      };
    }),

  // ─── Property type change ──────────────────────────────────────────────────

  setPropertyType: (type) =>
    set((s) => {
      if (s.step1.propertyType === type) {
        return {
          wizardPhase: 'basic_info',
        };
      }
      return {
        step1: { ...s.step1, propertyType: type },
        step3: {},    // Reset details when type changes
        errors: {},
        wizardPhase: 'basic_info',
      };
    }),

  // ─── Photo Management ──────────────────────────────────────────────────────

  addPhoto: (uri) =>
    set((s) => {
      if (s.step5.photos.length >= 15) return s;
      return { step5: { ...s.step5, photos: [...s.step5.photos, uri] } };
    }),

  removePhoto: (uri) =>
    set((s) => {
      // Also purge any cached CDN URL for this local URI
      const { [uri]: _dropped, ...remainingPhotoUrls } = s.uploadCache.photoUrls;
      return {
        step5: { ...s.step5, photos: s.step5.photos.filter((p) => p !== uri) },
        uploadCache: { ...s.uploadCache, photoUrls: remainingPhotoUrls },
      };
    }),

  reorderPhotos: (from, to) =>
    set((s) => {
      const photos = [...s.step5.photos];
      const [moved] = photos.splice(from, 1);
      photos.splice(to, 0, moved);
      return { step5: { ...s.step5, photos } };
    }),

  // ─── Amenity Toggle ────────────────────────────────────────────────────────

  toggleAmenity: (id) =>
    set((s) => {
      const current = s.step6.amenities;
      const updated = current.includes(id)
        ? current.filter((a) => a !== id)
        : [...current, id];
      return { step6: { ...s.step6, amenities: updated } };
    }),

  addCustomAmenity: (name) =>
    set((s) => {
      const custom = s.step6.customAmenities || [];
      if (custom.includes(name)) return s;
      return {
        step6: {
          ...s.step6,
          customAmenities: [...custom, name],
        },
      };
    }),

  // ─── Errors ────────────────────────────────────────────────────────────────

  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),

  // ─── Submission ────────────────────────────────────────────────────────────

  setSubmitting: (val) => set({ isSubmitting: val }),

  // ─── Eager upload cache actions ────────────────────────────────────────────

  setUploadedPhotoUrl: (localUri, cdnUrl) =>
    set((s) => ({
      uploadCache: {
        ...s.uploadCache,
        photoUrls: { ...s.uploadCache.photoUrls, [localUri]: cdnUrl },
      },
    })),

  removeUploadedPhotoUrl: (localUri) =>
    set((s) => {
      const { [localUri]: _dropped, ...rest } = s.uploadCache.photoUrls;
      return { uploadCache: { ...s.uploadCache, photoUrls: rest } };
    }),

  setUploadedVideoUrl: (cdnUrl) =>
    set((s) => ({ uploadCache: { ...s.uploadCache, videoUrl: cdnUrl } })),

  setUploadingMedia: (val) =>
    set((s) => ({ uploadCache: { ...s.uploadCache, isUploading: val } })),

  // ─── Payload builder ───────────────────────────────────────────────────────

  buildSubmitPayload: (uploadedPhotos, uploadedVideoUrl) => {
    const s = get();

    // 1. Listing Category mapping
    const categoryMap: Record<ListingCategory, string> = {
      resale: 'Resale',
      rental: 'Rental',
      new: 'New',
    };
    const listingCategory = categoryMap[s.step1.listingCategory || 'resale'];

    // 2. Property Type mapping
    const typeMap: Record<PropertyType, string> = {
      flat: 'Flat/Apartment',
      villa: 'Villa/Independent House',
      builder_floor: 'Builder Floor',
      penthouse: 'Penthouse',
      office: 'Office Space',
      shop: 'Shop',
      showroom: 'Showroom',
      warehouse: 'Warehouse/Godown',
      res_plot: 'Residential Plot',
      agri_land: 'Agricultural Land',
    };
    const propertyType = typeMap[s.step1.propertyType || 'flat'];

    // 3. Location object structure
    const location = {
      locality: s.step2.locality,
      subLocality: s.step2.subLocality || null,
      landmark: s.step2.landmark || null,
      pinCode: s.step2.pinCode || null,
      coordinates: {
        type: 'Point',
        coordinates: [s.step2.longitude || 79.0882, s.step2.latitude || 21.1458], // longitude first, then latitude
      },
    };

    // 4. Step 3 (Details) normalization
    const details: Record<string, any> = { ...s.step3 };

    // Helper to convert to number or undefined
    const parseNum = (val: any) => {
      if (val === undefined || val === null || String(val).trim() === '') return undefined;
      const parsed = Number(String(val).trim());
      return isNaN(parsed) ? undefined : parsed;
    };

    // Parse numeric fields in details
    const numFields = [
      "bhk", "bathrooms", "balconies", "floorNumber", "totalFloors",
      "carpetArea", "builtUpArea", "superBuiltUpArea", "plotArea", "parkingSlots",
      "roadWidth", "terraceArea", "totalUnitsInBuilding", "cabinCount", "openDesks",
      "washrooms", "frontage", "depth", "ceilingHeight", "showroomArea",
      "numberOfShowroomFloors", "warehouseArea", "warehouseHeight", "numberOfDocks",
      "openYardArea", "powerLoad", "plotAreaSqFt", "plotLength",
      "plotWidth", "fsiAvailable", "areaAcres", "areaHectares", "distanceFromCity",
      "totalUnitsInProject", "unitsAvailable", "totalVillasInProject",
      "totalPlotsInLayout", "plotsAvailable"
    ];
    for (const f of numFields) {
      if (f in details) {
        details[f] = parseNum(details[f]);
      }
    }

    // Standardize shopFloor enum
    if (details.shopFloor !== undefined && details.shopFloor !== null) {
      const validOptions = ['Lower Ground', 'Ground', '1st', '2nd', '3rd+'];
      if (!validOptions.includes(details.shopFloor)) {
        const floorVal = Number(details.shopFloor);
        if (floorVal === 0) details.shopFloor = 'Ground';
        else if (floorVal === 1) details.shopFloor = '1st';
        else if (floorVal === 2) details.shopFloor = '2nd';
        else if (floorVal >= 3) details.shopFloor = '3rd+';
        else details.shopFloor = 'Lower Ground';
      }
    }

    // Standardize ageOfProperty format
    if (details.ageOfProperty) {
      const ageMap: Record<string, string> = {
        'New': 'New',
        '1–3 Years': '1-3 yrs',
        '3–5 Years': '3-5 yrs',
        '5–10 Years': '5-10 yrs',
        '10+ Years': '10+ yrs',
      };
      if (ageMap[details.ageOfProperty]) {
        details.ageOfProperty = ageMap[details.ageOfProperty];
      }
    }

    // Standardize suitableFor options array
    if (Array.isArray(details.suitableFor)) {
      const suitableMap: Record<string, string> = {
        'Food & Beverage': 'Food',
        'Medical': 'Clinic',
      };
      const validOptions = ['Retail', 'Food', 'Pharmacy', 'Showroom', 'Office', 'Clinic'];
      details.suitableFor = details.suitableFor.map((item: string) => {
        if (suitableMap[item]) return suitableMap[item];
        if (validOptions.includes(item)) return item;
        return 'Retail'; // fallback
      });
    }

    // Standardize footfallRating
    if (details.footfallRating === 'Very High') {
      details.footfallRating = 'Premium';
    }

    // Standardize roadAccess boolean for Agricultural Land
    if (details.roadAccess !== undefined && details.roadAccess !== null) {
      if (typeof details.roadAccess === 'string') {
        details.roadAccess = details.roadAccess !== 'No Road';
      }
    }

    // Ensure required booleans default to false if undefined to satisfy backend schema validation
    if (s.step1.propertyType === 'warehouse') {
      if (details.truckAccess === undefined || details.truckAccess === null) {
        details.truckAccess = false;
      }
    } else if (s.step1.propertyType === 'showroom') {
      if (details.parkingAvailable === undefined || details.parkingAvailable === null) {
        details.parkingAvailable = false;
      }
    } else if (s.step1.propertyType === 'agri_land') {
      if (details.roadAccess === undefined || details.roadAccess === null) {
        details.roadAccess = false;
      }
    }

    // Standardize zoneType options for Residential Plot
    if (details.zoneType) {
      const zoneMap: Record<string, string> = {
        'Residential': 'Residential',
        'Mixed': 'Mixed Use',
        'Mixed Use': 'Mixed Use',
        'Commercial': 'Commercial',
        'Industrial': 'Industrial',
      };
      details.zoneType = zoneMap[details.zoneType] || 'Residential';
    }

    // Standardize floorOwnershipType for Builder Floor
    if (details.floorOwnershipType) {
      if (details.floorOwnershipType === 'Independent') {
        details.floorOwnershipType = 'Individual';
      }
    }

    // Standardize constructionStatus for new launches
    if (details.constructionStatus) {
      if (details.constructionStatus === 'New Launch') {
        details.constructionStatus = 'Pre-launch';
      }
    }

    // 5. Step 4 (Pricing) normalization
    const pricing: Record<string, any> = { ...s.step4 };

    // Parse numeric fields in pricing
    const pricingNumFields = [
      "totalPrice", "pricePerSqft", "startingPrice", "bookingAmount",
      "monthlyRent", "annualLease", "securityDeposit", "maintenance"
    ];
    for (const f of pricingNumFields) {
      if (f in pricing) {
        pricing[f] = parseNum(pricing[f]);
      }
    }

    // Delete temporary slider fields to satisfy backend schema validation
    delete pricing.priceRangeMin;
    delete pricing.priceRangeMax;

    // Copy/default possessionDate for new projects under pricing to satisfy backend schema
    if (s.step1.listingCategory === 'new') {
      if (details.possessionDate) {
        pricing.possessionDate = details.possessionDate;
      } else {
        // Fallback placeholder date (today) for plots or cases without a possession date to satisfy newPricing regex validation
        pricing.possessionDate = new Date().toISOString().split('T')[0];
      }
    }

    // Standardize possessionTimeline options
    if (pricing.possessionTimeline) {
      const timelineMap: Record<string, string> = {
        'Immediate': 'Immediate',
        'Within 1 Month': 'Within 1 month',
        'Within 1 month': 'Within 1 month',
        '1–3 Months': '1-3 months',
        '1-3 months': '1-3 months',
        '3–6 Months': '3-6 months',
        '3-6 months': '3-6 months',
      };
      pricing.possessionTimeline = timelineMap[pricing.possessionTimeline] || pricing.possessionTimeline;
    }

    // Standardize leaseDuration options for Rental listings
    if (pricing.leaseDuration) {
      const leaseMap: Record<string, string> = {
        '6 Months': 'Flexible',
        '11 Months': '11 months',
        '1 Year': '1 year',
        '2 Years': '2 years',
        '3 Years': '3 years',
        'Negotiable': 'Flexible',
      };
      pricing.leaseDuration = leaseMap[pricing.leaseDuration] || pricing.leaseDuration;
    }

    // Standardize preferredTenants option (must be an array of enum values in the backend)
    if (pricing.preferredTenants) {
      let tenantsVal = pricing.preferredTenants;
      if (!Array.isArray(tenantsVal)) {
        tenantsVal = [tenantsVal];
      }
      pricing.preferredTenants = tenantsVal.map((t: string) => {
        const m: Record<string, string> = {
          'Bachelors': 'Bachelor Male',
          'Female Tenants': 'Bachelor Female',
          'Any': 'Any',
          'Family': 'Family',
        };
        return m[t] || t;
      });
    }

    // Standardize lockInPeriod options for Rental listings
    if (pricing.lockInPeriod) {
      const lockInMap: Record<string, string> = {
        '1 Month': 'None',
        '3 Months': '3 months',
        '6 Months': '6 months',
        '1 Year': '1 year',
        'None': 'None',
      };
      pricing.lockInPeriod = lockInMap[pricing.lockInPeriod] || pricing.lockInPeriod.toLowerCase();
    }

    return {
      title: s.step1.title,
      description: s.step1.description,
      listingCategory,
      propertyType,
      propertyListedBy: s.step0.propertyListedBy,
      location,
      details,
      pricing,
      // Prefer pre-uploaded CDN URLs from the eager upload cache;
      // fall back to caller-supplied URLs, then raw step5 URIs as last resort.
      photos: uploadedPhotos
        ? uploadedPhotos
        : s.step5.photos.map((uri) => s.uploadCache.photoUrls[uri] ?? uri),
      video: uploadedVideoUrl !== undefined
        ? uploadedVideoUrl
        : (s.uploadCache.videoUrl ?? s.step5.video ?? null),
      amenities: s.step6.amenities,
    };
  },

  // ─── Reset ─────────────────────────────────────────────────────────────────

  resetAll: () =>
    set({
      currentStep: 1,
      wizardPhase: 'listed_by',
      step0: initialStep0,
      step1: initialStep1,
      step2: initialStep2,
      step3: {},
      step4: {},
      step5: { photos: [], video: null },
      step6: { amenities: [], customAmenities: [] },
      errors: {},
      isSubmitting: false,
      isDraft: false,
      editingPropertyId: null,
      editOrigin: null,
      uploadCache: { photoUrls: {}, videoUrl: null, isUploading: false },
    }),

  // ─── Edit Loader ───────────────────────────────────────────────────────────

  loadPropertyForEdit: (property, origin) => {
    const reverseCategoryMap: Record<string, ListingCategory> = {
      'Resale': 'resale',
      'Rental': 'rental',
      'New': 'new',
    };

    const reverseTypeMap: Record<string, PropertyType> = {
      'Flat/Apartment': 'flat',
      'Villa/Independent House': 'villa',
      'Builder Floor': 'builder_floor',
      'Penthouse': 'penthouse',
      'Office Space': 'office',
      'Shop': 'shop',
      'Showroom': 'showroom',
      'Warehouse/Godown': 'warehouse',
      'Residential Plot': 'res_plot',
      'Agricultural Land': 'agri_land',
    };

    const category = reverseCategoryMap[property.listingCategory] || 'resale';
    const type = reverseTypeMap[property.propertyType] || 'flat';

    const step1: Step1Data = {
      title: property.title || '',
      listingCategory: category,
      propertyType: type,
      description: property.description || '',
    };

    const loc = property.location || {};
    const coords = loc.coordinates?.coordinates || [];
    const step2: Step2Data = {
      city: loc.city || 'Nagpur',
      locality: loc.locality || '',
      subLocality: loc.subLocality || '',
      landmark: loc.landmark || '',
      pinCode: loc.pinCode || '',
      latitude: coords[1] || null,
      longitude: coords[0] || null,
    };

    const details = { ...property.details };
    const pricing = { ...property.pricing };

    // Parse priceRange min/max values for front-end slider representation
    if (pricing.priceRange && typeof pricing.priceRange === 'string') {
      const parts = pricing.priceRange.split('-');
      if (parts.length === 2) {
        const minVal = parseInt(parts[0], 10);
        const maxVal = parseInt(parts[1], 10);
        if (!isNaN(minVal) && !isNaN(maxVal)) {
          pricing.priceRangeMin = minVal;
          pricing.priceRangeMax = maxVal;
        }
      }
    }

    if (details.ageOfProperty) {
      const reverseAgeMap: Record<string, string> = {
        'New': 'New',
        '1-3 yrs': '1–3 Years',
        '3-5 yrs': '3–5 Years',
        '5-10 yrs': '5–10 Years',
        '10+ yrs': '10+ Years',
      };
      if (reverseAgeMap[details.ageOfProperty]) {
        details.ageOfProperty = reverseAgeMap[details.ageOfProperty];
      }
    }

    if (Array.isArray(details.suitableFor)) {
      const reverseSuitableMap: Record<string, string> = {
        'Food': 'Food & Beverage',
        'Clinic': 'Medical',
      };
      details.suitableFor = details.suitableFor.map((item: string) => {
        return reverseSuitableMap[item] || item;
      });
    }

    if (details.shopFloor !== undefined && details.shopFloor !== null) {
      const reverseFloorMap: Record<string, number> = {
        'Lower Ground': -1,
        'Ground': 0,
        '1st': 1,
        '2nd': 2,
        '3rd+': 3,
      };
      if (reverseFloorMap[details.shopFloor] !== undefined) {
        details.shopFloor = reverseFloorMap[details.shopFloor];
      }
    }

    // Normalize ISO date strings (e.g. "2025-06-01T00:00:00.000Z") to plain
    // "YYYY-MM-DD" so the date picker and formatDateDisplay work correctly in edit mode.
    const normalizeDateField = (val: any): string | undefined => {
      if (!val) return undefined;
      const str = String(val);
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str; // already correct
      if (str.length >= 10) return str.slice(0, 10);    // trim ISO string
      return undefined;
    };
    if (pricing.availableFrom) {
      pricing.availableFrom = normalizeDateField(pricing.availableFrom);
    }
    if (pricing.possessionDate) {
      pricing.possessionDate = normalizeDateField(pricing.possessionDate);
    }
    // details.possessionDate is the "Expected Possession Date" in Step 8 (WizardDetailsBScreen)
    // for new projects — normalize it the same way.
    if (details.possessionDate) {
      details.possessionDate = normalizeDateField(details.possessionDate);
    }

    const step0: Step0Data = {
      propertyListedBy: (property.propertyListedBy as PropertyListedBy) || null,
    };

    set({
      editingPropertyId: property._id || property.id || null,
      editOrigin: origin || null,
      step0,
      step1,
      step2,
      step3: details,
      step4: pricing,
      step5: {
        photos: Array.isArray(property.photos) ? property.photos : [],
        video: property.video || null,
      },
      step6: {
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        customAmenities: (Array.isArray(property.amenities) ? property.amenities : []).filter(
          (am: string) => !PREDEFINED_AMENITIES.includes(am)
        ),
      },
      wizardPhase: 'review',
      errors: {},
    });
  },

  clearEdit: () => set({ editingPropertyId: null, editOrigin: null }),
}));

// ─── Derived selectors (use outside store for performance) ────────────────────

export const selectCurrentCombo = (s: AddPropertyStore) => ({
  category: s.step1.listingCategory,
  type: s.step1.propertyType,
});

export const selectPhotoCount = (s: AddPropertyStore) => s.step5.photos.length;
export const selectAmenityCount = (s: AddPropertyStore) => s.step6.amenities.length;