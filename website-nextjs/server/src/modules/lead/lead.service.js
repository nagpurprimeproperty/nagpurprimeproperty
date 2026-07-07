import leadRepository from './lead.repository.js';
import propertyRepository from '../property/property.repository.js';

const leadService = {
  /**
   * Get lead by property and user (to check if already exists)
   */
  getLeadByPropertyAndUser: async (propertyId, userId) => {
    return leadRepository.findOne({ propertyId, userId });
  },

  createLead: async (payload, session) => {
    return leadRepository.create(payload, session);
  },

  createLeadByOnlyFetchDataFromPropertyId: async (propertyId, user, session) => {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw { status: 404, message: 'Property not found' };
   
    const lead = await leadRepository.create(
      {
        propertyId,
        userId: user.id,
        propertyType: property.propertyType,
        brokerId: property.brokerId,
        area: property.location?.locality,
        budget: property.pricing?.totalPrice || property?.pricing?.monthlyRent,
        customerName: user?.name,
        phone: user?.mobile,
      },
      session
    );
    return lead;
  },
};

export default leadService;