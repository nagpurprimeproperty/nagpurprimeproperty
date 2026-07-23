import UserService from "./user.service.js";

export const  loginUser = async (req, res, next) => {
  try {
    const { mobile, name } = req.body;
    const user = await UserService.findOrCreateByMobile(mobile, name);
    const otp = await UserService.generateOTP(user);
    res.json({ success: true,message: 'OTP sent successfully', data: otp });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp, fcmToken } = req.body;
    const response = await UserService.verifyOTP(mobile, otp);
    const user = response?.user;
    const token = response?.token;

    // Save FCM token if provided (optional — used for push notifications)
    if (fcmToken && user?._id) {
      await UserService.updateFcmToken(user._id, fcmToken);
    }

    res.cookie('userToken', token, { httpOnly: true });
    res.json({ success: true, message: 'OTP verified successfully', data: user, token });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    // Clear FCM token so push notifications stop after logout
    if (req.user?._id) {
      await UserService.updateFcmToken(req.user._id, null);
    }
    res.clearCookie('userToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserService.getUser(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserService.updateUser(userId, req.body, req.file);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await UserService.getStats(req.user?.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const deleteUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await UserService.deleteUser(userId);
    res.clearCookie('userToken');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const requestAccountDeletion = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const otp = await UserService.requestDeletion(mobile);
    res.json({ success: true, message: 'Account deletion OTP generated successfully', data: { otp } });
  } catch (error) {
    next(error);
  }
};

export const confirmAccountDeletion = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    await UserService.confirmDeletion(mobile, otp);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};