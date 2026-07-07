import keywordService from './keyword.service.js';

const keywordController = {
  /** GET /api/v1/keywords — public: active keywords */
  getActive: async (req, res, next) => {
    try {
      const keywords = await keywordService.getActiveKeywords();
      res.status(200).json({ success: true, data: keywords });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/v1/keywords/all — admin: all keywords */
  getAll: async (req, res, next) => {
    try {
      const keywords = await keywordService.getAllKeywords();
      res.status(200).json({ success: true, data: keywords });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/v1/keywords — admin: create */
  create: async (req, res, next) => {
    try {
      const keyword = await keywordService.createKeyword(req.body);
      res.status(201).json({ success: true, data: keyword, message: 'Keyword created successfully' });
    } catch (err) {
      next(err);
    }
  },

  /** PUT /api/v1/keywords/:id — admin: update */
  update: async (req, res, next) => {
    try {
      const keyword = await keywordService.updateKeyword(req.params.id, req.body);
      res.status(200).json({ success: true, data: keyword, message: 'Keyword updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/v1/keywords/:id — admin: delete */
  remove: async (req, res, next) => {
    try {
      await keywordService.deleteKeyword(req.params.id);
      res.status(200).json({ success: true, message: 'Keyword deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/v1/keywords/:id/click — public: track click */
  trackClick: async (req, res, next) => {
    try {
      const keyword = await keywordService.trackClick(req.params.id);
      res.status(200).json({ success: true, data: keyword });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/v1/keywords/bulk-import — admin: bulk CSV rows */
  bulkImport: async (req, res, next) => {
    try {
      const { rows } = req.body;
      const result = await keywordService.bulkImport(rows);
      res.status(201).json({
        success: true,
        data: result,
        message: `${result.length} keywords imported successfully`,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default keywordController;
