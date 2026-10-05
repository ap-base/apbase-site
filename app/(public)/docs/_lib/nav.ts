// Sphinx autodoc output, built into out/api/ by scripts/build-api-reference.sh during deploy (absent in `next dev`).
export const API_REFERENCE_URL = '/api';

export const SLUG_TO_PATH: Record<string, string> = {
  overview:                          'index.md',
  installation:                      'installation.md',
  quickstart:                        'quickstart.md',
  production:                        'production.md',
  'user-guide':                      'user-guide/index.md',
  'user-guide/grid-and-mapping':     'user-guide/grid-and-mapping.md',
  'user-guide/filtering':            'user-guide/filtering.md',
  'user-guide/variogram':            'user-guide/variogram.md',
  'user-guide/kriging':              'user-guide/kriging.md',
  'user-guide/idw':                  'user-guide/idw.md',
  'user-guide/cross-validation':     'user-guide/cross-validation.md',
  'user-guide/cokriging':            'user-guide/cokriging.md',
  methodology:                       'methodology/index.md',
  'methodology/idw':                 'methodology/idw.md',
  'methodology/kriging':             'methodology/kriging.md',
  'methodology/variogram-fitting':   'methodology/variogram-fitting.md',
  'methodology/cross-validation':    'methodology/cross-validation.md',
  'methodology/covariate-screening': 'methodology/covariate-screening.md',
  'methodology/cokriging':           'methodology/cokriging.md',
};

export const PATH_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_PATH).map(([slug, path]) => [path.replace(/\.md$/, ''), slug]),
);

export const slugHref = (slug: string) => (slug === 'overview' ? '/docs' : `/docs/${slug}`);

export type NavLeaf = { label: string; slug: string };
export type NavGroup = { label: string; slug?: string; children: NavLeaf[] };
export type NavExternalLink = { label: string; href: string };
export type NavExternal = NavExternalLink & { external: true; children?: NavExternalLink[] };
export type NavItem = NavLeaf | NavGroup | NavExternal;

export const NAV: NavItem[] = [
  { label: 'Overview',                         slug: 'overview' },
  { label: 'Installation',                     slug: 'installation' },
  { label: 'Quickstart',                       slug: 'quickstart' },
  { label: 'Production and cloud deployment',  slug: 'production' },
  {
    label: 'User Guide',
    slug: 'user-guide',
    children: [
      { label: 'Map and grid generation',    slug: 'user-guide/grid-and-mapping' },
      { label: 'Spatial filtering',          slug: 'user-guide/filtering' },
      { label: 'Variogram',                  slug: 'user-guide/variogram' },
      { label: 'Kriging',                    slug: 'user-guide/kriging' },
      { label: 'IDW',                        slug: 'user-guide/idw' },
      { label: 'Cross-validation',           slug: 'user-guide/cross-validation' },
      { label: 'Cokriging',                  slug: 'user-guide/cokriging' },
    ],
  },
  {
    label: 'Methodology',
    slug: 'methodology',
    children: [
      { label: 'Inverse distance weighting', slug: 'methodology/idw' },
      { label: 'Ordinary kriging',           slug: 'methodology/kriging' },
      { label: 'Variogram fitting',          slug: 'methodology/variogram-fitting' },
      { label: 'Cross-validation',           slug: 'methodology/cross-validation' },
      { label: 'Covariate screening',        slug: 'methodology/covariate-screening' },
      { label: 'Cokriging',                  slug: 'methodology/cokriging' },
    ],
  },
  {
    label: 'API Reference',
    href: `${API_REFERENCE_URL}/index.html`,
    external: true,
    children: [
      { label: 'apbase.mapping', href: `${API_REFERENCE_URL}/mapping.html` },
      { label: 'apbase.config',  href: `${API_REFERENCE_URL}/common.html` },
    ],
  },
];

export function isGroup(item: NavItem): item is NavGroup {
  return 'children' in item && !('external' in item);
}

export function isExternal(item: NavItem): item is NavExternal {
  return 'external' in item;
}

export function isLeaf(item: NavItem): item is NavLeaf {
  return 'slug' in item && !('children' in item);
}

// Reading order (sidebar flattened), used for the previous/next pager like Sphinx's.
export const PAGE_ORDER: NavLeaf[] = NAV.flatMap((item) => {
  if (isGroup(item)) return item.slug ? [{ label: item.label, slug: item.slug }, ...item.children] : item.children;
  return isLeaf(item) ? [item] : [];
});

export function labelForSlug(slug: string): string | undefined {
  return PAGE_ORDER.find((p) => p.slug === slug)?.label;
}

export function adjacentPages(slug: string): { prev?: NavLeaf | undefined; next?: NavLeaf | undefined } {
  const i = PAGE_ORDER.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: PAGE_ORDER[i - 1], next: PAGE_ORDER[i + 1] };
}
