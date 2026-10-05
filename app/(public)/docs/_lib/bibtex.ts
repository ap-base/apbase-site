export type BibEntry = { key: string; type: string; fields: Record<string, string> };

const ACCENTS: Record<string, string> = {
  "'": '́',
  '`': '̀',
  '^': '̂',
  '"': '̈',
  '~': '̃',
  c: '̧',
};

function cleanLatex(value: string): string {
  return value
    .replace(/\{?\\(['`^"~]|c\s)\{?([A-Za-z])\}?\}?/g, (_, accent: string, letter: string) => letter + (ACCENTS[accent.trim()] ?? ''))
    .replace(/--/g, '–')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .normalize('NFC')
    .trim();
}

export function parseBibtex(src: string): BibEntry[] {
  const entries: BibEntry[] = [];
  const entryRe = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g;
  let match: RegExpExecArray | null;

  while ((match = entryRe.exec(src))) {
    let i = entryRe.lastIndex;
    const fields: Record<string, string> = {};

    while (i < src.length) {
      const endRe = /\s*\}/y;
      endRe.lastIndex = i;
      if (endRe.exec(src)) {
        i = endRe.lastIndex;
        break;
      }

      const fieldRe = /\s*(\w+)\s*=\s*/y;
      fieldRe.lastIndex = i;
      const field = fieldRe.exec(src);
      if (!field) break;
      i = fieldRe.lastIndex;

      let value = '';
      if (src[i] === '{') {
        const start = i;
        let depth = 0;
        for (; i < src.length; i++) {
          if (src[i] === '{') depth++;
          else if (src[i] === '}' && --depth === 0) {
            i++;
            break;
          }
        }
        value = src.slice(start + 1, i - 1);
      } else if (src[i] === '"') {
        const end = src.indexOf('"', i + 1);
        value = src.slice(i + 1, end);
        i = end + 1;
      } else {
        const bareRe = /[^,}\s]+/y;
        bareRe.lastIndex = i;
        value = bareRe.exec(src)?.[0] ?? '';
        i = bareRe.lastIndex;
      }
      fields[field[1]!.toLowerCase()] = cleanLatex(value);

      const sepRe = /\s*,?/y;
      sepRe.lastIndex = i;
      sepRe.exec(src);
      i = sepRe.lastIndex;
    }

    entryRe.lastIndex = i;
    entries.push({ key: match[2]!, type: match[1]!.toLowerCase(), fields });
  }
  return entries;
}

function authors(entry: BibEntry): string[] {
  return (entry.fields.author ?? '').split(/\s+and\s+/).filter(Boolean);
}

function lastName(author: string): string {
  return author.includes(',') ? author.split(',')[0]!.trim() : author.split(' ').pop()!;
}

export function citeLabel(entry: BibEntry): string {
  const names = authors(entry).map(lastName);
  const who =
    names.length === 0 ? entry.key : names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]} et al.`;
  return entry.fields.year ? `${who}, ${entry.fields.year}` : who!;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function bibliographyHtml(entries: BibEntry[]): string {
  const items = entries.map((entry) => {
    const f = entry.fields;
    const venue = [f.journal ?? f.booktitle, f.volume && (f.number ? `${f.volume}(${f.number})` : f.volume), f.pages, f.publisher]
      .filter(Boolean)
      .join(', ');
    const link = f.url ?? (f.doi ? `https://doi.org/${f.doi}` : '');
    const parts = [
      escapeHtml(authors(entry).join('; ')),
      f.year ? ` (${escapeHtml(f.year)}).` : '.',
      f.title ? ` <em>${escapeHtml(f.title)}</em>.` : '',
      venue ? ` ${escapeHtml(venue)}.` : '',
      link ? ` <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(f.doi ? `doi:${f.doi}` : link)}</a>` : '',
    ];
    return `<li id="ref-${escapeHtml(entry.key)}">${parts.join('')}</li>`;
  });
  return `<ol class="bibliography">${items.join('')}</ol>`;
}
