import PropertyViews from "./propertyViews.model.js";

const PropertyViewsRepository = {
  async addView(propertyId, user, userId, session) {
    try {
      return await PropertyViews.findOneAndUpdate(
        { propertyId, user },
        { propertyId, user, userId },
        { upsert: true, new: true, session }
      );
    } catch (error) {
      // Handle E11000 duplicate key error from concurrent requests
      // The unique index guarantees exactly one view per (propertyId, user) pair
      if (error.code === 11000) {
        return await PropertyViews.findOne({ propertyId, user }, { session });
      }
      throw error;
    }
  },

  async hasViewed(propertyId, user, userId) {
    const existingView = await PropertyViews.findOne({ propertyId, user, userId });
    return !!existingView;
  },

  async removeView(propertyId, user, session) {
    return PropertyViews.deleteOne({ propertyId, user }, { session });
  },
};

export default PropertyViewsRepository;