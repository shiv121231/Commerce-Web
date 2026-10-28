const safeEq = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_TOKEN) return new Response('ADMIN_TOKEN is not set', { status: 503 });
  const auth = request.headers.get('authorization') || '';
  if (!safeEq(auth, `Bearer ${env.ADMIN_TOKEN}`)) return new Response('Unauthorized', { status: 401 });

  const { results } = await env.DB.prepare('SELECT * FROM responses ORDER BY created_at').all();
  if (!results.length) return new Response('No responses yet', { status: 200 });
  const cols = Object.keys(results[0]);
  const cell = (k, v) => {
    let s = k === 'coping' ? JSON.parse(v).join('; ') : String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const csv = [cols.join(','), ...results.map((r) => cols.map((c) => cell(c, r[c])).join(','))].join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="pen-survey-responses.csv"', 'cache-control': 'no-store' } });
}
