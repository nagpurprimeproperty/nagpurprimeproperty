/**
 * addPropertyStore.ts — COMPATIBILITY SHIM
 *
 * This file previously contained the 833-line monolithic add-property store.
 * It has been split into two focused stores:
 *
 *   store/propertyWizardStore.ts  — wizard navigation, form steps, validation,
 *                                   payload building, and edit loading
 *   store/propertyUploadStore.ts  — eager upload cache (local URI → CDN URL)
 *
 * All existing imports of `useAddPropertyStore` and its types continue to work
 * through this shim. Migrate consumers to import directly from the new stores
 * when you touch each file, then delete this shim once all consumers are updated.
 *
 * Migration checklist — update each file then tick it off:
 *   [ ] app/(myListing)/myProperties.tsx
 *   [ ] app/(screens)/mapPicker.tsx
 *   [ ] app/(tabs)/addProperty.tsx
 *   [ ] app/propertyDetail/[id].tsx
 *   [ ] components/addProperty/StepProgressBar.tsx
 *   [ ] components/addProperty/steps/Step1Basic.tsx
 *   [ ] components/addProperty/steps/Steps2to4.tsx
 *   [ ] components/addProperty/steps/Steps5and6.tsx
 *   [ ] components/addProperty/wizard/WizardBasicInfoScreen.tsx
 *   [ ] components/addProperty/wizard/WizardCategoryScreen.tsx
 *   [ ] components/addProperty/wizard/WizardDetailsAScreen.tsx
 *   [ ] components/addProperty/wizard/WizardDetailsBScreen.tsx
 *   [ ] components/addProperty/wizard/WizardListedByScreen.tsx
 *   [ ] components/addProperty/wizard/WizardLocalityScreen.tsx
 *   [ ] components/addProperty/wizard/WizardMapScreen.tsx
 *   [ ] components/addProperty/wizard/WizardPhotosScreen.tsx
 *   [ ] components/addProperty/wizard/WizardPricingScreen.tsx
 *   [ ] components/addProperty/wizard/WizardReviewScreen.tsx
 *   [ ] components/addProperty/wizard/WizardTypeScreen.tsx
 *   [ ] lib/validation.ts
 */

// ─── Re-export everything from the new stores ─────────────────────────────────

export type {
  PropertyListedBy,
  Step0Data,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  StepErrors,
  WizardPhase,
  PropertyWizardStore as AddPropertyStore,
} from './propertyWizardStore';

export {
  PREDEFINED_AMENITIES,
  usePropertyWizardStore as useAddPropertyStore,
  selectCurrentCombo,
  selectPhotoCount,
  selectAmenityCount,
} from './propertyWizardStore';

export type {
  UploadCache,
  PropertyUploadStore,
} from './propertyUploadStore';

export {
  usePropertyUploadStore,
} from './propertyUploadStore';