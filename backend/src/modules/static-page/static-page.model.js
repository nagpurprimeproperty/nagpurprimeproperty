import mongoose from 'mongoose';

const staticPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      enum: {
        values: ['about-us', 'privacy-policy', 'terms-and-conditions', 'contact-us'],
        message: '"{VALUE}" is not a valid page slug',
      },
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,  // HTML string from rich text editor
      required: [true, 'Content is required'],
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Meta title cannot exceed 100 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Meta description cannot exceed 300 characters'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('StaticPage', staticPageSchema);