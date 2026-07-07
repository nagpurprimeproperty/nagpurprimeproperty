// staticPage.repository.js
import StaticPage from './static-page.model.js';

const staticPageRepository = {
  findBySlug: (slug) =>
    StaticPage.findOne({ slug, isPublished: true })
      .select('-__v -createdBy')
      .lean(),
};

export default staticPageRepository;