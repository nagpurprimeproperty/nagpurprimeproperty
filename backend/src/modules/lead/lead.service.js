import leadRepository from './lead.repository.js';
import propertyRepository from '../property/property.repository.js';
import purchasePlanRepository from '../subscription/purchasePlan.repository.js';

const leadService = {

  /**
   * Get paginated list with server-side filtering
   */
  listLeads: async (brokerId,{page=1, limit=10} = {}) => {
    return leadRepository.findAll({ brokerId, page, limit });
  },

  /**
   * Get a single lead by ID
   */
  getLead: async (id, brokerId) => {
    const subscription = await purchasePlanRepository.getSubscriptionByUserId(brokerId);
    const lead = await leadRepository.findById(id, brokerId);
  
    if (!lead) throw { status: 404, message: 'Lead not found' };
     if(!lead.isOpened){
     if(!subscription) {
      throw { status: 403, message: 'Upgrade to a premium plan to view lead details' };
    }

    if(!subscription.limit?.isLeadsUnlimited && subscription.limits?.leadAccessCount <= subscription?.usage?.leadsUnlocked) {
      throw { status: 403, message: 'Your lead access limit has been reached' };
    }
        await purchasePlanRepository.markAsLeadOpened(subscription._id);
        await leadRepository.markAsOpened(id);
    }
    return lead;
  },

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

  /**
   * Update lead status
   */
  updateStatus: async (id, status, brokerId) => {
    const lead =  await leadRepository.updateStatus(id, status, brokerId);    
    return lead;
  },
};

export default leadService;