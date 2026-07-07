import { z } from 'zod';
import { getStep3Fields, getStep4Fields } from './fieldMatrix';
import type { AddPropertyStore } from '../store/addPropertyStore';

// ─── Modular Step Schemas ──────────────────────────────────────────────────────

export const basicInfoSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const localitySchema = z.object({
  locality: z.string().min(1, 'Select a locality in Nagpur'),
});

export const mapSchema = z.object({
  latitude: z.number({ required_error: 'Confirm coordinates on map' }).nullable().refine((val) => val !== null, { message: 'Confirm coordinates on map' }),
  longitude: z.number({ required_error: 'Confirm coordinates on map' }).nullable().refine((val) => val !== null, { message: 'Confirm coordinates on map' }),
});

export const photosSchema = z.object({
  photos: z.array(z.string()).min(1, 'Please upload at least one photo'),
});

// ─── Step Granular Validation Helpers ─────────────────────────────────────────

export function validateStepBasicInfo(title: string, description: string) {
  const result = basicInfoSchema.safeParse({ title, description });
  const errors: Record<string, string> = {};
  if (!result.success) {
    result.error.errors.forEach((e) => {
      errors[e.path[0] as string] = e.message;
    });
  }
  return errors;
}

export function validateStepLocality(locality: string) {
  const result = localitySchema.safeParse({ locality });
  const errors: Record<string, string> = {};
  if (!result.success) {
    result.error.errors.forEach((e) => {
      errors[e.path[0] as string] = e.message;
    });
  }
  return errors;
}

export function validateStepMap(latitude: number | null, longitude: number | null) {
  const result = mapSchema.safeParse({ latitude, longitude });
  const errors: Record<string, string> = {};
  if (!result.success) {
    result.error.errors.forEach((e) => {
      errors[e.path[0] as string] = e.message;
    });
  }
  return errors;
}

export function validateStepDetailsA(step3Data: Record<string, any>, propertyType: string) {
  const errors: Record<string, string> = {};

  const isResidential = ['flat', 'villa', 'builder_floor', 'penthouse'].includes(propertyType);
  const isLand = ['res_plot', 'agri_land'].includes(propertyType);

  // Area validations
  if (propertyType === 'villa') {
    // Villa: plotArea and builtUpArea are both required
    const plotVal = step3Data.plotArea;
    if (plotVal === undefined || plotVal === null || String(plotVal).trim() === '') {
      errors.plotArea = 'Plot Area is required';
    } else {
      const num = Number(plotVal);
      if (isNaN(num) || num <= 0) errors.plotArea = 'Plot Area must be a valid positive number';
    }

    const builtVal = step3Data.builtUpArea;
    if (builtVal === undefined || builtVal === null || String(builtVal).trim() === '') {
      errors.builtUpArea = 'Built-up Area is required';
    } else {
      const num = Number(builtVal);
      if (isNaN(num) || num <= 0) errors.builtUpArea = 'Built-up Area must be a valid positive number';
    }
  } else {
    // Other types: single main area validation
    const areaKey = isLand
      ? (propertyType === 'agri_land' ? 'areaAcres' : 'plotAreaSqFt')
      : (propertyType === 'showroom' ? 'showroomArea' : propertyType === 'warehouse' ? 'warehouseArea' : 'carpetArea');

    const areaLabel = isLand 
      ? (propertyType === 'agri_land' ? 'Total Area (Acres)' : 'Plot Area (sq.ft)') 
      : (propertyType === 'showroom' ? 'Showroom Area (sq.ft)' : propertyType === 'warehouse' ? 'Warehouse Area (sq.ft)' : 'Carpet Area (sq.ft)');

    const enteredArea = step3Data[areaKey];
    if (enteredArea === undefined || enteredArea === null || String(enteredArea).trim() === '') {
      errors[areaKey] = `${areaLabel} is required`;
    } else {
      const num = Number(enteredArea);
      if (isNaN(num) || num <= 0) {
        errors[areaKey] = `${areaLabel} must be a valid positive number`;
      }
    }
  }

  // Steppers (bhk, bathrooms, balconies) validation
  if (isResidential) {
    if (step3Data.bhk === undefined || step3Data.bhk === null || Number(step3Data.bhk) < 0 || Number(step3Data.bhk) > 8) {
      errors.bhk = 'BHK must be between 0 and 8';
    }
    if (step3Data.bathrooms === undefined || step3Data.bathrooms === null || Number(step3Data.bathrooms) < 0 || Number(step3Data.bathrooms) > 15) {
      errors.bathrooms = 'Bathrooms must be between 0 and 15';
    }
  }

  // Villa specific validation: numberOfFloors, parkingSlots
  if (propertyType === 'villa') {
    if (!step3Data.numberOfFloors) {
      errors.numberOfFloors = 'Number of floors is required';
    }
    if (step3Data.parkingSlots === undefined || step3Data.parkingSlots === null || Number(step3Data.parkingSlots) < 0 || Number(step3Data.parkingSlots) > 10) {
      errors.parkingSlots = 'Parking slots must be between 0 and 10';
    }
  }

  // Office Space specific validation: washrooms
  if (propertyType === 'office') {
    if (step3Data.washrooms === undefined || step3Data.washrooms === null || Number(step3Data.washrooms) < 1 || Number(step3Data.washrooms) > 10) {
      errors.washrooms = 'Washrooms must be between 1 and 10';
    }
  }

  // Shop specific validation: shopFloor
  if (propertyType === 'shop') {
    if (!step3Data.shopFloor) {
      errors.shopFloor = 'Shop floor selection is required';
    }
  }

  // Warehouse specific validation: warehouseHeight
  if (propertyType === 'warehouse') {
    const hVal = step3Data.warehouseHeight;
    if (hVal === undefined || hVal === null || String(hVal).trim() === '') {
      errors.warehouseHeight = 'Warehouse height is required';
    } else {
      const num = Number(hVal);
      if (isNaN(num) || num <= 0) errors.warehouseHeight = 'Warehouse height must be a valid positive number';
    }
  }

  // Floors validation for high-rise flat/office
  const showFloorsInfo = ['flat', 'builder_floor', 'penthouse', 'office'].includes(propertyType);
  if (showFloorsInfo) {
    const isOffice = propertyType === 'office';
    
    // floorNumber is required for all
    if (step3Data.floorNumber === undefined || step3Data.floorNumber === null || String(step3Data.floorNumber).trim() === '') {
      errors.floorNumber = 'Floor number is required';
    } else {
      const fNum = Number(step3Data.floorNumber);
      if (isNaN(fNum) || fNum < 0 || fNum > 99) errors.floorNumber = 'Floor number must be between 0 and 99';
    }

    // totalFloors is required for residential but optional for office
    const tfVal = step3Data.totalFloors;
    const hasTf = tfVal !== undefined && tfVal !== null && String(tfVal).trim() !== '';

    if (!isOffice && !hasTf) {
      errors.totalFloors = 'Total floors is required';
    } else if (hasTf) {
      const tFloors = Number(tfVal);
      if (isNaN(tFloors) || tFloors < 1 || tFloors > 99) {
        errors.totalFloors = 'Total floors must be between 1 and 99';
      } else if (step3Data.floorNumber !== undefined && step3Data.floorNumber !== null) {
        if (Number(step3Data.floorNumber) > tFloors) {
          errors.floorNumber = 'Floor number cannot exceed total floors';
        }
      }
    }
  }

  return errors;
}

export function validateStepDetailsB(
  step3Data: Record<string, any>,
  propertyType: string,
  category: string = 'resale'
) {
  const errors: Record<string, string> = {};
  const isResidential = ['flat', 'villa', 'builder_floor', 'penthouse'].includes(propertyType);
  const isOffice = propertyType === 'office';
  const showFurnishing = isResidential || isOffice;

  // Furnishing status validation
  if (showFurnishing && !step3Data.furnishing) {
    errors.furnishing = 'Furnishing status selection is required';
  }

  // Ownership type validation
  const needsOwnership = category === 'resale' || propertyType === 'agri_land';
  if (needsOwnership && !step3Data.ownershipType) {
    errors.ownershipType = 'Ownership type selection is required';
  }

  // Ready to move status validation
  if (category === 'resale' && isResidential && step3Data.readyToMove === undefined) {
    errors.readyToMove = 'Ready to move status is required';
  }

  // Agricultural land validation: roadAccess
  if (propertyType === 'agri_land') {
    if (step3Data.roadAccess === undefined || step3Data.roadAccess === null) {
      errors.roadAccess = 'Road access status is required';
    }
  }

  // New Listing validations (excluding agricultural land)
  if (category === 'new' && propertyType !== 'agri_land') {
    const isPlot = propertyType === 'res_plot';
    const isWarehouse = propertyType === 'warehouse';

    if (isPlot) {
      if (!step3Data.layoutProjectName || !String(step3Data.layoutProjectName).trim()) {
        errors.layoutProjectName = 'Layout Project Name is required';
      }
      if (!step3Data.developmentStatus) {
        errors.developmentStatus = 'Development Status is required';
      }
    } else {
      if (!isWarehouse && (!step3Data.projectName || !String(step3Data.projectName).trim())) {
        errors.projectName = 'Project Name is required';
      }
      if (!step3Data.constructionStatus) {
        errors.constructionStatus = 'Construction Status is required';
      }
      if (!step3Data.possessionDate || !String(step3Data.possessionDate).trim()) {
        errors.possessionDate = 'Expected Possession Date is required';
      } else {
        const POSSESSION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
        if (!POSSESSION_DATE_REGEX.test(step3Data.possessionDate)) {
          errors.possessionDate = 'Possession date must be in YYYY-MM-DD format';
        }
      }
    }

    if (!isWarehouse) {
      if (!step3Data.builderName || !String(step3Data.builderName).trim()) {
        errors.builderName = 'Builder Name is required';
      }
    }

    if (!step3Data.reraNumber || !String(step3Data.reraNumber).trim()) {
      errors.reraNumber = 'RERA Number is required';
    }
    if (!step3Data.projectReraNumber || !String(step3Data.projectReraNumber).trim()) {
      errors.projectReraNumber = 'Project RERA Number is required';
    }
  }

  return errors;
}

export function validateStepPricing(step4Data: Record<string, any>, category: string, propertyType: string) {
  const errors: Record<string, string> = {};

  if (category === 'resale') {
    const val = step4Data.totalPrice;
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.totalPrice = 'Total Price is required';
    } else {
      const num = Number(val);
      if (isNaN(num) || num <= 0) errors.totalPrice = 'Total Price must be a valid positive number';
    }
    
    if (!step4Data.possessionTimeline) {
      errors.possessionTimeline = 'Possession timeline is required';
    }
  } else if (category === 'rental') {
    const isAgri = propertyType === 'agri_land';
    if (isAgri) {
      const val = step4Data.annualLease;
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.annualLease = 'Annual Lease amount is required';
      } else {
        const num = Number(val);
        if (isNaN(num) || num <= 0) errors.annualLease = 'Annual Lease must be a valid positive number';
      }
    } else {
      const rentVal = step4Data.monthlyRent;
      if (rentVal === undefined || rentVal === null || String(rentVal).trim() === '') {
        errors.monthlyRent = 'Monthly Rent is required';
      } else {
        const num = Number(rentVal);
        if (isNaN(num) || num <= 0) errors.monthlyRent = 'Monthly Rent must be a valid positive number';
      }
    }

    const depVal = step4Data.securityDeposit;
    if (depVal === undefined || depVal === null || String(depVal).trim() === '') {
      errors.securityDeposit = 'Security Deposit is required';
    } else {
      const num = Number(depVal);
      if (isNaN(num) || num <= 0) errors.securityDeposit = 'Security Deposit must be a valid positive number';
    }

    const availVal = step4Data.availableFrom;
    if (availVal === undefined || availVal === null || String(availVal).trim() === '') {
      errors.availableFrom = 'Available From Date is required';
    } else {
      const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
      if (!DATE_REGEX.test(availVal)) {
        errors.availableFrom = 'Date must be in YYYY-MM-DD format';
      }
    }
  } else if (category === 'new') {
    const startVal = step4Data.startingPrice;
    if (startVal === undefined || startVal === null || String(startVal).trim() === '') {
      errors.startingPrice = 'Starting Price is required';
    } else {
      const num = Number(startVal);
      if (isNaN(num) || num <= 0) errors.startingPrice = 'Starting Price must be a valid positive number';
    }

    // possessionDate is required for new launch pricing
    const possVal = step4Data.possessionDate;
    if (possVal === undefined || possVal === null || String(possVal).trim() === '') {
      errors.possessionDate = 'Expected Possession Date is required';
    } else {
      const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
      if (!DATE_REGEX.test(possVal)) {
        errors.possessionDate = 'Possession date must be in YYYY-MM-DD format';
      }
    }
  }

  return errors;
}

export function validateStepPhotos(photos: string[]) {
  const result = photosSchema.safeParse({ photos });
  const errors: Record<string, string> = {};
  if (!result.success) {
    result.error.errors.forEach((e) => {
      errors[e.path[0] as string] = e.message;
    });
  }
  return errors;
}

// ─── Legacy / Full Validation compatibility ────────────────────────────────────

export function validateState(state: ReturnType<typeof import('../store/addPropertyStore').useAddPropertyStore.getState>) {
  const errors: Record<string, string> = {};

  // Step 0 Listed By
  if (!state.step0.propertyListedBy) {
    errors.propertyListedBy = 'Please select who is listing this property';
  }

  // Step 1 & Basic Info
  const basicInfoErrors = validateStepBasicInfo(state.step1.title, state.step1.description);
  Object.assign(errors, basicInfoErrors);

  // Locality
  const localityErrors = validateStepLocality(state.step2.locality);
  Object.assign(errors, localityErrors);

  // Map Coordinates
  const mapErrors = validateStepMap(state.step2.latitude, state.step2.longitude);
  Object.assign(errors, mapErrors);

  // Step 3 details_a
  const detailsAErrors = validateStepDetailsA(state.step3, state.step1.propertyType || 'flat');
  Object.assign(errors, detailsAErrors);

  // Step 3 details_b
  const detailsBErrors = validateStepDetailsB(state.step3, state.step1.propertyType || 'flat', state.step1.listingCategory || 'resale');
  Object.assign(errors, detailsBErrors);

  // Step 4 pricing
  const pricingErrors = validateStepPricing(
    state.step4,
    state.step1.listingCategory || 'resale',
    state.step1.propertyType || 'flat'
  );
  Object.assign(errors, pricingErrors);

  // Step 5 media
  const photoErrors = validateStepPhotos(state.step5.photos);
  Object.assign(errors, photoErrors);

  return errors;
}


