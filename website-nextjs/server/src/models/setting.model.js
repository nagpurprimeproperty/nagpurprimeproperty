import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    isComingSoonMode: {
      type: Boolean,
      default: false,
    },
    maintenanceTitle: {
      type: String,
      default: 'Under Maintenance',
    },
    maintenanceDescription: {
      type: String,
      default: 'We are performing scheduled maintenance to improve our platform. We will be back online shortly.',
    },
    maintenanceLiveAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
export default Setting;
