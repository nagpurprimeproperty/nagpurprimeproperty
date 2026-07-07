import mongoose from 'mongoose';

import {
  LISTING_CATEGORIES,
  LISTING_TYPES_MESSAGE,
  PROPERTY_TYPES,
  PROPERTY_TYPES_MESSAGE,
  PROPERTY_STATUSES,
  PROPERTY_STATUSES_MESSAGE,
  FURNISHING_OPTIONS,
  FURNISHING_OPTIONS_MESSAGE,
  PINCODE_REGEX,
  PINCODE_REGEX_MESSAGE,
  SUB_LOCALITY_LENGTH_LIMIT,
  SUB_LOCALITY_LENGTH_LIMIT_MESSAGE,
  LANDMARK_LENGTH_LIMIT,
  LANDMARK_LENGTH_LIMIT_MESSAGE,
  BHK_MIN_LENGTH_LIMIT,
  BHK_MIN_LENGTH_LIMIT_MESSAGE,
  BHK_MAX_LENGTH_LIMIT,
  BHK_MAX_LENGTH_LIMIT_MESSAGE,
  BATHROOMS_MIN_LENGTH_LIMIT,
  BATHROOMS_MIN_LENGTH_LIMIT_MESSAGE,
  BATHROOMS_MAX_LENGTH_LIMIT,
  BATHROOMS_MAX_LENGTH_LIMIT_MESSAGE,
  BALCONIES_MIN_LENGTH_LIMIT,
  BALCONIES_MIN_LENGTH_LIMIT_MESSAGE,
  BALCONIES_MAX_LENGTH_LIMIT,
  BALCONIES_MAX_LENGTH_LIMIT_MESSAGE,
  FLOOR_NUMBER_MIN_LENGTH_LIMIT,
  FLOOR_NUMBER_MIN_LENGTH_LIMIT_MESSAGE,
  FLOOR_NUMBER_MAX_LENGTH_LIMIT,
  FLOOR_NUMBER_MAX_LENGTH_LIMIT_MESSAGE,
  TOTAL_FLOORS_MIN_LENGTH_LIMIT,
  TOTAL_FLOORS_MIN_LENGTH_LIMIT_MESSAGE,
  TOTAL_FLOORS_MAX_LENGTH_LIMIT,
  TOTAL_FLOORS_MAX_LENGTH_LIMIT_MESSAGE,
  CARPET_AREA_MIN_LENGTH_LIMIT,
  CARPET_AREA_MIN_LENGTH_LIMIT_MESSAGE,
  BUILT_UP_AREA_MIN_LENGTH_limit,
  BUILT_UP_AREA_MIN_LENGTH_limit_MESSAGE,
  SUPER_BUILT_UP_AREA_MIN_LENGTH_limit,
  SUPER_BUILT_UP_AREA_MIN_LENGTH_limit_MESSAGE,
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
  OWNERSHIP_TYPES,
  OWNERSHIP_TYPES_MESSAGE,
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
  NA_ORDER_STATUS_OPTIONS,
  NA_ORDER_STATUS_OPTIONS_MESSAGE,
  WATER_SOURCE_OPTIONS,
  WATER_SOURCE_OPTIONS_MESSAGE,
  APPROVED_BY_OPTIONS,
  APPROVED_BY_OPTIONS_MESSAGE,
  ZONE_TYPES,
  ZONE_TYPES_MESSAGE,
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
  NA_ORDER_NUMBER_MAX_LENGTH,
  NA_ORDER_NUMBER_MAX_LENGTH_MESSAGE,
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
  PHOTOS_MIN_COUNT,
  PHOTOS_MIN_COUNT_MESSAGE,
  PHOTOS_MAX_COUNT,
  PHOTOS_MAX_COUNT_MESSAGE,
  CABIN_COUNT_MIN,
  CABIN_COUNT_MAX,
  OPEN_DESKS_MIN,
  OPEN_DESKS_MAX,
  WASHROOMS_MIN,
  WASHROOMS_MAX,
  PARKING_SLOTS_MIN,
  PARKING_SLOTS_MAX,
  NUMBER_OF_SHOWROOM_FLOORS_MIN,
  NUMBER_OF_SHOWROOM_FLOORS_MAX,
  NUMBER_OF_DOCKS_MIN,
  NUMBER_OF_DOCKS_MAX,
  LOCALITY_MAX_LENGTH_LIMIT,
  LOCALITY_MAX_LENGTH_LIMIT_MESSAGE,
  LOCALITY_MIN_LENGTH_LIMIT,
  LOCALITY_MIN_LENGTH_LIMIT_MESSAGE,
  PROPERTY_LISTED_BY,
  PROPERTY_LISTED_BY_MESSAGE,
} from '../constants/property.constants.js';

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const coordinatesSchema = new mongoose.Schema({
  type: { type: String, default: 'Point', enum: ['Point'] },
  coordinates: { type: [Number], required: [true, 'Coordinates are required'] }, // [longitude, latitude]
}, { _id: false });

const locationSchema = new mongoose.Schema({
  city: { type: String, default: 'Nagpur', immutable: true },
  locality: {
    type: String,
    required: [true, 'Locality is required'],
    minlength: [LOCALITY_MIN_LENGTH_LIMIT, LOCALITY_MIN_LENGTH_LIMIT_MESSAGE],
    maxlength: [LOCALITY_MAX_LENGTH_LIMIT, LOCALITY_MAX_LENGTH_LIMIT_MESSAGE],
  },
  subLocality: {
    type: String,
    maxlength: [SUB_LOCALITY_LENGTH_LIMIT, SUB_LOCALITY_LENGTH_LIMIT_MESSAGE],
    default: null,
  },
  landmark: {
    type: String,
    maxlength: [LANDMARK_LENGTH_LIMIT, LANDMARK_LENGTH_LIMIT_MESSAGE],
    default: null,
  },
  pinCode: {
    type: String,
    match: [PINCODE_REGEX, PINCODE_REGEX_MESSAGE],
    default: null,
  },
  coordinates: { type: coordinatesSchema, required: [true, 'Coordinates are required'] },
}, { _id: false });

/**
 * Details schema — every field is optional at the schema level.
 * Required fields are enforced in the Zod validation schema (property.schema.js)
 * based on the (listingCategory × propertyType) combination.
 */
const detailsSchema = new mongoose.Schema({
  // ── Residential (Flat, Builder Floor, Penthouse) ──────────────────────────
  bhk:              { type: Number, min: [BHK_MIN_LENGTH_LIMIT, BHK_MIN_LENGTH_LIMIT_MESSAGE], max: [BHK_MAX_LENGTH_LIMIT, BHK_MAX_LENGTH_LIMIT_MESSAGE] },
  bathrooms:        { type: Number, min: [BATHROOMS_MIN_LENGTH_LIMIT, BATHROOMS_MIN_LENGTH_LIMIT_MESSAGE], max: [BATHROOMS_MAX_LENGTH_LIMIT, BATHROOMS_MAX_LENGTH_LIMIT_MESSAGE] },
  balconies:        { type: Number, min: [BALCONIES_MIN_LENGTH_LIMIT, BALCONIES_MIN_LENGTH_LIMIT_MESSAGE], max: [BALCONIES_MAX_LENGTH_LIMIT, BALCONIES_MAX_LENGTH_LIMIT_MESSAGE] },
  floorNumber:      { type: Number, min: [FLOOR_NUMBER_MIN_LENGTH_LIMIT, FLOOR_NUMBER_MIN_LENGTH_LIMIT_MESSAGE], max: [FLOOR_NUMBER_MAX_LENGTH_LIMIT, FLOOR_NUMBER_MAX_LENGTH_LIMIT_MESSAGE] },
  totalFloors:      { type: Number, min: [TOTAL_FLOORS_MIN_LENGTH_LIMIT, TOTAL_FLOORS_MIN_LENGTH_LIMIT_MESSAGE], max: [TOTAL_FLOORS_MAX_LENGTH_LIMIT, TOTAL_FLOORS_MAX_LENGTH_LIMIT_MESSAGE] },
  carpetArea:       { type: Number, min: [CARPET_AREA_MIN_LENGTH_LIMIT, CARPET_AREA_MIN_LENGTH_LIMIT_MESSAGE] },
  builtUpArea:      { type: Number, min: [BUILT_UP_AREA_MIN_LENGTH_limit, BUILT_UP_AREA_MIN_LENGTH_limit_MESSAGE] },
  superBuiltUpArea: { type: Number, min: [SUPER_BUILT_UP_AREA_MIN_LENGTH_limit, SUPER_BUILT_UP_AREA_MIN_LENGTH_limit_MESSAGE] },
  furnishing:       { type: String, enum: { values: FURNISHING_OPTIONS, message: FURNISHING_OPTIONS_MESSAGE } },
  facing:           { type: String, enum: { values: [...FACING_OPTIONS, null], message: FACING_OPTIONS_MESSAGE } },
  ageOfProperty:    { type: String, enum: { values: [...AGE_OF_PROPERTY, null], message: AGE_OF_PROPERTY_MESSAGE } },
  floorType:        { type: String, enum: { values: [...FLOOR_TYPE, null], message: FLOOR_TYPE_MESSAGE } },
  waterSupply:      { type: String, enum: { values: [...WATER_SUPPLY, null], message: WATER_SUPPLY_MESSAGE } },
  electricityStatus:{ type: String, enum: { values: [...ELECTRICITY_STATUS, null], message: ELECTRICITY_STATUS_MESSAGE } },
  // ownershipType stores whatever the Zod schema allows per type (narrowed at validation time)
  ownershipType:    { type: String, enum: { values: [...OWNERSHIP_TYPES, null], message: OWNERSHIP_TYPES_MESSAGE } },
  readyToMove:      { type: Boolean },
  petFriendly:      { type: Boolean },
  nonVegAllowed:    { type: Boolean },

  // ── Villa / Independent House specific ────────────────────────────────────
  numberOfFloors:   { type: String, maxlength: [NUMBER_OF_FLOORS_MAX_LENGTH, NUMBER_OF_FLOORS_MAX_LENGTH_MESSAGE] },
  plotArea:         { type: Number, min: 1 },
  parkingSlots:     { type: Number, min: PARKING_SLOTS_MIN, max: PARKING_SLOTS_MAX },
  hasGarden:        { type: Boolean },
  cornerProperty:   { type: Boolean },
  gatedSociety:     { type: Boolean },
  independentEntry: { type: Boolean },
  roadWidth:        { type: Number, min: 1 },

  // ── Penthouse specific ────────────────────────────────────────────────────
  terraceArea:      { type: Number, min: 1, default: null },
  privateLift:      { type: Boolean },
  isDuplex:         { type: Boolean },
  servantRoom:      { type: Boolean },
  privatePool:      { type: Boolean },

  // ── Builder Floor specific ────────────────────────────────────────────────
  totalUnitsInBuilding: { type: Number, min: 1, default: null },
  floorOwnershipType:   { type: String, enum: { values: [...FLOOR_OWNERSHIP_TYPES, null], message: FLOOR_OWNERSHIP_TYPES_MESSAGE }, default: null },
  stiltParking:         { type: Boolean, default: null },

  // ── Office Space ──────────────────────────────────────────────────────────
  // FIX #5: removed dead 'officeArea' field — doc/Zod use carpetArea for Office Space
  cabinCount:       { type: Number, min: CABIN_COUNT_MIN, max: CABIN_COUNT_MAX },
  openDesks:        { type: Number, min: OPEN_DESKS_MIN, max: OPEN_DESKS_MAX },
  washrooms:        { type: Number, min: WASHROOMS_MIN, max: WASHROOMS_MAX },
  hasPantry:        { type: Boolean },
  itReady:          { type: Boolean, default: null },
  conferenceRoom:   { type: Boolean },
  receptionArea:    { type: Boolean },
  centralAC:        { type: Boolean },
  officeFireSafety: { type: Boolean },
  dgBackup:         { type: Boolean },

  // ── Shop ──────────────────────────────────────────────────────────────────
  // FIX #6: removed dead 'shopArea' field — doc/Zod use carpetArea for Shop
  shopFloor:        { type: String, enum: { values: [...SHOP_FLOOR_OPTIONS, null], message: SHOP_FLOOR_OPTIONS_MESSAGE } },
  frontage:         { type: Number, min: 1 },
  depth:            { type: Number, min: 1 },
  ceilingHeight:    { type: Number, min: 1 },
  mainRoadFacing:   { type: Boolean },
  cornerShop:       { type: Boolean },
  mezzanineFloor:   { type: Boolean },
  hasWashroom:      { type: Boolean },
  footfallRating:   { type: String, enum: { values: [...FOOTFALL_RATING_OPTIONS, null], message: FOOTFALL_RATING_OPTIONS_MESSAGE } },
  suitableFor:      [{ type: String, enum: { values: SUITABLE_FOR_OPTIONS, message: SUITABLE_FOR_OPTIONS_MESSAGE } }],

  // ── Showroom ──────────────────────────────────────────────────────────────
  showroomArea:           { type: Number, min: 1 },
  numberOfShowroomFloors: { type: Number, min: NUMBER_OF_SHOWROOM_FLOORS_MIN, max: NUMBER_OF_SHOWROOM_FLOORS_MAX },
  glassFront:             { type: Boolean },
  parkingAvailable:       { type: Boolean },
  acInstalled:            { type: Boolean },

  // ── Warehouse / Godown ────────────────────────────────────────────────────
  warehouseArea:        { type: Number, min: 1 },
  warehouseHeight:      { type: Number, min: 1 },
  truckAccess:          { type: Boolean },
  numberOfDocks:        { type: Number, min: NUMBER_OF_DOCKS_MIN, max: NUMBER_OF_DOCKS_MAX },
  floorLoadCapacity:    { type: String, maxlength: [FLOOR_LOAD_CAPACITY_MAX_LENGTH, FLOOR_LOAD_CAPACITY_MAX_LENGTH_MESSAGE] },
  openYardArea:         { type: Number, min: 1 },
  powerLoad:            { type: Number, min: 1 },
  waterSupplyWarehouse: { type: Boolean },
  officeSpaceInside:    { type: Boolean },
  midc:                 { type: Boolean },

  // ── Residential Plot ──────────────────────────────────────────────────────
  plotAreaSqFt: { type: Number, min: 1 },
  plotLength:   { type: Number, min: 1 },
  plotWidth:    { type: Number, min: 1 },
  boundaryWall: { type: Boolean },
  gatedLayout:  { type: Boolean },
  cornerPlot:   { type: Boolean },
  approvedBy:   [{ type: String, enum: { values: APPROVED_BY_OPTIONS, message: APPROVED_BY_OPTIONS_MESSAGE } }],
  zoneType:     { type: String, enum: { values: [...ZONE_TYPES, null], message: ZONE_TYPES_MESSAGE } },
  fsiAvailable: { type: Number, min: 0 },

  // ── Agricultural Land ─────────────────────────────────────────────────────
  areaAcres:    { type: Number, min: 0.01 },
  // FIX #8: stored as auto-calculated field sent from frontend
  areaHectares: { type: Number, min: 0.01 },
  waterSource:  [{ type: String, enum: { values: WATER_SOURCE_OPTIONS, message: WATER_SOURCE_OPTIONS_MESSAGE } }],
  roadAccess:         { type: Boolean, default: null },
  roadType:           { type: String, enum: { values: [...ROAD_TYPES, null], message: ROAD_TYPES_MESSAGE } },
  fencing:            { type: Boolean, default: null },
  treesPlantation:    { type: String, maxlength: [TREES_PLANTATION_MAX_LENGTH, TREES_PLANTATION_MAX_LENGTH_MESSAGE] },
  irrigationType:     { type: String, enum: { values: [...IRRIGATION_TYPES, null], message: IRRIGATION_TYPES_MESSAGE } },
  electricityLand:    { type: Boolean },
  distanceFromCity:   { type: Number, min: 0 },
  sevenTwelveExtract: { type: Boolean },
  soilType:           { type: String, enum: { values: [...SOIL_TYPES, null], message: SOIL_TYPES_MESSAGE } },

  // ── NA Details (for Plot/Land) ───────────────────────────────────────────
  naOrderStatus: { type: String, enum: { values: [...NA_ORDER_STATUS_OPTIONS, null], message: NA_ORDER_STATUS_OPTIONS_MESSAGE }, default: null },
  naOrderNumber: { type: String, maxlength: [NA_ORDER_NUMBER_MAX_LENGTH, NA_ORDER_NUMBER_MAX_LENGTH_MESSAGE], default: null },

  // ── RERA ──────────────────────────────────────────────────────────────────
  reraRegistered:  { type: Boolean, default: null },
  reraNumber:      { type: String, default: null },
  projectReraNumber: { type: String, default: null },
  reraValidityDate:{ type: Date, default: null },

  // ── New Project specific ──────────────────────────────────────────────────
  projectName:         { type: String, maxlength: [PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH_MESSAGE], default: null },
  builderName:         { type: String, maxlength: [BUILDER_NAME_MAX_LENGTH, BUILDER_NAME_MAX_LENGTH_MESSAGE], default: null },
  constructionStatus:  { type: String, enum: { values: [...CONSTRUCTION_STATUS_OPTIONS, null], message: CONSTRUCTION_STATUS_OPTIONS_MESSAGE }, default: null },
  possessionDate:      { type: Date, default: null },
  totalUnitsInProject: { type: Number, min: 1, default: null },
  unitsAvailable:      { type: Number, min: 0, default: null },
  towerWing:           { type: String, maxlength: [TOWER_WING_MAX_LENGTH, TOWER_WING_MAX_LENGTH_MESSAGE], default: null },
  approvedBanks:       { type: String, maxlength: [APPROVED_BANKS_MAX_LENGTH, APPROVED_BANKS_MAX_LENGTH_MESSAGE], default: null },
  ccOcReceived:        { type: String, enum: { values: [...CC_OC_OPTIONS, null], message: CC_OC_OPTIONS_MESSAGE }, default: null },
  // Villa-specific new project fields
  totalVillasInProject:{ type: Number, min: 1, default: null },
  // Residential Plot-specific new project fields
  layoutProjectName:   { type: String, maxlength: [LAYOUT_PROJECT_NAME_MAX_LENGTH, LAYOUT_PROJECT_NAME_MAX_LENGTH_MESSAGE], default: null },
  totalPlotsInLayout:  { type: Number, min: 1, default: null },
  plotsAvailable:      { type: Number, min: 0, default: null },
  developmentStatus:   { type: String, enum: { values: [...DEVELOPMENT_STATUS_OPTIONS, null], message: DEVELOPMENT_STATUS_OPTIONS_MESSAGE }, default: null },
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  // ── Resale / New ──────────────────────────────────────────────────────────
  totalPrice:         { type: Number, min: 0 },
  startingPrice:      { type: Number, min: 0 },
  pricePerSqft:       { type: Number, min: 0 },
  priceRange:         { type: String, maxlength: [PRICE_RANGE_MAX_LENGTH, PRICE_RANGE_MAX_LENGTH_MESSAGE] },
  bookingAmount:      { type: Number, min: 0 },
  gstApplicable:      { type: Boolean },
  priceNegotiable:    { type: Boolean },
  possessionTimeline: { type: String, enum: { values: [...POSSESSION_TIMELINE_OPTIONS, null], message: POSSESSION_TIMELINE_OPTIONS_MESSAGE } },
  possessionDate:     { type: Date },
  brokerage:          { type: String, maxlength: [BROKERAGE_MAX_LENGTH, BROKERAGE_MAX_LENGTH_MESSAGE] },

  // ── Rental ────────────────────────────────────────────────────────────────
  monthlyRent:      { type: Number, min: 0 },
  annualLease:      { type: Number, min: 0 },
  securityDeposit:  { type: Number, min: 0 },
  maintenance:      { type: Number, min: 0 },
  availableFrom:    { type: Date },
  preferredTenants: [{ type: String, enum: { values: PREFERRED_TENANTS_OPTIONS, message: PREFERRED_TENANTS_OPTIONS_MESSAGE } }],
  leaseDuration:    { type: String, enum: { values: [...LEASE_DURATION_OPTIONS, null], message: LEASE_DURATION_OPTIONS_MESSAGE } },
  lockInPeriod:     { type: String, enum: { values: [...LOCK_IN_PERIOD_OPTIONS, null], message: LOCK_IN_PERIOD_OPTIONS_MESSAGE } },
  rentNegotiable:   { type: Boolean },
}, { _id: false });

// ─── Main Property Schema ─────────────────────────────────────────────────────
const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [TITLE_MAX_LENGTH, TITLE_MAX_LENGTH_MESSAGE],
    },
    listingCategory: {
      type: String,
      required: [true, 'Listing category is required'],
      enum: { values: LISTING_CATEGORIES, message: LISTING_TYPES_MESSAGE },
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: { values: PROPERTY_TYPES, message: PROPERTY_TYPES_MESSAGE },
    },
    propertyListedBy:{
      type: String,
      required: [true, 'Property listed by is required'],
      enum: { values: PROPERTY_LISTED_BY, message: PROPERTY_LISTED_BY_MESSAGE },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [DESCRIPTION_MIN_LENGTH, DESCRIPTION_MIN_LENGTH_MESSAGE],
      maxlength: [DESCRIPTION_MAX_LENGTH, DESCRIPTION_MAX_LENGTH_MESSAGE],
    },

    location: { type: locationSchema, required: true },
    details:  { type: detailsSchema, default: () => ({}) },
    pricing:  { type: pricingSchema, default: () => ({}) },

    photos: {
      type: [String],
      validate: [
        { validator: (v) => v.length >= PHOTOS_MIN_COUNT, message: PHOTOS_MIN_COUNT_MESSAGE },
        { validator: (v) => v.length <= PHOTOS_MAX_COUNT, message: PHOTOS_MAX_COUNT_MESSAGE },
      ],
      default: [],
    },
    video: { type: String, default: null },

    amenities: [{ type: String }],

    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Broker (User) reference is required'],
      index: true,
    },

    // FIX #2: 'Pending' is now a valid value in PROPERTY_STATUSES
    status: {
      type: String,
      enum: { values: PROPERTY_STATUSES, message: PROPERTY_STATUSES_MESSAGE },
      default: 'Active',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    rejectedReason: {
      type: String,
      maxlength: [REJECTED_REASON_MAX_LENGTH, REJECTED_REASON_MAX_LENGTH_MESSAGE],
      default: null,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ listingCategory: 1, propertyType: 1, status: 1 });
propertySchema.index({ 'location.locality': 1 });
propertySchema.index({ brokerId: 1, status: 1 });
// Admin list + dashboard filters
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ brokerId: 1, status: 1, createdAt: -1 });
propertySchema.index({ featured: 1, createdAt: -1 });
propertySchema.index({ 'location.locality': 1, createdAt: -1 });
propertySchema.index({ listingCategory: 1, propertyType: 1, createdAt: -1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index(
  { title: 'text', description: 'text', 'location.locality': 'text' },
  { weights: { title: 5, 'location.locality': 3, description: 1 } }
);

// ─── Auto-generate slug on save ─────────────────────────────────────────────
propertySchema.pre('save', function (next) {
  if (this.slug) return next(); // already set — don't overwrite
  try {
    const type = (this.propertyType || 'property')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const locality = (this.location?.locality || 'nagpur')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const uid = Math.random().toString(36).slice(2, 8); // 6-char alphanumeric
    this.slug = `${type}-${locality}-${uid}`;
  } catch {
    this.slug = `property-${Math.random().toString(36).slice(2, 10)}`;
  }
  next();
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
export default Property;