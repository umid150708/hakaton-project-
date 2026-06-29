// Local dev server — routes /api/* to the correct handler
// Run: node --import tsx/esm dev-server.mjs
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load .env.local
try {
  const envPath = resolve(__dir, '.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !process.env[key]) process.env[key] = rest.join('=').trim();
  }
} catch {
  console.warn('No .env.local found');
}

// Lazy-load handlers so we don't import everything at startup
const handlers = {};
async function getHandler(name) {
  if (!handlers[name]) {
    const mod = await import(`./api/${name}.ts`);
    handlers[name] = mod.default;
  }
  return handlers[name];
}

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const url = new URL(`http://localhost:${PORT}${req.url}`);

  // Route: /api/<name>
  const match = url.pathname.match(/^\/api\/([a-z]+)/);
  if (!match) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const handlerName = match[1]; // 'generate', 'prices', etc.

  let handler;
  try {
    handler = await getHandler(handlerName);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Handler '${handlerName}' not found`, detail: String(e) }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const webReq = new Request(url.href, {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v ?? ''])
    ),
    body: body.length > 0 ? body : undefined,
  });

  try {
    const webRes = await handler(webReq);
    res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));
    const buf = await webRes.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Handler error', detail: String(e) }));
  }
});

server.listen(PORT, () => {
  console.log(`✓ API server ready on http://localhost:${PORT}`);
  console.log(`  Routes: /api/generate, /api/prices`);
  console.log(`  API key: ${process.env.ANTHROPIC_API_KEY ? '✓ loaded' : '✗ not set (demo mode will work)'}`);
});
