'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV, isGroup, isExternal, isLeaf, slugHref, type NavItem } from './_lib/nav';
import DocsSearch from './DocsSearch';
import styles from './docs.module.css';

function currentSlug(pathname: string): string {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/docs') return 'overview';
  return path.replace(/^\/docs\//, '');
}

function NavLink({ slug, label, active }: { slug: string; label: string; active: boolean }) {
  return (
    <Link
      href={slugHref(slug)}
      className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className={styles.sidebarLink} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Furo-style collapsible section: the label navigates, the chevron toggles.
function Collapsible({
  label,
  open,
  onToggle,
  head,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className={styles.sidebarGroupHead}>
        {head}
        <button
          type="button"
          className={styles.sidebarToggle}
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`}
          onClick={onToggle}
        >
          <Chevron open={open} />
        </button>
      </div>
      {open && <div className={styles.sidebarGroupLinks}>{children}</div>}
    </div>
  );
}

function NavItems({ items, current }: { items: NavItem[]; current: string }) {
  // Groups containing the current page start open; manual toggles override that.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const toggle = (label: string, open: boolean) => setToggled((t) => ({ ...t, [label]: !open }));

  return (
    <>
      {items.map((item) => {
        if (isExternal(item)) {
          if (!item.children) return <ExternalLink key={item.label} href={item.href} label={item.label} />;
          const open = toggled[item.label] ?? false;
          return (
            <Collapsible
              key={item.label}
              label={item.label}
              open={open}
              onToggle={() => toggle(item.label, open)}
              head={<ExternalLink href={item.href} label={item.label} />}
            >
              {item.children.map((child) => (
                <ExternalLink key={child.href} href={child.href} label={child.label} />
              ))}
            </Collapsible>
          );
        }
        if (isGroup(item)) {
          const containsCurrent = item.slug === current || item.children.some((c) => c.slug === current);
          const open = toggled[item.label] ?? containsCurrent;
          return (
            <Collapsible
              key={item.label}
              label={item.label}
              open={open}
              onToggle={() => toggle(item.label, open)}
              head={
                item.slug ? (
                  <NavLink slug={item.slug} label={item.label} active={item.slug === current} />
                ) : (
                  <span className={styles.sidebarLink}>{item.label}</span>
                )
              }
            >
              {item.children.map((child) => (
                <NavLink key={child.slug} slug={child.slug} label={child.label} active={child.slug === current} />
              ))}
            </Collapsible>
          );
        }
        if (isLeaf(item)) {
          return <NavLink key={item.slug} slug={item.slug} label={item.label} active={item.slug === current} />;
        }
        return null;
      })}
    </>
  );
}

export default function DocsNav() {
  return (
    <aside className={styles.sidebar}>
      <DocsSearch />
      <nav className={styles.sidebarNav} aria-label="Documentation sections">
        <NavItems items={NAV} current={currentSlug(usePathname())} />
      </nav>
      {/* Same badge as the Sphinx sidebar (sidebar/pypi-version.html): live version from PyPI via shields.io. */}
      <a
        href="https://pypi.org/project/apbase/"
        className={styles.sidebarVersion}
        aria-label="APbase Python package on PyPI"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external SVG badge */}
        <img
          src="https://img.shields.io/pypi/v/apbase.svg?label=Python%20%7C%20PyPI&cacheSeconds=3600"
          alt="APbase Python version on PyPI"
          height={20}
          decoding="async"
        />
      </a>
    </aside>
  );
}
