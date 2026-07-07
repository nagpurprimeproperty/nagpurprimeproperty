// blog.service.js
import blogRepository from './blog.repository.js';

const blogService = {
  listBlogs: async ({ limit } = {}) => {
    return blogRepository.findAll({ limit });
  },

  getBlogBySlug: async (slug) => {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog) throw Object.assign(new Error('Blog not found'), { status: 404 });
    return blog;
  },
};

export default blogService;
