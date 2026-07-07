// staticPage.service.js
import staticPageRepository from './staticPage.repository.js';

const VALID_SLUGS = ['about-us', 'privacy-policy', 'terms-and-conditions', 'contact-us'];

const staticPageService = {
  getPage: async (slug) => {
    if (!VALID_SLUGS.includes(slug)) {
      throw Object.assign(new Error('Page not found'), { status: 404 });
    }

    const page = await staticPageRepository.findBySlug(slug);

    if (!page) throw Object.assign(new Error('Page not found'), { status: 404 });

    return page;
  },
};

export default staticPageService;