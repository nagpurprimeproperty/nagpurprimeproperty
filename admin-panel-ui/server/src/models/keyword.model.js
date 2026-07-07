import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: [true, 'Keyword is required'],
      trim: true,
      maxlength: [100, 'Keyword cannot exceed 100 characters'],
    },
    redirectUrl: {
      type: String,
      required: [true, 'Redirect URL is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

keywordSchema.index({ isActive: 1, sortOrder: 1 });
keywordSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Keyword || mongoose.model('Keyword', keywordSchema);
