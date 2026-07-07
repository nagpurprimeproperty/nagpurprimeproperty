/**
 * Property API
 * All endpoints under /v1/admin/properties/
 */
import { apiClient } from "@/lib/api/client";
// ─── Enums (mirror backend constants exactly) ─────────────────────────────────
export const LISTING_CATEGORIES = ["Resale", "Rental", "New"];
export const PROPERTY_TYPES = [
    "Flat/Apartment",
    "Villa/Independent House",
    "Builder Floor",
    "Penthouse",
    "Office Space",
    "Shop",
    "Showroom",
    "Warehouse/Godown",
    "Residential Plot",
    "Agricultural Land",
];
export const PROPERTY_STATUSES = [
    "Active", "Rejected", "Sold", "Inactive",
];
export const NAGPUR_LOCALITIES = [
    "Dharampeth", "Sadar", "Sitabuldi", "Manish Nagar", "Trimurti Nagar",
    "Besa", "Wardha Road", "Hingna Road", "MIHAN", "Mankapur",
    "Laxmi Nagar", "Ramdaspeth", "Bajaj Nagar", "Pratap Nagar",
    "Kamptee Road", "Wadi", "Narendra Nagar", "Nandanvan",
    "Koradi Road", "Somalwada", "Khamla", "Ambazari",
    "Seminary Hills", "Civil Lines", "Godhni", "Dighori",
];
export const FURNISHING_OPTIONS = [
    "Unfurnished", "Semi-Furnished", "Fully Furnished", "Bare Shell", "Warm Shell",
];
export const FACING_OPTIONS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];
export const AGE_OF_PROPERTY = ["New", "1-3 yrs", "3-5 yrs", "5-10 yrs", "10+ yrs"];
export const FLOOR_TYPE = ["Marble", "Vitrified", "Wooden", "Granite", "Ceramic"];
export const WATER_SUPPLY = ["Municipal", "Borewell", "Both"];
export const ELECTRICITY_STATUS = ["Metered", "Non-metered", "Pre-paid"];
export const OWNERSHIP_TYPES = [
    "Freehold", "Leasehold", "Co-operative Society", "Power of Attorney",
    "Individual", "Joint", "Family",
];
export const FLOOR_OWNERSHIP_TYPES = ["Individual", "Shared", "Builder-owned"];
export const SHOP_FLOOR_OPTIONS = ["Lower Ground", "Ground", "1st", "2nd", "3rd+"];
export const FOOTFALL_RATING_OPTIONS = ["Low", "Medium", "High", "Premium"];
export const SUITABLE_FOR_OPTIONS = ["Retail", "Food", "Pharmacy", "Showroom", "Office", "Clinic"];
export const ROAD_TYPES = ["Tar Road", "Concrete", "Mud", "Kachcha"];
export const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Canal", "Flood", "None"];
export const SOIL_TYPES = ["Black", "Red", "Alluvial", "Mixed"];
export const NA_ORDER_STATUS_OPTIONS = ["NA Order Received", "Applied", "Not Applied"];
export const WATER_SOURCE_OPTIONS = ["Well", "Borewell", "Canal", "River", "None"];
export const APPROVED_BY_OPTIONS = ["NIT", "NMC", "NMRDA", "MHADA", "Private Layout"];
export const ZONE_TYPES = ["Residential", "Mixed Use", "Commercial", "Industrial"];
export const CONSTRUCTION_STATUS_OPTIONS = [
    "Pre-launch", "Under Construction", "Ready to Move", "Ready", "Partially Ready", "Under Development",
];
export const CC_OC_OPTIONS = ["CC Received", "OC Received", "Both", "None", "Applied"];
export const DEVELOPMENT_STATUS_OPTIONS = ["Under Development", "Ready", "Partially Ready"];
export const POSSESSION_TIMELINE_OPTIONS = ["Immediate", "Within 1 month", "1-3 months", "3-6 months"];
export const PREFERRED_TENANTS_OPTIONS = ["Family", "Bachelor Male", "Bachelor Female", "Company", "Any"];
export const LEASE_DURATION_OPTIONS = ["11 months", "1 year", "2 years", "3 years", "5 years", "10+ years", "Flexible"];
export const LOCK_IN_PERIOD_OPTIONS = ["None", "3 months", "6 months", "1 year"];
export { OTHER_AMENITIES_OPTION, PROPERTY_TYPES_WITHOUT_PREFERRED_TENANTS, showsPreferredTenants, } from "@/lib/property-form-constants";
// ─── API ──────────────────────────────────────────────────────────────────────
export const propertyApi = {
    list: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.search?.trim())
            qp.set("search", params.search.trim());
        if (params.status && params.status !== "all")
            qp.set("status", params.status);
        if (params.listingCategory && params.listingCategory !== "all")
            qp.set("listingCategory", params.listingCategory);
        if (params.propertyType && params.propertyType !== "all")
            qp.set("propertyType", params.propertyType);
        if (params.locality?.trim())
            qp.set("locality", params.locality.trim());
        if (params.brokerId)
            qp.set("brokerId", params.brokerId);
        if (params.featured != null)
            qp.set("featured", String(params.featured));
        if (params.dateFrom)
            qp.set("dateFrom", params.dateFrom);
        if (params.dateTo)
            qp.set("dateTo", params.dateTo);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/properties${qs ? `?${qs}` : ""}`);
    },
    getStats: () => apiClient.get("/v1/admin/properties/stats"),
    getLocalities: (status = "Active") =>
        apiClient.get(`/v1/admin/properties/localities?status=${encodeURIComponent(status)}`),
    getOne: (id) => apiClient.get(`/v1/admin/properties/${id}`),
    /** Create — sends plain JSON, photos/video are pre-uploaded URL strings */
    create: (payload) => apiClient.post("/v1/admin/properties", payload),
    /** Update — sends plain JSON, photos/video are pre-uploaded URL strings */
    update: (id, payload) => apiClient.put(`/v1/admin/properties/${id}`, payload),
    updateStatus: (id, payload) => apiClient.patch(`/v1/admin/properties/${id}/status`, payload),
    toggleFeatured: (id, featured) => apiClient.patch(`/v1/admin/properties/${id}/featured`, featured != null ? { featured } : undefined),
    removePhotos: (id, photoUrls) => apiClient.patch(`/v1/admin/properties/${id}/remove-photos`, { photoUrls }),
    delete: (id) => apiClient.delete(`/v1/admin/properties/${id}`),
};
