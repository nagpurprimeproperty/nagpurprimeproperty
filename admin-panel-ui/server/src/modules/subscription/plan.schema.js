import { z } from 'zod';

const limitsSchema = z.object({
  propertyUploads:               z.coerce.number().int().min(0).default(5),
  isPropertyUploadUnlimited:     z.boolean().default(false),
  featuredProperties:            z.coerce.number().int().min(0).default(0),
  isFeaturedPropertiesUnlimited: z.boolean().default(false),
  leadAccessCount:               z.coerce.number().int().min(0).default(10),
  isLeadAccessUnlimited:         z.boolean().default(false),
  prioritySupport:               z.boolean().default(false),
  analyticsAccess:               z.boolean().default(false),
}).optional();

export const createPlanSchema = z.object({
  name:                z.string().min(2, 'Name must be at least 2 characters').max(50),
  isFree:              z.boolean().default(false),
  price:               z.coerce.number().min(0),
  duration:            z.coerce.number().int().min(0).optional(),
  durationUnit:        z.enum(['days', 'months', 'years']).optional(),
  isDurationUnlimited: z.boolean().default(false),
  description:         z.string().max(500).optional(),
  features:            z.array(z.string().max(100)).optional().default([]),
  limits:              limitsSchema,
  isActive:            z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();