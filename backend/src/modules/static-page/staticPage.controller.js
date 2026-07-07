// staticPage.controller.js
import staticPageService from './staticPage.service.js';

const staticPageController = {
  getPage: async (req, res) => {
    try {
      const page = await staticPageService.getPage(req.params.slug);
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

export default staticPageController;