// area.model.js
import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  { q: { type: String, required: true, trim: true }, a: { type: String, required: true, trim: true } },
  { _id: false }
);

const areaSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, default: 'Nagpur' },
    banner: { type: String, default: '' },
    startingPrice: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    connectivity: { type: String, default: '' },
    schools: [{ type: String }],
    hospitals: [{ type: String }],
    investment: { type: String, default: '' },
    faqs: [faqSchema],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

areaSchema.index({ isPublished: 1, createdAt: -1 });

export default mongoose.models.Area || mongoose.model('Area', areaSchema);
