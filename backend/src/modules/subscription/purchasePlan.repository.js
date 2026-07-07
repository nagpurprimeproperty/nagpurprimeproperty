import PurchasedSubscription from './purchaseSubscription.model.js';
import Transaction from './transaction.model.js';
import mongoose from 'mongoose';

const purchasePlanRepository = {
  // ── Purchased Subscriptions ─────────────────────────────────────────────

  createSubscription: async (payload, session) => {
    const docs = session
      ? await PurchasedSubscription.create([payload], { session })
      : await PurchasedSubscription.create(payload);
    return Array.isArray(docs) ? docs[0] : docs;
  },

  findActiveByUser: (userId) =>
    PurchasedSubscription.findOne({ userId, status: 'Active' })
      .populate('planId', 'name price limits description features')
      .lean(),

  findSubscriptionById: (id) =>
    PurchasedSubscription.findById(id).populate('planId').lean(),

  findByPaymentIdentifier: (identifiers = []) => {
    const ids = Array.isArray(identifiers) ? identifiers : [identifiers];
    const conditions = [];

    ids.forEach((id) => {
      if (!id) return;
      conditions.push({ 'paymentDetails.orderId': id });
      conditions.push({ 'paymentDetails.paymentLinkId': id });
    });

    if (!conditions.length) return Promise.resolve(null);
    return PurchasedSubscription.findOne({ $or: conditions });
  },

 updateSubscription: (filterOrId, update) => {
  if (
    filterOrId !== null &&
    typeof filterOrId === 'object' &&
    !(filterOrId instanceof mongoose.Types.ObjectId)
  ) {
    return PurchasedSubscription.updateMany(filterOrId, { $set: update });
  }
  return PurchasedSubscription.findByIdAndUpdate(filterOrId, { $set: update }, { new: true });
},

  findAllByUser: async (userId, { page = 1, limit = 10 } = {}) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage  = Math.max(Number(page) || 1, 1);
    const skip      = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      PurchasedSubscription.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate('planId', 'name price')
        .lean(),
      PurchasedSubscription.countDocuments({ userId }),
    ]);

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  },

  // ── Transactions ────────────────────────────────────────────────────────

  createTransaction: async (payload, session) => {
    const docs = session
      ? await Transaction.create([payload], { session })
      : await Transaction.create(payload);
    return Array.isArray(docs) ? docs[0] : docs;
  },

  findTransactionByPaymentIdentifier: (identifiers = []) => {
    const ids = Array.isArray(identifiers) ? identifiers : [identifiers];
    const conditions = [];

    ids.forEach((id) => {
      if (!id) return;
      conditions.push({ 'paymentDetails.orderId': id });
      conditions.push({ 'paymentDetails.paymentLinkId': id });
    });

    if (!conditions.length) return Promise.resolve(null);
    return Transaction.findOne({ $or: conditions });
  },

  updateTransaction: (id, update) =>
    Transaction.findByIdAndUpdate(id, { $set: update }, { new: true }),

  getSubscriptionByUserId: (userId) =>
    PurchasedSubscription.findOne({ userId, status: 'Active' }).populate('planId').lean(),

  markAsLeadOpened: async (id) =>
    PurchasedSubscription.findByIdAndUpdate(id, { $set: { 'usage.leadsUnlocked': 1 } }, { new: true }),
};

export default purchasePlanRepository;