import { z } from 'zod';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH_MESSAGE,
  MIN_NAME_LENGTH_MESSAGE,
  MOBILE_REGEX,
  MOBILE_REGEX_MESSAGE,
  MAX_CITY_LENGTH,
  MAX_CITY_LENGTH_MESSAGE,
  MAX_AREA_LENGTH,
  MAX_AREA_LENGTH_MESSAGE,
  MAX_ADDRESS_LENGTH,
  MAX_ADDRESS_LENGTH_MESSAGE,
} from '../../constants/user.constants.js';

const userBaseSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(MIN_NAME_LENGTH, MIN_NAME_LENGTH_MESSAGE)
    .max(MAX_NAME_LENGTH, MAX_NAME_LENGTH_MESSAGE)
    .trim(),

  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .regex(MOBILE_REGEX, MOBILE_REGEX_MESSAGE),

  email: z
    .string()
    .email('Invalid email address')
    .trim()
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .max(MAX_CITY_LENGTH, MAX_CITY_LENGTH_MESSAGE)
    .trim()
    .optional(),

  area: z
    .string()
    .max(MAX_AREA_LENGTH, MAX_AREA_LENGTH_MESSAGE)
    .trim()
    .optional(),

  address: z
    .string()
    .max(MAX_ADDRESS_LENGTH, MAX_ADDRESS_LENGTH_MESSAGE)
    .trim()
    .optional(),
});

export const createUserSchema = userBaseSchema;

export const updateUserSchema = userBaseSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),

    planExpiry: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'planExpiry must be YYYY-MM-DD format')
      .optional()
      .or(z.literal('')),
  });