import mongoose from 'mongoose';

/**
 * AuditLog stores admin actions for compliance.
 * Retention: documents auto-expire after 90 days via TTL index.
 * PII fields (ip, userAgent) are optional and best-effort.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    module: { type: String, required: true }, // e.g. properties, users, plans, revenue
    resourceId: { type: String, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, required: false },
    userAgent: { type: String, required: false },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
