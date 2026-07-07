import mongoose from 'mongoose';
import {MODULES_ENUMS} from '../constants/permission.constants.js'

/**
 * Permission collection
 *
 * One document per (adminId + module) pair.
 * Only sub-admins need records here; the full-admin bypasses this collection entirely.
 *
 * Modules (must match frontend MODULES constant):
 *   dashboard | sub-admin | brokers | customers | leads
 *   properties | revenue | analytics | plans | notifications | settings
 */
const permissionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'adminId is required'],
      index: true,
    },
    module: {
      type: String,
      required: [true, 'module is required'],
      enum: {
        values: MODULES_ENUMS,
        message: '{VALUE} is not a valid module',
      },
    },
    permissions: {
      read:   { type: Boolean, default: false },
      write:  { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Ensure one document per (adminId, module) pair
permissionSchema.index({ adminId: 1, module: 1 }, { unique: true });

const Permission = mongoose.models.Permission || mongoose.model('Permission', permissionSchema);
export default Permission;