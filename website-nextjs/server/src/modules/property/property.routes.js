import { Router } from "express";
import { z } from "zod";
import { getListedProperties, getPropertyById, getSimilarProperties } from "./property.controller.js";
import { userProtect } from "../../middlewares/auth.middleware.js";
import { savePropertyToggle } from "./savedProperty.controller.js";
import { attachUser } from "../../middlewares/attachUser.middleware.js";
import { createLead, createLeadByOnlyFetchDataFromPropertyId } from "../lead/lead.controller.js";
import { createLeadSchema } from "../lead/lead.schema.js";
import { getSearchSuggestions } from "./searchSuggestions.controller.js";
import { getAmenities } from "./amenities.controller.js";

const router = Router();

// Custom validation middleware for create-lead that includes route params
const validateCreateLead = (req, _res, next) => {
  try {
    const dataToValidate = { ...req.body, propertyId: req.params.id };
    
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
    
    req.body = result.data;
    delete req.body.propertyId;
    return next();
  } catch (error) {
    next(error);
  }
};

// ─── Public Routes ────────────────────────────────────────────────────────────
router.use(attachUser);

// Search Suggestions
router.get("/search/suggestions", getSearchSuggestions);

// Amenities
router.get("/amenities", getAmenities);

// Properties List
router.get("/", getListedProperties);

// Property Detail Routes
router.get("/:id", getPropertyById);
router.post("/:id/save-toggle", userProtect, savePropertyToggle);
router.post("/:id/create-enquiry", userProtect, validateCreateLead, createLead);
router.post("/:id/create-call-enquiry", userProtect, createLeadByOnlyFetchDataFromPropertyId);
router.get("/:id/similar-properties", getSimilarProperties);

export default router;