import type { ListingCategory, PropertyType } from './propertyTypes';
import type { FieldDef } from './fieldMatrix';
import { getStep3Fields, getStep4Fields } from './fieldMatrix';

export interface WizardQuestion extends FieldDef {
  storeTarget: 'step1' | 'step3' | 'step4' | 'step6';
}

export function getWizardQuestions(
  category: ListingCategory,
  type: PropertyType
): WizardQuestion[] {
  const questions: WizardQuestion[] = [];

  // 1. Step 1 Fields (Title, Description)
  questions.push({
    key: 'title',
    label: 'What should we call your listing?',
    type: 'text',
    required: true,
    placeholder: 'e.g. Beautiful 2 BHK Apartment in Manish Nagar',
    hint: 'Keep it catchy and professional.',
    storeTarget: 'step1',
  });

  questions.push({
    key: 'description',
    label: 'Describe your property',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Spacious East-facing flat with modular kitchen...',
    hint: 'Mention key highlights like proximity to metro, schools, etc.',
    storeTarget: 'step1',
  });

  // 2. Step 3 Fields (Details)
  const step3Sections = getStep3Fields(category, type);
  for (const sec of step3Sections) {
    for (const field of sec.fields) {
      questions.push({
        ...field,
        storeTarget: 'step3',
      });
    }
  }

  // 3. Step 4 Fields (Pricing)
  const step4Sections = getStep4Fields(category, type);
  for (const sec of step4Sections) {
    for (const field of sec.fields) {
      // Avoid duplicate keys (like possessionTimeline or reraNumber which might be in both)
      if (questions.some((q) => q.key === field.key)) continue;

      questions.push({
        ...field,
        storeTarget: 'step4',
      });
    }
  }

  // 4. Step 6 (Amenities)
  questions.push({
    key: 'amenities',
    label: 'Select the amenities available',
    type: 'multi_select',
    required: false,
    hint: 'Select all that apply to your property.',
    storeTarget: 'step6',
  });

  return questions;
}
