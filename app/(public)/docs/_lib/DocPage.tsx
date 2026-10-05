import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchDoc } from './fetchDoc';
import { renderDoc } from './renderDoc';
import { SLUG_TO_PATH, adjacentPages, slugHref } from './nav';
import DocTabs from './DocTabs';
import styles from '../docs.module.css';

export default async function DocPage({ slug }: { slug: string }) {
  const path = SLUG_TO_PATH[slug];
  if (!path) notFound();

  const markdown = await fetchDoc(path);
  if (!markdown) notFound();

  const { html, headings } = await renderDoc(markdown, path);
  const { prev, next } = adjacentPages(slug);

  return (
    <div className={styles.docPageInner}>
      {/* Hoisted into <head>; only pages that actually render math pay for KaTeX's CSS. */}
      {html.includes('class="katex') && (
        // eslint-disable-next-line @next/next/no-css-tags -- on-demand, only for pages with math
        <link rel="stylesheet" href="/vendor/katex/katex.min.css" precedence="default" />
      )}
      <div className={styles.docMain}>
        <article className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
        {(prev || next) && (
          <nav className={styles.pager} aria-label="Previous and next pages">
            {prev && (
              <Link href={slugHref(prev.slug)} className={`${styles.pagerLink} ${styles.pagerPrev}`}>
                <span className={styles.pagerArrow} aria-hidden="true">‹</span>
                <span>
                  <span className={styles.pagerHint}>Previous</span>
                  <span className={styles.pagerTitle}>{prev.label}</span>
                </span>
              </Link>
            )}
            {next && (
              <Link href={slugHref(next.slug)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span>
                  <span className={styles.pagerHint}>Next</span>
                  <span className={styles.pagerTitle}>{next.label}</span>
                </span>
                <span className={styles.pagerArrow} aria-hidden="true">›</span>
              </Link>
            )}
          </nav>
        )}
      </div>
      <DocTabs />
      {headings.length > 0 && (
        <aside className={styles.rightToc} aria-label="On this page">
          <p className={styles.rightTocTitle}>On this page</p>
          <nav>
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`${styles.rightTocLink} ${h.level === 3 ? styles.rightTocSub : ''}`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  );
}
