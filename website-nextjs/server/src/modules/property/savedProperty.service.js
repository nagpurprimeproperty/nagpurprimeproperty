import savedPropertyRepository from "./savedProperty.repository.js";
import { invalidateCache } from '../../utils/cache.js';

const savedPropertyService = {
  savePropertyToggle: async (userId, propertyId) => {
    const existing = await savedPropertyRepository.findByUserIdAndPropertyId(userId, propertyId);
    if (existing) {
      await savedPropertyRepository.delete(existing._id);
      await invalidateCache(['property:*']);
      return {
        message: 'Property unsaved',
        success: true,
      };
    }

    await savedPropertyRepository.create({ userId, propertyId });
    await invalidateCache(['property:*']);
    return {
      message: 'Property saved',
      success: true,
    };
  },
};

export default savedPropertyService;