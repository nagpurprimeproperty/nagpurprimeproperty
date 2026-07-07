import searchSuggestionsRepository from './searchSuggestions.repository.js';

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { query, limit = 8 } = req.query;

    // Return empty array for blank query — not an error
    const suggestions = await searchSuggestionsRepository.getSearchSuggestions(
      query || '',
      req.user?.id,
      limit
    );

    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
};