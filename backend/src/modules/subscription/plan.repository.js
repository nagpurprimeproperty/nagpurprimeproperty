import Plan from './subscription.model.js';

const planRepository = {
    findAll: async ({  page = 1, limit = 10 } = {}) => {
        const filter = { isActive: true }; // Only fetch active plans

        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const safePage  = Math.max(Number(page) || 1, 1);
        const skip      = (safePage - 1) * safeLimit;

        const pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip }, 
                        { $limit: safeLimit },
                        { $project: {
                             _id: 1, 
                             name: 1, 
                             price: 1, 
                             duration: 1,
                             durationUnit: 1,
                             isDurationUnlimited: 1,
                             isFree: 1 ,
                            limits: 1,
                            description: 1,
                            features: 1
                            } 
                        }
                    ],
                    total: [{ $count: 'count' }]
                }
            }
        ];

        const result = await Plan.aggregate(pipeline);
        const data = result[0].data || [];
        const total = result[0].total[0]?.count || 0;

        return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) || 1 };
    },

    findById: (id) => Plan.findOne({ _id: id, isActive: true }).lean(),

    getFreePlan: () => Plan.findOne({ isFree: true }),
};

export default planRepository;