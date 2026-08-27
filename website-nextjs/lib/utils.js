import { clsx,} from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a redirect URL to prevent Open Redirect vulnerabilities.
 * Ensures the target is a safe relative path on the same origin.
 *
 * @param {string|null|undefined} target - Target redirect path
 * @param {string} fallback - Fallback route if invalid (default: '/profile')
 * @returns {string} Safe relative redirect path
 */
export function getSafeRedirectUrl(target, fallback = '/profile') {
  if (!target || typeof target !== 'string') return fallback;
  const trimmed = target.trim();
  // Must start with '/' but NOT '//' or '/\'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    try {
      const parsed = new URL(trimmed, 'http://localhost');
      if (parsed.origin === 'http://localhost' && parsed.pathname.startsWith('/')) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return fallback;
    }
  }
  return fallback;
}
