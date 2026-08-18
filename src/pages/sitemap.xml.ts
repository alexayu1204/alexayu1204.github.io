import type { APIRoute } from 'astro';
import { NAV_FRAMES } from '../scene/composition';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://alexayu1204.github.io')).origin + '/';
  const paths = ['/', ...NAV_FRAMES.map((f) => f.href!)];
  const urls = paths
    .map((p) => `  <url><loc>${new URL(p, base).href}</loc><changefreq>monthly</changefreq>` +
                `<priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
};
