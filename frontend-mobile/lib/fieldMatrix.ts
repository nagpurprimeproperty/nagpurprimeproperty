import type { ListingCategory, PropertyType } from './propertyTypes';

// ─── Field Definition Types ───────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'price'
  | 'select' | 'multi_select' | 'radio_group'
  | 'stepper' | 'toggle' | 'date' | 'area_auto';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];          // for select / multi_select / radio_group
  min?: number;
  max?: number;
  hint?: string;
  autoCalcFrom?: string;       // key of source field for auto-calculations
  autoCalcLabel?: string;      // label for auto-calc display value
  conditionKey?: string;       // show this field only when conditionKey === conditionValue
  conditionValue?: any;
}

export interface FieldSection {
  title: string;
  fields: FieldDef[];
}

// ─── Shared field helpers ─────────────────────────────────────────────────────

const reraSection = (category: ListingCategory): FieldSection => ({
  title: 'RERA Details',
  fields:
    category === 'new'
      ? [{ key: 'reraNumber', label: 'RERA Number', type: 'text', required: true, placeholder: 'e.g. P52100012345' }]
      : [
          { key: 'reraRegistered', label: 'RERA Registered', type: 'toggle', required: false },
          { key: 'reraNumber',     label: 'RERA Number',     type: 'text',   required: false,
            placeholder: 'e.g. P52100012345', conditionKey: 'reraRegistered', conditionValue: true },
        ],
});

const readyToMoveField: FieldDef = {
  key: 'readyToMove', label: 'Ready to Move', type: 'toggle', required: true,
};

const possessionTimelineField: FieldDef = {
  key: 'possessionTimeline', label: 'Possession Timeline', type: 'select', required: true,
  options: ['Immediate', 'Within 1 Month', '1–3 Months', '3–6 Months'],
  conditionKey: 'readyToMove', conditionValue: false,
};

const commonFlatFields = (category: ListingCategory): FieldSection[] => [
  {
    title: 'Size & Layout',
    fields: [
      { key: 'bhk',          label: 'BHK',          type: 'stepper', required: true,  min: 0, max: 8  },
      { key: 'bathrooms',    label: 'Bathrooms',    type: 'stepper', required: true,  min: 0, max: 15 },
      { key: 'balconies',    label: 'Balconies',    type: 'stepper', required: false, min: 0, max: 10 },
      { key: 'floorNumber',  label: 'Floor Number', type: 'stepper', required: true,  min: 0, max: 99, hint: '0 = Ground' },
      { key: 'totalFloors',  label: 'Total Floors', type: 'stepper', required: true,  min: 1, max: 99 },
    ],
  },
  {
    title: 'Area Details',
    fields: [
      { key: 'carpetArea',      label: 'Carpet Area (sq.ft)',        type: 'number', required: true,  placeholder: 'Net usable area' },
      { key: 'builtUpArea',     label: 'Built-up Area (sq.ft)',      type: 'number', required: false, placeholder: 'Including walls & balcony' },
      { key: 'superBuiltUpArea',label: 'Super Built-up Area (sq.ft)',type: 'number', required: false, placeholder: 'Including common areas' },
    ],
  },
  {
    title: 'Property Info',
    fields: [
      { key: 'furnishing',        label: 'Furnishing',          type: 'select', required: true,  options: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished', 'Bare Shell', 'Warm Shell'] },
      { key: 'facing',            label: 'Facing',              type: 'select', required: false, options: ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'] },
      { key: 'ageOfProperty',     label: 'Age of Property',     type: 'select', required: false, options: ['New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'] },
      { key: 'floorType',         label: 'Floor Type',          type: 'select', required: false, options: ['Marble', 'Vitrified', 'Wooden', 'Granite', 'Ceramic'] },
      { key: 'waterSupply',       label: 'Water Supply',        type: 'select', required: false, options: ['Municipal', 'Borewell', 'Both'] },
      { key: 'electricityStatus', label: 'Electricity Status',  type: 'select', required: false, options: ['Metered', 'Non-metered', 'Pre-paid'] },
      { key: 'ownershipType',     label: 'Ownership Type',      type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'] },
      readyToMoveField,
      possessionTimelineField,
      ...(category === 'rental'
        ? [
            { key: 'petFriendly',    label: 'Pet Friendly',       type: 'toggle' as FieldType, required: false },
            { key: 'nonVegAllowed',  label: 'Non-Veg Allowed',    type: 'toggle' as FieldType, required: false },
          ]
        : []),
    ],
  },
  reraSection(category),
];

// ─── STEP 3 FIELD MATRIX ──────────────────────────────────────────────────────
// Returns sections for Step 3 given category + propertyType

export function getStep3Fields(
  category: ListingCategory,
  type: PropertyType
): FieldSection[] {
  switch (type) {
    // ── FLAT / APARTMENT ──────────────────────────────────────────────────────
    case 'flat':
      return commonFlatFields(category);

    // ── PENTHOUSE ─────────────────────────────────────────────────────────────
    case 'penthouse':
      return [
        ...commonFlatFields(category),
        {
          title: 'Penthouse Exclusives',
          fields: [
            { key: 'terraceArea',  label: 'Terrace Area (sq.ft)', type: 'number', required: false },
            { key: 'privateLift',  label: 'Private Lift',         type: 'toggle', required: false },
            { key: 'isDuplex',     label: 'Duplex',               type: 'toggle', required: false },
            { key: 'servantRoom',  label: 'Servant Room',         type: 'toggle', required: false },
            { key: 'privatePool',  label: 'Private Pool',         type: 'toggle', required: false },
            ...(category === 'resale'
              ? [
                  { key: 'petFriendly',   label: 'Pet Friendly',      type: 'toggle' as FieldType, required: false },
                  { key: 'nonVegAllowed', label: 'Non-Veg Allowed',   type: 'toggle' as FieldType, required: false },
                ]
              : []),
          ],
        },
      ];

    // ── BUILDER FLOOR ─────────────────────────────────────────────────────────
    case 'builder_floor':
      return [
        ...commonFlatFields(category),
        {
          title: 'Builder Floor Specific',
          fields: [
            { key: 'totalUnitsInBuilding', label: 'Total Units in Building', type: 'number', required: false },
            { key: 'floorOwnershipType',   label: 'Floor Ownership Type',   type: 'select', required: false, options: ['Independent', 'Shared'] },
            { key: 'stiltParking',         label: 'Stilt Parking',          type: 'toggle', required: false },
          ],
        },
      ];

    // ── VILLA / INDEPENDENT HOUSE ─────────────────────────────────────────────
    case 'villa':
      return [
        {
          title: 'Size & Layout',
          fields: [
            { key: 'bhk',            label: 'BHK',             type: 'stepper', required: true,  min: 1, max: 8  },
            { key: 'bathrooms',      label: 'Bathrooms',       type: 'stepper', required: true,  min: 1, max: 15 },
            { key: 'numberOfFloors', label: 'Number of Floors',type: 'text',    required: true,  placeholder: 'e.g. G+1, G+2' },
          ],
        },
        {
          title: 'Area Details',
          fields: [
            { key: 'plotArea',    label: 'Plot Area (sq.ft)',    type: 'number', required: true  },
            { key: 'builtUpArea', label: 'Built-up Area (sq.ft)',type: 'number', required: true  },
            { key: 'carpetArea',  label: 'Carpet Area (sq.ft)',  type: 'number', required: false },
          ],
        },
        {
          title: 'Property Info',
          fields: [
            { key: 'furnishing',     label: 'Furnishing',          type: 'select', required: true,  options: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] },
            { key: 'facing',         label: 'Facing',              type: 'select', required: false, options: ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'] },
            { key: 'parkingSlots',   label: 'Parking Slots',       type: 'stepper',required: true,  min: 0, max: 10 },
            { key: 'gardenLawn',     label: 'Garden / Lawn',       type: 'toggle', required: false },
            { key: 'cornerProperty', label: 'Corner Property',     type: 'toggle', required: false },
            { key: 'gatedSociety',   label: 'Gated Society',       type: 'toggle', required: false },
            { key: 'independentEntry',label:'Independent Entry',   type: 'toggle', required: false },
            { key: 'roadWidth',      label: 'Road Width (ft)',      type: 'number', required: false },
            { key: 'waterSupply',    label: 'Water Supply',         type: 'select', required: false, options: ['Municipal', 'Borewell', 'Both'] },
            { key: 'floorType',      label: 'Floor Type',           type: 'select', required: false, options: ['Marble', 'Vitrified', 'Wooden', 'Granite'] },
            { key: 'ageOfProperty',  label: 'Age of Property',      type: 'select', required: false, options: ['New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'] },
            { key: 'petFriendly',    label: 'Pet Friendly',         type: 'toggle', required: false },
            { key: 'nonVegAllowed',  label: 'Non-Veg Allowed',      type: 'toggle', required: false },
            { key: 'ownershipType',  label: 'Ownership Type',       type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Power of Attorney'] },
            readyToMoveField,
            possessionTimelineField,
          ],
        },
        reraSection(category),
      ];

    // ── OFFICE SPACE ──────────────────────────────────────────────────────────
    case 'office':
      return [
        {
          title: 'Area & Floor',
          fields: [
            { key: 'carpetArea',       label: 'Carpet Area (sq.ft)',        type: 'number', required: true  },
            { key: 'builtUpArea',      label: 'Built-up Area (sq.ft)',      type: 'number', required: false },
            { key: 'superBuiltUpArea', label: 'Super Built-up Area (sq.ft)',type: 'number', required: false },
            { key: 'floorNumber',      label: 'Floor Number',               type: 'stepper',required: true, min: 0, max: 99 },
            { key: 'totalFloors',      label: 'Total Floors',               type: 'stepper',required: true, min: 1, max: 99 },
          ],
        },
        {
          title: 'Office Details',
          fields: [
            { key: 'furnishing',       label: 'Furnishing',      type: 'select', required: true,  options: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished', 'Bare Shell', 'Warm Shell'] },
            { key: 'washrooms',        label: 'Washrooms',        type: 'stepper',required: true, min: 0, max: 20 },
            { key: 'cabinCount',       label: 'Cabin Count',      type: 'number', required: false },
            { key: 'openDesks',        label: 'Open Desks',       type: 'number', required: false },
            { key: 'pantryCafeteria',  label: 'Pantry / Cafeteria',type: 'toggle',required: false },
            { key: 'itReady',          label: 'IT Ready',          type: 'toggle',required: false },
            { key: 'conferenceRoom',   label: 'Conference Room',   type: 'toggle',required: false },
            { key: 'receptionArea',    label: 'Reception Area',    type: 'toggle',required: false },
            { key: 'centralAC',        label: 'Central AC',        type: 'toggle',required: false },
            { key: 'fireSafety',       label: 'Fire Safety',       type: 'toggle',required: false },
            { key: 'dgBackup',         label: 'DG Backup',         type: 'toggle',required: false },
            { key: 'ageOfProperty',    label: 'Age of Property',   type: 'select', required: false, options: ['New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'] },
            { key: 'ownershipType',    label: 'Ownership Type',    type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Power of Attorney'] },
          ],
        },
      ];

    // ── SHOP ──────────────────────────────────────────────────────────────────
    case 'shop':
      return [
        {
          title: 'Area Details',
          fields: [
            { key: 'carpetArea',  label: 'Carpet Area (sq.ft)', type: 'number', required: true  },
            { key: 'builtUpArea', label: 'Built-up Area (sq.ft)',type: 'number', required: false },
            { key: 'shopFloor',   label: 'Shop Floor',           type: 'stepper',required: true, min: 0, max: 20 },
          ],
        },
        {
          title: 'Shop Details',
          fields: [
            { key: 'frontage',      label: 'Frontage (ft)',       type: 'number', required: false },
            { key: 'depth',         label: 'Depth (ft)',          type: 'number', required: false },
            { key: 'ceilingHeight', label: 'Ceiling Height (ft)', type: 'number', required: false },
            { key: 'mainRoadFacing',label: 'Main Road Facing',    type: 'toggle', required: false },
            { key: 'cornerShop',    label: 'Corner Shop',         type: 'toggle', required: false },
            { key: 'mezzanineFloor',label: 'Mezzanine Floor',     type: 'toggle', required: false },
            { key: 'washroom',      label: 'Washroom',            type: 'toggle', required: false },
            { key: 'footfallRating',label: 'Footfall Rating',     type: 'select', required: false, options: ['Low', 'Medium', 'High', 'Very High'] },
            { key: 'suitableFor',   label: 'Suitable For',        type: 'multi_select', required: false, options: ['Retail', 'Food & Beverage', 'Medical', 'Electronics', 'Clothing', 'Salon', 'Pharmacy', 'Bakery', 'Footwear', 'Other'] },
            { key: 'ageOfProperty', label: 'Age of Property',     type: 'select', required: false, options: ['New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'] },
            { key: 'ownershipType', label: 'Ownership Type',      type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Power of Attorney'] },
          ],
        },
      ];

    // ── SHOWROOM ──────────────────────────────────────────────────────────────
    case 'showroom':
      return [
        {
          title: 'Showroom Details',
          fields: [
            { key: 'showroomArea',    label: 'Showroom Area (sq.ft)', type: 'number', required: true  },
            { key: 'numberOfFloors',  label: 'Number of Floors',      type: 'number', required: false },
            { key: 'frontage',        label: 'Frontage (ft)',          type: 'number', required: false },
            { key: 'ceilingHeight',   label: 'Ceiling Height (ft)',    type: 'number', required: false },
            { key: 'glassFront',      label: 'Glass Front',            type: 'toggle', required: false },
            { key: 'parkingAvailable',label: 'Parking Available',      type: 'toggle', required: true  },
            { key: 'acInstalled',     label: 'AC Installed',           type: 'toggle', required: false },
            { key: 'mainRoadFacing',  label: 'Main Road Facing',       type: 'toggle', required: false },
            { key: 'ageOfProperty',   label: 'Age of Property',        type: 'select', required: false, options: ['New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'] },
            { key: 'ownershipType',   label: 'Ownership Type',         type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Power of Attorney'] },
          ],
        },
      ];

    // ── WAREHOUSE ─────────────────────────────────────────────────────────────
    case 'warehouse':
      return [
        {
          title: 'Warehouse Details',
          fields: [
            { key: 'warehouseArea',    label: 'Warehouse Area (sq.ft)',   type: 'number', required: true  },
            { key: 'warehouseHeight',  label: 'Warehouse Height (ft)',    type: 'number', required: true  },
            { key: 'truckAccess',      label: 'Truck Access',             type: 'toggle', required: true  },
            { key: 'numberOfDocks',    label: 'Number of Loading Docks',  type: 'number', required: false },
            { key: 'floorLoadCapacity',label: 'Floor Load Capacity',      type: 'number', required: false, hint: 'in kg/sq.ft' },
            { key: 'openYardArea',     label: 'Open Yard Area (sq.ft)',   type: 'number', required: false },
            { key: 'powerLoad',        label: 'Power Load (KVA)',         type: 'number', required: false },
            { key: 'waterSupply',      label: 'Water Supply',             type: 'toggle', required: false },
            { key: 'officeSpaceInside',label: 'Office Space Inside',      type: 'toggle', required: false },
            { key: 'midc',             label: 'MIDC / Industrial Zone',   type: 'toggle', required: false },
            { key: 'ageOfProperty',    label: 'Age of Property',          type: 'select', required: false, options: ['New', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'] },
            { key: 'ownershipType',    label: 'Ownership Type',           type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Power of Attorney'] },
          ],
        },
      ];

    // ── RESIDENTIAL PLOT ──────────────────────────────────────────────────────
    case 'res_plot':
      return [
        {
          title: 'Plot Details',
          fields: [
            { key: 'plotAreaSqFt', label: 'Plot Area (sq.ft)',  type: 'number', required: true  },
            { key: 'plotAreaSqm',  label: 'Plot Area (sq.m)',   type: 'area_auto', required: false, autoCalcFrom: 'plotAreaSqFt', autoCalcLabel: '× 0.0929' },
            { key: 'plotLength',   label: 'Length (ft)',         type: 'number', required: false },
            { key: 'plotWidth',    label: 'Width (ft)',          type: 'number', required: false },
            { key: 'facing',       label: 'Facing',              type: 'select', required: false, options: ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'] },
            { key: 'roadWidth',    label: 'Road Width (ft)',      type: 'number', required: false },
            { key: 'boundaryWall', label: 'Boundary Wall',       type: 'toggle', required: false },
            { key: 'gatedLayout',  label: 'Gated Layout',        type: 'toggle', required: false },
            { key: 'cornerPlot',   label: 'Corner Plot',         type: 'toggle', required: false },
            { key: 'approvedBy',   label: 'Approved By',         type: 'multi_select', required: false, options: ['NIT', 'NMC', 'NMRDA', 'MHADA'] },
            { key: 'zoneType',     label: 'Zone Type',           type: 'select', required: false, options: ['Residential', 'Commercial', 'Industrial', 'Mixed'] },
            { key: 'fsiAvailable', label: 'FSI Available',       type: 'number', required: false },
            { key: 'ownershipType',label: 'Ownership Type',      type: 'select', required: true,  options: ['Freehold', 'Leasehold', 'Power of Attorney'] },
          ],
        },
      ];

    // ── AGRICULTURAL LAND ─────────────────────────────────────────────────────
    case 'agri_land':
      return [
        {
          title: 'Land Details',
          fields: [
            { key: 'areaAcres',    label: 'Area (Acres)',     type: 'number', required: true  },
            { key: 'areaHectares', label: 'Area (Hectares)',  type: 'area_auto', required: false, autoCalcFrom: 'areaAcres', autoCalcLabel: '× 0.4047' },
            { key: 'waterSource',  label: 'Water Source',     type: 'multi_select', required: false, options: ['Borewell', 'Canal', 'River', 'None', 'Well'] },
            { key: 'roadAccess',   label: 'Road Access',      type: 'select', required: true,  options: ['Pucca Road', 'Kutcha Road', 'No Road'] },
            { key: 'roadType',     label: 'Road Type',        type: 'text',   required: false, placeholder: 'e.g. State Highway, Village Road' },
            { key: 'fencing',      label: 'Fencing',          type: 'toggle', required: false },
            { key: 'treesPlantation',label:'Trees / Plantation',type:'toggle',required: false },
            { key: 'irrigationType',label:'Irrigation Type',  type: 'select', required: false, options: ['Drip', 'Sprinkler', 'Flood', 'None'] },
            { key: 'electricity',  label: 'Electricity',      type: 'toggle', required: false },
            { key: 'distanceFromCity',label:'Distance from City (km)',type:'number',required:false},
            { key: 'sevenTwelveExtract',label:'7/12 Extract Available',type:'toggle',required:false},
            { key: 'soilType',     label: 'Soil Type',        type: 'text',   required: false, placeholder: 'e.g. Black cotton, Red' },
            { key: 'ownershipType',label: 'Ownership Type',   type: 'select', required: true,  options: ['Individual', 'Joint', 'Family'] },
          ],
        },
      ];



    default:
      return [];
  }
}

// ─── STEP 4 PRICING FIELDS ────────────────────────────────────────────────────

export function getStep4Fields(
  category: ListingCategory,
  type: PropertyType
): FieldSection[] {
  const isAgri = type === 'agri_land';

  switch (category) {
    case 'resale':
      return [
        {
          title: 'Pricing',
          fields: [
            { key: 'totalPrice',        label: 'Total Price (₹)',         type: 'price',  required: true  },
            { key: 'pricePerSqft',      label: 'Price per sq.ft (₹)',     type: 'area_auto', required: false, autoCalcFrom: 'totalPrice', autoCalcLabel: '÷ Carpet Area' },
            { key: 'priceNegotiable',   label: 'Price Negotiable',        type: 'toggle', required: false },
            { key: 'brokerage',         label: 'Brokerage',               type: 'text',   required: false, placeholder: 'e.g. 1% or ₹50,000' },
          ],
        },
        {
          title: 'Availability',
          fields: [
            { key: 'possessionTimeline',label: 'Possession Timeline',     type: 'select', required: true, options: ['Immediate', 'Within 1 Month', '1–3 Months', '3–6 Months'] },
          ],
        },
      ];

    case 'rental':
      return [
        {
          title: 'Rent Details',
          fields: isAgri
            ? [
                { key: 'annualLease',      label: 'Annual Lease (₹)',         type: 'price',  required: true  },
                { key: 'securityDeposit',  label: 'Security Deposit (₹)',     type: 'price',  required: true  },
                { key: 'leaseDuration',    label: 'Lease Duration',           type: 'select', required: true, options: ['1 Year', '2 Years', '3 Years', 'Negotiable'] },
              ]
            : [
                { key: 'monthlyRent',      label: 'Monthly Rent (₹)',         type: 'price',  required: true  },
                { key: 'securityDeposit',  label: 'Security Deposit (₹)',     type: 'price',  required: true  },
                { key: 'maintenance',      label: 'Maintenance (₹/month)',    type: 'price',  required: false },
              ],
        },
        {
          title: 'Availability',
          fields: [
            { key: 'availableFrom',    label: 'Available From',           type: 'date',   required: true  },
            ...(!isAgri ? [
              { key: 'preferredTenants', label: 'Preferred Tenants',       type: 'select', required: false, options: ['Family', 'Bachelors', 'Female Tenants', 'Any'] },
              { key: 'leaseDuration',   label: 'Lease Duration',          type: 'select', required: false, options: ['6 Months', '11 Months', '1 Year', '2 Years', '3 Years', 'Negotiable'] },
              { key: 'lockInPeriod',    label: 'Lock-in Period',          type: 'select', required: false, options: ['1 Month', '3 Months', '6 Months', '1 Year', 'None'] },
              { key: 'rentNegotiable',  label: 'Rent Negotiable',         type: 'toggle', required: false },
              { key: 'brokerage',       label: 'Brokerage',               type: 'text',   required: false, placeholder: 'e.g. 1% or ₹50,000' },
            ] as FieldDef[] : []),
          ],
        },
      ];

    case 'new':
      return [
        {
          title: 'Project Pricing',
          fields: [
            { key: 'startingPrice',    label: 'Starting Price (₹)',       type: 'price',  required: true  },
            { key: 'bookingAmount',    label: 'Booking Amount (₹)',       type: 'price',  required: true  },
            { key: 'pricePerSqft',     label: 'Price per sq.ft (₹)',      type: 'price',  required: false },
            { key: 'priceNegotiable',  label: 'Price Negotiable',         type: 'toggle', required: false },
          ],
        },
        {
          title: 'Construction Status',
          fields: [
            { key: 'constructionStatus', label: 'Construction Status',     type: 'select', required: true,  options: ['Under Construction', 'Ready to Move', 'New Launch'] },
            { key: 'possessionDate',     label: 'Expected Possession',    type: 'date',   required: false, conditionKey: 'constructionStatus', conditionValue: 'Under Construction' },
            { key: 'reraNumber',         label: 'RERA Number',            type: 'text',   required: true,  placeholder: 'e.g. P52100012345' },
          ],
        },
      ];

    default:
      return [];
  }
}

// ─── Validation helper ────────────────────────────────────────────────────────

export function validateStep3(
  sections: FieldSection[],
  values: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const section of sections) {
    for (const field of section.fields) {
      // Skip fields with unmet conditions
      if (field.conditionKey) {
        const conditionMet = values[field.conditionKey] === field.conditionValue;
        if (!conditionMet) continue;
      }
      if (field.required) {
        const val = values[field.key];
        const isEmpty =
          val === undefined || val === null || val === '' ||
          (Array.isArray(val) && val.length === 0);
        if (isEmpty) {
          errors[field.key] = `${field.label} is required`;
        }
      }
    }
  }
  return errors;
}