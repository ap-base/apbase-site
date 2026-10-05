import 'highlight.js/styles/github.css';
import DocsNav from './DocsNav';
import styles from './docs.module.css';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.docsLayout} lang="en">
      <DocsNav />
      <div className={styles.docsContent}>{children}</div>
    </div>
  );
}
