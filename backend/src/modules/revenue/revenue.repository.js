import Subscription from '../../models/purchaseSubscription.model.js';
import Plan from '../../models/subscription.model.js';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const revenueRepository = {
  /**
   * KPI stat cards:
   * totalRevenue, monthlyRevenue, activeSubscriptions, expiringSoon
   */
  getStats: async () => {
    const now = new Date();
    const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysOut  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalResult, monthlyResult, activeCount, expiringSoon] = await Promise.all([
      Subscription.aggregate([
        { $match: { status: { $nin: ['Failed', 'Pending'] } } },
        { $group: { _id: null, total: { $sum: '$paymentDetails.amountPaid' } } },
      ]),
      Subscription.aggregate([
        { $match: { startDate: { $gte: monthStart }, status: { $nin: ['Failed', 'Pending'] } } },
        { $group: { _id: null, total: { $sum: '$paymentDetails.amountPaid' } } },
      ]),
      Subscription.countDocuments({ status: 'Active' }),
      Subscription.countDocuments({
        status: 'Active',
        endDate: { $gte: now, $lte: sevenDaysOut },
      }),
    ]);

    return {
      totalRevenue:        totalResult[0]?.total  ?? 0,
      monthlyRevenue:      monthlyResult[0]?.total ?? 0,
      activeSubscriptions: activeCount,
      expiringSoon,
    };
  },

  /**
   * Last 6 months revenue + subscription count → AreaChart
   * Returns: [{ month, revenue, subscriptions }]
   */
  getMonthlyRevenue: async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const result = await Subscription.aggregate([
      { $match: { startDate: { $gte: sixMonthsAgo }, status: { $nin: ['Failed', 'Pending'] } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$startDate' },
            month: { $month: '$startDate' },
          },
          revenue:       { $sum: '$paymentDetails.amountPaid' },
          subscriptions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year  = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = result.find((r) => r._id.year === year && r._id.month === month);
      return {
        month:         MONTH_NAMES[month - 1],
        revenue:       found?.revenue       ?? 0,
        subscriptions: found?.subscriptions ?? 0,
      };
    });
  },

  /**
   * Last 6 months subscriptions per plan → stacked BarChart
   * Returns: { planNames: string[], data: [{ month, [planName]: count }] }
   */
  getSubscriptionsByPlan: async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const result = await Subscription.aggregate([
      { $match: { startDate: { $gte: sixMonthsAgo }, status: { $nin: ['Failed', 'Pending'] } } },
      {
        $lookup: {
          from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan',
        },
      },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            year:     { $year:  '$startDate' },
            month:    { $month: '$startDate' },
            planName: { $ifNull: ['$plan.name', 'Other'] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const planNames = [...new Set(result.map((r) => r._id.planName))];
    const now = new Date();

    const data = Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year  = d.getFullYear();
      const month = d.getMonth() + 1;
      const row   = { month: MONTH_NAMES[month - 1] };
      for (const name of planNames) {
        const found = result.find(
          (r) => r._id.year === year && r._id.month === month && r._id.planName === name
        );
        row[name] = found?.count ?? 0;
      }
      return row;
    });

    return { planNames, data };
  },

  /**
   * Per-plan breakdown cards
   * Returns: [{ planName, price, subscribers, totalRevenue, monthlyRevenue, newThisMonth }]
   */
  getPlanBreakdown: async () => {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [plans, allTime, thisMonth] = await Promise.all([
      Plan.find({ isActive: true }).select('name price durationUnit isDurationUnlimited duration').lean(),
      Subscription.aggregate([
        { $match: { status: 'Active' } },
        { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id:          { $ifNull: ['$plan.name', 'Other'] },
            subscribers:  { $sum: 1 },
            totalRevenue: { $sum: '$paymentDetails.amountPaid' },
          },
        },
      ]),
      Subscription.aggregate([
        { $match: { status: 'Active', startDate: { $gte: monthStart } } },
        { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id:            { $ifNull: ['$plan.name', 'Other'] },
            monthlyRevenue: { $sum: '$paymentDetails.amountPaid' },
            newThisMonth:   { $sum: 1 },
          },
        },
      ]),
    ]);

    return plans.map((plan) => {
      const at = allTime.find((b) => b._id === plan.name);
      const tm = thisMonth.find((m) => m._id === plan.name);
      return {
        planName:            plan.name,
        price:               plan.price ?? 0,
        durationUnit:        plan.durationUnit ?? 'months',
        isDurationUnlimited: plan.isDurationUnlimited ?? false,
        duration:            plan.duration ?? null,
        subscribers:         at?.subscribers    ?? 0,
        totalRevenue:        at?.totalRevenue   ?? 0,
        revenueThisMonth:    tm?.monthlyRevenue ?? 0,
        newThisMonth:        tm?.newThisMonth   ?? 0,
      };
    });
  },

  /**
   * Global transaction stat cards — completely filter-independent.
   * Returns: { total, active, pending, failed, totalAmount }
   */
  getTransactionStats: async () => {
    const rows = await Subscription.aggregate([
      {
        $group: {
          _id:         '$status',
          count:       { $sum: 1 },
          totalAmount: { $sum: '$paymentDetails.amountPaid' },
        },
      },
    ]);

    const result = { total: 0, active: 0, pending: 0, failed: 0, totalAmount: 0 };
    for (const row of rows) {
      result.total       += row.count;
      result.totalAmount += row.totalAmount ?? 0;
      if (row._id === 'Active')                                  result.active  += row.count;
      else if (row._id === 'Pending')                            result.pending += row.count;
      else if (row._id === 'Cancelled' || row._id === 'Expired') result.failed  += row.count;
    }
    return result;
  },

  /**
   * Paginated transaction list (read-only)
   * Returns: { data, total, page, limit, totalPages }
   */
  getTransactions: async ({ search, status, page = 1, limit = 10 } = {}) => {
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage  = Math.max(Number(page) || 1, 1);
    const skip      = (safePage - 1) * safeLimit;

    const basePipeline = [
      { $match: filter },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
    ];

    if (search?.trim()) {
      basePipeline.push({
        $match: {
          $or: [
            { 'user.name':   { $regex: search.trim(), $options: 'i' } },
            { 'user.mobile': { $regex: search.trim(), $options: 'i' } },
            { 'plan.name':   { $regex: search.trim(), $options: 'i' } },
          ],
        },
      });
    }

    const [data, countResult] = await Promise.all([
      Subscription.aggregate([
        ...basePipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: safeLimit },
        {
          $project: {
            _id: 1, status: 1, startDate: 1, endDate: 1, createdAt: 1,
            paymentDetails: 1,
            user: { name: '$user.name', mobile: '$user.mobile', email: '$user.email' },
            plan: { name: '$plan.name', price: '$plan.price' },
          },
        },
      ]),
      Subscription.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total ?? 0;
    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) || 1 };
  },
};

export default revenueRepository;