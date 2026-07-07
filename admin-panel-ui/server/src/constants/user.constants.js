const MAX_NAME_LENGTH = 30;
const MIN_NAME_LENGTH = 2;

const MAX_NAME_LENGTH_MESSAGE = `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
const MIN_NAME_LENGTH_MESSAGE = `Name must be at least ${MIN_NAME_LENGTH} characters`;

const MOBILE_REGEX = /^\d{10}$/;
const MOBILE_REGEX_MESSAGE = 'Please enter a valid 10-digit mobile number';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const EMAIL_REGEX_MESSAGE = 'Please enter a valid email address';

const MAX_CITY_LENGTH = 50;
const MAX_CITY_LENGTH_MESSAGE = `City cannot exceed ${MAX_CITY_LENGTH} characters`;

const MAX_AREA_LENGTH = 50;
const MAX_AREA_LENGTH_MESSAGE = `Area cannot exceed ${MAX_AREA_LENGTH} characters`;

const MAX_ADDRESS_LENGTH = 100;
const MAX_ADDRESS_LENGTH_MESSAGE = `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters`;

const DEFAULT_CITY = 'Nagpur';

export {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH_MESSAGE,
  MIN_NAME_LENGTH_MESSAGE,
  MOBILE_REGEX,
  MOBILE_REGEX_MESSAGE,
  EMAIL_REGEX,
  EMAIL_REGEX_MESSAGE,
  MAX_CITY_LENGTH,
  MAX_CITY_LENGTH_MESSAGE,
  MAX_AREA_LENGTH,
  MAX_AREA_LENGTH_MESSAGE,
  MAX_ADDRESS_LENGTH,
  MAX_ADDRESS_LENGTH_MESSAGE,
  DEFAULT_CITY,
};