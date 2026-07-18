import z from 'zod';
import {
  MAX_FIRST_NAME_LENGTH,
  MIN_FIRST_NAME_LENGTH,
  MIN_LAST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH_MESSAGE,
  MIN_FIRST_NAME_LENGTH_MESSAGE,
  MIN_LAST_NAME_LENGTH_MESSAGE,
  MAX_FIRST_NAME_LENGTH_MESSAGE,
  PHONE_REGEX,
  PHONE_REGEX_MESSAGE,
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH_MESSAGE,
  MAX_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH_MESSAGE,
} from '../../constants/admin.constants.js';

const VALID_MODULES = [
  'dashboard', 'sub-admin', 'users',
  'leads', 'properties', 'revenue', 'analytics',
  'plans', 'notifications', 'settings',
  'areas', 'keywords', 'blogs',
];

const modulePermissionSchema = z.object({
  module: z.enum(VALID_MODULES, {
    errorMap: () => ({ message: `module must be one of: ${VALID_MODULES.join(', ')}` }),
  }),
  permissions: z.object({
    read:   z.boolean().default(false),
    write:  z.boolean().default(false),
    delete: z.boolean().default(false),
  }),
});

/**
 * Schema for creating a sub-admin
 */
export const createSubAdminSchema = z.object({
  firstName: z.string()
    .min(MIN_FIRST_NAME_LENGTH, MIN_FIRST_NAME_LENGTH_MESSAGE)
    .max(MAX_FIRST_NAME_LENGTH, MAX_FIRST_NAME_LENGTH_MESSAGE),
  lastName: z.string()
    .min(MIN_LAST_NAME_LENGTH, MIN_LAST_NAME_LENGTH_MESSAGE)
    .max(MAX_LAST_NAME_LENGTH, MAX_LAST_NAME_LENGTH_MESSAGE),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(PHONE_REGEX, PHONE_REGEX_MESSAGE),
  password: z.string()
    .min(MIN_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH_MESSAGE)
    .max(MAX_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH_MESSAGE),
  // permissions is optional at creation time
  permissions: z.array(modulePermissionSchema).optional().default([]),
});

/**
 * Schema for updating permissions only
 */
export const updatePermissionsSchema = z.object({
  permissions: z.array(modulePermissionSchema).min(0),
});