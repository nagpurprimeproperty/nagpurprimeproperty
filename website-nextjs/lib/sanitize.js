import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content before rendering with dangerouslySetInnerHTML.
 * Strips executable scripts (<script>), iframes, objects, event handlers (onerror, onload, onclick),
 * and dangerous URI protocols (javascript:).
 *
 * @param {string} dirtyHtml - Raw HTML string from database or user input
 * @returns {string} Sanitized, safe HTML string
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
  });
}

export default sanitizeHtml;
