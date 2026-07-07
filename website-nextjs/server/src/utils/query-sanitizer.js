/**
 * MongoDB query sanitization helpers.
 * Prevents NoSQL injection by stripping forbidden operators from user input.
 */

const PROTOTYPE_POLLUTING_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Recursively strip MongoDB operators from an object/array.
 * Blocks any key starting with '$' and prototype-polluting keys.
 * @param {any} obj
 * @returns {any}
 */
export function sanitizeMongoObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoObject);
  }
  if (obj && typeof obj === 'object') {
    const clean = Object.create(null);
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$') || PROTOTYPE_POLLUTING_KEYS.includes(key)) {
        continue; // skip operators and prototype-polluting keys
      }
      clean[key] = sanitizeMongoObject(value);
    }
    return clean;
  }
  return obj;
}

/**
 * Sanitize a string search term for safe use in $regex queries.
 * Escapes special regex characters.
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a safe regex filter from a user search string.
 * @param {string} search
 * @returns {Object|null}
 */
export function safeRegexFilter(search) {
  const term = typeof search === 'string' ? search.trim() : '';
  if (!term) return null;
  return { $regex: escapeRegex(term), $options: 'i' };
}
