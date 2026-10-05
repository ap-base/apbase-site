import { fetchDoc } from './fetchDoc';
import { renderDoc } from './renderDoc';
import { SLUG_TO_PATH } from './nav';

export const htmlToText = (html: string) =>
  html
    .replace(/<(script|style|annotation)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/ ([.,;:!?)])/g, '$1')
    .trim();

const MAX_DESCRIPTION = 160;

// Meta description from the page's first paragraph, cut at a word boundary.
export async function docDescription(slug: string): Promise<string | undefined> {
  const path = SLUG_TO_PATH[slug];
  const markdown = path ? await fetchDoc(path) : null;
  if (!path || !markdown) return undefined;
  const { html } = await renderDoc(markdown, path);
  const paragraph = /<p>([\s\S]*?)<\/p>/.exec(html)?.[1];
  const text = paragraph ? htmlToText(paragraph) : '';
  if (!text) return undefined;
  if (text.length <= MAX_DESCRIPTION) return text;
  return `${text.slice(0, MAX_DESCRIPTION - 1).replace(/\s+\S*$/, '').replace(/[\s.,;:]+$/, '')}…`;
}
