/* eslint-disable @typescript-eslint/no-explicit-any */
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Polyfill global fetch using https module (native fetch broken on this Windows setup)
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
  const urlObj = new URL(url);
  const mod = urlObj.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.request(url, {
      method: init?.method || 'GET',
      headers: (init?.headers as Record<string, string>) || { 'Content-Type': 'application/json' },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        const statusCode = res.statusCode || 502;
          if (statusCode >= 400) console.log(`[fetch] ${init?.method || 'GET'} ${urlObj.hostname}${urlObj.pathname} => ${statusCode} (${body.length}b)`);
        resolve({
          ok: statusCode >= 200 && statusCode < 300,
          status: statusCode,
          headers: new Map(Object.entries(res.headers || {})),
          json: async () => JSON.parse(body.toString()),
          text: async () => body.toString(),
        } as unknown as Response);
      });
    });
    req.on('error', (e) => { console.log(`[fetch] ERROR ${urlObj.hostname}: ${e.message}`); reject(e); });
    if (init?.body) req.write(init.body as string);
    req.end();
  });
};

import handler from '../api/index';

// Simple .env parser to avoid external dependencies
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          const value = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not parse .env file:', e);
}

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // Add Vercel helper methods to the response object
  (res as any).status = function (code: number) {
    this.statusCode = code;
    return this;
  };

  (res as any).json = function (data: any) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
    return this;
  };

  try {
    console.log(`[API Request] ${req.method} ${req.url}`);
    await handler(req, res);
  } catch (err) {
    console.error('API Error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: true, message: err instanceof Error ? err.message : String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`Local API Dev Server listening on http://localhost:${PORT}`);
  console.log(`Proxying requests to Vercel Serverless Function (api/index.ts)`);
});
