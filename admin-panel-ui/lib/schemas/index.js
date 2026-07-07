import { z } from "zod";
// Broker schemas
export const brokerSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    area: z.string().min(2, "Area is required"),
    status: z.enum(["pending", "approved", "rejected", "suspended"]),
    subscriptionPlan: z.string().optional(),
    subscriptionStatus: z.enum(["active", "inactive", "expired"]).optional(),
    createdAt: z.string(),
    totalProperties: z.number().default(0),
    totalLeads: z.number().default(0),
});
export const brokerFormSchema = brokerSchema.omit({ id: true, createdAt: true, totalProperties: true, totalLeads: true });
// Customer schemas
export const customerSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    preferences: z.object({
        propertyType: z.array(z.string()),
        budgetMin: z.number(),
        budgetMax: z.number(),
        locations: z.array(z.string()),
    }).optional(),
    savedProperties: z.array(z.string()).default([]),
    inquiries: z.number().default(0),
    status: z.enum(["active", "inactive"]),
    createdAt: z.string(),
});
export const customerFormSchema = customerSchema.omit({ id: true, createdAt: true, savedProperties: true, inquiries: true });
// Property schemas
export const propertySchema = z.object({
    id: z.string(),
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    propertyType: z.enum(["apartment", "house", "villa", "plot", "commercial", "office"]),
    transactionType: z.enum(["sale", "rent"]),
    price: z.number().positive("Price must be positive"),
    area: z.number().positive("Area must be positive"),
    areaUnit: z.enum(["sqft", "sqm", "sqyd"]),
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    images: z.array(z.string()).default([]),
    amenities: z.array(z.string()).default([]),
    brokerId: z.string(),
    brokerName: z.string(),
    status: z.enum(["active", "pending", "rejected", "sold", "rented", "inactive"]),
    featured: z.boolean().default(false),
    views: z.number().default(0),
    inquiries: z.number().default(0),
    createdAt: z.string(),
});
// Plan schemas
export const planSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Plan name is required"),
    description: z.string(),
    price: z.number().positive("Price must be positive"),
    duration: z.number().positive("Duration must be positive"),
    durationUnit: z.enum(["days", "months", "years"]),
    features: z.array(z.string()),
    maxProperties: z.number().positive(),
    maxLeads: z.number().positive(),
    featuredListings: z.number().min(0),
    prioritySupport: z.boolean().default(false),
    analyticsAccess: z.boolean().default(false),
    status: z.enum(["active", "inactive"]),
    createdAt: z.string(),
});
export const planFormSchema = planSchema.omit({ id: true, createdAt: true });
// Notification schemas
export const notificationSchema = z.object({
    id: z.string(),
    title: z.string().min(5, "Title must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    targetIds: z.array(z.string()).optional(),
    status: z.enum(["draft", "scheduled", "sent"]),
    scheduledAt: z.string().optional(),
    sentAt: z.string().optional(),
    createdAt: z.string(),
});
export const notificationFormSchema = notificationSchema.omit({ id: true, createdAt: true, sentAt: true });
