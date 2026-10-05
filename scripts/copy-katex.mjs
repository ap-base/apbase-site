// Copies KaTeX's stylesheet + fonts to public/ so doc pages with math can link it on demand
// (a static CSS import would ship it on every docs page).
// Only .woff2 is shipped (every current browser supports it); the woff/ttf fallbacks are dropped.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const src = 'node_modules/katex/dist';
const dest = 'public/vendor/katex';

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
const css = readFileSync(`${src}/katex.min.css`, 'utf8').replace(/,url\(fonts\/[^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g, '');
writeFileSync(`${dest}/katex.min.css`, css);
cpSync(`${src}/fonts`, `${dest}/fonts`, { recursive: true, filter: (path) => !/\.(woff|ttf)$/.test(path) });
