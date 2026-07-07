import Property from './property.model.js';
import RecentlySearchedKeywords from './recentlySearchedKeywords.js';
import mongoose from 'mongoose';

const fmt = (v) => {
  if (typeof v !== 'number') return '';
  if (v >= 10000000) return `${+(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000)   return `${+(v / 100000).toFixed(1)} L`;
  if (v >= 1000)     return `${+(v / 1000).toFixed(0)}k`;
  return String(v);
};

const searchSuggestionsRepository = {
  getSearchSuggestions: async (query, userId, limit = 8) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);

    // Empty query → show recent searches only
    if (!query || !query.trim()) {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return [];
      try {
        const recent = await RecentlySearchedKeywords
          .find({ userId: new mongoose.Types.ObjectId(userId) }, { keyword: 1 })
          .sort({ searchedAt: -1 })
          .limit(6)
          .lean();
        return recent.map((r) => ({
          type: 'keyword',
          title: r.keyword,
          subtitle: 'Recent search',
          propertyId: null,
        }));
      } catch {
        return [];
      }
    }

    const safe  = query.trim();
    const regex = new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [recent, localities, titles] = await Promise.all([

      // Recent searches matching query
      (async () => {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return [];
        try {
          const list = await RecentlySearchedKeywords
            .find({ userId: new mongoose.Types.ObjectId(userId), keyword: regex }, { keyword: 1 })
            .sort({ searchedAt: -1 })
            .limit(3)
            .lean();
          return list.map((r) => ({
            type: 'keyword',
            title: r.keyword,
            subtitle: 'Recent search',
            propertyId: null,
          }));
        } catch { return []; }
      })(),

      // Localities matching query
      (async () => {
        try {
          const props = await Property
            .find(
              { status: 'Active', $or: [{ 'location.locality': regex }, { 'location.subLocality': regex }] },
              { 'location.locality': 1, 'location.subLocality': 1 }
            )
            .limit(30)
            .lean();

          const seen = new Set();
          const out  = [];
          for (const p of props) {
            for (const name of [p.location?.locality, p.location?.subLocality]) {
              if (!name) continue;
              const key = name.toLowerCase().trim();
              if (seen.has(key)) continue;
              if (!key.includes(safe.toLowerCase())) continue;
              seen.add(key);
              out.push({ type: 'locality', title: name.trim(), subtitle: 'Locality · Nagpur', propertyId: null });
            }
          }
          return out.slice(0, 4);
        } catch { return []; }
      })(),

      // Property titles matching query
      (async () => {
        try {
          const props = await Property
            .find(
              { status: 'Active', title: regex },
              { title: 1, propertyType: 1, listingCategory: 1, 'location.locality': 1, pricing: 1, details: 1 }
            )
            .limit(4)
            .lean();

          return props.map((p) => {
            const isRent = p.listingCategory === 'Rental';
            const price  = isRent ? p.pricing?.monthlyRent : (p.pricing?.totalPrice || p.pricing?.startingPrice);
            const bhk    = p.details?.bhk ? `${p.details.bhk} BHK · ` : '';
            return {
              type: 'property',
              title: p.title,
              subtitle: `${bhk}${p.propertyType} · ${p.location?.locality} · ${price ? `₹${fmt(price)}` : 'Price on request'}`,
              propertyId: p._id.toString(),
            };
          });
        } catch { return []; }
      })(),
    ]);

    // Merge and deduplicate
    const seen = new Set();
    const out  = [];
    for (const item of [...recent, ...localities, ...titles]) {
      const key = `${item.type}:${item.title.toLowerCase().trim()}`;
      if (!seen.has(key)) { seen.add(key); out.push(item); }
    }
    return out.slice(0, safeLimit);
  },
};

export default searchSuggestionsRepository;