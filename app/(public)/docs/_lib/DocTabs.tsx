'use client';

import { useEffect } from 'react';

function activate(button: Element) {
  const list = button.closest('.doc-tab-list');
  if (!list) return;
  for (const tab of list.querySelectorAll('.doc-tab-button')) {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.setAttribute('tabindex', selected ? '0' : '-1');
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
    if (panel) panel.hidden = !selected;
  }
}

// Mirrors sphinx-design: tabs sharing a :sync: key switch together across the page.
export default function DocTabs() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest?.('.doc-tab-button');
      if (!button) return;
      const sync = button.getAttribute('data-sync');
      const targets = sync
        ? document.querySelectorAll(`.doc-tab-button[data-sync="${CSS.escape(sync)}"]`)
        : [button];
      targets.forEach(activate);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
