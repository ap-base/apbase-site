import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import styles from './(public)/page.module.css';

// No canonical: the root layout's './' would otherwise point at the internal /_not-found/ route.
export const metadata: Metadata = {
  title: 'Página não encontrada',
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.kicker}>404</p>
        <h1>Página não encontrada</h1>
        <p className={styles.lead}>O endereço pode ter mudado ou não existe mais.</p>
        <div className={styles.ctaRow}>
          <Link href={ROUTES.HOME} className={styles.secondaryCta}>
            Voltar para o início
          </Link>
        </div>
      </div>
    </section>
  );
}
