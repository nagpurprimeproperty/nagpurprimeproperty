import Lead from '../lead/leads.model.js';
import mongoose from 'mongoose';


function formatLeadDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (diffDays === 0) return `TODAY ${time}`;
  if (diffDays === 1) return `YESTERDAY`;
  return `${diffDays} DAYS AGO`;
}

const formatPriceLabel = (value, isMonthly = false) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return value;

  const formatNumber = (num) => {
    const rounded = Math.round(num * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.0$/, '');
  };

  let label;
  if (value >= 100000) {
    label = `${formatNumber(value / 100000)}.L`;
  } else if (value >= 1000) {
    label = `${formatNumber(value / 1000)}k`;
  } else {
    label = String(value);
  }

  return isMonthly ? `${label}/month` : label;
};

const leadRepository = {
  /**
   * Find lead by ID
   */
  findById: (id, brokerId) => Lead.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id), brokerId: new mongoose.Types.ObjectId(brokerId) } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'properties',
        let: { propertyId: '$propertyId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$propertyId'] } } },
          { $limit: 1 },
          { $project: { title: 1, listingCategory: 1, pricing: 1, photos: 1 } }
        ],
        as: 'property',
      }
    },
    { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        customerName: 1,
        phone: 1,
        propertyName: '$property.title',
        propertyType: 1,
        listingCategory: '$property.listingCategory',
        title: 1,
        totalPrice: {
          $ifNull: [
            {
              $ifNull: ['$property.pricing.totalPrice', {
                $ifNull: ['$property.pricing.startingPrice', '$property.pricing.monthlyRent'],
              }]
            },
            '',
          ],
        },
        notes: 1,
        photos: '$property.photos',
        status: 1,
      }
    },
  ]).exec().then(results => {
    const item = results[0];
    if (!item) return null;
    const value = item.totalPrice ?? '';
    const isMonthly = typeof value === 'number' && item.listingCategory === 'Rental';
    return {
      ...item,
      totalPrice: formatPriceLabel(value, isMonthly),
    };
  }),

  /**
   * Find lead by filter
   */
  findOne: async (filter) => {
    return Lead.findOne(filter).lean();
  },
  /**
   * Find all leads with server-side filtering and pagination
   * @param {Object} options
   * @param {string}  options.search      - Search across name, phone, notes
   * @param {string}  options.status      - 'all' | 'New' | 'Contacted' | 'Closed'
   * @param {string}  options.area        - Filter by locality
   * @param {string}  options.propertyType
   * @param {string}  options.dateFrom    - ISO date string
   * @param {string}  options.dateTo      - ISO date string
   * @param {number}  options.page        - 1-based page number
   * @param {number}  options.limit       - Items per page (max 100)
   */
  findAll: async ({ brokerId, page = 1, limit = 10 } = {}) => {
    const filter = {};

    if (brokerId && mongoose.Types.ObjectId.isValid(brokerId)) {
      filter.brokerId = new mongoose.Types.ObjectId(brokerId);
    }


    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Lead.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: safeLimit },
        {
          $lookup: {
            from: 'properties',
            localField: 'propertyId',
            foreignField: '_id',
            as: 'property',
            pipeline: [
              { $limit: 1 },
              { $project: { title: 1 } }
            ]
          }
        },
        { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            customerName: 1,
            propertyType: 1,
            propertyName: '$property.title',
            phone: { $cond: { if: { $eq: ['$isOpened', true] }, then: '$phone', else: null } },
            title: 1,
            status: 1,
            isNew: { $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
            createdAt: 1,
          }
        },
      ]).exec(),
      Lead.countDocuments(filter),
    ]);


    const formattedData = data.map(lead => ({
      ...lead,
      createdAt: formatLeadDate(lead.createdAt),
    }));

    return {
      data: formattedData,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  },


  /**
   * Create a new lead
   */
  create: async (payload, session) => {
    const [lead] = await Lead.create([payload], { session });
    return lead;
  },
  /**
   * Update a lead  status by ID
   */
  updateStatus: (id, status, brokerId) => Lead.findOneAndUpdate({ _id: id, brokerId }, { $set: { status } }, { new: true, runValidators: true }),


  markAsOpened: (id) => Lead.findByIdAndUpdate(id, { $set: { isOpened: true } }, { new: true }),
  /**
   * Check if lead exists
   */
  exists: (filter) => Lead.exists(filter),
};

export default leadRepository;