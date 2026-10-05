const GITHUB_RAW = 'https://raw.githubusercontent.com/ap-base/apbase-docs/main/docs';

// Every page re-reads the files it links to (for titles), so memoize per build worker.
const cache = new Map<string, Promise<string | null>>();

// Runs at build time only (static export); the deploy workflow rebuilds when apbase-docs changes.
export function fetchDoc(path: string): Promise<string | null> {
  let doc = cache.get(path);
  if (!doc) {
    doc = fetch(`${GITHUB_RAW}/${path}`, { cache: 'force-cache' }).then((res) => (res.ok ? res.text() : null));
    cache.set(path, doc);
  }
  return doc;
}
