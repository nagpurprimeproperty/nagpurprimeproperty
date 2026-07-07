import mongoose from "mongoose";

const recentlySearchedKeywordsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  keyword: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Expires in 30 days
});

recentlySearchedKeywordsSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
recentlySearchedKeywordsSchema.index({ userId: 1, keyword: 1 }, { unique: true });

export default mongoose.models.RecentlySearchedKeywords || mongoose.model("RecentlySearchedKeywords", recentlySearchedKeywordsSchema);