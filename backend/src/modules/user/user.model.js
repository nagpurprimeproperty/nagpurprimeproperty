import mongoose from 'mongoose';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH_MESSAGE,
  MIN_NAME_LENGTH_MESSAGE,
  MOBILE_REGEX,
  MOBILE_REGEX_MESSAGE,
  EMAIL_REGEX,
  EMAIL_REGEX_MESSAGE,
  MAX_CITY_LENGTH,
  MAX_CITY_LENGTH_MESSAGE,
  MAX_AREA_LENGTH,
  MAX_AREA_LENGTH_MESSAGE,
  MAX_ADDRESS_LENGTH,
  MAX_ADDRESS_LENGTH_MESSAGE,
  DEFAULT_CITY,
} from '../../constants/user.constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
      minlength: [MIN_NAME_LENGTH, MIN_NAME_LENGTH_MESSAGE],
      maxlength: [MAX_NAME_LENGTH, MAX_NAME_LENGTH_MESSAGE],
    },
    mobile: {
      type: String,
      required: [true, 'Please enter your mobile number'],
      match: [MOBILE_REGEX, MOBILE_REGEX_MESSAGE],
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [EMAIL_REGEX, EMAIL_REGEX_MESSAGE],
    },
    city: {
      type: String,
      default: DEFAULT_CITY,
      trim: true,
      maxlength: [MAX_CITY_LENGTH, MAX_CITY_LENGTH_MESSAGE],
    },
    area: {
      type: String,
      trim: true,
      maxlength: [MAX_AREA_LENGTH, MAX_AREA_LENGTH_MESSAGE],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [MAX_ADDRESS_LENGTH, MAX_ADDRESS_LENGTH_MESSAGE],
    },
    fcmToken:  { type: String },
    avatar:    { type: String },
    isActive:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    otp:       { type: String, select: false },
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ isDeleted: 1, isActive: 1, createdAt: -1 });
userSchema.index({ city: 1, createdAt: -1 });
userSchema.index({ area: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.fcmToken;
  delete obj.__v;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.isDeleted;
  delete obj.isActive;
  return obj;
}

export default mongoose.models.User || mongoose.model('User', userSchema);