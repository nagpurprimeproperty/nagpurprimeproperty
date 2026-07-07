import revenueRepository from './revenue.repository.js';
import { getOrSet, invalidateCache } from '../../utils/cache.js';

const CACHE_KEYS = ['revenue:stats', 'revenue:monthly', 'revenue:subscriptions-by-plan', 'revenue:plan-breakdown'];

const revenueService = {
  /** KPI stats for the 4 stat cards */
  getStats: () => getOrSet('revenue:stats', () => revenueRepository.getStats(), 300),

  /** Last 6 months monthly revenue + subscription count */
  getMonthlyRevenue: () => getOrSet('revenue:monthly', () => revenueRepository.getMonthlyRevenue(), 300),

  /** Last 6 months subscriptions broken down by plan */
  getSubscriptionsByPlan: () => getOrSet('revenue:subscriptions-by-plan', () => revenueRepository.getSubscriptionsByPlan(), 300),

  /** Per-plan breakdown cards */
  getPlanBreakdown: () => getOrSet('revenue:plan-breakdown', () => revenueRepository.getPlanBreakdown(), 300),

  /** Global transaction stat cards — filter-independent, short-lived cache */
  getTransactionStats: () => getOrSet('revenue:transaction-stats', () => revenueRepository.getTransactionStats(), 60),

  /** Paginated transaction list — no cache to keep data fresh */
  getTransactions: (params) => revenueRepository.getTransactions(params),

  /** Invalidate all revenue caches after mutations */
  invalidateCache: () => invalidateCache(CACHE_KEYS),
};

export default revenueService;