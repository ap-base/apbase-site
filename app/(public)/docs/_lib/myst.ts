import { fetchDoc } from './fetchDoc';
import { bibliographyHtml, citeLabel, parseBibtex, type BibEntry } from './bibtex';
import { API_REFERENCE_URL, PATH_TO_SLUG, slugHref } from './nav';

const ROLE_RE = /\{((?:py:)?(?:doc|cite|class|func|meth|mod|attr|data|exc|obj)|ref)\}`([^`]+)`/g;
const TOCTREE_RE = /^([`~]{3,})\{toctree\}[^\n]*\n([\s\S]*?)^\1\s*$/gm;
const TITLED_RE = /^(.*?)\s*<([^>]+)>$/;
const OPTION_RE = /^\s*:([\w-]+):\s*(.*)$/;
const BIB_PAGE = '/docs/methodology';

type Context = {
  path: string;
  titles: Map<string, string>;
  bib: Map<string, BibEntry>;
  bibEntries: BibEntry[];
};

function resolveDocPath(fromPath: string, target: string): string {
  const base = target.startsWith('/') ? [] : fromPath.split('/').slice(0, -1);
  const out: string[] = [];
  for (const part of [...base, ...target.replace(/^\//, '').split('/')]) {
    if (part === '..') out.pop();
    else if (part && part !== '.') out.push(part);
  }
  return out.join('/').replace(/\.md$/, '');
}

function docHref(docPath: string): string | null {
  if (docPath.startsWith('api/')) return `${API_REFERENCE_URL}/${docPath.slice(4)}.html`;
  const slug = PATH_TO_SLUG[docPath];
  return slug ? slugHref(slug) : null;
}

function splitTitled(body: string): { text: string | null; target: string } {
  const m = TITLED_RE.exec(body.trim());
  return m ? { text: m[1]!, target: m[2]! } : { text: null, target: body.trim() };
}

function docLink(ctx: Context, body: string): string {
  const { text, target } = splitTitled(body);
  const docPath = resolveDocPath(ctx.path, target);
  const label = text || ctx.titles.get(docPath) || docPath.split('/').pop()!;
  const href = docHref(docPath);
  return href ? `[${label}](${href})` : label;
}

function transformRoles(line: string, ctx: Context): string {
  return line.replace(ROLE_RE, (_, role: string, body: string) => {
    if (role === 'doc') return docLink(ctx, body);
    if (role === 'cite') {
      const cites = body.split(',').map((raw) => {
        const key = raw.trim();
        const entry = ctx.bib.get(key);
        return `[${entry ? citeLabel(entry) : key}](${BIB_PAGE}#ref-${key})`;
      });
      return `(${cites.join('; ')})`;
    }
    const { text, target } = splitTitled(body);
    if (role === 'ref') return text ?? target;
    const shown = text ?? (target.startsWith('~') ? target.split('.').pop()! : target);
    return '`' + shown + '`';
  });
}

function renderFencedDirective(name: string, arg: string, body: string[], ctx: Context): string[] {
  const options = new Map<string, string>();
  const content: string[] = [];
  for (const line of body) {
    const m = content.length === 0 ? OPTION_RE.exec(line) : null;
    if (m) options.set(m[1]!, m[2]!);
    else content.push(line);
  }

  switch (name) {
    case 'toctree': {
      if (options.has('hidden')) return [];
      const entries = content.map((l) => l.trim()).filter(Boolean);
      return ['', ...entries.map((entry) => `- ${docLink(ctx, entry)}`), ''];
    }
    case 'bibliography':
      return ctx.bibEntries.length ? ['', bibliographyHtml(ctx.bibEntries), ''] : [];
    case 'math':
      return ['$$', ...content, '$$'];
    case 'code-block':
    case 'code':
      return ['```' + arg, ...content, '```'];
    case 'eval-rst':
      return [];
    default:
      return [`:::${name}${arg ? `[${arg}]` : ''}`, ...content, ':::'];
  }
}

function collectDocTargets(markdown: string, path: string): Set<string> {
  const targets = new Set<string>();
  for (const [, role, body] of markdown.matchAll(ROLE_RE)) {
    if (role === 'doc') targets.add(resolveDocPath(path, splitTitled(body!).target));
  }
  for (const [, , body] of markdown.matchAll(TOCTREE_RE)) {
    for (const line of body!.split('\n')) {
      const entry = line.trim();
      if (entry && !entry.startsWith(':')) targets.add(resolveDocPath(path, splitTitled(entry).target));
    }
  }
  return targets;
}

async function fetchTitles(docPaths: Iterable<string>): Promise<Map<string, string>> {
  const pairs = await Promise.all(
    [...docPaths].map(async (docPath) => {
      const md = docPath in PATH_TO_SLUG ? await fetchDoc(`${docPath}.md`) : null;
      const title = md && /^#\s+(.+)$/m.exec(md)?.[1]?.trim();
      return title ? ([docPath, title] as const) : null;
    }),
  );
  return new Map(pairs.filter((p) => p !== null));
}

export async function mystToMarkdown(markdown: string, path: string): Promise<string> {
  const needsBib = /\{cite\}|\{bibliography\}/.test(markdown);
  const [titles, bibSource] = await Promise.all([
    fetchTitles(collectDocTargets(markdown, path)),
    needsBib ? fetchDoc('references.bib') : Promise.resolve(null),
  ]);
  const bibEntries = bibSource ? parseBibtex(bibSource) : [];
  const ctx: Context = { path, titles, bibEntries, bib: new Map(bibEntries.map((e) => [e.key, e])) };

  const lines = markdown.split('\n');
  const out: string[] = [];
  let codeFence: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (codeFence) {
      out.push(line);
      const trimmed = line.trim();
      if (trimmed.startsWith(codeFence) && /^[`~]+$/.test(trimmed)) codeFence = null;
      continue;
    }

    const fenced = /^\s*([`~]{3,})\{([\w:-]+)\}\s*(.*)$/.exec(line);
    if (fenced) {
      const [, marker, name, arg] = fenced;
      const body: string[] = [];
      while (++i < lines.length) {
        const trimmed = lines[i]!.trim();
        if (trimmed.startsWith(marker!) && /^[`~]+$/.test(trimmed)) break;
        body.push(lines[i]!);
      }
      out.push(...renderFencedDirective(name!, arg!, body, ctx));
      continue;
    }

    const code = /^\s*([`~]{3,})/.exec(line);
    if (code) {
      codeFence = code[1]!;
      out.push(line);
      continue;
    }

    const colon = /^(\s*)(:{3,})\{([\w:-]+)\}\s*(.*)$/.exec(line);
    if (colon) {
      const [, indent, colons, name, arg] = colon;
      const attrs: string[] = [];
      let option: RegExpExecArray | null;
      while (i + 1 < lines.length && (option = OPTION_RE.exec(lines[i + 1]!))) {
        attrs.push(`${option[1]}="${option[2]!.replace(/"/g, '')}"`);
        i++;
      }
      const label = arg ? `[${transformRoles(arg, ctx)}]` : '';
      out.push(`${indent}${colons}${name}${label}${attrs.length ? `{${attrs.join(' ')}}` : ''}`);
      continue;
    }

    out.push(transformRoles(line, ctx));
  }

  return out.join('\n');
}
