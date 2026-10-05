import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Sphinx by-products in the API reference: raw sources and generated index/search pages.
      disallow: ['/api/_sources/', '/api/genindex.html', '/api/py-modindex.html', '/api/search.html'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
