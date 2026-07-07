import Keyword from './keyword.model.js';

const keywordRepository = {
  /** Public: only active keywords, sorted */
  findAllActive: () =>
    Keyword.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-__v')
      .lean(),

  /** Admin: all keywords */
  findAll: () =>
    Keyword.find().sort({ sortOrder: 1, createdAt: -1 }).select('-__v').lean(),

  findById: (id) => Keyword.findById(id).lean(),

  create: (data) => Keyword.create(data),

  updateById: (id, data) =>
    Keyword.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean(),

  deleteById: (id) => Keyword.findByIdAndDelete(id),

  /** Increment click counter by 1 */
  incrementClick: (id) =>
    Keyword.findByIdAndUpdate(id, { $inc: { clickCount: 1 } }, { new: true }).lean(),

  /** Bulk insert many keywords */
  bulkCreate: (docs) => Keyword.insertMany(docs, { ordered: false }),
};

export default keywordRepository;
