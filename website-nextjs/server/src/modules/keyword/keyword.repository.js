// keyword.repository.js — Website server module
import Keyword from './keyword.model.js';

const keywordRepository = {
  /** Public: only active keywords, sorted by sortOrder then newest */
  findAllActive: () =>
    Keyword.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-__v')
      .lean(),

  /** Increment click count atomically */
  incrementClick: (id) =>
    Keyword.findByIdAndUpdate(id, { $inc: { clickCount: 1 } }, { new: true }).lean(),
};

export default keywordRepository;
