// area.service.js
import areaRepository from './area.repository.js';
import { getOrSet } from '../../utils/cache.js';

const areaService = {
  listAreas: async () => {
    return getOrSet('area:list', () => areaRepository.findAll(), 3600);
  },

  getAreaBySlug: async (slug) => {
    return getOrSet(`area:slug:${slug}`, async () => {
      const area = await areaRepository.findBySlug(slug);
      if (!area) throw Object.assign(new Error('Area not found'), { status: 404 });
      return area;
    }, 3600);
  },
};

export default areaService;
