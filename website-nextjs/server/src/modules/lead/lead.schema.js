import { z } from 'zod';
import {
  PROPERTY_TYPES,
  LEAD_STATUSES,
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
} from '../../constants/lead.constants.js';

// ─── CREATE ───────────────────────────────────────────────────────────────

export const createLeadSchema = z.object({
  customerName: z
    .string({ required_error: 'Customer name is required' })
    .min(MIN_NAME_LENGTH, MIN_NAME_LENGTH_MESSAGE)
    .max(MAX_NAME_LENGTH, MAX_NAME_LENGTH_MESSAGE)
    .trim(),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(PHONE_REGEX, PHONE_REGEX_MESSAGE),

  propertyType: z.enum(PROPERTY_TYPES),

  area: z.string({ required_error: 'Area is required' }),

  budget: z
    .string()
    .max(MAX_BUDGET_LENGTH, MAX_BUDGET_LENGTH_MESSAGE)
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(MAX_NOTES_LENGTH, MAX_NOTES_LENGTH_MESSAGE)
    .optional()
    .or(z.literal('')),

  status: z
    .enum(LEAD_STATUSES)
    .optional()
    .default(DEFAULT_LEAD_STATUS),
});


// ─── UPDATE ───────────────────────────────────────────────────────────────

export const updateLeadSchema = createLeadSchema.partial();


// ─── STATUS UPDATE ────────────────────────────────────────────────────────

export const updateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});