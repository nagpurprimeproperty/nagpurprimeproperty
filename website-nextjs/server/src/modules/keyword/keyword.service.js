// keyword.service.js — Website server module
import keywordRepository from './keyword.repository.js';

const keywordService = {
  /** Get all active keywords (public) */
  getActiveKeywords: () => keywordRepository.findAllActive(),

  /** Track a keyword click */
  trackClick: async (id) => {
    const updated = await keywordRepository.incrementClick(id);
    if (!updated) throw Object.assign(new Error('Keyword not found'), { status: 404 });
    return updated;
  },
};

export default keywordService;
