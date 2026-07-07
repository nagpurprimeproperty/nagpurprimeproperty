// area.repository.js
import Area from './area.model.js';

const areaRepository = {
  findAll: () =>
    Area.find({ isPublished: true }).select('-__v').sort({ createdAt: -1 }).lean(),

  findBySlug: (slug) =>
    Area.findOne({ slug, isPublished: true }).select('-__v').lean(),

  create: (data) => Area.create(data),

  updateBySlug: (slug, data) =>
    Area.findOneAndUpdate({ slug }, data, { new: true, runValidators: true }).lean(),

  deleteBySlug: (slug) => Area.findOneAndDelete({ slug }),

  findAllAdmin: () =>
    Area.find().select('-__v').sort({ createdAt: -1 }).lean(),
};

export default areaRepository;
