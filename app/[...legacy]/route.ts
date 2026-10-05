import { SITE_CONFIG } from '@/config/site';
import { SLUG_TO_PATH, slugHref } from '../(public)/docs/_lib/nav';

// The docs used to be Sphinx pages at the site root (e.g. /installation.html). GitHub Pages can't send
// 301s, so each old URL becomes a static page with an instant meta refresh plus a canonical to the new
// URL, which search engines treat as a permanent redirect.

export const dynamic = 'force-static';
export const dynamicParams = false;

// 'index.md' is skipped: /index.html is the home page itself.
const LEGACY: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_PATH)
    .filter(([, path]) => path !== 'index.md')
    .map(([slug, path]) => [path.replace(/\.md$/, '.html'), slugHref(slug)]),
);

export function generateStaticParams() {
  return Object.keys(LEGACY).map((path) => ({ legacy: path.split('/') }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const target = `${SITE_CONFIG.url}${LEGACY[legacy.join('/')]}/`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body><p>This page moved to <a href="${target}">${target}</a>.</p></body>
</html>
`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
