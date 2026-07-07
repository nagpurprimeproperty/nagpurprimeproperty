import enquiryRepository from './enquiry.repository.js';
 
const leadService = {

  /**
   * Get paginated list with server-side filtering
   */
  enquiryLeads: async (userId,{page=1, limit=10} = {}) => {
    return  enquiryRepository.findAll({ userId, page, limit });
  }, 

  /**
   * Get a single lead by ID
   */
  getEnquiry: async (id, userId) => {
    const lead = await  enquiryRepository.findById(id, userId);
    if (!lead) throw { status: 404, message: 'Lead not found' };
    return lead;
  },

 
 
   
};

export default leadService;