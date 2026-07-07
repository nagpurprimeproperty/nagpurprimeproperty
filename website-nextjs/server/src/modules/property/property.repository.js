import mongoose from 'mongoose';
import Property from '../../modules/property/property.model.js';
import User from '../user/user.model.js';
import { safeRegexFilter } from '../../utils/query-sanitizer.js';
import SavedProperty from './savedProperty.model.js';
import Lead from '../lead/leads.model.js';
import { getOrSet } from '../../utils/cache.js';

const formatPriceLabel = (value, isMonthly = false) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return value;

  const formatNumber = (num) => {
    const rounded = Math.round(num * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.0$/, '');
  };

  let label;
  if (value >= 10000000) {
    label = `${formatNumber(value / 10000000)}CR`;
  } else if (value >= 100000) {
    label = `${formatNumber(value / 100000)}L`;
  } else if (value >= 1000) {
    label = `${formatNumber(value / 1000)}k`;
  } else {
    label = String(value);
  }

  return isMonthly ? `${label}/month` : label;
};

const cleanNulls = (value) => {
  const isDate = (v) => Object.prototype.toString.call(v) === '[object Date]';
  const isObjectIdLike = (v) => v && (typeof v.toHexString === 'function' || v._bsontype === 'ObjectID' || v._bsontype === 'ObjectId');
  const isBuffer = (v) => typeof Buffer !== 'undefined' && Buffer.isBuffer(v);

  if (Array.isArray(value)) {
    return value
      .map(cleanNulls)
      .filter((item) => item !== null && item !== undefined);
  }

  if (isDate(value)) {
    return value.toISOString();
  }

  if (isObjectIdLike(value)) {
    return typeof value.toHexString === 'function' ? value.toHexString() : String(value);
  }

  if (isBuffer(value)) {
    return value.toString('hex');
  }

  if (value && Object.prototype.toString.call(value) === '[object Object]') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const cleaned = cleanNulls(val);
      if (cleaned !== null && cleaned !== undefined) {
        acc[key] = cleaned;
      }
      return acc;
    }, {});
  }

  return value;
};

const formatPropertyDetail = (item) => {
  if (!item) return item;

  const priceValue =
    item.pricing?.totalPrice ?? item.pricing?.startingPrice ?? item.pricing?.monthlyRent;
  const isMonthly =
    item.propertyType === 'Rental' &&
    item.pricing?.monthlyRent != null &&
    item.pricing?.totalPrice == null &&
    item.pricing?.startingPrice == null;

  return cleanNulls({
    ...item,
    totalPrice: formatPriceLabel(priceValue, isMonthly) || '',
    image: item.photos?.[0] ?? '',
    photos: item.photos ?? [],
    featured: item.featured ?? false,
    isSaved: item.isSaved ?? false,
    recommendationScore: item.recommendationScore ?? 0,
  });
};

const propertyRepository = {
  /**
   * Create a new property
   */
  create: (payload) => Property.create(payload),

  /**
   * Find all properties with server-side filtering, search, and pagination.
   */
  findAll: async (params = {}, userId) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[SEARCH REQUEST] params:`, {
        search: params.search || '',
        latitude: params.latitude || '',
        longitude: params.longitude || '',
        locality: params.locality || '',
        bhk: params.bhk || '',
        budgetFrom: params.budgetFrom || '',
        budgetTo: params.budgetTo || '',
        sqftMin: params.sqftMin || '',
        sqftMax: params.sqftMax || '',
      });
    }
    const {
      search,
      slug,
      listingCategory,
      propertyType,
      locality,
      featured,
      isRecommended,
      isRelevanceSorted,
      priceSort,
      budgetFrom,
      budgetTo,
      amenities,
      isSaved,
      bhk,
      page = 1,
      limit = 12,
      sqftMin, sqftMax,
      latitude,
      longitude,
    } = params;

    let userObjectId = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    const latVal = Number(latitude);
    const lngVal = Number(longitude);
    const hasGeo = !!(latitude && longitude
      && !isNaN(latVal) && !isNaN(lngVal)
      && latVal !== 0 && lngVal !== 0);

    let amenitiesArray = [];
    if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    } else if (amenities && typeof amenities === 'object') {
      amenitiesArray = Object.values(amenities);
    } else if (amenities) {
      amenitiesArray = [amenities];
    } else {
      Object.keys(params).forEach((key) => {
        if (key.startsWith('amenities[')) {
          amenitiesArray.push(params[key]);
        }
      });
    }

    // PAGINATION — declare early so cache key can use safeLimit
    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    // Build a normalized cache key for the base listing using a fast join key builder
    const cacheKeyParts = [
      search || '',
      slug || '',
      listingCategory || '',
      propertyType || '',
      locality || '',
      params.latitude ? Number(params.latitude).toFixed(3) : '',
      params.longitude ? Number(params.longitude).toFixed(3) : '',
      featured === true || featured === 'true' ? '1' : '0',
      isRelevanceSorted ? '1' : '0',
      priceSort || '',
      budgetFrom || '',
      budgetTo || '',
      [...amenitiesArray].sort().join(','),
      bhk || '',
      params.brokerId || '',
      page,
      safeLimit,
      params.status || 'Active',
      params.ids || '',
    ];

    if (isSaved === true || isSaved === 'true' || isRecommended === true || isRecommended === 'true') {
      cacheKeyParts.push(
        isSaved === true || isSaved === 'true' ? '1' : '0',
        isRecommended === true || isRecommended === 'true' ? '1' : '0',
        userObjectId ? String(userObjectId) : 'anon'
      );
    }

    const cacheKey = `property:list:${cacheKeyParts.join('|')}`;

    const filter = {
      status: params.status || 'Active',
    };

    if (params.ids) {
      const idsArray = Array.isArray(params.ids)
        ? params.ids
        : typeof params.ids === 'string'
          ? params.ids.split(',').map(id => id.trim()).filter((id) => mongoose.Types.ObjectId.isValid(id))
          : [];
      if (idsArray.length > 0) {
        filter._id = { $in: idsArray.map(id => new mongoose.Types.ObjectId(id)) };
      }
    }

    if (slug) {
      if (mongoose.Types.ObjectId.isValid(slug)) {
        filter._id = new mongoose.Types.ObjectId(slug);
      } else {
        const parts = slug.split('-').map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const regexStr = '^' + parts.join('[\\s\\-,\\/\\(\\)_.]*') + '$';
        filter.title = { $regex: regexStr, $options: 'i' };
      }
    }

    // Allow filtering by brokerId for "my properties" endpoints
    if (params.brokerId) {
      if (mongoose.Types.ObjectId.isValid(params.brokerId)) {
        filter.brokerId = new mongoose.Types.ObjectId(params.brokerId);
      } else {
        // If invalid id provided, no results
        filter.brokerId = null;
      }
    }

    // SEARCH
    const safeSearchFilter = safeRegexFilter(search);
    if (safeSearchFilter) {
      filter.$or = [
        { title: safeSearchFilter },
        { 'location.locality': safeSearchFilter },
        { 'location.city': safeSearchFilter },
      ];
    }

    // FILTERS
    if (listingCategory && listingCategory !== 'all') filter.listingCategory = listingCategory;
    if (propertyType && propertyType !== 'all') filter.propertyType = propertyType;    // Geo search (latitude/longitude already destructured at top)
    if (latitude && longitude) {
      if (hasGeo) {
        const EARTH_RADIUS_METRES = 6378100;
        const radiusInRadians = 5000 / EARTH_RADIUS_METRES; // 5km radius
        filter['location.coordinates'] = {
          $geoWithin: {
            $centerSphere: [
              [lngVal, latVal], // [longitude, latitude]
              radiusInRadians,
            ],
          },
        };
        // $nearSphere cannot coexist with top-level $or
        // so skip text search entirely when geo is active
        delete filter.$or;
      } else {
        // Text search
        const safeSearchFilter = safeRegexFilter(search);
        if (safeSearchFilter) {
          filter.$or = [
            { title: safeSearchFilter },
            { 'location.locality': safeSearchFilter },
            { 'location.city': safeSearchFilter },
          ];
        }
        if (locality && locality !== 'all') {
          filter['location.locality'] = locality;
        }
      }
    } else if (locality && locality !== 'all') {
      filter['location.locality'] = locality;
    }
    if (featured === true || featured === 'true') filter.featured = true;

    // NEW: BHK filter
    if (bhk) filter['details.bhk'] = Number(bhk);

    // Amenities filter
    if (amenitiesArray.length > 0) {
      filter.amenities = { $all: amenitiesArray };
    }

    // NEW: Budget filter
    if (budgetFrom || budgetTo) {
      const priceFilter = {};
      if (budgetFrom) priceFilter.$gte = Number(budgetFrom);
      if (budgetTo) priceFilter.$lte = Number(budgetTo);

      const priceCondition = {
        $or: [
          { 'pricing.totalPrice': priceFilter },
          { 'pricing.startingPrice': priceFilter },
          { 'pricing.monthlyRent': priceFilter },
        ],
      };

      if (hasGeo) {
        // $nearSphere at top level — budget must go inside $and
        // $and IS allowed alongside $nearSphere
        filter.$and = [...(filter.$and || []), priceCondition];
      } else if (filter.$or) {
        // Combine text-search $or with price $or
        filter.$and = [{ $or: filter.$or }, priceCondition];
        delete filter.$or;
      } else {
        Object.assign(filter, priceCondition);
      }
    }
    // BUILD SORT
    // priceSort is applied later in the pipeline (after pricing is available)
    const defaultSort = { createdAt: -1 };

    if (process.env.DEBUG === 'true') {
      console.log(`[MONGO FILTER] Final filter:`, JSON.stringify(filter, null, 2));
    }

    // =========================
    // PRE-PAGINATION PIPELINE
    // Saved + recommendation scoring must happen BEFORE $facet
    // so totalCount reflects actual filtered totals
    // =========================

    const prePaginationStages = [
      { $match: filter },

      // ── Saved check (only run pre-pagination if user is filtering specifically by saved homes) ──
      ...((userObjectId && (isSaved === true || isSaved === 'true'))
        ? [
          {
            $lookup: {
              from: 'savedproperties',
              let: { propertyId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$propertyId', '$$propertyId'] },
                        { $eq: ['$userId', userObjectId] },
                      ],
                    },
                  },
                },
                { $limit: 1 },
                { $project: { _id: 1 } },
              ],
              as: 'savedProperty',
            },
          },
          {
            $addFields: {
              isSaved: { $gt: [{ $size: '$savedProperty' }, 0] },
            },
          },
          { $unset: 'savedProperty' },
        ]
        : [{ $addFields: { isSaved: false } }]),

      // ── Filter saved-only ──
      ...(isSaved === true || isSaved === 'true'
        ? [{ $match: { isSaved: true } }]
        : []),

      // ── Recommendation scoring ──
      ...(isRecommended === true || isRecommended === 'true'
        ? [
          {
            $lookup: {
              from: 'recentlysearchedkeywords',
              let: { currentUserId: userObjectId },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$userId', '$$currentUserId'] },
                  },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 10 },
                { $project: { keyword: 1 } },
              ],
              as: 'recentlySearchedKeywords',
            },
          },
          {
            $addFields: {
              recommendationKeywords: {
                $map: {
                  input: '$recentlySearchedKeywords',
                  as: 'item',
                  in: '$$item.keyword',
                },
              },
            },
          },
          {
            $addFields: {
              recommendationScore: {
                $size: {
                  $filter: {
                    input: '$recommendationKeywords',
                    as: 'kw',
                    cond: {
                      $or: [
                        { $regexMatch: { input: '$title', regex: '$$kw', options: 'i' } },
                        { $regexMatch: { input: '$location.locality', regex: '$$kw', options: 'i' } },
                        { $regexMatch: { input: '$location.city', regex: '$$kw', options: 'i' } },
                        { $regexMatch: { input: '$propertyType', regex: '$$kw', options: 'i' } },
                      ],
                    },
                  },
                },
              },
            },
          },
          { $match: { recommendationScore: { $gt: 0 } } },
          { $unset: ['recentlySearchedKeywords', 'recommendationKeywords'] },
        ]
        : []),
    ];

    // ── Sort logic ──
    let sortStage;
    if (isRecommended === true || isRecommended === 'true') {
      sortStage = { $sort: { recommendationScore: -1, createdAt: -1 } };
    } else if (priceSort === 'low_to_high') {
      // NEW: sort by whichever price field is present
      sortStage = {
        $sort: {
          'pricing.totalPrice': 1,
          'pricing.startingPrice': 1,
          'pricing.monthlyRent': 1,
          createdAt: -1,
        },
      };
    } else if (priceSort === 'high_to_low') {
      sortStage = {
        $sort: {
          'pricing.totalPrice': -1,
          'pricing.startingPrice': -1,
          'pricing.monthlyRent': -1,
          createdAt: -1,
        },
      };
    } else if (isRelevanceSorted === true || isRelevanceSorted === 'true') {
      // NEW: relevance = featured first, then newest
      sortStage = { $sort: { featured: -1, createdAt: -1 } };
    } else {
      sortStage = { $sort: defaultSort };
    }

    const aggregation = [
      ...prePaginationStages,

      sortStage,

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: safeLimit },

            // Broker lookup (only on paginated subset)
            {
              $lookup: {
                from: 'users',
                localField: 'brokerId',
                foreignField: '_id',
                pipeline: [
                  { $project: { name: 1, email: 1, mobile: 1, profileImage: 1 } },
                ],
                as: 'broker',
              },
            },
            { $addFields: { broker: { $arrayElemAt: ['$broker', 0] } } },

            // Views & Leads count (for My Properties analytics)
            ...(params.brokerId ? [
              {
                $lookup: {
                  from: 'propertyviews',
                  localField: '_id',
                  foreignField: 'propertyId',
                  as: '_views'
                }
              },
              {
                $lookup: {
                  from: 'leads',
                  localField: '_id',
                  foreignField: 'propertyId',
                  as: '_leads'
                }
              },
              {
                $addFields: {
                  views: { $size: '$_views' },
                  leads: { $size: '$_leads' }
                }
              },
              { $project: { _views: 0, _leads: 0 } },
            ] : []),

            {
              $project: {
                title: { $ifNull: ['$title', ''] },
                location: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ['$location.locality', ''] },
                        {
                          $cond: {
                            if: {
                              $and: [
                                { $ifNull: ['$location.locality', false] },
                                { $ifNull: ['$location.city', false] },
                              ],
                            },
                            then: ', ',
                            else: '',
                          },
                        },
                        { $ifNull: ['$location.city', ''] },
                      ],
                    },
                  },
                },
                totalPrice: {
                  $ifNull: [
                    {
                      $ifNull: ['$pricing.totalPrice', {
                        $ifNull: ['$pricing.startingPrice', '$pricing.monthlyRent'],
                      }],
                    },
                    '',
                  ],
                }, // like 52.L, 10k, 15k/month
                sqft: { $ifNull: [{ $ifNull: ['$details.superBuiltUpArea', '$details.builtUpArea'] }, ''] },
                listingCategory: { $ifNull: ['$listingCategory', ''] },
                propertyType: { $ifNull: ['$propertyType', ''] },
                featured: { $ifNull: ['$featured', false] },
                photos: { $ifNull: ['$photos', ''] },
                video: { $ifNull: ['$video', ''] },
                coordinates: { $ifNull: ['$location.coordinates.coordinates', []] },
                isSaved: { $ifNull: ['$isSaved', false] },
                bhk: { $ifNull: ['$details.bhk', 0] },
                recommendationScore: { $ifNull: ['$recommendationScore', 0] },
                broker: { $ifNull: ['$broker', null] },
                details: { $ifNull: ['$details', {}] },
                pricing: { $ifNull: ['$pricing', {}] },
                status: { $ifNull: ['$status', 'Active'] },
                slug: { $ifNull: ['$slug', ''] },
                ...(params.brokerId ? { views: { $ifNull: ['$views', 0] }, leads: { $ifNull: ['$leads', 0] } } : {}),
              },
            },
          ],

          totalCount: [{ $count: 'count' }],
        },
      },

      {
        $project: {
          data: 1,
          total: {
            $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0],
          },
        },
      },
    ];

    const base = await getOrSet(cacheKey, async () => {
      if (process.env.DEBUG === 'true') {
        console.log(`[DB QUERY] Executing MongoDB query for cacheKey: ${cacheKey.substring(0, 20)}...`);
      }
      const res = await Property.aggregate(aggregation);
      if (process.env.DEBUG === 'true') {
        console.log(`[DB QUERY RESULT] Found ${res[0]?.data?.length || 0} properties`);
      }
      return res[0] || { data: [], total: 0 };
    }, 86400);

    let data = base.data || [];
    const total = base.total || 0;

    // Merge user-specific isSaved states dynamically in-memory for general catalog browse
    if (userObjectId && !(isSaved === true || isSaved === 'true') && data.length > 0) {
      try {
        const savedDocs = await SavedProperty.find({
          userId: userObjectId,
          propertyId: { $in: data.map(p => new mongoose.Types.ObjectId(p._id)) }
        }).select('propertyId').lean();
        
        const savedSet = new Set(savedDocs.map(d => String(d.propertyId)));
        data = data.map(p => ({
          ...p,
          isSaved: savedSet.has(String(p._id))
        }));
      } catch (err) {
        console.warn('[propertyRepository] Failed to merge isSaved states in-memory:', err.message);
      }
    }

    const formattedData = data.map((item) => {
      const value = item.totalPrice ?? '';
      const isMonthly = typeof value === 'number' && item.propertyType === 'Rental';
      const formattedPrice = formatPriceLabel(value, isMonthly);
      return {
        _id: item._id,
        slug: item.slug ?? '',
        title: item.title ?? '',
        location: item.location ?? '',
        totalPrice: formattedPrice || '',
        sqft: item.sqft ?? '',
        listingCategory: item.listingCategory ?? '',
        propertyType: item.propertyType ?? '',
        featured: item.featured ?? false,
        status: item.status ?? 'Active',
        photos: item.photos ?? '',
        video: item.video ?? '',
        coordinates: item.coordinates ?? [],
        isSaved: item.isSaved ?? false,
        bhk: item.bhk ?? 0,
        recommendationScore: item.recommendationScore ?? 0,
        broker: item.broker ?? null,
        // Specification details for property cards
        details: item.details ?? {},
        // Negotiable flags from pricing
        priceNegotiable: item.pricing?.priceNegotiable ?? null,
        rentNegotiable: item.pricing?.rentNegotiable ?? null,
        // Analytics (populated when brokerId filter is present)
        views: item.views ?? undefined,
        leads: item.leads ?? undefined,
      };
    });

    return cleanNulls({
      data: formattedData,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    });
  },

  /**
   * Find property by ID, populated with broker info.
   * FIX: use .lean() so service gets a plain object (safe to spread/mutate for media formatting)
   */
  findById: async (id, userId, session) => {
    let query = { status: 'Active' };
    if (mongoose.Types.ObjectId.isValid(id)) {
      // Param looks like a MongoDB ObjectId — query by _id
      query._id = id;
    } else {
      // Try slug first (fast indexed exact match)
      const bySlug = await Property.findOne({ slug: id, status: 'Active' }, null, { session })
        .populate('brokerId', 'name mobile email city area avatar')
        .lean();

      if (bySlug) {
        // Resolve isSaved, hasLead and return
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          const isSaved = await SavedProperty.exists({
            userId: new mongoose.Types.ObjectId(userId),
            propertyId: bySlug._id,
          });
          bySlug.isSaved = !!isSaved;
        } else {
          bySlug.isSaved = false;
        }
        const broker = bySlug.brokerId;
        const hasLeadWithBroker = Boolean(
          userId && broker && (broker._id || broker) &&
          (await Lead.exists({ brokerId: broker._id || broker, userId }))
        );
        if (broker && !hasLeadWithBroker) {
          bySlug.brokerId = { _id: broker._id, name: broker.name ?? '' };
        }
        return formatPropertyDetail(bySlug);
      }

      // Fallback to title-regex for legacy URLs (old properties without a slug)
      const parts = id.split('-').map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      const regexStr = '^' + parts.join('[\\s\\-,\\/\\(\\)_.]*') + '$';
      query.title = { $regex: regexStr, $options: 'i' };
    }

    const property = await Property.findOne(query, null, { session })
      .populate('brokerId', 'name mobile email city area avatar')
      .lean();

    if (!property) return null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const isSaved = await SavedProperty.exists({
        userId: new mongoose.Types.ObjectId(userId),
        propertyId: property._id,
      });
      property.isSaved = !!isSaved;
    } else {
      property.isSaved = false;
    }

    const broker = property.brokerId;
    const hasLeadWithBroker = Boolean(
      userId &&
      broker &&
      (broker._id || broker) &&
      (await Lead.exists({
        brokerId: broker._id || broker,
        userId,
      }))
    );

    if (broker && !hasLeadWithBroker) {
      property.brokerId = {
        _id: broker._id,
        name: broker.name ?? '',
      };
    }

    return formatPropertyDetail(property);
  },

  /**
   * Find by ID without populate (raw mongoose doc, for mutations)
   */
  findByIdRaw: (id) => Property.findOne({ _id: id }),

  /**
 * Update property — returns populated plain object via lean
 */
  updateById: (id, update, options = { new: true }) =>
    Property.findOneAndUpdate({ _id: id }, update, { ...options, runValidators: true })
      .populate('brokerId', 'name mobile email city area avatar')
      .lean(),

  /**
   * Delete propertyisDele
   */
  deleteById: (id) => Property.findOneAndDelete({ _id: id }),

  /**
   * Aggregate admin-facing stats.
   * FIX: only query statuses that exist in PROPERTY_STATUSES constant.
   *      Removed 'Draft' (not in schema). 'Pending' and 'Rented' added to constants.
   */
  getStats: async () => {
    const [stats] = await Property.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Active'] }, 1, 0],
            },
          },
          featured: {
            $sum: {
              $cond: [{ $eq: ['$featured', true] }, 1, 0],
            },
          },
          sold: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Sold'] }, 1, 0],
            },
          },
          inactive: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          featured: 1,
          sold: 1,
          inactive: 1,
        },
      },
    ]);

    return stats || {
      total: 0,
      active: 0,
      featured: 0,
      sold: 0,
      inactive: 0,
    };
  },

  incrementViews: (id) =>
    Property.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }),

  incrementInquiries: (id) =>
    Property.findByIdAndUpdate(id, { $inc: { inquiries: 1 } }, { new: true }),

  countByBroker: (brokerId) => Property.countDocuments({ brokerId }),

  /**
   * Distinct localities from properties (for lead/property filter dropdowns).
   * @param {Object} options
   * @param {string} [options.status] - e.g. 'Active' for available listings only
   */
  getDistinctLocalities: async ({ status } = {}) => {
    const filter = {
      'location.locality': { $exists: true, $nin: [null, ''] },
    };
    if (status) filter.status = status;

    const localities = await Property.distinct('location.locality', filter);
    return localities
      .map((l) => (typeof l === 'string' ? l.trim() : l))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  },

  //this will return top properties areas and count of properties in those areas
  getMostPopularAreas: async ({ limit = 5 } = {}) => {
    const popularAreas = await Property.aggregate([
      { $match: { 'location.locality': { $exists: true } } },
      {
        $group: {
          _id: '$location.locality',
          count: { $sum: 1 },
          latitude: { $first: { $arrayElemAt: ['$location.coordinates.coordinates', 1] } },
          longitude: { $first: { $arrayElemAt: ['$location.coordinates.coordinates', 0] } },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    return popularAreas.filter(a => a._id && a._id.trim());
  },

  findSimilarProperties: async (propertyId, userId, {
    page = 1,
    limit = 10,
  } = {}) => {

    const property = await Property.findById(propertyId).lean();
    if (!property) return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };

    const { locality } = property.location;

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const filter = {
      status: 'Active',
      'location.locality': locality,
      _id: { $ne: property._id },
    };

    // Build aggregation without per-user saved lookup so it can be cached as the base result
    const baseAggregation = [
      { $match: filter },

      // No saved lookup in base aggregation — will be merged per-user later
      { $addFields: { isSaved: false } },

      { $sort: { featured: -1, createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: safeLimit },

            // Broker lookup (only on paginated subset)
            {
              $lookup: {
                from: 'users',
                localField: 'brokerId',
                foreignField: '_id',
                pipeline: [
                  { $project: { name: 1, email: 1, mobile: 1, profileImage: 1 } },
                ],
                as: 'broker',
              },
            },
            { $addFields: { broker: { $arrayElemAt: ['$broker', 0] } } },

            {
              $project: {
                title: { $ifNull: ['$title', ''] },
                location: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ['$location.locality', ''] },
                        {
                          $cond: {
                            if: {
                              $and: [
                                { $ifNull: ['$location.locality', false] },
                                { $ifNull: ['$location.city', false] },
                              ],
                            },
                            then: ', ',
                            else: '',
                          },
                        },
                        { $ifNull: ['$location.city', ''] },
                      ],
                    },
                  },
                },
                totalPrice: {
                  $ifNull: [
                    { $ifNull: ['$pricing.totalPrice', { $ifNull: ['$pricing.startingPrice', '$pricing.monthlyRent'] }] },
                    '',
                  ],
                },
                sqft: { $ifNull: [{ $ifNull: ['$details.superBuiltUpArea', '$details.builtUpArea'] }, ''] },
                listingCategory: { $ifNull: ['$listingCategory', ''] },
                propertyType: { $ifNull: ['$propertyType', ''] },
                featured: { $ifNull: ['$featured', false] },
                photos: { $ifNull: ['$photos', ''] },
                video: { $ifNull: ['$video', ''] },
                isSaved: { $ifNull: ['$isSaved', false] },
                bhk: { $ifNull: ['$details.bhk', 0] },
                recommendationScore: { $ifNull: ['$recommendationScore', 0] },
                broker: { $ifNull: ['$broker', null] },
                details: { $ifNull: ['$details', {}] },
                pricing: { $ifNull: ['$pricing', {}] },
                slug: { $ifNull: ['$slug', ''] },
              },
            },
          ],

          totalCount: [{ $count: 'count' }],
        },
      },

      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
        },
      },
    ];

    // end of aggregation handling; now execute aggregation (cached) and format results

    const cacheKey = `property:similar:${property._id}:${locality || ''}:${safePage}:${safeLimit}`;

    const base = await getOrSet(cacheKey, async () => {
      const res = await Property.aggregate(baseAggregation);
      return res[0] || { data: [], total: 0 };
    }, 60);

    const data = base.data || [];
    const total = base.total || 0;

    const formattedData = data.map((item) => {
      const value = item.totalPrice ?? '';
      const isMonthly = typeof value === 'number' && item.propertyType === 'Rental';
      const formattedPrice = formatPriceLabel(value, isMonthly);
      return {
        _id: item._id,
        slug: item.slug ?? '',
        title: item.title ?? '',
        location: item.location ?? '',
        totalPrice: formattedPrice || '',
        sqft: item.sqft ?? '',
        listingCategory: item.listingCategory ?? '',
        propertyType: item.propertyType ?? '',
        featured: item.featured ?? false,
        status: item.status ?? 'Active',
        photos: item.photos ?? '',
        video: item.video ?? '',
        isSaved: item.isSaved ?? false,
        bhk: item.bhk ?? 0,
        recommendationScore: item.recommendationScore ?? 0,
        details: item.details ?? {},
        priceNegotiable: item.pricing?.priceNegotiable ?? null,
        rentNegotiable: item.pricing?.rentNegotiable ?? null,
      };
    });

    return cleanNulls({
      data: formattedData,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    });
  },

};

export default propertyRepository;