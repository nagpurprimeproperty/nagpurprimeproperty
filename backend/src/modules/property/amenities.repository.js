import Property from './property.model.js';

const amenitiesRepository = {
  /**
   * Get distinct amenities from all active properties
   * @param {number} limit - Number of amenities to return
   * @returns {Promise<array>} - List of unique amenities
   */
  getAmenities: async (limit = 10) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const amenities = await Property.aggregate([
      { $match: { status: 'Active' } },
      { $unwind: '$amenities' },
      {
        $group: {
          _id: '$amenities',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: safeLimit,
      },
      {
        $project: {
          amenity: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]).exec();

    return amenities;
  },
};

export default amenitiesRepository;
