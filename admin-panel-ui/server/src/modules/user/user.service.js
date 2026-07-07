import planRepository from '../subscription/plan.repository.js';
import userRepository from './user.repository.js';
import purchasePlanRepository from '../purchasePlan/purchasePlan.repository.js';
import Property from '../../models/property.model.js';
import mongoose from 'mongoose';
import PurchasePlans from '../../models/purchaseSubscription.model.js';
import Lead from '../../models/leads.model.js';

const userService = {
  /**
   * Create a new user
   * Validates uniqueness of mobile and email before creating
   */
 createUser: async (payload) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check mobile uniqueness
      if (payload.mobile) {
        const existing = await userRepository.findByMobile(payload.mobile);
        if (existing) throw { status: 409, message: 'Mobile number already registered' };
      }

      // Check email uniqueness
      if (payload.email && payload.email.trim()) {
        const existing = await userRepository.findByEmail(payload.email.trim());
        if (existing) throw { status: 409, message: 'Email already registered' };
      }

      const freePlan = await planRepository.getFreePlan();

      // 👇 Pass session
      const user = await userRepository.create(payload, session);

      if (freePlan) {
        await purchasePlanRepository.createPurchasePlan(
          {
            planId: freePlan._id,
            planName: freePlan.name,
            userId: user._id,
            price: freePlan?.price,
            isFree: freePlan?.isFree,
            duration: freePlan?.duration,
            durationUnit: freePlan?.durationUnit,
            isDurationUnlimited: freePlan?.isDurationUnlimited,
            limits: freePlan?.limits,
          },
          session
        );
      }

      await session.commitTransaction();
      session.endSession();

      return user;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  /**
   * Get paginated list of users with server-side filtering
   */
  listUsers: async ({ search, isActive, page, limit } = {}) => {
    return userRepository.findAll({ search, isActive, page, limit });
  },

  /**
   * Get a single user by ID
   */
  getUser: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  /**
   * Update user fields
   * Validates uniqueness of mobile/email if they are being changed
   */
  updateUser: async (id, payload) => {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };

    // Check mobile uniqueness only if it changed
    if (payload.mobile && payload.mobile !== user.mobile) {
      const existing = await userRepository.findByMobile(payload.mobile);
      if (existing) throw { status: 409, message: 'Mobile number already in use' };
    }

    // Check email uniqueness only if it changed
    if (payload.email && payload.email.trim() && payload.email.trim() !== user.email) {
      const existing = await userRepository.findByEmail(payload.email.trim());
      if (existing) throw { status: 409, message: 'Email already in use' };
    }

    return userRepository.updateById(id, payload);
  },

  /**
   * Delete a user permanently
   */
  deleteUser: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return userRepository.deleteById(id);
  },

  /**
   * Get aggregate stats for the overview cards
   */
  getStats: () => userRepository.getStats(),

  /**
   * Toggle isActive status
   */
  toggleStatus: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return userRepository.updateById(id, { isActive: !user.isActive });
  },

  /**
   * Set isActive to an explicit boolean (idempotent)
   */
  setStatus: async (id, enabled) => {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return userRepository.updateById(id, { isActive: !!enabled });
  },

  getPropLeadPlanQueryStats: async (userId) => {
    const [properties, leads, enquiries, plans] = await Promise.all([
      Property.countDocuments({ brokerId: userId }),
      Lead.countDocuments({ brokerId: userId }),
      Lead.countDocuments({ userId }),
      PurchasePlans.countDocuments({ userId }),
    ]);

    return { properties, leads, enquiries, plans };
  },
};

export default userService;