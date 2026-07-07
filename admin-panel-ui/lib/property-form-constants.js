/** Shared property form constants (mirror backend where applicable). */

export const OTHER_AMENITIES_OPTION = "Other Amenities";

export const PROPERTY_TYPES_WITHOUT_PREFERRED_TENANTS = [
    "Office Space",
    "Shop",
    "Showroom",
    "Warehouse/Godown",
    "Residential Plot",
    "Agricultural Land",
];

export function showsPreferredTenants(propertyType) {
    return Boolean(
        propertyType && !PROPERTY_TYPES_WITHOUT_PREFERRED_TENANTS.includes(propertyType)
    );
}
