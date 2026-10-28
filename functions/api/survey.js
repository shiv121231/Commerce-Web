import { validate } from '../../lib/questions.js';

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'Database not configured' }, 500);
  if (Number(request.headers.get('content-length') || 0) > 8192) return json({ error: 'Payload too large' }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (body.website) return json({ ok: true }); // honeypot: bots fill the hidden field

  const r = validate(body);
  if (!r.ok) return json({ error: r.error }, 400);
  const v = r.value;
  const id = /^[a-z0-9]{6,40}$/i.test(body.rid || '') ? body.rid : crypto.randomUUID(); // retries can't double-count

  const cols = ['id', 'created_at', ...Object.keys(v)];
  const vals = [id, new Date().toISOString(), ...Object.values(v)];
  await env.DB.prepare(`INSERT OR IGNORE INTO responses (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).bind(...vals).run();
  return json({ ok: true }, 201);
}
