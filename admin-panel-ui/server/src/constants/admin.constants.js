const  ROLLS= {
  ADMIN: 'admin',
  SUB_ADMIN: 'sub-admin',
};

const ADMIN_ROLLS_ENUM = Object.values(ROLLS);
 
const ADMIN_ROLLS_DROPDOWN = ADMIN_ROLLS_ENUM.map((roll) => ({
  value: roll,
  label: roll.charAt(0).toUpperCase() + roll.slice(1), 
}));

const INVALID_ROLE_MESSAGE = `Invalid role. Valid roles: ${ADMIN_ROLLS_ENUM.join(', ')}`;

const MAX_FIRST_NAME_LENGTH = 30; 

const MIN_FIRST_NAME_LENGTH = 2;

const MAX_LAST_NAME_LENGTH = 30;

const MIN_LAST_NAME_LENGTH = 2;

const MAX_LAST_NAME_LENGTH_MESSAGE = `Last name cannot exceed ${MAX_LAST_NAME_LENGTH} characters`;

const MIN_FIRST_NAME_LENGTH_MESSAGE = `First name must be at least ${MIN_FIRST_NAME_LENGTH} characters`;

const MIN_LAST_NAME_LENGTH_MESSAGE = `Last name must be at least ${MIN_LAST_NAME_LENGTH} characters`;

const MAX_FIRST_NAME_LENGTH_MESSAGE = `First name cannot exceed ${MAX_FIRST_NAME_LENGTH} characters`;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PHONE_REGEX = /^(\+91[-\s]?)?(\d{10})$/;

const EMAIL_REGEX_MESSAGE = 'Please enter a valid email address';

const PHONE_REGEX_MESSAGE = 'Please enter a valid phone number';

const MIN_PASSWORD_LENGTH = 8;

const MIN_PASSWORD_LENGTH_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;

const MAX_PASSWORD_LENGTH = 20;

const MAX_PASSWORD_LENGTH_MESSAGE = `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`;

const MAX_BIO_LENGTH = 200;

const MAX_BIO_LENGTH_MESSAGE = `Bio cannot exceed ${MAX_BIO_LENGTH} characters`;
export { 
  ADMIN_ROLLS_ENUM, 
  ADMIN_ROLLS_DROPDOWN,
  MAX_FIRST_NAME_LENGTH,
  MIN_FIRST_NAME_LENGTH,
  MIN_LAST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH_MESSAGE,
  MIN_FIRST_NAME_LENGTH_MESSAGE,
  MIN_LAST_NAME_LENGTH_MESSAGE,
  MAX_FIRST_NAME_LENGTH_MESSAGE,
  INVALID_ROLE_MESSAGE,
  EMAIL_REGEX,
  EMAIL_REGEX_MESSAGE,
  PHONE_REGEX,
  PHONE_REGEX_MESSAGE,
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH_MESSAGE,
  MAX_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH_MESSAGE,
  MAX_BIO_LENGTH,
  MAX_BIO_LENGTH_MESSAGE
};
export default ROLLS;


