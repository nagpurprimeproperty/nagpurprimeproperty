import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Premium Gold'
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
  
  description: { type: String },
  features:{
   type:[
    {
      type: String,
       maxlength: [100, 'Feature description cannot exceed 100 characters']
    }
   ]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
planSchema.index({ isActive: 1, createdAt: -1 }); // fast filtered listing

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

export default Plan;