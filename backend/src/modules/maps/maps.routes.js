/**
 * maps.routes.js
 *
 * Server-side proxy for Google Maps APIs.
 *
 * Why this exists
 * ───────────────
 * The Google Maps API key must never appear in the React Native JS bundle
 * (EXPO_PUBLIC_* vars are statically replaced by Metro).  Instead the mobile
 * app calls these endpoints; the server calls Google with the secret key and
 * forwards the JSON response unchanged.
 *
 * Endpoints
 * ─────────
 *   GET /api/v1/maps/reverse-geocode   ?latlng=<lat>,<lng>
 *   GET /api/v1/maps/geocode           ?address=<url-encoded-address>
 *   GET /api/v1/maps/autocomplete      ?input=<text>[&components=…&location=…&radius=…]
 *   GET /api/v1/maps/place-details     ?place_id=<id>[&fields=…]
 *
 * All routes require a valid JWT (userProtect middleware) to prevent key abuse by
 * unauthenticated third parties.
 */

import { Router } from 'express';
import env from '../../config/env.js';
import { userProtect } from '../../middlewares/auth.middleware.js';

const router = Router();

// ── Helper ────────────────────────────────────────────────────────────────────

const GOOGLE_BASE = 'https://maps.googleapis.com/maps/api';
const LANGUAGE = 'en';

/**
 * Forward a Google Maps API response to the client.
 * Strips nothing — the client already expects the standard Google JSON shape.
 */
async function proxyGoogle(res, googleUrl) {
  try {
    const response = await fetch(googleUrl);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[maps proxy] upstream error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'Failed to reach Google Maps API',
    });
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /maps/reverse-geocode?latlng=<lat>,<lng>
 * Converts a coordinate pair to a structured address.
 */
router.get('/reverse-geocode', userProtect, (req, res) => {
  const { latlng } = req.query;
  if (!latlng) {
    return res.status(400).json({ success: false, message: 'latlng query param is required' });
  }
  const url =
    `${GOOGLE_BASE}/geocode/json` +
    `?latlng=${encodeURIComponent(latlng)}` +
    `&key=${env.GOOGLE_MAPS_API_KEY}` +
    `&language=${LANGUAGE}`;
  return proxyGoogle(res, url);
});

/**
 * GET /maps/geocode?address=<url-encoded-string>
 * Converts a human-readable address to coordinates.
 */
router.get('/geocode', userProtect, (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: 'address query param is required' });
  }
  const url =
    `${GOOGLE_BASE}/geocode/json` +
    `?address=${encodeURIComponent(address)}` +
    `&key=${env.GOOGLE_MAPS_API_KEY}` +
    `&language=${LANGUAGE}`;
  return proxyGoogle(res, url);
});

/**
 * GET /maps/autocomplete?input=<text>[&components=country:in&location=lat,lng&radius=N]
 * Returns place predictions for the given partial text input.
 */
router.get('/autocomplete', userProtect, (req, res) => {
  const { input, components, location, radius, strictbounds } = req.query;
  if (!input) {
    return res.status(400).json({ success: false, message: 'input query param is required' });
  }
  let url =
    `${GOOGLE_BASE}/place/autocomplete/json` +
    `?input=${encodeURIComponent(input)}` +
    `&key=${env.GOOGLE_MAPS_API_KEY}` +
    `&language=${LANGUAGE}`;
  if (components) url += `&components=${encodeURIComponent(components)}`;
  if (location)   url += `&location=${encodeURIComponent(location)}`;
  if (radius)     url += `&radius=${encodeURIComponent(radius)}`;
  if (strictbounds === 'false' || strictbounds === 'true') {
    url += `&strictbounds=${strictbounds}`;
  }
  return proxyGoogle(res, url);
});

/**
 * GET /maps/place-details?place_id=<id>[&fields=geometry,address_components,formatted_address]
 * Returns detailed information for a place identified by place_id.
 */
router.get('/place-details', userProtect, (req, res) => {
  const { place_id, fields } = req.query;
  if (!place_id) {
    return res.status(400).json({ success: false, message: 'place_id query param is required' });
  }
  let url =
    `${GOOGLE_BASE}/place/details/json` +
    `?place_id=${encodeURIComponent(place_id)}` +
    `&key=${env.GOOGLE_MAPS_API_KEY}` +
    `&language=${LANGUAGE}`;
  if (fields) url += `&fields=${encodeURIComponent(fields)}`;
  return proxyGoogle(res, url);
});

export default router;
