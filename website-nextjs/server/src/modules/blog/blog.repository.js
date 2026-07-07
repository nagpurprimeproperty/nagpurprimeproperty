// blog.repository.js
import Blog from './blog.model.js';

const blogRepository = {
  findAll: ({ limit } = {}) => {
    let q = Blog.find({ isPublished: true }).select('-__v').sort({ date: -1 });
    if (limit) q = q.limit(Number(limit));
    return q.lean();
  },

  findBySlug: (slug) =>
    Blog.findOne({ slug, isPublished: true }).select('-__v').lean(),

  create: (data) => Blog.create(data),

  updateBySlug: (slug, data) =>
    Blog.findOneAndUpdate({ slug }, data, { new: true, runValidators: true }).lean(),

  deleteBySlug: (slug) => Blog.findOneAndDelete({ slug }),

  findAllAdmin: () =>
    Blog.find().select('-__v').sort({ date: -1 }).lean(),
};

export default blogRepository;
