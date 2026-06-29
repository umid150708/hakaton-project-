// Local dev server — adapts api/generate.ts for Node http (no Vercel CLI needed)
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
  console.warn('No .env.local found — ANTHROPIC_API_KEY must be set in environment');
}

const { default: handler } = await import('./api/generate.ts');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const url = `http://localhost:${PORT}${req.url}`;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const webReq = new Request(url, {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v ?? ''])
    ),
    body: body.length > 0 ? body : undefined,
  });

  const webRes = await handler(webReq);

  res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));
  const buf = await webRes.arrayBuffer();
  res.end(Buffer.from(buf));
});

server.listen(PORT, () => {
  console.log(`API server ready on http://localhost:${PORT}`);
  console.log('API key:', process.env.ANTHROPIC_API_KEY ? '✓ loaded' : '✗ MISSING');
});
