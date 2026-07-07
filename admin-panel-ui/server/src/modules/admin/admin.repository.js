import admin from '../../models/admin.model.js';

const adminRepository = {
  findByPhone: (phone) => admin.findOne({ phone }),

  findByEmail: (email) => admin.findOne({ email }),

  findByEmailWithOTPToken: (email) => admin.findOne({ email }).select('+otpToken +otpExpiry'),

  findByEmailWithPassword: (email) => admin.findOne({ email }).select('+password'),

  findById: (id) => admin.findById(id),

  findByIdWithPassword: (id) => admin.findById(id).select('+password'),

  update: (id, update) => admin.findByIdAndUpdate(id, update, { new: true }),

  findByEmailWithResetToken: (email) =>
    admin.findOne({ email }).select('+resetToken +resetTokenExpiry'),

  /**
   * Find an admin whose stored (hashed) reset token matches `hashedToken`
   * and whose token expiry is still in the future.
   */
  findByResetToken: (hashedToken) =>
    admin
      .findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: Date.now() },
      })
      .select('+password +resetToken +resetTokenExpiry'),

  findByRefreshToken: (hashedToken) =>
    admin
      .findOne({
        refreshToken: hashedToken,
        refreshTokenExpiry: { $gt: Date.now() },
      })
      .select('+refreshToken +refreshTokenExpiry'),

  rotateRefreshToken: (hashedToken, newRefreshToken, newRefreshTokenExpiry) =>
    admin
      .findOneAndUpdate(
        {
          refreshToken: hashedToken,
          refreshTokenExpiry: { $gt: Date.now() },
        },
        {
          refreshToken: newRefreshToken,
          refreshTokenExpiry: newRefreshTokenExpiry,
        },
        { new: true }
      )
      .select('+refreshToken +refreshTokenExpiry'),
};

export default adminRepository;