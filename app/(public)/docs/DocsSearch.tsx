'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import { slugHref } from './_lib/nav';
import type { SearchEntry } from './search-index.json/route';
import styles from './docs.module.css';

type Result = { href: string; title: string; context?: string; snippet: string };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const MAX_RESULTS = 8;

function snippetAround(text: string, normText: string, term: string): string {
  const at = normText.indexOf(term);
  if (at === -1) return text.slice(0, 120);
  const start = Math.max(0, at - 50);
  const end = Math.min(text.length, at + term.length + 70);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function search(index: SearchEntry[], query: string): Result[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { score: number; result: Result }[] = [];
  for (const entry of index) {
    const normTitle = normalize(entry.title);
    const normText = normalize(entry.text);
    if (!terms.every((t) => normTitle.includes(t) || normText.includes(t))) continue;

    let score = terms.filter((t) => normTitle.includes(t)).length * 10;
    const heading = entry.headings.find((h) => terms.every((t) => normalize(h.text).includes(t)));
    if (heading) score += 5;
    score += terms.reduce((n, t) => n + Math.min(normText.split(t).length - 1, 5), 0);

    scored.push({
      score,
      result: {
        href: `${slugHref(entry.slug)}${heading ? `#${heading.id}` : ''}`,
        title: entry.title,
        ...(heading ? { context: heading.text } : {}),
        snippet: snippetAround(entry.text, normText, terms[0]!),
      },
    });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((s) => s.result);
}

export default function DocsSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const loading = useRef(false);

  const loadIndex = () => {
    if (index || loading.current) return;
    loading.current = true;
    fetch('/docs/search-index.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SearchEntry[]) => setIndex(data))
      .catch(() => setIndex([]))
      .finally(() => {
        loading.current = false;
      });
  };

  const results = useMemo(() => (index ? search(index, query) : []), [index, query]);
  const open = query.trim().length > 0;

  const close = () => setQuery('');

  return (
    <div className={styles.search} role="search">
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            router.push(results[0].href);
            close();
          }
        }}
      >
        <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search"
          aria-label="Search the documentation"
          aria-controls={listId}
          value={query}
          onFocus={loadIndex}
          onChange={(e) => {
            loadIndex();
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
        />
      </form>

      {open && (
        <div id={listId} className={styles.searchResults} aria-live="polite">
          {!index ? (
            <p className={styles.searchEmpty}>Loading…</p>
          ) : results.length === 0 ? (
            <p className={styles.searchEmpty}>No results.</p>
          ) : (
            results.map((r) => (
              <Link key={r.href} href={r.href} className={styles.searchResult} onClick={close}>
                <span className={styles.searchResultTitle}>
                  {r.title}
                  {r.context && <span className={styles.searchResultContext}> › {r.context}</span>}
                </span>
                <span className={styles.searchResultSnippet}>{r.snippet}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
