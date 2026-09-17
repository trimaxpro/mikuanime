/**
 * Generates public/sitemap.xml from the bundled AniList anime list.
 *
 * The catalog (public/anime-list-mini.json) contains ~42k entries; the sitemap
 * includes every TV / Movie title with a MyAnimeList id (those are the URLs the
 * /anime/:id API can resolve), newest first, capped by ANIME_LIMIT. Core and
 * genre pages are always included; account/noindexed routes are excluded.
 *
 * Run: npm run gen:sitemap
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = 'https://www.mikuanime.site';
const DATE = new Date().toISOString().slice(0, 10);
const ANIME_LIMIT = Number(process.env.ANIME_LIMIT || 4000);

function xml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[c]));
}

const core = [
  { loc: '/', freq: 'daily', priority: '1.0' },
  { loc: '/browse', freq: 'daily', priority: '0.9' },
  { loc: '/schedule', freq: 'daily', priority: '0.9' },
  { loc: '/terms', freq: 'monthly', priority: '0.4' },
  { loc: '/privacy', freq: 'monthly', priority: '0.4' },
];

const genres = [
  'action', 'adventure', 'comedy', 'drama', 'ecchi', 'fantasy', 'horror',
  'mahou-shoujo', 'mecha', 'music', 'mystery', 'psychological', 'romance',
  'sci-fi', 'slice-of-life', 'sports', 'supernatural', 'thriller',
];

const list = JSON.parse(readFileSync(path.join(root, 'public/anime-list-mini.json'), 'utf8'));

// Reverse the AniList id order so the newest (most recent seasonal/popular)
// titles are prioritised over older catalogue entries.
const anime = list
  .filter((a) => (a.type === 'TV' || a.type === 'MOVIE') && Number.isFinite(a.mal_id))
  .slice()
  .reverse()
  .slice(0, ANIME_LIMIT)
  .map((a) => ({ loc: `/anime/${a.mal_id}`, freq: 'monthly', priority: '0.6' }));

const urls = [
  ...core.map((u) => ({ ...u })),
  ...genres.map((slug) => ({ loc: `/genre/${slug}`, freq: 'monthly', priority: '0.7' })),
  ...anime,
];

const xmlOut = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE}${xml(u.loc)}</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(path.join(root, 'public/sitemap.xml'), xmlOut, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs (${anime.length} anime).`);