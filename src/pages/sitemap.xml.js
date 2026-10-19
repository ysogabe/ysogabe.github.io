import { projects } from '../lib/projects.js';
export function GET() {
  const base = 'https://ysogabe.github.io';
  const paths = ['/', '/about/', '/projects/', ...projects.map(p => '/projects/'+encodeURIComponent(p.slug)+'/')];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + paths.map(p => '<url><loc>'+base+p+'</loc></url>').join('\n') + '\n</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
