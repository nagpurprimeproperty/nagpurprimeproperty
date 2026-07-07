import amenitiesRepository from './amenities.repository.js';

/**
 * Get top amenities from properties
 * Returns amenities sorted by frequency of use
 */
export const getAmenities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const amenities = await amenitiesRepository.getAmenities(limit);

    res.json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    next(error);
  }
};
