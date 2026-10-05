import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { NAV, SLUG_TO_PATH, isExternal, slugHref } from './(public)/docs/_lib/nav';

export const dynamic = 'force-static';

// trailingSlash: true in next.config.js, so every URL ends with "/".
const url = (path: string) => `${SITE_CONFIG.url}${path.replace(/\/?$/, '/')}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.values(ROUTES).filter((route) => route !== ROUTES.DOCS);
  const docs = Object.keys(SLUG_TO_PATH).map(slugHref);
  // Sphinx API reference pages (/api/*.html) are files, not directories, so they keep their exact URL.
  const api = NAV.filter(isExternal).flatMap((item) => [item.href, ...(item.children ?? []).map((c) => c.href)]);
  return [...[...pages, ...docs].map(url), ...api.map((path) => `${SITE_CONFIG.url}${path}`)].map((u) => ({ url: u }));
}
