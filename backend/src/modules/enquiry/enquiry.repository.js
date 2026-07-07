import Lead from '../lead/leads.model.js';
import mongoose from 'mongoose';

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

const formatEnquiredDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const isToday = date.toDateString() === new Date().toDateString();

  const formattedDate = `${day} ${month} ${year}`;
  const relativeLabel = isToday ? 'TODAY' : date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const formattedTime = `${hour12}:${minutes} ${period}`;

  return `${formattedDate} , ${relativeLabel} , ${formattedTime}`;
};
const leadRepository = {
  /**
   * Find lead by ID
   */
  findById: (id, userId) => Lead.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'properties',
        localField: 'propertyId',
        foreignField: '_id',
        as: 'property',
        pipeline: [{ $limit: 1 }],
      }
    },
    { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'brokerId',
        foreignField: '_id',
        as: 'broker',
        pipeline: [{ $limit: 1 }],
      }
    },
    { $unwind: { path: '$broker', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        area: 1,
        propertyType: 1,
        budget: 1,
        notes: 1,
        source: 1,
        propertyName: '$property.title',
        photos: '$property.photos',
        listingCategory: '$property.listingCategory',
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
        status: { $cond: [{ $eq: ['$status', 'New'] }, 'Pending', 'Responded'] },
        brokerName: '$broker.name',
        enquired: '$createdAt',
      }
    },
  ]).exec().then(async (results) => {
    const item = results[0];
    if (!item) return null;

    const value = item.totalPrice ?? '';
    const isMonthly = typeof value === 'number' && item.listingCategory === 'Rental';

    return {
      ...item,
      totalPrice: formatPriceLabel(value, isMonthly),
      enquired: formatEnquiredDate(item.enquired),
    };
  }),
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
  findAll: async ({ userId, page = 1, limit = 10 } = {}) => {
    const filter = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
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
            pipeline: [{ $limit: 1 }],
          }
        },
        { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'brokerId',
            foreignField: '_id',
            as: 'broker',
            pipeline: [{ $limit: 1 }],
          }
        },
        { $unwind: { path: '$broker', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            propertyName: '$property.title',
            totalPrice: {
              $ifNull: [
                {
                  $ifNull: ['$property.pricing.totalPrice', {
                    $ifNull: ['$property.pricing.startingPrice', '$property.pricing.monthlyRent'],
                  }],
                },
                '',
              ],
            },
            listingCategory: '$property.listingCategory',
            photos: '$property.photos',
            title: 1,
            status: { $cond: [{ $eq: ['$status', 'New'] }, 'Pending', 'Responded'] },
            brokerName: '$broker.name',
            enquired: '$createdAt',
          }
        },
      ]).exec(),
      Lead.countDocuments(filter),
    ]);

    const formattedData = data.map((item) => {
      const value = item.totalPrice ?? '';
      const isMonthly = typeof value === 'number' && item.listingCategory === 'Rental';
      const formattedPrice = formatPriceLabel(value, isMonthly);
      const formattedEnquired = formatEnquiredDate(item.enquired); // like this 12 JAN 2026 , TODAY , 10:45 AM
      return {
        ...item,
        totalPrice: formattedPrice,
        enquired: formattedEnquired,
      };
    });

    return {
      data: formattedData,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  },


};

export default leadRepository;