import propertyRepository from '../../modules/property/property.repository.js';
import RecentlySearchedKeywords from './recentlySearchedKeywords.js';
import mongoose from 'mongoose';
import propertyViewsRepository from './propertyViews.repository.js';
import PropertyViews from './propertyViews.model.js';
import Lead from '../lead/leads.model.js';
import { getOrSet } from '../../utils/cache.js';

const propertyService = {
  /** List properties with server-side filtering and pagination. */
  listProperties: async (params, userId) => {
    if (params?.search && userId) {
      try {
        await RecentlySearchedKeywords.findOneAndUpdate(
          {
            userId: new mongoose.Types.ObjectId(userId),
            keyword: params.search.trim(),
          },
          { searchedAt: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.error('Error updating recently searched keywords:', err);
      }
    }
    return propertyRepository.findAll(params, userId);
  },

  getSimilarProperties: async (propertyId, userId) => {
    return propertyRepository.findSimilarProperties(propertyId, userId);
  },

  /** Get admin-facing stats. */
  getStats: async () => {
    return getOrSet('property:stats', () => propertyRepository.getStats(), 300);
  },

  /** Distinct localities from listed properties (Active by default). */
  getDistinctLocalities: async (params = {}) => {
    const status = params.status || 'Active';
    return getOrSet(
      `property:distinct-localities:${status}`,
      () => propertyRepository.getDistinctLocalities({ status }),
      300
    );
  },

  /** Get a single property by ID. */
  getProperty: async (id, userId, userIp, session) => {
    const property = await propertyRepository.findById(id, userId, session);
    if (!property) throw { status: 404, message: 'Property not found' };

    const realId = property._id;

    const hasViewed = await propertyViewsRepository.hasViewed(realId, userIp, userId);
    if (!hasViewed) {
      await propertyViewsRepository.addView(realId, userIp, userId, session);
    }

    // Aggregate view and lead counts
    const [viewCount, leadCount] = await Promise.all([
      PropertyViews.countDocuments({ propertyId: realId }),
      Lead.countDocuments({ propertyId: realId }),
    ]);
    property.views = viewCount;
    property.inquiries = leadCount;

    return property;
  },

  getMostPopularAreasCount: async (limit = 5) => {
    return getOrSet(
      `property:popular-areas:${limit}`,
      async () => {
        const results = await propertyRepository.getMostPopularAreas({ limit });
        return results.map((r) => ({
          locality: r._id,
          count: r.count,
          latitude: r.latitude || null,
          longitude: r.longitude || null
        }));
      },
      300
    );
  },
}

export default propertyService;