import mongoose from 'mongoose';
import {
  PROPERTY_TYPES,
  LEAD_STATUSES,
  DEFAULT_LEAD_STATUS,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH_MESSAGE,
  MAX_NAME_LENGTH_MESSAGE,
  PHONE_REGEX,
  PHONE_REGEX_MESSAGE,
  MAX_BUDGET_LENGTH,
  MAX_BUDGET_LENGTH_MESSAGE,
  MAX_NOTES_LENGTH,
  MAX_NOTES_LENGTH_MESSAGE,
  MAX_SOURCE_LENGTH,
  MAX_SOURCE_LENGTH_MESSAGE,
  INVALID_PROPERTY_TYPE_MESSAGE,
  INVALID_STATUS_MESSAGE,
} from '../../constants/lead.constants.js';

const leadSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [MIN_NAME_LENGTH, MIN_NAME_LENGTH_MESSAGE],
      maxlength: [MAX_NAME_LENGTH, MAX_NAME_LENGTH_MESSAGE],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [PHONE_REGEX, PHONE_REGEX_MESSAGE],
      trim: true,
    },

    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: PROPERTY_TYPES,
        message: INVALID_PROPERTY_TYPE_MESSAGE,
      },
    },

    area: {
      type: String,
      required: [true, 'Area is required'],
    },

    budget: {
      type: String,
      trim: true,
      maxlength: [MAX_BUDGET_LENGTH, MAX_BUDGET_LENGTH_MESSAGE],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [MAX_NOTES_LENGTH, MAX_NOTES_LENGTH_MESSAGE],
    },

    status: {
      type: String,
      enum: {
        values: LEAD_STATUSES,
        message: INVALID_STATUS_MESSAGE,
      },
      default: DEFAULT_LEAD_STATUS,
    },

    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    source: {
      type: String,
      trim: true,
      maxlength: [MAX_SOURCE_LENGTH, MAX_SOURCE_LENGTH_MESSAGE],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Associated property is required'],
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Fixed indexes
leadSchema.index({ status: 1 });
leadSchema.index({ area: 1 });
leadSchema.index({ propertyType: 1 });
leadSchema.index({ brokerId: 1 }); // FIXED
leadSchema.index({ userId: 1 });   // Added: queries by assigned user
leadSchema.index({ propertyId: 1 }); // Added: queries by associated property
leadSchema.index({ createdAt: -1 });

// Admin list + analytics filters (match + sort)
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ brokerId: 1, createdAt: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ area: 1, createdAt: -1 });
leadSchema.index({ propertyType: 1, createdAt: -1 });

leadSchema.index({
  customerName: 'text',
  phone: 'text',
  notes: 'text',
});


const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
export default Lead;