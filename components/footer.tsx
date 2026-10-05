import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/config/site';
import styles from './footer.module.css';

const LINKS = [
  { label: 'Documentação', href: ROUTES.DOCS },
  { label: 'Pacotes', href: ROUTES.PACOTES },
  { label: 'GitHub', href: SITE_CONFIG.links.github },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.grid}>
          <div>
            <h3 className={styles.brand}>APbase</h3>
            <p className={styles.tagline}>Inteligência em processamento de dados para agricultura de precisão.</p>
          </div>

          <div>
            <h4 className={styles.heading}>Recursos</h4>
            <ul className={styles.links}>
              {LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>© 2026 APbase. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
