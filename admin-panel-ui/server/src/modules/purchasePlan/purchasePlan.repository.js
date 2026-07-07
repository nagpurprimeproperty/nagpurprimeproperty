import PurchasePlan from '../../models/purchaseSubscription.model.js';

const purchasePlanRepository = {
    async createPurchasePlan(payload, session) {
        const docs = session
            ? await PurchasePlan.create([payload], { session })
            : await PurchasePlan.create(payload);
        return Array.isArray(docs) ? docs[0] : docs;
    },
};


export default purchasePlanRepository;
