import { YEARS, YNM_COLS } from '../../lib/questions.js';

const QUESTION_COLS = { calmStationery: 'calm_stationery', ...YNM_COLS };

export async function onRequestGet({ env }) {
  const headers = { 'content-type': 'application/json', 'cache-control': 'public, max-age=3, s-maxage=3' };
  if (!env.DB) return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { ...headers, 'cache-control': 'no-store' } });

  const now = Date.now();
  const stmts = [
    env.DB.prepare('SELECT COUNT(*) AS n, AVG(stress_freq) AS f, AVG(stress_impact) AS i, MAX(created_at) AS last FROM responses'),
    env.DB.prepare('SELECT COUNT(*) AS n FROM responses WHERE created_at >= ?').bind(new Date(now - 864e5).toISOString()),
    env.DB.prepare('SELECT stress_freq AS v, COUNT(*) AS n FROM responses GROUP BY stress_freq'),
    env.DB.prepare('SELECT stress_impact AS v, COUNT(*) AS n FROM responses GROUP BY stress_impact'),
    env.DB.prepare('SELECT year AS v, COUNT(*) AS n FROM responses GROUP BY year'),
    env.DB.prepare('SELECT j.value AS v, COUNT(*) AS n FROM responses, json_each(responses.coping) AS j GROUP BY j.value ORDER BY n DESC'),
    env.DB.prepare('SELECT substr(created_at,1,10) AS v, COUNT(*) AS n FROM responses WHERE created_at >= ? GROUP BY v')
      .bind(new Date(now - 13 * 864e5).toISOString().slice(0, 10)),
    ...Object.values(QUESTION_COLS).map((c) => env.DB.prepare(`SELECT ${c} AS v, COUNT(*) AS n FROM responses GROUP BY ${c}`)),
  ];
  const res = await env.DB.batch(stmts);
  const rows = (i) => res[i].results || [];
  const toMap = (i) => Object.fromEntries(rows(i).map((r) => [r.v, r.n]));

  const t = rows(0)[0] || {};
  const years = toMap(4);
  const questions = {};
  Object.keys(QUESTION_COLS).forEach((k, idx) => { questions[k] = toMap(7 + idx); });

  const body = {
    total: t.n || 0,
    last24h: rows(1)[0]?.n || 0,
    avgFreq: t.f, avgImpact: t.i, lastAt: t.last,
    freq: toMap(2), impact: toMap(3),
    years: YEARS.map((y) => ({ label: y, n: years[y] || 0 })),
    coping: rows(5).map((r) => ({ label: r.v, n: r.n })),
    daily: toMap(6),
    questions,
    updatedAt: new Date(now).toISOString(),
  };
  return new Response(JSON.stringify(body), { headers });
}
