
 

const INVALID_LOCALITY_MESSAGE = `Area must be one of the valid Nagpur localities`;


// ─── PROPERTY TYPES ───────────────────────────────────────────────────────────

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

const PROPERTY_TYPES_ENUM = Object.values(PROPERTY_TYPES);

const PROPERTY_TYPES_DROPDOWN = PROPERTY_TYPES.map((type) => ({
  value: type,
  label: type,
}));

const INVALID_PROPERTY_TYPE_MESSAGE = `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`;


// ─── LEAD STATUS ──────────────────────────────────────────────────────────────

const LEAD_STATUSES = ['New', 'Contacted', 'Closed'];

const LEAD_STATUSES_ENUM = Object.values(LEAD_STATUSES);

const LEAD_STATUSES_DROPDOWN = LEAD_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

const INVALID_STATUS_MESSAGE = `Status must be one of: ${LEAD_STATUSES.join(', ')}`;

const DEFAULT_LEAD_STATUS = 'New';


// ─── VALIDATIONS ──────────────────────────────────────────────────────────────

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

const MIN_NAME_LENGTH_MESSAGE = `Name must be at least ${MIN_NAME_LENGTH} characters`;
const MAX_NAME_LENGTH_MESSAGE = `Name cannot exceed ${MAX_NAME_LENGTH} characters`;

const PHONE_REGEX = /^\d{10}$/;
const PHONE_REGEX_MESSAGE = 'Enter a valid 10-digit phone number';

const MAX_BUDGET_LENGTH = 50;
const MAX_BUDGET_LENGTH_MESSAGE = `Budget cannot exceed ${MAX_BUDGET_LENGTH} characters`;

const MAX_NOTES_LENGTH = 500;
const MAX_NOTES_LENGTH_MESSAGE = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters`;

const MAX_SOURCE_LENGTH = 50;
const MAX_SOURCE_LENGTH_MESSAGE = `Source cannot exceed ${MAX_SOURCE_LENGTH} characters`;


// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export {
  INVALID_LOCALITY_MESSAGE,

  PROPERTY_TYPES,
  PROPERTY_TYPES_ENUM,
  PROPERTY_TYPES_DROPDOWN,
  INVALID_PROPERTY_TYPE_MESSAGE,

  LEAD_STATUSES,
  LEAD_STATUSES_ENUM,
  LEAD_STATUSES_DROPDOWN,
  INVALID_STATUS_MESSAGE,
  DEFAULT_LEAD_STATUS,

  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH_MESSAGE,
  MAX_NAME_LENGTH_MESSAGE,

  PHONE_REGEX,
  PHONE_REGEX_MESSAGE,

  MAX_BUDGET_LENGTH,
  MAX_BUDGET_LENGTH_MESSAGE,

  MAX_NOTES_LENGTH,
  MAX_NOTES_LENGTH_MESSAGE,

  MAX_SOURCE_LENGTH,
  MAX_SOURCE_LENGTH_MESSAGE,
};