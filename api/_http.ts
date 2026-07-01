/**
 * _http.ts — Shared HTTP helpers for the edge API endpoints (DRY).
 *
 * Every endpoint used to redeclare the same cors block + json() responder +
 * OPTIONS/405 handling. This centralises them so they exist in exactly one place.
 */

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** JSON response with CORS headers. */
export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });

/** 204 response for CORS preflight (OPTIONS). */
export const preflight = (): Response => new Response(null, { status: 204, headers: cors });

/** 405 for unsupported methods. */
export const methodNotAllowed = (): Response => json({ error: 'Method not allowed' }, 405);
