/**
 * Frontend Zod validation — mirrors backend property.schema.js exactly.
 *
 * All number fields in the form are stored as strings, so we always
 * use z.coerce on them. Empty strings are treated as "not provided".
 *
 * validateStep(step, form) returns { fieldName: errorMessage } or {}.
 */
import { z } from "zod";
// ─── Constants (mirrored from property.constants.js) ─────────────────────────
const LISTING_CATEGORIES = ["Resale", "Rental", "New"];
const PROPERTY_TYPES = [
    "Flat/Apartment", "Villa/Independent House", "Builder Floor", "Penthouse",
    "Office Space", "Shop", "Showroom", "Warehouse/Godown",
    "Residential Plot", "Agricultural Land",
];
const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished", "Bare Shell", "Warm Shell"];
const FACING_OPTIONS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];
const AGE_OF_PROPERTY = ["New", "1-3 yrs", "3-5 yrs", "5-10 yrs", "10+ yrs"];
const FLOOR_TYPE = ["Marble", "Vitrified", "Wooden", "Granite", "Ceramic"];
const WATER_SUPPLY = ["Municipal", "Borewell", "Both"];
const ELECTRICITY_STATUS = ["Metered", "Non-metered", "Pre-paid"];
const FLOOR_OWNERSHIP_TYPES = ["Individual", "Shared", "Builder-owned"];
const SHOP_FLOOR_OPTIONS = ["Lower Ground", "Ground", "1st", "2nd", "3rd+"];
const FOOTFALL_RATING_OPTIONS = ["Low", "Medium", "High", "Premium"];
const SUITABLE_FOR_OPTIONS = ["Retail", "Food", "Pharmacy", "Showroom", "Office", "Clinic"];
const ROAD_TYPES = ["Tar Road", "Concrete", "Mud", "Kachcha"];
const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Canal", "Flood", "None"];
const SOIL_TYPES = ["Black", "Red", "Alluvial", "Mixed"];
const NA_ORDER_STATUS_OPTIONS = ["NA Order Received", "Applied", "Not Applied"];
const WATER_SOURCE_OPTIONS = ["Well", "Borewell", "Canal", "River", "None"];
const APPROVED_BY_OPTIONS = ["NIT", "NMC", "NMRDA", "MHADA", "Private Layout"];
const ZONE_TYPES = ["Residential", "Mixed Use", "Commercial", "Industrial"];
const CONSTRUCTION_STATUS_OPTIONS = [
    "Pre-launch", "Under Construction", "Ready to Move", "Ready", "Partially Ready", "Under Development",
];
const CC_OC_OPTIONS = ["CC Received", "OC Received", "Both", "None", "Applied"];
const DEVELOPMENT_STATUS_OPTIONS = ["Under Development", "Ready", "Partially Ready"];
const POSSESSION_TIMELINE_OPTIONS = ["Immediate", "Within 1 month", "1-3 months", "3-6 months"];
const PREFERRED_TENANTS_OPTIONS = ["Family", "Bachelor Male", "Bachelor Female", "Company", "Any"];
const LEASE_DURATION_OPTIONS = ["11 months", "1 year", "2 years", "3 years", "5 years", "10+ years", "Flexible"];
const LOCK_IN_PERIOD_OPTIONS = ["None", "3 months", "6 months", "1 year"];
const PINCODE_REGEX = /^44\d{4}$/;
// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Coerce a form string to a positive number; reject empty/0/negative. */
const posNum = (msg) => z.string().refine((v) => v !== "" && Number(v) > 0, { message: msg });
/** Coerce to non-negative number (0 allowed). */
const nonNegNum = (msg) => z.string().refine((v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 0, { message: msg });
/** Integer in [min, max] from a string; required. */
const intRange = (min, max, msg) => z.string().refine((v) => v !== "" && Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max, { message: msg });
/** Optional string — passes when empty or absent. */
const optStr = () => z.string().optional().or(z.literal(""));
/** Optional positive number string — passes when empty. */
const optPosNum = (msg) => z.union([
    z.literal(""),
    z.string().refine((v) => Number(v) > 0, { message: msg }),
]);
/** Optional int in range — passes when empty. */
const optIntRange = (min, max, msg) => z.union([
    z.literal(""),
    z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max, { message: msg }),
]);
/** Required enum from array of strings. */
const reqEnum = (values, msg) => z.enum(values, { errorMap: () => ({ message: msg }) });
/** Optional enum — passes when empty. */
const optEnum = (values, msg) => z.union([z.literal(""), z.enum(values, { errorMap: () => ({ message: msg }) })]);
// ─── Step 0 — Basic Info ──────────────────────────────────────────────────────
const step0Schema = z.object({
    title: z.string().min(1, "Property title is required").max(100, "Title cannot exceed 100 characters"),
    listingCategory: reqEnum(LISTING_CATEGORIES, "Select a listing category"),
    propertyType: reqEnum(PROPERTY_TYPES, "Select a property type"),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
});
// ─── Step 1 — Location ────────────────────────────────────────────────────────
const step1Schema = z.object({
    locality: z.string().min(1, "Locality is required").max(100, "Locality cannot exceed 100 characters"),
    lat: z.string().refine((v) => v !== "" && !isNaN(Number(v)), { message: "Latitude is required" }),
    lng: z.string().refine((v) => v !== "" && !isNaN(Number(v)), { message: "Longitude is required" }),
    pinCode: z.union([
        z.literal(""),
        z.string().regex(PINCODE_REGEX, "Enter a valid Nagpur pin code (440001-440037)"),
    ]).optional(),
});
// ─── Step 2 — Broker ─────────────────────────────────────────────────────────
const step2Schema = z.object({
    brokerId: z.string().min(1, "Please select a broker"),
});
// ─── Step 3 — Details ────────────────────────────────────────────────────────
// Each schema returns z.ZodTypeAny so we can call .safeParse()
function buildDetailsSchema(listingCategory, propertyType) {
    const isNew = listingCategory === "New";
    const isResale = listingCategory === "Resale";
    const isRental = listingCategory === "Rental";
    // ── Shared pieces ──────────────────────────────────────────────────────────
    const residentialBase = z.object({
        bhk: intRange(0, 8, "BHK must be between 0 and 8"),
        bathrooms: intRange(0, 15, "Bathrooms must be between 0 and 15"),
        balconies: optIntRange(0, 10, "Balconies must be between 0 and 10"),
        floorNumber: intRange(0, 99, "Floor number must be between 0 and 99"),
        totalFloors: intRange(1, 99, "Total floors must be between 1 and 99"),
        carpetArea: posNum("Carpet area is required and must be greater than 0"),
        builtUpArea: optPosNum("Built-up area must be greater than 0"),
        superBuiltUpArea: optPosNum("Super built-up area must be greater than 0"),
        furnishing: reqEnum(FURNISHING_OPTIONS, "Select a furnishing option"),
        facing: optEnum(FACING_OPTIONS, "Select a valid facing direction"),
        ageOfProperty: optEnum(AGE_OF_PROPERTY, "Select a valid age of property"),
        floorType: optEnum(FLOOR_TYPE, "Select a valid floor type"),
        waterSupply: optEnum(WATER_SUPPLY, "Select a valid water supply"),
        electricityStatus: optEnum(ELECTRICITY_STATUS, "Select a valid electricity status"),
        reraNumber: optStr(),
    });
    const villaBase = z.object({
        bhk: intRange(0, 8, "BHK must be between 0 and 8"),
        bathrooms: intRange(0, 15, "Bathrooms must be between 0 and 15"),
        numberOfFloors: z.string().min(1, "Number of floors is required").max(20),
        plotArea: posNum("Plot area is required and must be greater than 0"),
        builtUpArea: posNum("Built-up area is required and must be greater than 0"),
        carpetArea: optPosNum("Carpet area must be greater than 0"),
        furnishing: reqEnum(FURNISHING_OPTIONS, "Select a furnishing option"),
        facing: optEnum(FACING_OPTIONS, "Select a valid facing direction"),
        parkingSlots: intRange(0, 10, "Parking slots must be between 0 and 10"),
        roadWidth: optPosNum("Road width must be greater than 0"),
        waterSupply: optEnum(WATER_SUPPLY, "Select a valid water supply"),
        floorType: optEnum(FLOOR_TYPE, "Select a valid floor type"),
        ageOfProperty: optEnum(AGE_OF_PROPERTY, "Select a valid age of property"),
        reraNumber: optStr(),
    });
    const penthouseExtra = z.object({
        terraceArea: optPosNum("Terrace area must be greater than 0"),
    });
    const builderFloorExtra = z.object({
        totalUnitsInBuilding: optPosNum("Total units must be greater than 0"),
        floorOwnershipType: optEnum(FLOOR_OWNERSHIP_TYPES, "Select a valid floor ownership type"),
    });
    const commercialOfficeBase = z.object({
        carpetArea: posNum("Carpet area is required and must be greater than 0"),
        builtUpArea: optPosNum("Built-up area must be greater than 0"),
        superBuiltUpArea: optPosNum("Super built-up area must be greater than 0"),
        floorNumber: intRange(0, 99, "Floor number must be between 0 and 99"),
        totalFloors: optIntRange(1, 99, "Total floors must be between 1 and 99"),
        furnishing: reqEnum(FURNISHING_OPTIONS, "Select a furnishing option"),
        washrooms: intRange(1, 10, "Washrooms must be between 1 and 10"),
        cabinCount: optIntRange(0, 50, "Cabin count must be between 0 and 50"),
        openDesks: optIntRange(0, 200, "Open desks must be between 0 and 200"),
        ageOfProperty: optEnum(AGE_OF_PROPERTY, "Select a valid age of property"),
    });
    const shopBase = z.object({
        carpetArea: posNum("Carpet area is required and must be greater than 0"),
        builtUpArea: optPosNum("Built-up area must be greater than 0"),
        shopFloor: reqEnum(SHOP_FLOOR_OPTIONS, "Select the shop floor"),
        frontage: optPosNum("Frontage must be greater than 0"),
        depth: optPosNum("Depth must be greater than 0"),
        ceilingHeight: optPosNum("Ceiling height must be greater than 0"),
        footfallRating: optEnum(FOOTFALL_RATING_OPTIONS, "Select a valid footfall rating"),
        ageOfProperty: optEnum(AGE_OF_PROPERTY, "Select a valid age of property"),
    });
    const showroomBase = z.object({
        showroomArea: posNum("Showroom area is required and must be greater than 0"),
        numberOfShowroomFloors: optIntRange(1, 5, "Showroom floors must be between 1 and 5"),
        frontage: optPosNum("Frontage must be greater than 0"),
        ceilingHeight: optPosNum("Ceiling height must be greater than 0"),
        ageOfProperty: optEnum(AGE_OF_PROPERTY, "Select a valid age of property"),
    });
    const warehouseBase = z.object({
        warehouseArea: posNum("Warehouse area is required and must be greater than 0"),
        warehouseHeight: posNum("Warehouse height is required and must be greater than 0"),
        numberOfDocks: optIntRange(0, 20, "Number of docks must be between 0 and 20"),
        openYardArea: optPosNum("Open yard area must be greater than 0"),
        powerLoad: optPosNum("Power load must be greater than 0"),
        ageOfProperty: optEnum(AGE_OF_PROPERTY, "Select a valid age of property"),
    });
    const residentialPlotBase = z.object({
        plotAreaSqFt: posNum("Plot area (sq.ft) is required and must be greater than 0"),
        plotLength: optPosNum("Plot length must be greater than 0"),
        plotWidth: optPosNum("Plot width must be greater than 0"),
        facing: optEnum(FACING_OPTIONS, "Select a valid facing direction"),
        roadWidth: optPosNum("Road width must be greater than 0"),
        zoneType: optEnum(["Residential", "Mixed Use"], "Zone type must be Residential or Mixed Use"),
        fsiAvailable: optPosNum("FSI must be greater than 0"),
    });
    const agriLandBase = z.object({
        areaAcres: posNum("Area (acres) is required and must be greater than 0"),
        areaHectares: optPosNum("Area (hectares) must be greater than 0"),
        roadAccess: z.boolean({ required_error: "Road access is required" }),
        roadType: optEnum(ROAD_TYPES, "Select a valid road type"),
        irrigationType: optEnum(IRRIGATION_TYPES, "Select a valid irrigation type"),
        soilType: optEnum(SOIL_TYPES, "Select a valid soil type"),
        distanceFromCity: optPosNum("Distance from city must be greater than 0"),
        ownershipType: reqEnum(["Individual", "Joint", "Family"], "Ownership type for Agricultural Land must be Individual, Joint, or Family"),
    });
    // ── New project details ────────────────────────────────────────────────────
    const newProjectCore = z.object({
        projectName: z.string().min(1, "Project name is required").max(100),
        builderName: z.string().min(1, "Builder name is required").max(100),
        reraNumber: z.string().min(1, "RERA Number is required for new projects"),
        projectReraNumber: z.string().min(1, "Project RERA Number is required for new projects"),
        constructionStatus: reqEnum(CONSTRUCTION_STATUS_OPTIONS, "Select construction status"),
        possessionDate: z.string().min(1, "Possession date is required"),
        totalUnitsInProject: optPosNum("Total units must be greater than 0"),
        unitsAvailable: optPosNum("Units available must be 0 or more"),
        towerWing: optStr(),
        approvedBanks: optStr(),
        ccOcReceived: optEnum(CC_OC_OPTIONS, "Select a valid CC/OC status"),
    });
    // Villa new omits approvedBanks + ccOcReceived
    const newVillaProjectCore = z.object({
        projectName: z.string().min(1, "Project name is required").max(100),
        builderName: z.string().min(1, "Builder name is required").max(100),
        reraNumber: z.string().min(1, "RERA Number is required for new projects"),
        projectReraNumber: z.string().min(1, "Project RERA Number is required for new projects"),
        constructionStatus: reqEnum(CONSTRUCTION_STATUS_OPTIONS, "Select construction status"),
        possessionDate: z.string().min(1, "Possession date is required"),
        totalVillasInProject: optPosNum("Total villas must be greater than 0"),
        unitsAvailable: optPosNum("Units available must be 0 or more"),
        towerWing: optStr(),
    });
    // Warehouse new: projectName/builderName optional, RERA required, limited constructionStatus
    const newWarehouseCore = z.object({
        projectName: optStr(),
        builderName: optStr(),
        reraNumber: z.string().min(1, "RERA Number is required for new projects"),
        projectReraNumber: z.string().min(1, "Project RERA Number is required for new projects"),
        constructionStatus: reqEnum(["Under Construction", "Ready"], 'Construction status must be "Under Construction" or "Ready"'),
        possessionDate: z.string().min(1, "Possession date is required"),
    });
    // Residential plot new
    const newResPlotCore = z.object({
        layoutProjectName: z.string().min(1, "Layout project name is required").max(100),
        builderName: z.string().min(1, "Builder name is required").max(100),
        reraNumber: z.string().min(1, "RERA Number is required for new projects"),
        projectReraNumber: z.string().min(1, "Project RERA Number is required for new projects"),
        totalPlotsInLayout: optPosNum("Total plots must be greater than 0"),
        plotsAvailable: optPosNum("Plots available must be 0 or more"),
        developmentStatus: reqEnum(DEVELOPMENT_STATUS_OPTIONS, "Select development status"),
    });
    // Resale residential extra
    const resaleResidentialExtra = z.object({
        ownershipType: reqEnum(["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"], "Select a valid ownership type"),
        readyToMove: z.boolean(),
    });
    // Villa resale ownership
    const villaResaleExtra = z.object({
        ownershipType: reqEnum(["Freehold", "Leasehold", "Power of Attorney"], "Ownership type must be Freehold, Leasehold, or Power of Attorney"),
        readyToMove: z.boolean(),
    });
    // Commercial resale ownership
    const commercialResaleExtra = z.object({
        ownershipType: reqEnum(["Freehold", "Leasehold"], "Ownership type must be Freehold or Leasehold"),
    });
    const plotResaleExtra = z.object({
        ownershipType: reqEnum(["Freehold", "Leasehold"], "Ownership type must be Freehold or Leasehold"),
    });
    // ── Build schema per type ──────────────────────────────────────────────────
    switch (propertyType) {
        case "Flat/Apartment": {
            if (isNew)
                return residentialBase.merge(newProjectCore);
            if (isResale)
                return residentialBase.merge(resaleResidentialExtra);
            // Rental
            return residentialBase;
        }
        case "Builder Floor": {
            const base = residentialBase.merge(builderFloorExtra);
            if (isNew)
                return base.merge(newProjectCore);
            if (isResale)
                return base.merge(resaleResidentialExtra);
            return base;
        }
        case "Penthouse": {
            const base = residentialBase.merge(penthouseExtra);
            if (isNew)
                return base.merge(newProjectCore);
            if (isResale)
                return base.merge(resaleResidentialExtra);
            return base;
        }
        case "Villa/Independent House": {
            if (isResale)
                return villaBase.merge(villaResaleExtra);
            if (isNew)
                return villaBase.merge(newVillaProjectCore);
            // Rental: villaBase includes petFriendly/nonVegAllowed, they are booleans
            return villaBase;
        }
        case "Office Space": {
            if (isNew)
                return commercialOfficeBase.merge(newProjectCore);
            if (isResale)
                return commercialOfficeBase.merge(commercialResaleExtra);
            // Rental: ownershipType optional
            return commercialOfficeBase.merge(z.object({
                ownershipType: optEnum(["Freehold", "Leasehold"], "Ownership type must be Freehold or Leasehold"),
            }));
        }
        case "Shop": {
            if (isNew)
                return shopBase.merge(newProjectCore);
            if (isResale)
                return shopBase.merge(commercialResaleExtra);
            return shopBase;
        }
        case "Showroom": {
            if (isNew)
                return showroomBase.merge(newProjectCore);
            if (isResale)
                return showroomBase.merge(commercialResaleExtra);
            return showroomBase;
        }
        case "Warehouse/Godown": {
            if (isNew)
                return warehouseBase.merge(newWarehouseCore);
            if (isResale)
                return warehouseBase.merge(commercialResaleExtra);
            return warehouseBase;
        }
        case "Residential Plot": {
            if (isNew)
                return residentialPlotBase.merge(newResPlotCore);
            if (isResale)
                return residentialPlotBase.merge(plotResaleExtra);
            return residentialPlotBase;
        }
        case "Agricultural Land":
            return agriLandBase;
        default:
            return z.object({});
    }
}
// ─── Step 4 — Pricing ────────────────────────────────────────────────────────
function buildPricingSchema(listingCategory, propertyType) {
    if (listingCategory === "Resale") {
        return z.object({
            totalPrice: posNum("Total price is required and must be greater than 0"),
            pricePerSqft: optPosNum("Price per sqft must be greater than 0"),
            possessionTimeline: reqEnum(POSSESSION_TIMELINE_OPTIONS, "Select a possession timeline"),
            brokerage: optStr(),
        });
    }
    if (listingCategory === "New") {
        return z.object({
            startingPrice: posNum("Starting price is required and must be greater than 0"),
            pricePerSqft: optPosNum("Price per sqft must be greater than 0"),
            priceRange: optStr(),
            bookingAmount: optPosNum("Booking amount must be greater than 0"),
            possessionDate: z.string().min(1, "Possession date is required"),
            brokerage: optStr(),
        });
    }
    // Rental
    if (propertyType === "Agricultural Land") {
        // Agricultural Land rental: annualLease required (no monthlyRent)
        return z.object({
            annualLease: posNum("Annual lease is required and must be greater than 0"),
            securityDeposit: posNum("Security deposit is required and must be greater than 0"),
            availableFrom: z.string().min(1, "Available from date is required"),
            maintenance: optPosNum("Maintenance must be greater than 0"),
            leaseDuration: optEnum(LEASE_DURATION_OPTIONS, "Select a valid lease duration"),
            lockInPeriod: optEnum(LOCK_IN_PERIOD_OPTIONS, "Select a valid lock-in period"),
            brokerage: optStr(),
        });
    }
    return z.object({
        monthlyRent: posNum("Monthly rent is required and must be greater than 0"),
        annualLease: optPosNum("Annual lease must be greater than 0"),
        securityDeposit: posNum("Security deposit is required and must be greater than 0"),
        availableFrom: z.string().min(1, "Available from date is required"),
        maintenance: optPosNum("Maintenance must be greater than 0"),
        leaseDuration: optEnum(LEASE_DURATION_OPTIONS, "Select a valid lease duration"),
        lockInPeriod: optEnum(LOCK_IN_PERIOD_OPTIONS, "Select a valid lock-in period"),
        brokerage: optStr(),
    });
}
/**
 * Validate a single wizard step.
 * Returns { fieldName: errorMessage } for each failing field, or {} if all pass.
 */
export function validateStep(step, form) {
    const errors = {};
    function collectErrors(result) {
        if (!result.success) {
            for (const issue of result.error.issues) {
                const field = issue.path[issue.path.length - 1];
                if (field && !errors[field]) {
                    errors[field] = issue.message;
                }
            }
        }
    }
    switch (step) {
        case 0: {
            collectErrors(step0Schema.safeParse({
                title: form.title,
                listingCategory: form.listingCategory,
                propertyType: form.propertyType,
                description: form.description,
            }));
            break;
        }
        case 1: {
            collectErrors(step1Schema.safeParse({
                locality: form.locality,
                lat: form.lat,
                lng: form.lng,
                pinCode: form.pinCode,
            }));
            break;
        }
        case 2: {
            collectErrors(step2Schema.safeParse({ brokerId: form.brokerId }));
            break;
        }
        case 3: {
            const lc = form.listingCategory;
            const pt = form.propertyType;
            if (!lc || !pt) {
                errors.listingCategory = "Select a listing category first";
                errors.propertyType = "Select a property type first";
                break;
            }
            const schema = buildDetailsSchema(lc, pt);
            // Build the details payload that matches what the schema expects
            // (pick only the fields relevant to this schema from the flat form)
            const details = {};
            // ── boolean fields always pass through ─────────────────────────────────
            const boolFields = [
                "readyToMove", "petFriendly", "nonVegAllowed", "hasGarden", "cornerProperty",
                "gatedSociety", "independentEntry", "privateLift", "isDuplex", "servantRoom",
                "privatePool", "stiltParking", "hasPantry", "itReady", "conferenceRoom",
                "receptionArea", "centralAC", "officeFireSafety", "dgBackup", "mainRoadFacing",
                "cornerShop", "mezzanineFloor", "hasWashroom", "glassFront", "parkingAvailable",
                "acInstalled", "truckAccess", "waterSupplyWarehouse", "officeSpaceInside", "midc",
                "boundaryWall", "gatedLayout", "cornerPlot", "roadAccess", "fencing",
                "electricityLand", "sevenTwelveExtract", "reraRegistered",
            ];
            for (const f of boolFields) {
                if (f in form)
                    details[f] = form[f];
            }
            // ── string fields always pass through ──────────────────────────────────
            const strFields = [
                "furnishing", "facing", "ageOfProperty", "floorType", "waterSupply",
                "electricityStatus", "ownershipType", "numberOfFloors", "floorOwnershipType",
                "shopFloor", "footfallRating", "roadType", "irrigationType", "soilType",
                "zoneType", "reraNumber", "projectReraNumber", "reraValidityDate",
                "projectName", "builderName", "constructionStatus", "possessionDate",
                "towerWing", "approvedBanks", "ccOcReceived", "layoutProjectName",
                "developmentStatus", "floorLoadCapacity", "treesPlantation",
            ];
            for (const f of strFields) {
                if (f in form)
                    details[f] = form[f];
            }
            // ── array fields ───────────────────────────────────────────────────────
            const arrFields = [
                "suitableFor", "approvedBy", "waterSource", "preferredTenants",
            ];
            for (const f of arrFields) {
                if (f in form)
                    details[f] = form[f];
            }
            // ── numeric string fields ──────────────────────────────────────────────
            const numFields = [
                "bhk", "bathrooms", "balconies", "floorNumber", "totalFloors",
                "carpetArea", "builtUpArea", "superBuiltUpArea", "plotArea", "parkingSlots",
                "roadWidth", "terraceArea", "totalUnitsInBuilding", "cabinCount", "openDesks",
                "washrooms", "frontage", "depth", "ceilingHeight", "showroomArea",
                "numberOfShowroomFloors", "warehouseArea", "warehouseHeight", "numberOfDocks",
                "openYardArea", "powerLoad", "plotAreaSqFt", "plotLength",
                "plotWidth", "fsiAvailable", "areaAcres", "areaHectares", "distanceFromCity",
                "totalUnitsInProject", "unitsAvailable", "totalVillasInProject",
                "totalPlotsInLayout", "plotsAvailable",
            ];
            for (const f of numFields) {
                if (f in form)
                    details[f] = form[f]; // pass as string; posNum/intRange handle coercion
            }
            collectErrors(schema.safeParse(details));
            break;
        }
        case 4: {
            const lc = form.listingCategory;
            const pt = form.propertyType;
            if (!lc) {
                errors.listingCategory = "Select a listing category first";
                break;
            }
            const schema = buildPricingSchema(lc, pt);
            collectErrors(schema.safeParse({
                totalPrice: form.totalPrice,
                startingPrice: form.startingPrice,
                pricePerSqft: form.pricePerSqft,
                priceRange: form.priceRange,
                bookingAmount: form.bookingAmount,
                possessionTimeline: form.possessionTimeline,
                possessionDate: form.possessionDate,
                brokerage: form.brokerage,
                monthlyRent: form.monthlyRent,
                annualLease: form.annualLease,
                securityDeposit: form.securityDeposit,
                maintenance: form.maintenance,
                availableFrom: form.availableFrom,
                leaseDuration: form.leaseDuration,
                lockInPeriod: form.lockInPeriod,
            }));
            break;
        }
        case 5:
            // Amenities are optional — always passes
            break;
        case 6:
            // Photo validation is done inline in the page component (file count check)
            break;
        default:
            break;
    }
    return errors;
}
