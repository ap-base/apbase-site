'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/config/site';
import styles from './navbar.module.css';

const NAV_ITEMS = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Documentação', href: ROUTES.DOCS },
  { label: 'Pacotes', href: ROUTES.PACOTES },
];

// Same list for the desktop bar and the mobile menu; GitHub is the Python package repo (the only public repo for now).
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const handlers = onNavigate ? { onClick: onNavigate } : {};
  return (
    <ul className={styles.links}>
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={styles.link} {...handlers}>
            {item.label}
          </Link>
        </li>
      ))}
      <li>
        <a
          href={SITE_CONFIG.links.github}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
          {...handlers}
        >
          GitHub ↗
        </a>
      </li>
    </ul>
  );
}

// Desktop/mobile switch is pure CSS (navbar.module.css); JS only tracks the open menu.
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <Link href={ROUTES.HOME} className={styles.brand} aria-label="APbase — início">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG; next/image adds nothing in a static export */}
          <img src="/logo.svg" alt="APbase" width={710} height={171} className={styles.logo} />
        </Link>
        <NavLinks />
        <button
          type="button"
          className={styles.toggle}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className={styles.toggleBars} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div id="mobile-menu" className={styles.mobileMenu} data-open={menuOpen}>
        <NavLinks onNavigate={() => setMenuOpen(false)} />
      </div>
    </nav>
  );
}
