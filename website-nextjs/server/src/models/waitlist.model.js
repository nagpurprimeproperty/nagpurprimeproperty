import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    source: {
      type: String,
      enum: ['coming-soon', 'maintenance'],
      default: 'coming-soon',
    },
  },
  { timestamps: true }
);

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);
export default Waitlist;
