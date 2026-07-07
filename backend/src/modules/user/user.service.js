import planRepository from '../subscription/plan.repository.js';
import userRepository from './user.repository.js';
import purchasePlanRepository from '../subscription/purchasePlan.repository.js';
import Property from '../../modules/property/property.model.js';
import mongoose from 'mongoose';
import PurchasePlans from '../subscription/purchaseSubscription.model.js';
import Lead from '../lead/leads.model.js';
import jwt from 'jsonwebtoken';
import storageService from '../../services/storage.service.js';
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
        await purchasePlanRepository.createSubscription(
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

  findOrCreateByMobile: async (mobile, name) => {
    let user = await userRepository.findByMobile(mobile);
    if (!user) {
      user = await userService.createUser({ mobile, name });
    }
    return user;
  },

  generateToken: (user) => {
     // use jwt to generate a token with user id and mobile as payload
    const payload = { id: user._id, mobile: user.mobile, };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
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
  updateUser: async (id, payload, file) => {
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

    if(payload.avatar || file) {
      const avatarFile = payload.avatar || file;
      const result = await storageService.upload(avatarFile, `avatars`);
      if (result?.url) {
        payload.avatar = result.url;
        if(user.avatar) {
          await storageService.delete(user.avatar);
        }
      }
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

  getPropLeadPlanQueryStats: async (userId) => {
    const [properties, leads, enquiries, plans] = await Promise.all([
      Property.countDocuments({ brokerId: userId }),
      Lead.countDocuments({ brokerId: userId }),
      Lead.countDocuments({ userId }),
      PurchasePlans.countDocuments({ userId }),
    ]);

    return { properties, leads, enquiries, plans };
  },

    generateOTP: (user) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    const expiry = new Date(Date.now() + 1 * 60 * 1000); // Expires in 1 minutes
    user.otp = otp;
    user.otpExpiry = expiry;
    user.save();
    return otp;
  },

  verifyOTP: async (mobile, otp) => {
    const user = await userRepository.findByMobile(mobile).select('+otp +otpExpiry');
    if (!user) throw { status: 404, message: 'User not found' };
    if (user.otp !== otp) throw { status: 400, message: 'Invalid OTP' };
    if (user.otpExpiry < new Date()) throw { status: 400, message: 'OTP expired' };
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    const token = userService.generateToken(user);
    return { user: user?.toJSON(), token };
  },

  getStats: async (userId) => {
    return userRepository.getStats(userId);
  },

  /**
   * Save or clear the FCM device token for a user.
   * Pass null to clear (on logout).
   */
  updateFcmToken: async (userId, fcmToken) => {
    return userRepository.updateById(userId, { fcmToken: fcmToken ?? null });
  },
};

export default userService;