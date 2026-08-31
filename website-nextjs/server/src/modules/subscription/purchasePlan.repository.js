import PurchasedSubscription from './purchaseSubscription.model.js';
import Plan from './subscription.model.js';

const purchasePlanRepository = {
  getSubscriptionByUserId: (userId) =>
    PurchasedSubscription.findOne({ userId, status: 'Active' }).populate('planId').lean(),

  markAsLeadOpened: async (id) =>
    PurchasedSubscription.findByIdAndUpdate(id, { $inc: { 'usage.leadsUnlocked': 1 } }, { new: true }),
};

export default purchasePlanRepository;
