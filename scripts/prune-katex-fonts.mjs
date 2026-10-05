// Runs after `next build`: deletes the KaTeX fonts no exported page uses.
// Font usage is read from the rendered HTML, so a new formula that needs another
// font (e.g. \mathcal) keeps that font automatically on the next build.
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const FONTS = join(OUT, 'vendor/katex/fonts');
const css = readFileSync(join(OUT, 'vendor/katex/katex.min.css'), 'utf8');

// Every CSS rule that sets a KaTeX font: the classes its element needs -> font family.
const rules = [];
for (const [, selectors, family] of css.matchAll(/([^{}]+)\{[^{}]*font-family:\s*(KaTeX_\w+)/g)) {
  if (selectors.includes('@font-face')) continue;
  for (const selector of selectors.split(',')) {
    const last = selector.trim().split(/\s+/).pop();
    rules.push({ classes: last.match(/[\w-]+/g) ?? [], family });
  }
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const used = new Set();
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes('class="katex')) continue;
  for (const [, attr] of html.matchAll(/class="([^"]*)"/g)) {
    const classes = new Set(attr.split(/\s+/));
    for (const rule of rules) {
      if (rule.classes.every((c) => classes.has(c))) used.add(rule.family);
    }
  }
}

// Files are named KaTeX_<Family>-<Variant>.woff2; keep every variant of a used family.
let removed = 0;
for (const name of readdirSync(FONTS)) {
  if (!used.has(name.split('-')[0])) {
    rmSync(join(FONTS, name));
    removed++;
  }
}
console.log(`KaTeX fonts: kept ${[...used].sort().join(', ') || 'none'}; removed ${removed} unused files.`);
