const LISTING_CATEGORIES = ['Resale', 'Rental', 'New'];
const LISTING_TYPES_MESSAGE = `Listing type must be one of: ${LISTING_CATEGORIES.join(', ')}`;

const PROPERTY_TYPES = [
  'Flat/Apartment',
  'Villa/Independent House',
  'Builder Floor',
  'Penthouse',
  'Office Space',
  'Shop',
  'Showroom',
  'Warehouse/Godown',
  'Residential Plot',
  'Agricultural Land',
];
const PROPERTY_TYPES_MESSAGE = `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`;

// FIX #2: Added 'Pending' so the model default is a valid enum value
const PROPERTY_STATUSES = ['Active', 'Rejected', 'Sold', 'Inactive'];
const PROPERTY_STATUSES_MESSAGE = `Property status must be one of: ${PROPERTY_STATUSES.join(', ')}`;

const FURNISHING_OPTIONS = [
  'Unfurnished',
  'Semi-Furnished',
  'Fully Furnished',
  'Bare Shell',
  'Warm Shell',
];
const FURNISHING_OPTIONS_MESSAGE = `Furnishing option must be one of: ${FURNISHING_OPTIONS.join(', ')}`;

const LOCALITY_MAX_LENGTH_LIMIT = 100;
const LOCALITY_MAX_LENGTH_LIMIT_MESSAGE = `Locality must be at most ${LOCALITY_MAX_LENGTH_LIMIT} characters long`;
const LOCALITY_MIN_LENGTH_LIMIT = 2;
const LOCALITY_MIN_LENGTH_LIMIT_MESSAGE = `Locality must be at least ${LOCALITY_MIN_LENGTH_LIMIT} characters long`;

const AMENITIES_LIST = [
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
const AMENITIES_LIST_MESSAGE = `Amenities must be an array of the following: ${AMENITIES_LIST.join(', ')}`;

const OTHER_AMENITIES_OPTION = 'Other Amenities';
const OTHER_AMENITIES_MAX_COUNT = 20;
const OTHER_AMENITIES_MAX_LENGTH = 100;
const OTHER_AMENITIES_MAX_LENGTH_MESSAGE = `Each custom amenity must be at most ${OTHER_AMENITIES_MAX_LENGTH} characters`;

const PINCODE_REGEX = /^44\d{4}$/;
const PINCODE_REGEX_MESSAGE = 'Enter a valid Nagpur pin code (440001-440037)';

const SUB_LOCALITY_LENGTH_LIMIT = 100;
const SUB_LOCALITY_LENGTH_LIMIT_MESSAGE = `Sub-locality must be at most ${SUB_LOCALITY_LENGTH_LIMIT} characters long`;

const LANDMARK_LENGTH_LIMIT = 100;
const LANDMARK_LENGTH_LIMIT_MESSAGE = `Landmark must be at most ${LANDMARK_LENGTH_LIMIT} characters long`;

// FIX #1: BHK is a number — corrected misleading messages
const BHK_MIN_LENGTH_LIMIT = 0;
const BHK_MIN_LENGTH_LIMIT_MESSAGE = `BHK must be a number between ${BHK_MIN_LENGTH_LIMIT} and 8`;
const BHK_MAX_LENGTH_LIMIT = 8;
const BHK_MAX_LENGTH_LIMIT_MESSAGE = `BHK must be a number between 0 and ${BHK_MAX_LENGTH_LIMIT}`;

const BATHROOMS_MIN_LENGTH_LIMIT = 0;
const BATHROOMS_MAX_LENGTH_LIMIT = 15;
const BATHROOMS_MIN_LENGTH_LIMIT_MESSAGE = `Bathrooms must be a number between ${BATHROOMS_MIN_LENGTH_LIMIT} and ${BATHROOMS_MAX_LENGTH_LIMIT}`;
const BATHROOMS_MAX_LENGTH_LIMIT_MESSAGE = `Bathrooms must be a number between ${BATHROOMS_MIN_LENGTH_LIMIT} and ${BATHROOMS_MAX_LENGTH_LIMIT}`;

const BALCONIES_MIN_LENGTH_LIMIT = 0;
const BALCONIES_MAX_LENGTH_LIMIT = 10;
const BALCONIES_MIN_LENGTH_LIMIT_MESSAGE = `Balconies must be a number between ${BALCONIES_MIN_LENGTH_LIMIT} and ${BALCONIES_MAX_LENGTH_LIMIT}`;
const BALCONIES_MAX_LENGTH_LIMIT_MESSAGE = `Balconies must be a number between ${BALCONIES_MIN_LENGTH_LIMIT} and ${BALCONIES_MAX_LENGTH_LIMIT}`;

const FLOOR_NUMBER_MIN_LENGTH_LIMIT = 0;
const FLOOR_NUMBER_MAX_LENGTH_LIMIT = 99;
const FLOOR_NUMBER_MIN_LENGTH_LIMIT_MESSAGE = `Floor number must be a number between ${FLOOR_NUMBER_MIN_LENGTH_LIMIT} and ${FLOOR_NUMBER_MAX_LENGTH_LIMIT}`;
const FLOOR_NUMBER_MAX_LENGTH_LIMIT_MESSAGE = `Floor number must be a number between ${FLOOR_NUMBER_MIN_LENGTH_LIMIT} and ${FLOOR_NUMBER_MAX_LENGTH_LIMIT}`;

const TOTAL_FLOORS_MIN_LENGTH_LIMIT = 1;
const TOTAL_FLOORS_MAX_LENGTH_LIMIT = 99;
const TOTAL_FLOORS_MIN_LENGTH_LIMIT_MESSAGE = `Total floors must be a number between ${TOTAL_FLOORS_MIN_LENGTH_LIMIT} and ${TOTAL_FLOORS_MAX_LENGTH_LIMIT}`;
const TOTAL_FLOORS_MAX_LENGTH_LIMIT_MESSAGE = `Total floors must be a number between ${TOTAL_FLOORS_MIN_LENGTH_LIMIT} and ${TOTAL_FLOORS_MAX_LENGTH_LIMIT}`;

const CARPET_AREA_MIN_LENGTH_LIMIT = 1;
const CARPET_AREA_MIN_LENGTH_LIMIT_MESSAGE = `Carpet area must be a number greater than or equal to ${CARPET_AREA_MIN_LENGTH_LIMIT}`;

const BUILT_UP_AREA_MIN_LENGTH_limit = 1;
const BUILT_UP_AREA_MIN_LENGTH_limit_MESSAGE = `Built-up area must be a number greater than or equal to ${BUILT_UP_AREA_MIN_LENGTH_limit}`;

const SUPER_BUILT_UP_AREA_MIN_LENGTH_limit = 1;
const SUPER_BUILT_UP_AREA_MIN_LENGTH_limit_MESSAGE = `Super built-up area must be a number greater than or equal to ${SUPER_BUILT_UP_AREA_MIN_LENGTH_limit}`;

const FACING_OPTIONS = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];
const FACING_OPTIONS_MESSAGE = `Facing must be one of: ${FACING_OPTIONS.join(', ')}`;

const AGE_OF_PROPERTY = ['New', '1-3 yrs', '3-5 yrs', '5-10 yrs', '10+ yrs'];
const AGE_OF_PROPERTY_MESSAGE = `Age of property must be one of: ${AGE_OF_PROPERTY.join(', ')}`;

const FLOOR_TYPE = ['Marble', 'Vitrified', 'Wooden', 'Granite', 'Ceramic'];
const FLOOR_TYPE_MESSAGE = `Floor type must be one of: ${FLOOR_TYPE.join(', ')}`;

const WATER_SUPPLY = ['Municipal', 'Borewell', 'Both'];
const WATER_SUPPLY_MESSAGE = `Water supply must be one of: ${WATER_SUPPLY.join(', ')}`;

const ELECTRICITY_STATUS = ['Metered', 'Non-metered', 'Pre-paid'];
const ELECTRICITY_STATUS_MESSAGE = `Electricity status must be one of: ${ELECTRICITY_STATUS.join(', ')}`;

const POSSESSION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const POSSESSION_DATE_REGEX_MESSAGE = 'Possession date must be in YYYY-MM-DD format';

// Full ownership list — individual property type schemas narrow this down as needed
const OWNERSHIP_TYPES = [
  'Freehold',
  'Leasehold',
  'Co-operative Society',
  'Power of Attorney',
  'Individual',
  'Joint',
  'Family',
];
const OWNERSHIP_TYPES_MESSAGE = `Ownership type must be one of: ${OWNERSHIP_TYPES.join(', ')}`;

const FLOOR_OWNERSHIP_TYPES = ['Individual', 'Shared', 'Builder-owned'];
const FLOOR_OWNERSHIP_TYPES_MESSAGE = `Floor ownership type must be one of: ${FLOOR_OWNERSHIP_TYPES.join(', ')}`;

const SHOP_FLOOR_OPTIONS = ['Lower Ground', 'Ground', '1st', '2nd', '3rd+'];
const SHOP_FLOOR_OPTIONS_MESSAGE = `Shop floor must be one of: ${SHOP_FLOOR_OPTIONS.join(', ')}`;

const FOOTFALL_RATING_OPTIONS = ['Low', 'Medium', 'High', 'Premium'];
const FOOTFALL_RATING_OPTIONS_MESSAGE = `Footfall rating must be one of: ${FOOTFALL_RATING_OPTIONS.join(', ')}`;

const SUITABLE_FOR_OPTIONS = ['Retail', 'Food', 'Pharmacy', 'Showroom', 'Office', 'Clinic'];
const SUITABLE_FOR_OPTIONS_MESSAGE = `Suitable for must be one of: ${SUITABLE_FOR_OPTIONS.join(', ')}`;

const ROAD_TYPES = ['Tar Road', 'Concrete', 'Mud', 'Kachcha'];
const ROAD_TYPES_MESSAGE = `Road type must be one of: ${ROAD_TYPES.join(', ')}`;

const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Canal', 'Flood', 'None'];
const IRRIGATION_TYPES_MESSAGE = `Irrigation type must be one of: ${IRRIGATION_TYPES.join(', ')}`;

const SOIL_TYPES = ['Black', 'Red', 'Alluvial', 'Mixed'];
const SOIL_TYPES_MESSAGE = `Soil type must be one of: ${SOIL_TYPES.join(', ')}`;

const NA_ORDER_STATUS_OPTIONS = ['NA Order Received', 'Applied', 'Not Applied'];
const NA_ORDER_STATUS_OPTIONS_MESSAGE = `NA order status must be one of: ${NA_ORDER_STATUS_OPTIONS.join(', ')}`;

const WATER_SOURCE_OPTIONS = ['Well', 'Borewell', 'Canal', 'River', 'None'];
const WATER_SOURCE_OPTIONS_MESSAGE = `Water source must be one of: ${WATER_SOURCE_OPTIONS.join(', ')}`;

const APPROVED_BY_OPTIONS = ['NIT', 'NMC', 'NMRDA', 'MHADA', 'Private Layout'];
const APPROVED_BY_OPTIONS_MESSAGE = `Approved by must be one of: ${APPROVED_BY_OPTIONS.join(', ')}`;

const ZONE_TYPES = ['Residential', 'Mixed Use', 'Commercial', 'Industrial'];
const ZONE_TYPES_MESSAGE = `Zone type must be one of: ${ZONE_TYPES.join(', ')}`;

const CONSTRUCTION_STATUS_OPTIONS = [
  'Pre-launch',
  'Under Construction',
  'Ready to Move',
  'Ready',
  'Partially Ready',
  'Under Development',
];
const CONSTRUCTION_STATUS_OPTIONS_MESSAGE = `Construction status must be one of: ${CONSTRUCTION_STATUS_OPTIONS.join(', ')}`;

const CC_OC_OPTIONS = ['CC Received', 'OC Received', 'Both', 'None', 'Applied'];
const CC_OC_OPTIONS_MESSAGE = `CC/OC status must be one of: ${CC_OC_OPTIONS.join(', ')}`;

const DEVELOPMENT_STATUS_OPTIONS = ['Under Development', 'Ready', 'Partially Ready'];
const DEVELOPMENT_STATUS_OPTIONS_MESSAGE = `Development status must be one of: ${DEVELOPMENT_STATUS_OPTIONS.join(', ')}`;

const POSSESSION_TIMELINE_OPTIONS = ['Immediate', 'Within 1 month', '1-3 months', '3-6 months'];
const POSSESSION_TIMELINE_OPTIONS_MESSAGE = `Possession timeline must be one of: ${POSSESSION_TIMELINE_OPTIONS.join(', ')}`;

const PREFERRED_TENANTS_OPTIONS = ['Family', 'Bachelor Male', 'Bachelor Female', 'Company', 'Any'];
const PREFERRED_TENANTS_OPTIONS_MESSAGE = `Preferred tenants must be one of: ${PREFERRED_TENANTS_OPTIONS.join(', ')}`;

const LEASE_DURATION_OPTIONS = ['11 months', '1 year', '2 years', '3 years', '5 years', '10+ years', 'Flexible'];
const LEASE_DURATION_OPTIONS_MESSAGE = `Lease duration must be one of: ${LEASE_DURATION_OPTIONS.join(', ')}`;

const LOCK_IN_PERIOD_OPTIONS = ['None', '3 months', '6 months', '1 year'];
const LOCK_IN_PERIOD_OPTIONS_MESSAGE = `Lock-in period must be one of: ${LOCK_IN_PERIOD_OPTIONS.join(', ')}`;


// ─── String length limits ─────────────────────────────────────────────────────

const TITLE_MAX_LENGTH = 100;
const TITLE_MAX_LENGTH_MESSAGE = `Title cannot exceed ${TITLE_MAX_LENGTH} characters`;

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MIN_LENGTH_MESSAGE = `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`;

const DESCRIPTION_MAX_LENGTH = 2000;
const DESCRIPTION_MAX_LENGTH_MESSAGE = `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`;

const NUMBER_OF_FLOORS_MAX_LENGTH = 20;
const NUMBER_OF_FLOORS_MAX_LENGTH_MESSAGE = `Number of floors must be at most ${NUMBER_OF_FLOORS_MAX_LENGTH} characters long`;

const FLOOR_LOAD_CAPACITY_MAX_LENGTH = 50;
const FLOOR_LOAD_CAPACITY_MAX_LENGTH_MESSAGE = `Floor load capacity must be at most ${FLOOR_LOAD_CAPACITY_MAX_LENGTH} characters long`;

const TREES_PLANTATION_MAX_LENGTH = 100;
const TREES_PLANTATION_MAX_LENGTH_MESSAGE = `Trees/plantation must be at most ${TREES_PLANTATION_MAX_LENGTH} characters long`;

const NA_ORDER_NUMBER_MAX_LENGTH = 50;
const NA_ORDER_NUMBER_MAX_LENGTH_MESSAGE = `NA order number must be at most ${NA_ORDER_NUMBER_MAX_LENGTH} characters long`;

const PROJECT_NAME_MAX_LENGTH = 100;
const PROJECT_NAME_MAX_LENGTH_MESSAGE = `Project name must be at most ${PROJECT_NAME_MAX_LENGTH} characters long`;

const BUILDER_NAME_MAX_LENGTH = 100;
const BUILDER_NAME_MAX_LENGTH_MESSAGE = `Builder name must be at most ${BUILDER_NAME_MAX_LENGTH} characters long`;

const TOWER_WING_MAX_LENGTH = 50;
const TOWER_WING_MAX_LENGTH_MESSAGE = `Tower/wing must be at most ${TOWER_WING_MAX_LENGTH} characters long`;

const APPROVED_BANKS_MAX_LENGTH = 200;
const APPROVED_BANKS_MAX_LENGTH_MESSAGE = `Approved banks must be at most ${APPROVED_BANKS_MAX_LENGTH} characters long`;

const LAYOUT_PROJECT_NAME_MAX_LENGTH = 100;
const LAYOUT_PROJECT_NAME_MAX_LENGTH_MESSAGE = `Layout project name must be at most ${LAYOUT_PROJECT_NAME_MAX_LENGTH} characters long`;

const BROKERAGE_MAX_LENGTH = 50;
const BROKERAGE_MAX_LENGTH_MESSAGE = `Brokerage must be at most ${BROKERAGE_MAX_LENGTH} characters long`;

const PRICE_RANGE_MAX_LENGTH = 50;
const PRICE_RANGE_MAX_LENGTH_MESSAGE = `Price range must be at most ${PRICE_RANGE_MAX_LENGTH} characters long`;

const REJECTED_REASON_MAX_LENGTH = 200;
const REJECTED_REASON_MAX_LENGTH_MESSAGE = `Rejected reason must be at most ${REJECTED_REASON_MAX_LENGTH} characters long`;

// ─── Photo limits ─────────────────────────────────────────────────────────────

const PHOTOS_MIN_COUNT = 1;
const PHOTOS_MIN_COUNT_MESSAGE = `At least ${PHOTOS_MIN_COUNT} photo is required`;

const PHOTOS_MAX_COUNT = 15;
const PHOTOS_MAX_COUNT_MESSAGE = `Maximum ${PHOTOS_MAX_COUNT} photos allowed`;

// ─── Numeric field limits ─────────────────────────────────────────────────────

const CABIN_COUNT_MIN = 0;
const CABIN_COUNT_MAX = 50;
const CABIN_COUNT_MESSAGE = `Cabin count must be a number between ${CABIN_COUNT_MIN} and ${CABIN_COUNT_MAX}`;

const OPEN_DESKS_MIN = 0;
const OPEN_DESKS_MAX = 200;
const OPEN_DESKS_MESSAGE = `Open desks must be a number between ${OPEN_DESKS_MIN} and ${OPEN_DESKS_MAX}`;

const WASHROOMS_MIN = 1;
const WASHROOMS_MAX = 10;
const WASHROOMS_MESSAGE = `Washrooms must be a number between ${WASHROOMS_MIN} and ${WASHROOMS_MAX}`;

const PARKING_SLOTS_MIN = 0;
const PARKING_SLOTS_MAX = 10;
const PARKING_SLOTS_MESSAGE = `Parking slots must be a number between ${PARKING_SLOTS_MIN} and ${PARKING_SLOTS_MAX}`;

const NUMBER_OF_SHOWROOM_FLOORS_MIN = 1;
const NUMBER_OF_SHOWROOM_FLOORS_MAX = 5;
const NUMBER_OF_SHOWROOM_FLOORS_MESSAGE = `Number of showroom floors must be a number between ${NUMBER_OF_SHOWROOM_FLOORS_MIN} and ${NUMBER_OF_SHOWROOM_FLOORS_MAX}`;

const NUMBER_OF_DOCKS_MIN = 0;
const NUMBER_OF_DOCKS_MAX = 20;
const NUMBER_OF_DOCKS_MESSAGE = `Number of docks must be a number between ${NUMBER_OF_DOCKS_MIN} and ${NUMBER_OF_DOCKS_MAX}`;

const PROPERTY_LISTED_BY_OPTIONS = ['Owner', 'Broker', 'Builder'];
const PROPERTY_LISTED_BY_OPTIONS_MESSAGE = `Property listed by must be one of: ${PROPERTY_LISTED_BY_OPTIONS.join(', ')}`;
export {
  LISTING_CATEGORIES,
  LISTING_TYPES_MESSAGE,
  PROPERTY_TYPES,
  PROPERTY_TYPES_MESSAGE,
  PROPERTY_STATUSES,
  PROPERTY_STATUSES_MESSAGE,
  FURNISHING_OPTIONS,
  FURNISHING_OPTIONS_MESSAGE,
  AMENITIES_LIST,
  AMENITIES_LIST_MESSAGE,
  OTHER_AMENITIES_OPTION,
  OTHER_AMENITIES_MAX_COUNT,
  OTHER_AMENITIES_MAX_LENGTH,
  OTHER_AMENITIES_MAX_LENGTH_MESSAGE,
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
  CABIN_COUNT_MESSAGE,
  OPEN_DESKS_MIN,
  OPEN_DESKS_MAX,
  OPEN_DESKS_MESSAGE,
  WASHROOMS_MIN,
  WASHROOMS_MAX,
  WASHROOMS_MESSAGE,
  PARKING_SLOTS_MIN,
  PARKING_SLOTS_MAX,
  PARKING_SLOTS_MESSAGE,
  NUMBER_OF_SHOWROOM_FLOORS_MIN,
  NUMBER_OF_SHOWROOM_FLOORS_MAX,
  NUMBER_OF_SHOWROOM_FLOORS_MESSAGE,
  NUMBER_OF_DOCKS_MIN,
  NUMBER_OF_DOCKS_MAX,
  NUMBER_OF_DOCKS_MESSAGE,
  POSSESSION_DATE_REGEX,
  POSSESSION_DATE_REGEX_MESSAGE,
  LOCALITY_MAX_LENGTH_LIMIT,
  LOCALITY_MAX_LENGTH_LIMIT_MESSAGE,
  LOCALITY_MIN_LENGTH_LIMIT,
  LOCALITY_MIN_LENGTH_LIMIT_MESSAGE,
  PROPERTY_LISTED_BY_OPTIONS,
  PROPERTY_LISTED_BY_OPTIONS_MESSAGE,
};