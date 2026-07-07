import AdminRepository from './admin.repository.js';
import storageService from '../../services/storage.service.js';
import subAdminService from '../sub-admin/sub-admin.service.js';
import crypto from 'crypto';
import mailService from '../../services/mail.service.js';
import env from '../../config/env.js';

const AdminService = {
  getProfile: async (adminId) => {
    const admin = await AdminRepository.findById(adminId);
    if (!admin) throw { status: 401, message: 'Unauthorized' };
    return admin;
  },

  updateProfile: async (adminId, payload, file) => {
    let avatar;
    if (file) {
      const uploaded = await storageService.upload(file, 'avatars');
      if (uploaded) {
        const existingAdmin = await AdminRepository.findById(adminId);
        if (existingAdmin?.avatar) {
          await storageService.delete( existingAdmin.avatar );
        }
        avatar = uploaded?.url;
      }
    }
    const admin = await AdminRepository.update(
      adminId,
      { ...payload, ...(avatar && { avatar }) },
      { new: true }
    );
    if (!admin) throw { status: 401, message: 'Unauthorized' };
    return admin;
  },

  /**
   * Login
   * Returns: { token, role, permissions, admin }
   *   - permissions is a flat map for sub-admins: { module: { read, write, delete } }
   *   - permissions is null for full admin (frontend treats null as "all allowed")
   */
  login: async ({ email, password }) => {
    const admin = await AdminRepository.findByEmailWithPassword(email);
    if (!admin) throw { status: 401, message: 'Invalid email or password' };

    if (!admin.isActive) {
      throw { status: 403, message: 'Your account has been deactivated. Contact the administrator.' };
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) throw { status: 401, message: 'Invalid email or password' };

    const accessToken = admin.generateToken();
    const refreshToken = admin.generateRefreshToken();
    await admin.save({ validateBeforeSave: false });

    // Build permissions map for sub-admins
    let permissions = null;
    if (admin.role === 'sub-admin') {
      permissions = await subAdminService.getPermissionsMap(admin._id);
    }

    return {
      token: accessToken,
      refreshToken,
      role: admin.role,
      permissions,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
      },
    };
  },

  updatePassword: async (adminId, oldPassword, newPassword) => {
    const admin = await AdminRepository.findByIdWithPassword(adminId);
    if (!admin) throw { status: 401, message: 'Unauthorized' };

    const isValid = await admin.comparePassword(oldPassword);
    if (!isValid) throw { status: 400, message: 'Current password is incorrect' };

    if (oldPassword === newPassword) {
      throw { status: 400, message: 'New password must be different from the current password' };
    }

    admin.password = newPassword;
    await admin.save();
    return admin;
  },

  /**
   * forgotPassword
   * Generates a reset token, stores its hash, queues a reset-link email.
   * Always resolves successfully (no email enumeration).
   */
  forgotPassword: async (email) => {
    const admin = await AdminRepository.findByEmail(email);

    console.log('Forgot password requested for email:', email, 'Admin found:', admin);
    // Return silently even if admin not found — prevents email enumeration
    if (!admin) return null;

    const rawToken = admin.generateResetToken();
    await admin.save();

    const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
    console.log('Sending password reset email directly for email:', email, 'Reset link:', resetLink);
    await mailService.sendPasswordResetEmail(admin.email, admin.firstName, resetLink);

    return null;
  },

  /**
   * resetPassword
   * Verifies the raw token against the stored hash, updates the password.
   */
  /**
   * refreshToken
   * Verifies a refresh token, rotates it, and returns a new access + refresh token pair.
   */
  refreshToken: async (rawToken) => {
    if (!rawToken) throw { status: 401, message: 'Refresh token is required' };

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHashedRefreshToken = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
    const newRefreshTokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const admin = await AdminRepository.rotateRefreshToken(
      hashedToken,
      newHashedRefreshToken,
      newRefreshTokenExpiry
    );

    if (!admin) {
      throw { status: 401, message: 'Invalid or expired refresh token' };
    }

    if (!admin.isActive) {
      throw { status: 403, message: 'Admin is deactivated' };
    }

    const accessToken = admin.generateToken();

    return { token: accessToken, refreshToken: newRawRefreshToken };
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    if (!token) throw { status: 400, message: 'Reset token is required' };

    if (newPassword !== confirmPassword) {
      throw { status: 400, message: 'Passwords do not match' };
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const adminDoc = await AdminRepository.findByResetToken(hashedToken);

    if (!adminDoc) {
      throw { status: 400, message: 'Reset link is invalid or has expired' };
    }

    adminDoc.password = newPassword;
    adminDoc.resetToken = undefined;
    adminDoc.resetTokenExpiry = undefined;
    await adminDoc.save();

    return null;
  },
};

export default AdminService;