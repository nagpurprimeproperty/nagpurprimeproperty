// blog.model.js
import mongoose from 'mongoose';

const contentBlockSchema = new mongoose.Schema(
  { heading: { type: String, default: '' }, body: { type: String, required: true } },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '' },
    cover: { type: String, default: '' },
    author: { type: String, required: true, trim: true },
    authorImage: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    readMins: { type: Number, default: 5, min: 1 },
    tags: [{ type: String }],
    content: [contentBlockSchema],
    bodyHtml: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogSchema.index({ isPublished: 1, date: -1 });

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
