// blog.controller.js
import blogService from './blog.service.js';

const blogController = {
  getBlogs: async (req, res, next) => {
    try {
      const { limit } = req.query;
      const blogs = await blogService.listBlogs({ limit });
      res.status(200).json({ success: true, data: blogs });
    } catch (err) {
      next(err);
    }
  },

  getBlog: async (req, res, next) => {
    try {
      const blog = await blogService.getBlogBySlug(req.params.slug);
      res.status(200).json({ success: true, data: blog });
    } catch (err) {
      next(err);
    }
  },
};

export default blogController;
