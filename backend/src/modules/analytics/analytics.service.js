import Property from '../../models/property.model.js';
import User from '../../models/user.model.js';
import Lead from '../../models/leads.model.js';
import Subscription from '../../models/purchaseSubscription.model.js';
import { getOrSet, invalidateCache } from '../../utils/cache.js';

/**
 * All analytics cache keys — update this list when adding new analytics methods.
 * Used by invalidateAnalyticsCache() to flush everything at once.
 */
const ANALYTICS_CACHE_KEYS = [
  'analytics:overview',
  'analytics:monthly-growth',
  'analytics:subscription-plan-distribution',
  'analytics:property-type-distribution',
  'analytics:properties-by-location',
  // Parameterised keys — cover all period variants
  'analytics:user-activity:week',
  'analytics:user-activity:month',
  'analytics:user-activity:year',
  'analytics:top-brokers:5',
  'analytics:top-brokers:10',
];

/**
 * Invalidate all analytics caches.
 * Call this from property, user, or subscription write operations.
 */
export async function invalidateAnalyticsCache() {
  try {
    await invalidateCache(ANALYTICS_CACHE_KEYS);
  } catch (err) {
    // Non-fatal — analytics will simply serve stale data until TTL expires
    console.warn('[analytics] Cache invalidation failed:', err?.message);
  }
}

// Bust stale caches on module load so fixed computations take effect immediately.
invalidateCache([
  'analytics:subscription-plan-distribution',
  'analytics:top-brokers:5',
  'analytics:top-brokers:10',
]).catch(() => {});


const analyticsService = {
  /**
   * Overview stats: page views, inquiries, conversion rate, active users
   * Derived from real DB aggregations
   */
  getOverview: async () => {
    return getOrSet('analytics:overview', async () => {
      const now = new Date();
      const thisWeekStart = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [
        totalProperties,
        totalLeads,
        activeUsers,
        totalUsers,
        propsThisWeek,
        propsLastWeek,
        leadsThisWeek,
        leadsLastWeek,
        activeUsersThisWeek,
        activeUsersLastWeek,
      ] = await Promise.all([
        Property.countDocuments({ status: 'Active' }),
        Lead.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments(),
        Property.countDocuments({ status: 'Active', createdAt: { $gte: thisWeekStart } }),
        Property.countDocuments({ status: 'Active', createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } }),
        Lead.countDocuments({ createdAt: { $gte: thisWeekStart } }),
        Lead.countDocuments({ createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } }),
        User.countDocuments({ isActive: true, createdAt: { $gte: thisWeekStart } }),
        User.countDocuments({ isActive: true, createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } }),
      ]);

      const pctChange = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100);
      };

      const inquiries = totalLeads;
      const conversionRate = totalLeads > 0 && totalUsers > 0
        ? ((totalLeads / totalUsers) * 100).toFixed(1)
        : '0.0';

      // Conversion rate change: compare this-week vs last-week lead/user ratios
      const convThisWeek  = leadsThisWeek  > 0 ? (leadsThisWeek  / (totalUsers || 1)) * 100 : 0;
      const convLastWeek  = leadsLastWeek  > 0 ? (leadsLastWeek  / (totalUsers || 1)) * 100 : 0;

      return {
        totalProperties,
        totalPropertiesChange: pctChange(propsThisWeek, propsLastWeek),
        inquiries,
        inquiriesChange: pctChange(leadsThisWeek, leadsLastWeek),
        conversionRate: parseFloat(conversionRate),
        conversionRateChange: pctChange(convThisWeek, convLastWeek),
        activeUsers,
        activeUsersChange: pctChange(activeUsersThisWeek, activeUsersLastWeek),
      };
    }, 300);
  },

  /**
   * New users + inquiries by period
   * Returns real DB counts for week (days), month (weeks), or year (months)
   */
  getUserActivity: async (period = 'week') => {
    return getOrSet(`analytics:user-activity:${period}`, async () => {
      const now = new Date();
      let dateFrom;
      let labels;
      let groupFormat;

      if (period === 'week') {
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        groupFormat = '%u'; // day of week (1=Mon)
      } else if (period === 'month') {
        dateFrom = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        groupFormat = '%V'; // week number
      } else {
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        groupFormat = '%m'; // month
      }

      const [leadAgg, userAgg] = await Promise.all([
        Lead.aggregate([
          { $match: { createdAt: { $gte: dateFrom } } },
          { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: dateFrom } } },
          { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } },
        ]),
      ]);

      const leadMap = {};
      const userMap = {};
      for (const item of leadAgg) leadMap[item._id] = item.count;
      for (const item of userAgg) userMap[item._id] = item.count;

      const getISOWeek = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      };

      const getGroupKey = (index) => {
        if (period === 'week') return String(index + 1);
        if (period === 'month') {
          const weekDate = new Date(dateFrom.getTime() + (index * 7 * 24 * 60 * 60 * 1000));
          return String(getISOWeek(weekDate)).padStart(2, '0');
        }
        return String(index + 1).padStart(2, '0');
      };

      return labels.map((date, i) => {
        const key = getGroupKey(i);
        return {
          date,
          newUsers: userMap[key] ?? 0,
          inquiries: leadMap[key] ?? 0,
        };
      });
    }, 300);
  },

  /**
   * Subscription plan distribution — active users grouped by plan type
   */
  getSubscriptionPlanDistribution: async () => {
    return getOrSet('analytics:subscription-plan-distribution', async () => {
    const agg = await Subscription.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$planName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = agg.reduce((s, a) => s + a.count, 0) || 1;

    // Indexed palette — ensures every plan gets a unique, distinct colour
    // regardless of the plan name stored in the database.
    const PALETTE = [
      '#f97316', // orange
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#10b981', // green
      '#ef4444', // red
      '#f59e0b', // amber
      '#06b6d4', // cyan
      '#ec4899', // pink
    ];

    return agg.map((item, i) => ({
      name:       item._id ?? 'Unknown',
      value:      item.count,
      percentage: Math.round((item.count / total) * 100),
      color:      PALETTE[i % PALETTE.length],
    }));
    }, 300);
  },

  /**
   * Monthly growth — users, active users, properties over last 6 months.
   * Uses 3 aggregation pipelines instead of 18 countDocuments calls.
   */
  getMonthlyGrowth: async () => {
    return getOrSet('analytics:monthly-growth', async () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      // Build ordered month labels for the output
      const monthLabels = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthLabels.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: d.toLocaleString('en', { month: 'short' }),
        });
      }

      // 3 aggregations in parallel — each groups by YYYY-MM in a single scan
      const groupByMonth = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

      const [userAgg, activeUserAgg, propertyAgg] = await Promise.all([
        User.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          { $group: { _id: groupByMonth, count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo }, isActive: true } },
          { $group: { _id: groupByMonth, count: { $sum: 1 } } },
        ]),
        Property.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo }, status: 'Active' } },
          { $group: { _id: groupByMonth, count: { $sum: 1 } } },
        ]),
      ]);

      // Build lookup maps keyed by YYYY-MM
      const userMap         = Object.fromEntries(userAgg.map(r => [r._id, r.count]));
      const activeUserMap   = Object.fromEntries(activeUserAgg.map(r => [r._id, r.count]));
      const propertyMap     = Object.fromEntries(propertyAgg.map(r => [r._id, r.count]));

      // Assemble ordered result — missing months default to 0
      return monthLabels.map(({ key, label }) => ({
        month:       label,
        users:       userMap[key]       ?? 0,
        activeUsers: activeUserMap[key] ?? 0,
        properties:  propertyMap[key]   ?? 0,
      }));
    }, 300);
  },


  /**
   * Top performing brokers — users with most active property listings
   */
  getTopBrokers: async (limit = 5) => {
    return getOrSet(`analytics:top-brokers:${limit}`, async () => {
      const agg = await Property.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: '$brokerId', properties: { $sum: 1 } } },
        { $sort: { properties: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'broker',
          },
        },
        { $unwind: { path: '$broker', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'leads',
            localField: '_id',
            foreignField: 'brokerId',
            as: 'leads',
          },
        },
        {
          // Compute counts BEFORE renaming fields — ensures $leads still refers to the array
          $addFields: {
            totalLeads: { $size: '$leads' },
            // Count leads that have progressed beyond 'New' (Contacted or Closed)
            progressedLeads: {
              $size: {
                $filter: {
                  input: '$leads',
                  as: 'l',
                  cond: { $in: ['$$l.status', ['Contacted', 'Closed']] },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            name:            { $ifNull: ['$broker.name', 'Unknown Broker'] },
            company:         { $ifNull: ['$broker.area', 'Nagpur'] },
            properties:      1,
            leads:           '$totalLeads',
            progressedLeads: 1,
          },
        },
      ]);

      return agg.map((b) => ({
        ...b,
        conversion: b.leads > 0
          ? `${Math.round((b.progressedLeads / b.leads) * 100)}%`
          : '0%',
      }));
    }, 300);
  },

  getPropertiesByLocation: async () => {
    return getOrSet('analytics:properties-by-location', async () => {
      const agg = await Property.aggregate([
        { $match: { 'location.locality': { $exists: true, $ne: null, $nin: [''] } } },
        { $group: { _id: '$location.locality', properties: { $sum: 1 }, brokers: { $addToSet: '$brokerId' } } },
        { $sort: { properties: -1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 0,
            city: '$_id',
            properties: 1,
            brokers: { $size: '$brokers' },
          },
        },
      ]);

      return agg;
    }, 300);
  },

  /**
   * Property type distribution
   */
  getPropertyTypeDistribution: async () => {
    return getOrSet('analytics:property-type-distribution', async () => {
      const total = await Property.countDocuments() || 1;

      const agg = await Property.aggregate([
        { $group: { _id: '$propertyType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $project: {
            _id:        0,
            type:       '$_id',
            count:      1,
            percentage: { $round: [{ $multiply: [{ $divide: ['$count', total] }, 100] }, 0] },
          },
        },
      ]);

      return agg;
    }, 300);
  },
};

export default analyticsService;
