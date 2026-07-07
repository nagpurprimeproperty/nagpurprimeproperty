import mongoose from 'mongoose';
const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },

  planName: {
    type: String,
    required: true
  },

  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, },


  // Status Management
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Inactive', 'Cancelled', 'Failed', 'Pending'],
    default: 'Active'
  },

  // Payment Reference (for Razorpay/Stripe integration)
  paymentDetails: {
    orderId: { type: String },
    paymentLinkId: { type: String },
    paymentLinkUrl: { type: String },
    paymentId: { type: String },
    amountPaid: { type: Number },
    method: { type: String } // e.g., 'UPI', 'Card'
  },

  isFree: { type: Boolean, default: false },
  price: { type: Number, required: true }, // e.g., 2999
  duration: { type: Number}, // e.g., 30, 90, 365
  durationUnit: {
    type: String,
    enum: ['days', 'months', 'years'],
    default: 'days'
  },
  isDurationUnlimited: { type: Boolean, default: false }, // If true, duration is not limited by days

  // Feature Limits
  limits: {
    propertyUploads: { type: Number, default: 5 }, // Max properties they can list
    isPropertyUploadUnlimited: { type: Boolean, default: false }, // If true, no limit on property uploads
    featuredProperties: { type: Number, default: 0 }, // Properties shown at the top
    isFeaturedPropertiesUnlimited: { type: Boolean, default: false }, // If true, no limit on featured properties
    leadAccessCount: { type: Number, default: 10 }, // How many leads they can "unlock"
    isLeadAccessUnlimited: { type: Boolean, default: false },

    prioritySupport: { type: Boolean, default: false },// If true, they get priority support
    analyticsAccess: { type: Boolean, default: false } // If true, they can access detailed analytics
  },
   usage: {
    propertiesPosted:{
      type: Number,
      default: 0
    },
    leadsUnlocked: {
      type: Number,
      default: 0
    },
    featuredPropertiesUsed:{
      type: Number,
      default: 0
    }
  },

  // Cron notification tracking — prevents duplicate sends
  expiryReminderSent:      { type: Boolean, default: false },
  expiredNotificationSent: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes — userId already has index: true on the field definition above
subscriptionSchema.index({ status: 1, startDate: 1 });           // fast status + date filters
subscriptionSchema.index({ userId: 1, status: 1 });              // fast per-user active lookup
subscriptionSchema.index({ planId: 1, status: 1, startDate: 1 }); // fast per-plan revenue and analytics
// Transactions list sorting/filtering
subscriptionSchema.index({ status: 1, createdAt: -1 });
subscriptionSchema.index({ startDate: 1, status: 1 }); // align with range queries on startDate

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;