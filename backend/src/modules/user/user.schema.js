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
  avatar: z.string().optional(),
});

export const createUserSchema = userBaseSchema;

export const loginUserSchema = z.object({
  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .regex(MOBILE_REGEX, MOBILE_REGEX_MESSAGE),
  name: z
    .string({ required_error: 'Name is required' })
    .min(MIN_NAME_LENGTH, MIN_NAME_LENGTH_MESSAGE)
    .max(MAX_NAME_LENGTH, MAX_NAME_LENGTH_MESSAGE)
    .trim()
    .optional(),
});

export const verifyOTPSchema = z.object({
  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .regex(MOBILE_REGEX, MOBILE_REGEX_MESSAGE),
  otp: z.string({ required_error: 'OTP is required' }).length(4, 'OTP must be 4 digits'),
  fcmToken: z.string().nullable().optional(),
});

export const updateUserSchema = userBaseSchema.partial();

export const requestDeletionSchema = z.object({
  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .regex(MOBILE_REGEX, MOBILE_REGEX_MESSAGE),
});

export const confirmDeletionSchema = z.object({
  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .regex(MOBILE_REGEX, MOBILE_REGEX_MESSAGE),
  otp: z.string({ required_error: 'OTP is required' }).length(4, 'OTP must be 4 digits'),
});