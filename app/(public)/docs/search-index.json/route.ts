import { fetchDoc } from '../_lib/fetchDoc';
import { renderDoc } from '../_lib/renderDoc';
import { PAGE_ORDER, SLUG_TO_PATH } from '../_lib/nav';

export const dynamic = 'force-static';

export type SearchEntry = {
  slug: string;
  title: string;
  headings: { id: string; text: string }[];
  text: string;
};

const htmlToText = (html: string) =>
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
    .trim();

// Built once at export time; the sidebar search fetches it lazily on first focus.
export async function GET() {
  const entries = await Promise.all(
    PAGE_ORDER.map(async ({ slug, label }): Promise<SearchEntry | null> => {
      const path = SLUG_TO_PATH[slug];
      const markdown = path ? await fetchDoc(path) : null;
      if (!path || !markdown) return null;
      const { html, headings } = await renderDoc(markdown, path);
      return {
        slug,
        title: label,
        headings: headings.map(({ id, text }) => ({ id, text })),
        text: htmlToText(html),
      };
    }),
  );
  return Response.json(entries.filter(Boolean));
}
