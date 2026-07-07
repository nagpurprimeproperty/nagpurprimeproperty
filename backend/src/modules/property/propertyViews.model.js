import mongoose from "mongoose";

const propertyViewsSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user:{type:String, required:true},// user ip address or user id if logged in
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, if user is logged in
  },
  { timestamps: true }
);

propertyViewsSchema.index({ propertyId: 1, user: 1 }, { unique: true }); // Ensure a user can only have one view per property

export default mongoose.model('PropertyViews', propertyViewsSchema);