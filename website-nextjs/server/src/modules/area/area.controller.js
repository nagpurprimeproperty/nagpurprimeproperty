// area.controller.js
import areaService from './area.service.js';

const areaController = {
  getAreas: async (req, res, next) => {
    try {
      const areas = await areaService.listAreas();
      res.status(200).json({ success: true, data: areas });
    } catch (err) {
      next(err);
    }
  },

  getArea: async (req, res, next) => {
    try {
      const area = await areaService.getAreaBySlug(req.params.slug);
      res.status(200).json({ success: true, data: area });
    } catch (err) {
      next(err);
    }
  },
};

export default areaController;
