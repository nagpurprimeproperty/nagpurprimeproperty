/**
 * Utility functions to build property pricing object from form state
 * Extracted from usePropertyForm hook for better maintainability
 */
import { showsPreferredTenants } from "@/lib/api/property.api";

/**
 * Convert string to number or undefined
 */
function num(value) {
  // Handle null/undefined
  if (value == null) return undefined;
  
  // Handle numbers directly
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  
  // Handle strings
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  
  // Handle other types (objects, arrays, etc.)
  return undefined;
}

/**
 * Build pricing object for residential properties based on listing category
 */
export function buildResalePricing(form) {
  const pricing = {};
  
  if (form.totalPrice) pricing.totalPrice = num(form.totalPrice);
  if (form.pricePerSqft) pricing.pricePerSqft = num(form.pricePerSqft);
  if (form.possessionTimeline) pricing.possessionTimeline = form.possessionTimeline;
  if (form.brokerage) pricing.brokerage = form.brokerage;
  if (form.priceNegotiable !== undefined) pricing.priceNegotiable = form.priceNegotiable;
  
  return pricing;
}

export function buildNewPricing(form) {
  const pricing = {};
  
  if (form.startingPrice) pricing.startingPrice = num(form.startingPrice);
  if (form.pricePerSqft) pricing.pricePerSqft = num(form.pricePerSqft);
  if (form.priceRange) pricing.priceRange = form.priceRange;
  if (form.bookingAmount) pricing.bookingAmount = num(form.bookingAmount);
  if (form.possessionDate) pricing.possessionDate = form.possessionDate;
  if (form.brokerage) pricing.brokerage = form.brokerage;
  if (form.gstApplicable !== undefined) pricing.gstApplicable = form.gstApplicable;
  if (form.priceNegotiable !== undefined) pricing.priceNegotiable = form.priceNegotiable;
  
  return pricing;
}

export function buildRentalPricing(form) {
  const pricing = {};
  const isAgri = form.propertyType === "Agricultural Land";
  
  if (isAgri) {
    if (form.annualLease) pricing.annualLease = num(form.annualLease);
  } else {
    if (form.monthlyRent) pricing.monthlyRent = num(form.monthlyRent);
    if (form.annualLease) pricing.annualLease = num(form.annualLease);
  }
  
  if (form.securityDeposit) pricing.securityDeposit = num(form.securityDeposit);
  if (form.maintenance) pricing.maintenance = num(form.maintenance);
  if (form.availableFrom) pricing.availableFrom = form.availableFrom;
  if (form.leaseDuration) pricing.leaseDuration = form.leaseDuration;
  if (form.lockInPeriod) pricing.lockInPeriod = form.lockInPeriod;
  if (form.brokerage) pricing.brokerage = form.brokerage;
  if (showsPreferredTenants(form.propertyType) && form.preferredTenants?.length) {
    pricing.preferredTenants = form.preferredTenants;
  }
  if (form.rentNegotiable !== undefined) pricing.rentNegotiable = form.rentNegotiable;
  
  return pricing;
}

/**
 * Main buildPricing function that delegates to specific builders
 */
export function buildPricing(form) {
  // Validate form input
  if (!form || typeof form !== 'object' || Array.isArray(form)) {
    throw new Error('Invalid form parameter: must be an object');
  }
  
  const lc = form.listingCategory;
  
  if (lc === "Resale") {
    return buildResalePricing(form);
  }
  
  if (lc === "New") {
    return buildNewPricing(form);
  }
  
  if (lc === "Rental") {
    return buildRentalPricing(form);
  }
  
  return {};
}
