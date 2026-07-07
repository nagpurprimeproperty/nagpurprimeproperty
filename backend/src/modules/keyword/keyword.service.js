import keywordRepository from './keyword.repository.js';

const keywordService = {
  /** Get all active keywords (public) */
  getActiveKeywords: () => keywordRepository.findAllActive(),

  /** Get all keywords (admin) */
  getAllKeywords: () => keywordRepository.findAll(),

  /** Create a keyword */
  createKeyword: (data) => keywordRepository.create(data),

  /** Update a keyword */
  updateKeyword: async (id, data) => {
    const updated = await keywordRepository.updateById(id, data);
    if (!updated) throw Object.assign(new Error('Keyword not found'), { status: 404 });
    return updated;
  },

  /** Delete a keyword */
  deleteKeyword: async (id) => {
    const deleted = await keywordRepository.deleteById(id);
    if (!deleted) throw Object.assign(new Error('Keyword not found'), { status: 404 });
    return deleted;
  },

  /** Increment click count */
  trackClick: async (id) => {
    const updated = await keywordRepository.incrementClick(id);
    if (!updated) throw Object.assign(new Error('Keyword not found'), { status: 404 });
    return updated;
  },

  /** Bulk import from parsed CSV data */
  bulkImport: async (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw Object.assign(new Error('No rows provided for import'), { status: 400 });
    }
    const docs = rows.map((r) => ({
      keyword: (r.keyword || r.Keyword || '').trim(),
      redirectUrl: (r.redirectUrl || r.RedirectUrl || r.url || r.URL || '').trim(),
      category: (r.category || r.Category || 'General').trim(),
      isFeatured: String(r.isFeatured || r.IsFeatured || 'false').toLowerCase() === 'true',
      sortOrder: Number(r.sortOrder || r.SortOrder || 0),
    })).filter((d) => d.keyword && d.redirectUrl);

    if (docs.length === 0) {
      throw Object.assign(new Error('No valid rows found after parsing. Ensure columns: keyword, redirectUrl'), { status: 400 });
    }

    const result = await keywordRepository.bulkCreate(docs);
    return result;
  },
};

export default keywordService;
