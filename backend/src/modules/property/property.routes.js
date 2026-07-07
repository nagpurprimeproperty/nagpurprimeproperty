import { Router } from "express";
import { z } from "zod";
import {getPopularLocalitiesCount,getListedProperties,getPropertyById,getSimilarProperties, getMyProperties, getMyProperty, createMyProperty, updateMyProperty, deleteMyProperty, toggleFeaturedMyProperty, updateMyPropertyStatus} from "./property.controller.js";
import {userProtect} from "../../middlewares/auth.middleware.js";
import {savePropertyToggle} from "./savedProperty.controller.js";
import { attachUser } from "../../middlewares/attachUser.middleware.js";
import {createLead,createLeadByOnlyFetchDataFromPropertyId} from "../lead/lead.controller.js";
import {createLeadSchema} from "../lead/lead.schema.js";
import {getSearchSuggestions} from "./searchSuggestions.controller.js";
import {getAmenities} from "./amenities.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import {basePropertySchema, updatePropertySchema} from "./property.schema.js";
const router = Router();

// ─── Validation Middlewares ───────────────────────────────────────────────────

// Custom validation middleware for create-lead that includes route params
const validateCreateLead = (req, _res, next) => {
  try {
    // Merge route params with body for validation
    const dataToValidate = { ...req.body, propertyId: req.params.id };
    
    // Extend schema to include propertyId
    const extendedSchema = createLeadSchema.extend({
      propertyId: z.string({ required_error: 'Associated property is required' }).min(1),
    });
    
    const result = extendedSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      return next({
        statusCode: 400,
        message: "Validation Error",
        errors: result.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    
    // Preserve only body fields, propertyId is already in params
    req.body = result.data;
    delete req.body.propertyId; // Remove from body since it's in params
    return next();
  } catch (error) {
    next(error);
  }
};

// ─── Public Routes ────────────────────────────────────────────────────────────
// Define property-related routes here
router.use(attachUser); // Attach user information to the request if available
router.get("/get-popular-localities-count", getPopularLocalitiesCount);

// ─── Search Suggestions Routes ────────────────────────────────────────────────
router.get("/search/suggestions", getSearchSuggestions);

// ─── Amenities Routes ────────────────────────────────────────────────────────────
router.get("/amenities", getAmenities);

router.get("/", getListedProperties);

// ─── My Properties Routes (Authenticated) ───────────────────────────────────────
router.get("/me", userProtect, getMyProperties);
router.post("/me", userProtect, validate(basePropertySchema), createMyProperty);
router.get("/me/:id", userProtect, getMyProperty);
router.put("/me/:id", userProtect, validate(updatePropertySchema), updateMyProperty);
router.delete("/me/:id", userProtect, deleteMyProperty);
router.post("/me/:id/toggle-featured", userProtect, toggleFeaturedMyProperty);
router.patch("/me/:id/update-status", userProtect, updateMyPropertyStatus);

// ─── Property Detail Routes ───────────────────────────────────────────────────────
router.get("/:id", getPropertyById);
router.post("/:id/save-toggle", userProtect, savePropertyToggle);
router.post("/:id/create-enquiry", userProtect, validateCreateLead, createLead);
router.post("/:id/create-call-enquiry", userProtect, createLeadByOnlyFetchDataFromPropertyId);
router.get("/:id/similar-properties", getSimilarProperties); // Reuse listing logic for similar properties

export default router;