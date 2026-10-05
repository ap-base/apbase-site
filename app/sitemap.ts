import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { SLUG_TO_PATH, slugHref } from './(public)/docs/_lib/nav';

export const dynamic = 'force-static';

// trailingSlash: true in next.config.js, so every URL ends with "/".
const url = (path: string) => `${SITE_CONFIG.url}${path.replace(/\/?$/, '/')}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.values(ROUTES).filter((route) => route !== ROUTES.DOCS);
  const docs = Object.keys(SLUG_TO_PATH).map(slugHref);
  return [...pages, ...docs].map((path) => ({ url: url(path) }));
}
