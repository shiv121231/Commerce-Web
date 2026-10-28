import { onRequestPost as survey } from '../functions/api/survey.js';
import { onRequestGet as stats } from '../functions/api/stats.js';
import { onRequestGet as exportCsv } from '../functions/api/export.js';

const json = (d, s) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (pathname === '/api/survey') return request.method === 'POST' ? await survey({ request, env }) : json({ error: 'Use POST' }, 405);
      if (pathname === '/api/stats' && request.method === 'GET') return await stats({ request, env });
      if (pathname === '/api/export' && request.method === 'GET') return await exportCsv({ request, env });
      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: 'Server error' }, 500);
    }
  },
};
