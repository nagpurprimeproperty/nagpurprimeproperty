import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['email', 'whatsapp', 'push', 'sms'],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
      validate: {
        validator: function (v, doc) {
          const type = doc?.type || this?.type;
          if (type === 'email') return /^\S+@\S+\.\S+$/.test(v);
          if (type === 'sms' || type === 'whatsapp') return /^\+?[\d\s-]{6,}$/.test(v);
          return v && v.length > 0;
        },
        message: (props) => `Invalid recipient format for type ${props?.doc?.type || props?.instance?.type}`,
      },
    },
    subject: { type: String },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered'],
      default: 'pending',
    },
    templateId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    failedAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

const CommunicationLog = mongoose.models.CommunicationLog || mongoose.model('CommunicationLog', communicationLogSchema);
export default CommunicationLog;
