import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending',enum: ['pending', 'success', 'failed'] },
    paymentDetails: {
      orderId: { type: String },
      paymentId: { type: String },
      amountPaid: { type: Number },
      method: { type: String } // e.g., 'UPI', 'Card'
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
