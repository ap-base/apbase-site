'use client';

import { useEffect, useState } from 'react';
import styles from './CopyCommand.module.css';

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(command).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <div className={styles.command}>
      <code>
        <span className={styles.prompt} aria-hidden="true">$</span> {command}
      </code>
      <button
        type="button"
        className={styles.copy}
        onClick={copy}
        aria-label={copied ? 'Comando copiado' : 'Copiar comando'}
        title={copied ? 'Copiado' : 'Copiar'}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
      </button>
      <span className={styles.srOnly} aria-live="polite">
        {copied ? 'Comando copiado' : ''}
      </span>
    </div>
  );
}
