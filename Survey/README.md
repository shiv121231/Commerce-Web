# One Pen site: survey + live metrics on Cloudflare Pages

```
public/index.html     main pen page (your existing page, plus a survey link in the footer)
public/survey.html    the survey (posts to /api/survey)
public/metrics.html   live dashboard (polls /api/stats every 5s)
functions/api/survey.js   POST  - validates + stores a response in D1
functions/api/stats.js    GET   - public aggregates only (no names)
functions/api/export.js   GET   - CSV of all rows, needs Authorization: Bearer ADMIN_TOKEN
lib/questions.js      shared allowed answers + validation
schema.sql            D1 table
wrangler.toml         Pages + D1 binding
```
`functions/` and `lib/` live at the **repo root**, next to the output folder (`public`). If your repo is a flat site, move your files into `public/` or set the Pages output directory to match.

## Setup
1. `npx wrangler d1 create onepen-survey`, then paste the `database_id` into `wrangler.toml`.
2. `npx wrangler d1 execute onepen-survey --remote --file=schema.sql`
3. Pages project > Settings > Variables and Secrets: add secret `ADMIN_TOKEN` (a long random string). If you'd rather not use `wrangler.toml`, delete it and add the D1 binding named `DB` under Settings > Bindings instead.
4. Push to GitHub. Pages builds with output directory `public` and no build command.

## Local dev
```
cp .dev.vars.example .dev.vars
npx wrangler d1 execute onepen-survey --local --file=schema.sql
npx wrangler pages dev public
```

## Export
`curl -H "Authorization: Bearer $ADMIN_TOKEN" https://YOUR-SITE/api/export -o responses.csv`

## Before you share it
- `/metrics.html` and `/api/stats` are public but contain only counts. To restrict them, put them behind Cloudflare Access.
- The survey stores students' names. Check your school's privacy/consent rules, and consider removing the name question.
- Add a Cloudflare WAF rate-limit rule on `/api/survey` (the honeypot and server-side validation only stop casual abuse).
- To delete everything: `npx wrangler d1 execute onepen-survey --remote --command "DELETE FROM responses"`
