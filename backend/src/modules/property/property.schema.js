import { z } from 'zod';
import {
  LISTING_CATEGORIES,
  LISTING_TYPES_MESSAGE,
  PROPERTY_TYPES,
  PROPERTY_TYPES_MESSAGE,
  PROPERTY_STATUSES,
  PROPERTY_STATUSES_MESSAGE,
  LOCALITY_MAX_LENGTH_LIMIT,
  LOCALITY_MAX_LENGTH_LIMIT_MESSAGE,
  LOCALITY_MIN_LENGTH_LIMIT,
  LOCALITY_MIN_LENGTH_LIMIT_MESSAGE,
  FURNISHING_OPTIONS,
  FURNISHING_OPTIONS_MESSAGE,
  PINCODE_REGEX,
  PINCODE_REGEX_MESSAGE,
  SUB_LOCALITY_LENGTH_LIMIT,
  SUB_LOCALITY_LENGTH_LIMIT_MESSAGE,
  LANDMARK_LENGTH_LIMIT,
  LANDMARK_LENGTH_LIMIT_MESSAGE,
  BHK_MIN_LENGTH_LIMIT,
  BHK_MAX_LENGTH_LIMIT,
  BHK_MAX_LENGTH_LIMIT_MESSAGE,
  BATHROOMS_MIN_LENGTH_LIMIT,
  BATHROOMS_MAX_LENGTH_LIMIT,
  BATHROOMS_MAX_LENGTH_LIMIT_MESSAGE,
  BALCONIES_MIN_LENGTH_LIMIT,
  BALCONIES_MAX_LENGTH_LIMIT,
  BALCONIES_MAX_LENGTH_LIMIT_MESSAGE,
  FLOOR_NUMBER_MIN_LENGTH_LIMIT,
  FLOOR_NUMBER_MAX_LENGTH_LIMIT,
  FLOOR_NUMBER_MAX_LENGTH_LIMIT_MESSAGE,
  TOTAL_FLOORS_MIN_LENGTH_LIMIT,
  TOTAL_FLOORS_MAX_LENGTH_LIMIT,
  TOTAL_FLOORS_MAX_LENGTH_LIMIT_MESSAGE,
  FACING_OPTIONS,
  FACING_OPTIONS_MESSAGE,
  AGE_OF_PROPERTY,
  AGE_OF_PROPERTY_MESSAGE,
  FLOOR_TYPE,
  FLOOR_TYPE_MESSAGE,
  WATER_SUPPLY,
  WATER_SUPPLY_MESSAGE,
  ELECTRICITY_STATUS,
  ELECTRICITY_STATUS_MESSAGE,
  FLOOR_OWNERSHIP_TYPES,
  FLOOR_OWNERSHIP_TYPES_MESSAGE,
  SHOP_FLOOR_OPTIONS,
  SHOP_FLOOR_OPTIONS_MESSAGE,
  FOOTFALL_RATING_OPTIONS,
  FOOTFALL_RATING_OPTIONS_MESSAGE,
  SUITABLE_FOR_OPTIONS,
  SUITABLE_FOR_OPTIONS_MESSAGE,
  ROAD_TYPES,
  ROAD_TYPES_MESSAGE,
  IRRIGATION_TYPES,
  IRRIGATION_TYPES_MESSAGE,
  SOIL_TYPES,
  SOIL_TYPES_MESSAGE,
  WATER_SOURCE_OPTIONS,
  WATER_SOURCE_OPTIONS_MESSAGE,
  APPROVED_BY_OPTIONS,
  APPROVED_BY_OPTIONS_MESSAGE,
  CONSTRUCTION_STATUS_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS_MESSAGE,
  CC_OC_OPTIONS,
  CC_OC_OPTIONS_MESSAGE,
  DEVELOPMENT_STATUS_OPTIONS,
  DEVELOPMENT_STATUS_OPTIONS_MESSAGE,
  POSSESSION_TIMELINE_OPTIONS,
  POSSESSION_TIMELINE_OPTIONS_MESSAGE,
  PREFERRED_TENANTS_OPTIONS,
  PREFERRED_TENANTS_OPTIONS_MESSAGE,
  LEASE_DURATION_OPTIONS,
  LEASE_DURATION_OPTIONS_MESSAGE,
  LOCK_IN_PERIOD_OPTIONS,
  LOCK_IN_PERIOD_OPTIONS_MESSAGE,
  TITLE_MAX_LENGTH,
  TITLE_MAX_LENGTH_MESSAGE,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MIN_LENGTH_MESSAGE,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH_MESSAGE,
  NUMBER_OF_FLOORS_MAX_LENGTH,
  NUMBER_OF_FLOORS_MAX_LENGTH_MESSAGE,
  FLOOR_LOAD_CAPACITY_MAX_LENGTH,
  FLOOR_LOAD_CAPACITY_MAX_LENGTH_MESSAGE,
  TREES_PLANTATION_MAX_LENGTH,
  TREES_PLANTATION_MAX_LENGTH_MESSAGE,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH_MESSAGE,
  BUILDER_NAME_MAX_LENGTH,
  BUILDER_NAME_MAX_LENGTH_MESSAGE,
  TOWER_WING_MAX_LENGTH,
  TOWER_WING_MAX_LENGTH_MESSAGE,
  APPROVED_BANKS_MAX_LENGTH,
  APPROVED_BANKS_MAX_LENGTH_MESSAGE,
  LAYOUT_PROJECT_NAME_MAX_LENGTH,
  LAYOUT_PROJECT_NAME_MAX_LENGTH_MESSAGE,
  BROKERAGE_MAX_LENGTH,
  BROKERAGE_MAX_LENGTH_MESSAGE,
  PRICE_RANGE_MAX_LENGTH,
  PRICE_RANGE_MAX_LENGTH_MESSAGE,
  REJECTED_REASON_MAX_LENGTH,
  REJECTED_REASON_MAX_LENGTH_MESSAGE,
  PARKING_SLOTS_MIN,
  PARKING_SLOTS_MAX,
  PARKING_SLOTS_MESSAGE,
  CABIN_COUNT_MIN,
  CABIN_COUNT_MAX,
  CABIN_COUNT_MESSAGE,
  OPEN_DESKS_MIN,
  OPEN_DESKS_MAX,
  OPEN_DESKS_MESSAGE,
  WASHROOMS_MIN,
  WASHROOMS_MAX,
  WASHROOMS_MESSAGE,
  NUMBER_OF_SHOWROOM_FLOORS_MIN,
  NUMBER_OF_SHOWROOM_FLOORS_MAX,
  NUMBER_OF_SHOWROOM_FLOORS_MESSAGE,
  NUMBER_OF_DOCKS_MIN,
  NUMBER_OF_DOCKS_MAX,
  NUMBER_OF_DOCKS_MESSAGE,
  POSSESSION_DATE_REGEX,
  POSSESSION_DATE_REGEX_MESSAGE,
  PHOTOS_MIN_COUNT,
  PHOTOS_MIN_COUNT_MESSAGE,
  PHOTOS_MAX_COUNT,
  PHOTOS_MAX_COUNT_MESSAGE,
  ZONE_TYPES,
  ZONE_TYPES_MESSAGE,
  PROPERTY_LISTED_BY_OPTIONS,
  PROPERTY_LISTED_BY_OPTIONS_MESSAGE,
} from '../../modules/property/property.constants.js';
// FIX #9: removed unused `import { de } from 'zod/v4/locales'`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const positiveNumber = () => z.number({ coerce: true }).positive();
const optionalPosNum = () => z.number({ coerce: true }).positive().nullable().optional();
const optionalBool = () => z.boolean().nullable().optional();
const optionalString = (max, msg) => z.string().max(max, msg).nullable().optional();
const optionalEnum = (values, msg) => z.enum(values, { errorMap: () => ({ message: msg }) }).nullable().optional();
const safeCoerceDate = () => z.preprocess((val) => {
  if (val === '' || val === undefined) return undefined;
  if (val === null) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}, z.date().nullable().optional());

// ─── Location schema ──────────────────────────────────────────────────────────
const locationSchema = z.object({
  locality: z.string().max(LOCALITY_MAX_LENGTH_LIMIT, LOCALITY_MAX_LENGTH_LIMIT_MESSAGE).min(LOCALITY_MIN_LENGTH_LIMIT, LOCALITY_MIN_LENGTH_LIMIT_MESSAGE),
  subLocality: optionalString(SUB_LOCALITY_LENGTH_LIMIT, SUB_LOCALITY_LENGTH_LIMIT_MESSAGE),
  landmark: optionalString(LANDMARK_LENGTH_LIMIT, LANDMARK_LENGTH_LIMIT_MESSAGE),
  pinCode: z.string().regex(PINCODE_REGEX, PINCODE_REGEX_MESSAGE).nullable().optional(),
  coordinates: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]'),
  }),
});

// ─── Shared detail schemas ────────────────────────────────────────────────────

/** Core fields shared by Flat, Builder Floor, Penthouse */
const residentialBase = z.object({
  bhk: z.number({ coerce: true }).int().min(BHK_MIN_LENGTH_LIMIT).max(BHK_MAX_LENGTH_LIMIT, BHK_MAX_LENGTH_LIMIT_MESSAGE),
  bathrooms: z.number({ coerce: true }).int().min(BATHROOMS_MIN_LENGTH_LIMIT).max(BATHROOMS_MAX_LENGTH_LIMIT, BATHROOMS_MAX_LENGTH_LIMIT_MESSAGE),
  balconies: z.number({ coerce: true }).int().min(BALCONIES_MIN_LENGTH_LIMIT).max(BALCONIES_MAX_LENGTH_LIMIT, BALCONIES_MAX_LENGTH_LIMIT_MESSAGE).nullable().optional(),
  floorNumber: z.number({ coerce: true }).int().min(FLOOR_NUMBER_MIN_LENGTH_LIMIT).max(FLOOR_NUMBER_MAX_LENGTH_LIMIT, FLOOR_NUMBER_MAX_LENGTH_LIMIT_MESSAGE),
  totalFloors: z.number({ coerce: true }).int().min(TOTAL_FLOORS_MIN_LENGTH_LIMIT).max(TOTAL_FLOORS_MAX_LENGTH_LIMIT, TOTAL_FLOORS_MAX_LENGTH_LIMIT_MESSAGE),
  carpetArea: positiveNumber(),
  builtUpArea: optionalPosNum(),
  superBuiltUpArea: optionalPosNum(),
  furnishing: z.enum(FURNISHING_OPTIONS, { errorMap: () => ({ message: FURNISHING_OPTIONS_MESSAGE }) }),
  facing: optionalEnum(FACING_OPTIONS, FACING_OPTIONS_MESSAGE),
  ageOfProperty: optionalEnum(AGE_OF_PROPERTY, AGE_OF_PROPERTY_MESSAGE),
  floorType: optionalEnum(FLOOR_TYPE, FLOOR_TYPE_MESSAGE),
  waterSupply: optionalEnum(WATER_SUPPLY, WATER_SUPPLY_MESSAGE),
  electricityStatus: optionalEnum(ELECTRICITY_STATUS, ELECTRICITY_STATUS_MESSAGE),
  reraRegistered: optionalBool(),
  reraNumber: z.string().nullable().optional(),
});

const villaBase = z.object({
  bhk: z.number({ coerce: true }).int().min(BHK_MIN_LENGTH_LIMIT).max(BHK_MAX_LENGTH_LIMIT, BHK_MAX_LENGTH_LIMIT_MESSAGE),
  bathrooms: z.number({ coerce: true }).int().min(BATHROOMS_MIN_LENGTH_LIMIT).max(BATHROOMS_MAX_LENGTH_LIMIT, BATHROOMS_MAX_LENGTH_LIMIT_MESSAGE),
  numberOfFloors: z.string().max(NUMBER_OF_FLOORS_MAX_LENGTH, NUMBER_OF_FLOORS_MAX_LENGTH_MESSAGE),
  plotArea: positiveNumber(),
  builtUpArea: positiveNumber(),
  carpetArea: optionalPosNum(),
  furnishing: z.enum(FURNISHING_OPTIONS, { errorMap: () => ({ message: FURNISHING_OPTIONS_MESSAGE }) }),
  facing: optionalEnum(FACING_OPTIONS, FACING_OPTIONS_MESSAGE),
  parkingSlots: z.number({ coerce: true }).int().min(PARKING_SLOTS_MIN).max(PARKING_SLOTS_MAX, PARKING_SLOTS_MESSAGE),
  hasGarden: optionalBool(),
  cornerProperty: optionalBool(),
  gatedSociety: optionalBool(),
  independentEntry: optionalBool(),
  roadWidth: optionalPosNum(),
  waterSupply: optionalEnum(WATER_SUPPLY, WATER_SUPPLY_MESSAGE),
  floorType: optionalEnum(FLOOR_TYPE, FLOOR_TYPE_MESSAGE),
  ageOfProperty: optionalEnum(AGE_OF_PROPERTY, AGE_OF_PROPERTY_MESSAGE),
  reraRegistered: optionalBool(),
  reraNumber: z.string().nullable().optional(),
  // pet / diet prefs shown for all villa categories (doc §5, §16, §27)
  petFriendly: optionalBool(),
  nonVegAllowed: optionalBool(),
});

const penthouseExtra = z.object({
  terraceArea: optionalPosNum(),
  privateLift: optionalBool(),
  isDuplex: optionalBool(),
  servantRoom: optionalBool(),
  privatePool: optionalBool(),
});

const builderFloorExtra = z.object({
  totalUnitsInBuilding: optionalPosNum(),
  floorOwnershipType: optionalEnum(FLOOR_OWNERSHIP_TYPES, FLOOR_OWNERSHIP_TYPES_MESSAGE),
  stiltParking: optionalBool(),
});

const commercialOfficeBase = z.object({
  carpetArea: positiveNumber(),
  builtUpArea: optionalPosNum(),
  superBuiltUpArea: optionalPosNum(),
  floorNumber: z.number({ coerce: true }).int().min(FLOOR_NUMBER_MIN_LENGTH_LIMIT).max(FLOOR_NUMBER_MAX_LENGTH_LIMIT, FLOOR_NUMBER_MAX_LENGTH_LIMIT_MESSAGE),
  totalFloors: optionalPosNum(),
  furnishing: z.enum(FURNISHING_OPTIONS, { errorMap: () => ({ message: FURNISHING_OPTIONS_MESSAGE }) }),
  washrooms: z.number({ coerce: true }).int().min(WASHROOMS_MIN).max(WASHROOMS_MAX, WASHROOMS_MESSAGE),
  cabinCount: z.number({ coerce: true }).int().min(CABIN_COUNT_MIN).max(CABIN_COUNT_MAX, CABIN_COUNT_MESSAGE).nullable().optional(),
  openDesks: z.number({ coerce: true }).int().min(OPEN_DESKS_MIN).max(OPEN_DESKS_MAX, OPEN_DESKS_MESSAGE).nullable().optional(),
  hasPantry: optionalBool(),
  itReady: optionalBool(),
  conferenceRoom: optionalBool(),
  receptionArea: optionalBool(),
  centralAC: optionalBool(),
  officeFireSafety: optionalBool(),
  dgBackup: optionalBool(),
  ageOfProperty: optionalEnum(AGE_OF_PROPERTY, AGE_OF_PROPERTY_MESSAGE),
});

const shopBase = z.object({
  carpetArea: positiveNumber(),
  builtUpArea: optionalPosNum(),
  shopFloor: z.enum(SHOP_FLOOR_OPTIONS, { errorMap: () => ({ message: SHOP_FLOOR_OPTIONS_MESSAGE }) }),
  frontage: optionalPosNum(),
  depth: optionalPosNum(),
  ceilingHeight: optionalPosNum(),
  mainRoadFacing: optionalBool(),
  cornerShop: optionalBool(),
  mezzanineFloor: optionalBool(),
  hasWashroom: optionalBool(),
  footfallRating: optionalEnum(FOOTFALL_RATING_OPTIONS, FOOTFALL_RATING_OPTIONS_MESSAGE),
  suitableFor: z.array(z.enum(SUITABLE_FOR_OPTIONS, { errorMap: () => ({ message: SUITABLE_FOR_OPTIONS_MESSAGE }) })).optional(),
  ageOfProperty: optionalEnum(AGE_OF_PROPERTY, AGE_OF_PROPERTY_MESSAGE),
});

const showroomBase = z.object({
  showroomArea: positiveNumber(),
  numberOfShowroomFloors: z.number({ coerce: true }).int().min(NUMBER_OF_SHOWROOM_FLOORS_MIN).max(NUMBER_OF_SHOWROOM_FLOORS_MAX, NUMBER_OF_SHOWROOM_FLOORS_MESSAGE).nullable().optional(),
  frontage: optionalPosNum(),
  ceilingHeight: optionalPosNum(),
  glassFront: optionalBool(),
  parkingAvailable: z.boolean(),
  acInstalled: optionalBool(),
  mainRoadFacing: optionalBool(),
  ageOfProperty: optionalEnum(AGE_OF_PROPERTY, AGE_OF_PROPERTY_MESSAGE),
});

const warehouseBase = z.object({
  warehouseArea: positiveNumber(),
  warehouseHeight: positiveNumber(),
  truckAccess: z.boolean(),
  numberOfDocks: z.number({ coerce: true }).int().min(NUMBER_OF_DOCKS_MIN).max(NUMBER_OF_DOCKS_MAX, NUMBER_OF_DOCKS_MESSAGE).nullable().optional(),
  floorLoadCapacity: optionalString(FLOOR_LOAD_CAPACITY_MAX_LENGTH, FLOOR_LOAD_CAPACITY_MAX_LENGTH_MESSAGE),
  openYardArea: optionalPosNum(),
  powerLoad: optionalPosNum(),
  waterSupplyWarehouse: optionalBool(),
  officeSpaceInside: optionalBool(),
  midc: optionalBool(),
  ageOfProperty: optionalEnum(AGE_OF_PROPERTY, AGE_OF_PROPERTY_MESSAGE),
});

const residentialPlotBase = z.object({
  plotAreaSqFt: positiveNumber(),
  plotLength: optionalPosNum(),
  plotWidth: optionalPosNum(),
  facing: optionalEnum(FACING_OPTIONS, FACING_OPTIONS_MESSAGE),
  roadWidth: optionalPosNum(),
  boundaryWall: optionalBool(),
  gatedLayout: optionalBool(),
  cornerPlot: optionalBool(),
  approvedBy: z.array(z.enum(APPROVED_BY_OPTIONS, { errorMap: () => ({ message: APPROVED_BY_OPTIONS_MESSAGE }) })).optional(),
  zoneType: optionalEnum(ZONE_TYPES, ZONE_TYPES_MESSAGE),
  fsiAvailable: optionalPosNum(),
});

const agriLandBase = z.object({
  areaAcres: positiveNumber(),
  // FIX #8: accept auto-calculated field from frontend
  areaHectares: optionalPosNum(),
  waterSource: z.array(z.enum(WATER_SOURCE_OPTIONS, { errorMap: () => ({ message: WATER_SOURCE_OPTIONS_MESSAGE }) })).optional(),
  roadAccess: z.boolean(),
  roadType: optionalEnum(ROAD_TYPES, ROAD_TYPES_MESSAGE),
  fencing: optionalBool(),
  treesPlantation: optionalString(TREES_PLANTATION_MAX_LENGTH, TREES_PLANTATION_MAX_LENGTH_MESSAGE),
  irrigationType: optionalEnum(IRRIGATION_TYPES, IRRIGATION_TYPES_MESSAGE),
  electricityLand: optionalBool(),
  distanceFromCity: optionalPosNum(),
  sevenTwelveExtract: optionalBool(),
  soilType: optionalEnum(SOIL_TYPES, SOIL_TYPES_MESSAGE),
  // FIX #16: doc §13 restricts agri land ownership to Individual / Joint / Family only
  ownershipType: z.enum(['Individual', 'Joint', 'Family'], {
    errorMap: () => ({ message: 'Ownership type for Agricultural Land must be Individual, Joint, or Family' }),
  }),
});

// ─── Pricing schemas ──────────────────────────────────────────────────────────
const resalePricing = z.object({
  totalPrice: positiveNumber(),
  pricePerSqft: optionalPosNum(),
  priceNegotiable: optionalBool(),
  possessionTimeline: optionalEnum(POSSESSION_TIMELINE_OPTIONS, POSSESSION_TIMELINE_OPTIONS_MESSAGE),
  brokerage: optionalString(BROKERAGE_MAX_LENGTH, BROKERAGE_MAX_LENGTH_MESSAGE),
});

const rentalPricing = z.object({
  monthlyRent: positiveNumber(),
  annualLease: optionalPosNum(),
  securityDeposit: positiveNumber(),
  maintenance: z.number({ coerce: true }).min(0).nullable().optional(),
  availableFrom: safeCoerceDate(),
  preferredTenants: z.array(z.enum(PREFERRED_TENANTS_OPTIONS, { errorMap: () => ({ message: PREFERRED_TENANTS_OPTIONS_MESSAGE }) })).optional(),
  leaseDuration: optionalEnum(LEASE_DURATION_OPTIONS, LEASE_DURATION_OPTIONS_MESSAGE),
  lockInPeriod: optionalEnum(LOCK_IN_PERIOD_OPTIONS, LOCK_IN_PERIOD_OPTIONS_MESSAGE),
  rentNegotiable: optionalBool(),
  possessionTimeline: optionalEnum(POSSESSION_TIMELINE_OPTIONS, POSSESSION_TIMELINE_OPTIONS_MESSAGE),
  brokerage: optionalString(BROKERAGE_MAX_LENGTH, BROKERAGE_MAX_LENGTH_MESSAGE),
});

const newPricing = z.object({
  startingPrice: positiveNumber(),
  pricePerSqft: optionalPosNum(),
  priceRange: optionalString(PRICE_RANGE_MAX_LENGTH, PRICE_RANGE_MAX_LENGTH_MESSAGE),
  bookingAmount: optionalPosNum(),
  gstApplicable: optionalBool(),
  possessionDate: z.string().regex(POSSESSION_DATE_REGEX, POSSESSION_DATE_REGEX_MESSAGE),
  priceNegotiable: optionalBool(),
  possessionTimeline: optionalEnum(POSSESSION_TIMELINE_OPTIONS, POSSESSION_TIMELINE_OPTIONS_MESSAGE),
  brokerage: optionalString(BROKERAGE_MAX_LENGTH, BROKERAGE_MAX_LENGTH_MESSAGE),
});

// ─── New Project details ──────────────────────────────────────────────────────
const newProjectDetails = z.object({
  projectName: z.string().min(1).max(PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH_MESSAGE),
  builderName: z.string().min(1).max(BUILDER_NAME_MAX_LENGTH, BUILDER_NAME_MAX_LENGTH_MESSAGE),
  reraNumber: z.string().min(1, 'RERA Number is required for new projects'),
  projectReraNumber: z.string().min(1, 'Project RERA Number is required for new projects'),
  reraValidityDate: safeCoerceDate(),
  constructionStatus: z.enum(CONSTRUCTION_STATUS_OPTIONS, { errorMap: () => ({ message: CONSTRUCTION_STATUS_OPTIONS_MESSAGE }) }),
  possessionDate: z.string().regex(POSSESSION_DATE_REGEX, POSSESSION_DATE_REGEX_MESSAGE),
  totalUnitsInProject: optionalPosNum(),
  unitsAvailable: z.number({ coerce: true }).min(0).nullable().optional(),
  towerWing: optionalString(TOWER_WING_MAX_LENGTH, TOWER_WING_MAX_LENGTH_MESSAGE),
  approvedBanks: optionalString(APPROVED_BANKS_MAX_LENGTH, APPROVED_BANKS_MAX_LENGTH_MESSAGE),
  ccOcReceived: optionalEnum(CC_OC_OPTIONS, CC_OC_OPTIONS_MESSAGE),
});

// ─── Resale ownership mixin ───────────────────────────────────────────────────
/** Standard ownership + readyToMove fields for Resale residential types */
const resaleResidentialExtra = z.object({
  ownershipType: z.enum(
    ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'],
    { errorMap: () => ({ message: 'Ownership type must be Freehold, Leasehold, Co-operative Society, or Power of Attorney' }) }
  ).optional(),
  readyToMove: z.boolean().optional(),
});

// ─── Base property schema ─────────────────────────────────────────────────────
export const basePropertySchema = z.object({
  title: z.string().min(1).max(TITLE_MAX_LENGTH, TITLE_MAX_LENGTH_MESSAGE),
  listingCategory: z.enum(LISTING_CATEGORIES, { errorMap: () => ({ message: LISTING_TYPES_MESSAGE }) }),
  propertyType: z.enum(PROPERTY_TYPES, { errorMap: () => ({ message: PROPERTY_TYPES_MESSAGE }) }),
  propertyListedBy: z.enum(PROPERTY_LISTED_BY_OPTIONS, { errorMap: () => ({ message: PROPERTY_LISTED_BY_OPTIONS_MESSAGE }) }),
  description: z.string().min(DESCRIPTION_MIN_LENGTH, DESCRIPTION_MIN_LENGTH_MESSAGE).max(DESCRIPTION_MAX_LENGTH, DESCRIPTION_MAX_LENGTH_MESSAGE),
  location: locationSchema,
  amenities: z.array(z.string()).optional().default([]),
  photos: z
    .array(z.string().url('Each photo must be a valid URL'))
    .min(PHOTOS_MIN_COUNT, PHOTOS_MIN_COUNT_MESSAGE)
    .max(PHOTOS_MAX_COUNT, PHOTOS_MAX_COUNT_MESSAGE),
  video: z.string().url('Video must be a valid URL').nullable().optional(),
  // Include details and pricing for creation (validated further in controller)
  details: z.unknown().optional(),
  pricing: z.unknown().optional(),
}).passthrough();

/**
 * Full create/update schema — validates details + pricing based on
 * (listingCategory × propertyType). Called in the controller after
 * parsing req.body.
 *
 * Returns { error } if invalid, { data } if valid.
 */
export function validatePropertyPayload(payload) {
  const base = basePropertySchema.safeParse(payload);
  if (!base.success) {
    return {
      errors: base.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    };
  }

  const { listingCategory, propertyType } = base.data;
  const details = payload.details || {};
  const pricing = payload.pricing || {};

  // ── Validate Details ──────────────────────────────────────────────────────
  let detailsResult;

  switch (propertyType) {

    // ── Flat / Apartment ────────────────────────────────────────────────────
    case 'Flat/Apartment': {
      if (listingCategory === 'New') {
        detailsResult = residentialBase.merge(newProjectDetails).safeParse(details);
      } else if (listingCategory === 'Resale') {
        detailsResult = residentialBase.merge(resaleResidentialExtra).safeParse(details);
      } else {
        // Rental — FIX #14: add petFriendly / nonVegAllowed (doc §15)
        detailsResult = residentialBase.merge(z.object({
          petFriendly: optionalBool(),
          nonVegAllowed: optionalBool(),
        })).safeParse(details);
      }
      break;
    }

    // ── Builder Floor ───────────────────────────────────────────────────────
    case 'Builder Floor': {
      // FIX #10: was building `schema` but never assigning detailsResult — fixed
      // FIX #11: builderFloorExtra now correctly merged here, not inside Penthouse
      let schema = residentialBase.merge(builderFloorExtra);

      if (listingCategory === 'New') {
        schema = schema.merge(newProjectDetails);
      } else if (listingCategory === 'Resale') {
        schema = schema.merge(resaleResidentialExtra);
      } else {
        // Rental — doc §17 shows petFriendly / nonVegAllowed
        schema = schema.merge(z.object({
          petFriendly: optionalBool(),
          nonVegAllowed: optionalBool(),
        }));
      }

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Penthouse ───────────────────────────────────────────────────────────
    case 'Penthouse': {
      // FIX #11: penthouseExtra always merged; removed dead Builder Floor inner check
      let schema = residentialBase.merge(penthouseExtra);

      if (listingCategory === 'New') {
        schema = schema.merge(newProjectDetails);
      } else if (listingCategory === 'Resale') {
        schema = schema.merge(resaleResidentialExtra).merge(z.object({
          petFriendly: optionalBool(),
          nonVegAllowed: optionalBool(),
        }));
      } else {
        // Rental only — FIX #12: was incorrectly adding these for New too (doc §18)
        schema = schema.merge(z.object({
          petFriendly: optionalBool(),
          nonVegAllowed: optionalBool(),
        }));
      }

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Villa / Independent House ───────────────────────────────────────────
    case 'Villa/Independent House': {
      // villaBase already includes petFriendly / nonVegAllowed for all categories
      let schema = villaBase;

      if (listingCategory === 'Resale') {
        // doc §5: Villa Resale ownership limited to Freehold / Leasehold / Power of Attorney
        schema = schema.merge(z.object({
          ownershipType: z.enum(['Freehold', 'Leasehold', 'Power of Attorney'], {
            errorMap: () => ({ message: 'Ownership type must be Freehold, Leasehold, or Power of Attorney' }),
          }),
          readyToMove: z.boolean(),
        }));
      } else if (listingCategory === 'New') {
        // doc §27: omit approvedBanks and ccOcReceived for villa new projects
        schema = schema
          .merge(newProjectDetails.omit({ approvedBanks: true, ccOcReceived: true }))
          .merge(z.object({ totalVillasInProject: optionalPosNum() }));
      }
      // Rental: villaBase is sufficient (doc §16)

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Office Space ────────────────────────────────────────────────────────
    case 'Office Space': {
      // FIX #15: ownershipType required for Resale (doc §8), optional for Rental (doc §19)
      let schema = commercialOfficeBase;

      if (listingCategory === 'New') {
        schema = schema.merge(newProjectDetails);
      } else if (listingCategory === 'Resale') {
        schema = schema.merge(z.object({
          ownershipType: z.enum(['Freehold', 'Leasehold'], {
            errorMap: () => ({ message: 'Ownership type must be Freehold or Leasehold' }),
          }),
        }));
      } else {
        // Rental: ownershipType not shown in doc §19
        schema = schema.merge(z.object({
          ownershipType: optionalEnum(['Freehold', 'Leasehold'], 'Ownership type must be Freehold or Leasehold'),
        }));
      }

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Shop ────────────────────────────────────────────────────────────────
    case 'Shop': {
      // FIX #15: ownershipType required for Resale (doc §9), not shown for Rental (doc §20)
      let schema = shopBase;

      if (listingCategory === 'New') {
        schema = schema.merge(newProjectDetails);
      } else if (listingCategory === 'Resale') {
        schema = schema.merge(z.object({
          ownershipType: z.enum(['Freehold', 'Leasehold'], {
            errorMap: () => ({ message: 'Ownership type must be Freehold or Leasehold' }),
          }),
        }));
      }

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Showroom ────────────────────────────────────────────────────────────
    case 'Showroom': {
      // FIX #15: ownershipType required for Resale (doc §10), not shown for Rental (doc §21)
      let schema = showroomBase;

      if (listingCategory === 'New') {
        schema = schema.merge(newProjectDetails);
      } else if (listingCategory === 'Resale') {
        schema = schema.merge(z.object({
          ownershipType: z.enum(['Freehold', 'Leasehold'], {
            errorMap: () => ({ message: 'Ownership type must be Freehold or Leasehold' }),
          }),
        }));
      }

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Warehouse / Godown ──────────────────────────────────────────────────
    case 'Warehouse/Godown': {
      let schema = warehouseBase;

      if (listingCategory === 'Resale') {
        schema = schema.merge(z.object({
          ownershipType: z.enum(['Freehold', 'Leasehold'], {
            errorMap: () => ({ message: 'Ownership type must be Freehold or Leasehold' }),
          }),
        }));
      } else if (listingCategory === 'New') {
        // doc §33: projectName / builderName optional, but RERA required for new warehouses
        schema = schema.merge(z.object({
          projectName: optionalString(PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH_MESSAGE),
          builderName: optionalString(BUILDER_NAME_MAX_LENGTH, BUILDER_NAME_MAX_LENGTH_MESSAGE),
          reraNumber: z.string().min(1, 'RERA Number is required for new projects'),
          projectReraNumber: z.string().min(1, 'Project RERA Number is required for new projects'),
          constructionStatus: z.enum(['Under Construction', 'Ready'], { errorMap: () => ({ message: CONSTRUCTION_STATUS_OPTIONS_MESSAGE }) }),
          possessionDate: safeCoerceDate(),
          towerWing: optionalString(TOWER_WING_MAX_LENGTH, TOWER_WING_MAX_LENGTH_MESSAGE),
          approvedBanks: optionalString(APPROVED_BANKS_MAX_LENGTH, APPROVED_BANKS_MAX_LENGTH_MESSAGE),
          ccOcReceived: optionalEnum(CC_OC_OPTIONS, CC_OC_OPTIONS_MESSAGE),
          approvedBy: z.array(z.enum(APPROVED_BY_OPTIONS, { errorMap: () => ({ message: APPROVED_BY_OPTIONS_MESSAGE }) })).optional(),
        }));
      }

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Residential Plot ────────────────────────────────────────────────────
    case 'Residential Plot': {
      let schema = residentialPlotBase;

      if (listingCategory === 'New') {
        schema = schema.merge(z.object({
          layoutProjectName: z.string().min(1).max(LAYOUT_PROJECT_NAME_MAX_LENGTH, LAYOUT_PROJECT_NAME_MAX_LENGTH_MESSAGE),
          builderName: z.string().min(1).max(BUILDER_NAME_MAX_LENGTH, BUILDER_NAME_MAX_LENGTH_MESSAGE),
          reraNumber: z.string().min(1, 'RERA Number is required for new projects'),
          projectReraNumber: z.string().min(1, 'Project RERA Number is required for new projects'),
          totalPlotsInLayout: optionalPosNum(),
          plotsAvailable: z.number({ coerce: true }).min(0).nullable().optional(),
          developmentStatus: z.enum(DEVELOPMENT_STATUS_OPTIONS, { errorMap: () => ({ message: DEVELOPMENT_STATUS_OPTIONS_MESSAGE }) }),
        }));
      } else if (listingCategory === 'Resale') {
        // FIX #17: ownershipType required for Resale (doc §12)
        schema = schema.merge(z.object({
          ownershipType: z.enum(['Freehold', 'Leasehold'], {
            errorMap: () => ({ message: 'Ownership type must be Freehold or Leasehold' }),
          }),
        }));
      }
      // Rental: no ownershipType shown in doc §23

      detailsResult = schema.safeParse(details);
      break;
    }

    // ── Agricultural Land ───────────────────────────────────────────────────
    case 'Agricultural Land': {
      // agriLandBase already enforces ownershipType = Individual/Joint/Family (FIX #16)
      // RERA not required for Agricultural Land, even for New listings
      if (listingCategory === 'New') {
        // New agricultural land doesn't require RERA like other new properties
        const schema = agriLandBase.merge(z.object({
          projectName: optionalString(PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH_MESSAGE),
          builderName: optionalString(BUILDER_NAME_MAX_LENGTH, BUILDER_NAME_MAX_LENGTH_MESSAGE),
        }));
        detailsResult = schema.safeParse(details);
      } else {
        detailsResult = agriLandBase.safeParse(details);
      }
      break;
    }

    default:
      return {
        errors: [
          {
            field: "propertyType",
            message: `Unsupported property type: ${propertyType}`,
          },
        ],
      };
  }

  if (!detailsResult.success) {
    return {
      errors: detailsResult.error.issues.map((i) => ({
        field: `details.${i.path.join('.')}`,
        message: i.message,
      })),
    };
  }

  // ── Validate Pricing ──────────────────────────────────────────────────────
  let pricingResult;

  if (listingCategory === 'Resale') {
    pricingResult = resalePricing.safeParse(pricing);
  } else if (listingCategory === 'Rental') {
    if (propertyType === 'Agricultural Land') {
      // doc §24: agri land rental uses annualLease (required), not monthlyRent
      pricingResult = rentalPricing
        .omit({ monthlyRent: true })
        .merge(z.object({ annualLease: positiveNumber() }))
        .safeParse(pricing);
    } else {
      pricingResult = rentalPricing.safeParse(pricing);
    }
  } else {
    pricingResult = newPricing.safeParse(pricing);
  }

  if (!pricingResult.success) {
    return {
      errors: pricingResult.error.issues.map((i) => ({
        field: `pricing.${i.path.join('.')}`,
        message: i.message,
      })),
    };
  }

  return {
    data: {
      ...base.data,
      details: detailsResult.data,
      pricing: pricingResult.data,
    },
  };
}

// ─── Status update schema ─────────────────────────────────────────────────────
export const updateStatusSchema = z.object({
  status: z.enum(PROPERTY_STATUSES, { errorMap: () => ({ message: PROPERTY_STATUSES_MESSAGE }) }),
  rejectedReason: optionalString(REJECTED_REASON_MAX_LENGTH, REJECTED_REASON_MAX_LENGTH_MESSAGE),
});

// ─── Update property schema (all fields optional for partial updates) ─────────
export const updatePropertySchema = z.object({
  title: z.string().min(1).max(TITLE_MAX_LENGTH, TITLE_MAX_LENGTH_MESSAGE).optional(),
  listingCategory: z.enum(LISTING_CATEGORIES, { errorMap: () => ({ message: LISTING_TYPES_MESSAGE }) }).optional(),
  propertyType: z.enum(PROPERTY_TYPES, { errorMap: () => ({ message: PROPERTY_TYPES_MESSAGE }) }).optional(),
  description: z.string().min(DESCRIPTION_MIN_LENGTH, DESCRIPTION_MIN_LENGTH_MESSAGE).max(DESCRIPTION_MAX_LENGTH, DESCRIPTION_MAX_LENGTH_MESSAGE).optional(),
  location: z.unknown().optional(),
  amenities: z.array(z.string()).optional(),
  // For updates, allow photos to be omitted or provided (with min 1 if provided, max 15)
  photos: z
    .array(z.string().url('Each photo must be a valid URL'))
    .min(PHOTOS_MIN_COUNT, PHOTOS_MIN_COUNT_MESSAGE)
    .max(PHOTOS_MAX_COUNT, PHOTOS_MAX_COUNT_MESSAGE)
    .optional(),
  video: z.string().url('Video must be a valid URL').nullable().optional(),
  // Allow partial updates to details and pricing (accept any object structure)
  details: z.unknown().optional(),
  pricing: z.unknown().optional(),
}).passthrough();