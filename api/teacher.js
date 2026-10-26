// Native Node entrypoint, matching the existing image API packaging.
let service;
export default async function handler(req, res) {
  let run;
  try { service ??= import('../server/teacher-service.mjs'); run = (await service).default; }
  catch {
    service = undefined;
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ error: 'AI Teacher is temporarily unavailable.', code: 'unavailable' }));
    return;
  }
  return run(req, res);
}
