import Plan from '../../models/subscription.model.js';

const planRepository = {
    findAll: async ({ isActive, page = 1, limit = 10 } = {}) => {
        const filter = {};
        if (isActive !== undefined && isActive !== 'all') {
            filter.isActive = isActive === 'true' || isActive === true;
        }

        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const safePage  = Math.max(Number(page) || 1, 1);
        const skip      = (safePage - 1) * safeLimit;

        const pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: safeLimit }],
                    total: [{ $count: 'count' }]
                }
            }
        ];

        const result = await Plan.aggregate(pipeline);
        const data = result[0].data;
        const total = result[0].total[0]?.count || 0;

        return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) || 1 };
    },

    findById: (id) => Plan.findById(id),

    findByName: (name) => Plan.findOne({ name }),

    create: (payload) => Plan.create(payload),

    updateById: (id, update) => Plan.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }),

    deleteById: (id) => Plan.findByIdAndDelete(id),

    getStats: async () => {
        const stats = await Plan.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
                    free: { $sum: { $cond: [{ $eq: ["$isFree", true] }, 1, 0] } }
                }
            }
        ]);
        const { total = 0, active = 0, free = 0 } = stats[0] || {};
        return { total, active, inactive: total - active, free, paid: total - free };
    },

    getFreePlan: () => Plan.findOne({ isFree: true }),
};

export default planRepository;