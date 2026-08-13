import planRepository from '../subscription/plan.repository.js';
import userRepository from './user.repository.js';
import purchasePlanRepository from '../subscription/purchasePlan.repository.js';
import Property from '../../modules/property/property.model.js';
import mongoose from 'mongoose';
import PurchasePlans from '../subscription/purchaseSubscription.model.js';
import Lead from '../lead/leads.model.js';
import jwt from 'jsonwebtoken';
import storageService from '../../services/storage.service.js';
import env from '../../config/env.js';
import communicationService from '../communication/communication.service.js';
import { getRedis } from '../../config/redis.js';
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

  generateOTP: async (user) => {
    const mobile = user.mobile;
    const redis = getRedis();

    // Check resend cooldown
    const cooldown = await redis.get(`otp_cooldown:${mobile}`);
    if (cooldown) {
      throw { status: 429, message: 'Please wait before requesting a new OTP' };
    }

    // Static test numbers for App/Google Play reviewers
    const isStaticTestUser = mobile === '9999999999' || mobile === '1234567890';

    const otp = isStaticTestUser ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Redis
    await redis.set(`otp:${mobile}`, otp, 'EX', 300); // 5 minutes expiry
    
    // Set 60-second resend cooldown
    await redis.set(`otp_cooldown:${mobile}`, '1', 'EX', 60);

    // Clear failed verification attempts
    await redis.del(`otp_attempts:${mobile}`);

    if (env.WHATSAPP_ENABLED && !isStaticTestUser) {
      try {
        await communicationService.sendWhatsApp({
          to: mobile,
          body: `Your OTP is ${otp}`,
          templateId: env.WHATSAPP_OTP_TEMPLATE_NAME,
          metadata: {
            otp,
          },
        });
      } catch (err) {
        console.error('Failed to send OTP via WhatsApp:', err.message);
        throw { status: 500, message: `Failed to send OTP via WhatsApp: ${err.message}` };
      }
    }

    return otp;
  },

  verifyOTP: async (mobile, otp) => {
    const user = await userRepository.findByMobile(mobile);
    if (!user) throw { status: 404, message: 'User not found' };

    const redis = getRedis();

    // Check failed attempts
    const attemptsStr = await redis.get(`otp_attempts:${mobile}`);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    if (attempts >= 5) {
      throw { status: 400, message: 'Too many failed verification attempts. Please request a new OTP.' };
    }

    const cachedOtp = await redis.get(`otp:${mobile}`);
    if (!cachedOtp) {
      throw { status: 400, message: 'OTP expired or not requested' };
    }

    if (cachedOtp !== otp) {
      await redis.incr(`otp_attempts:${mobile}`);
      if (!attemptsStr) {
        await redis.expire(`otp_attempts:${mobile}`, 300);
      }
      throw { status: 400, message: 'Invalid OTP' };
    }

    // Success: clear OTP and attempts
    await redis.del(`otp:${mobile}`);
    await redis.del(`otp_attempts:${mobile}`);

    const token = userService.generateToken(user);
    return { user: user?.toJSON(), token };
  },

  getStats: async (userId) => {
    return userRepository.getStats(userId);
  },

  requestDeletion: async (mobile) => {
    const user = await userRepository.findByMobile(mobile);
    if (!user) throw { status: 404, message: 'User not found with this mobile number' };
    const otp = await userService.generateOTP(user);
    return otp;
  },

  confirmDeletion: async (mobile, otp) => {
    const user = await userRepository.findByMobile(mobile);
    if (!user) throw { status: 404, message: 'User not found' };

    const redis = getRedis();

    // Check failed attempts
    const attemptsStr = await redis.get(`otp_attempts:${mobile}`);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    if (attempts >= 5) {
      throw { status: 400, message: 'Too many failed verification attempts. Please request a new OTP.' };
    }

    const cachedOtp = await redis.get(`otp:${mobile}`);
    if (!cachedOtp) {
      throw { status: 400, message: 'OTP expired or not requested' };
    }

    if (cachedOtp !== otp) {
      await redis.incr(`otp_attempts:${mobile}`);
      if (!attemptsStr) {
        await redis.expire(`otp_attempts:${mobile}`, 300);
      }
      throw { status: 400, message: 'Invalid OTP' };
    }

    // Success: clear OTP and attempts
    await redis.del(`otp:${mobile}`);
    await redis.del(`otp_attempts:${mobile}`);

    await userRepository.deleteById(user._id);
    return true;
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