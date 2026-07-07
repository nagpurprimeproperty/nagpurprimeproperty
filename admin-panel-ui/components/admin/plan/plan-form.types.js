import { z } from "zod";
export const planFormSchema = z.object({
    name: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters"),
    isFree: z.boolean().default(false),
    price: z.coerce.number().min(0, "Must be ≥ 0"),
    duration: z.coerce.number().int().min(0, "Must be ≥ 0"),
    durationUnit: z.enum(["days", "months", "years"]).optional(),
    isDurationUnlimited: z.boolean().default(false),
    description: z.string().max(500).optional(),
    // comma-separated string in the form, split to array on submit
    featuresRaw: z.string().optional(),
    isActive: z.boolean().default(true),
    limits: z.object({
        propertyUploads: z.coerce.number().int().min(0).default(5),
        isPropertyUploadUnlimited: z.boolean().default(false),
        featuredProperties: z.coerce.number().int().min(0).default(0),
        isFeaturedPropertiesUnlimited: z.boolean().default(false),
        leadAccessCount: z.coerce.number().int().min(0).default(10),
        isLeadAccessUnlimited: z.boolean().default(false),
        prioritySupport: z.boolean().default(false),
        analyticsAccess: z.boolean().default(false),
    }),
});
export const DEFAULT_FORM_VALUES = {
    name: "",
    isFree: false,
    price: 0,
    duration: 0,
    isDurationUnlimited: false,
    durationUnit: "months",
    description: "",
    featuresRaw: "",
    isActive: true,
    limits: {
        propertyUploads: 5,
        isPropertyUploadUnlimited: false,
        featuredProperties: 0,
        isFeaturedPropertiesUnlimited: false,
        leadAccessCount: 10,
        isLeadAccessUnlimited: false,
        prioritySupport: false,
        analyticsAccess: false,
    },
};
