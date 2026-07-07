import leadRepository from './lead.repository.js';
import propertyRepository from '../property/property.repository.js';
import { PROPERTY_TYPES } from '../../constants/lead.constants.js';

const leadService = {

  /**
   * Get paginated list with server-side filtering
   */
  listLeads: async ({ search, status, area, propertyType, dateFrom, dateTo, page, limit } = {}) => {
    return leadRepository.findAll({ search, status, area, propertyType, dateFrom, dateTo, page, limit });
  },

  /**
   * Get a single lead by ID
   */
  getLead: async (id) => {
    const lead = await leadRepository.findById(id);
    if (!lead) throw { status: 404, message: 'Lead not found' };
    return lead;
  },

  /**
   * Update lead fields
   */
  updateLead: async (id, payload) => {
    const lead = await leadRepository.findById(id);
    if (!lead) throw { status: 404, message: 'Lead not found' };
    return leadRepository.updateById(id, payload);
  },

  /**
   * Delete a lead permanently
   */
  deleteLead: async (id) => {
    const lead = await leadRepository.findById(id);
    if (!lead) throw { status: 404, message: 'Lead not found' };
    return leadRepository.deleteById(id);
  },

  /**
   * Get aggregate stats for overview cards
   */
  getStats: () => leadRepository.getStats(),

  /**
   * Filter dropdown options: property types (canonical) + localities from active properties.
   */
  getFilterOptions: async () => {
    const localities = await propertyRepository.getDistinctLocalities({ status: 'Active' });
    return { propertyTypes: PROPERTY_TYPES, localities };
  },

  /**
   * Update lead status
   */
  updateStatus: async (id, status) => {
    const lead = await leadRepository.findById(id);
    if (!lead) throw { status: 404, message: 'Lead not found' };
    return leadRepository.updateById(id, { status });
  },

  /**
   * Get leads created BY a user (queries)
   */
  getQueriesByUser: async (userId, { page = 1, limit = 10 } = {}) => {
    if (userId == null) throw { status: 400, message: 'userId is required' };
    return leadRepository.findAll({ userId, page, limit });
  },

  /**
   * Get leads received ON a user's properties (leads)
   */
  getLeadsByBroker: async (brokerId, { page = 1, limit = 10 } = {}) => {
    if (brokerId == null) throw { status: 400, message: 'brokerId is required' };
    return leadRepository.findAll({ brokerId, page, limit });
  },
};

export default leadService;