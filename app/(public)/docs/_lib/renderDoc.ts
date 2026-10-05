import { unified, type Plugin } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import type { Root as MdastRoot, Paragraph, PhrasingContent } from 'mdast';
import type { Root as HastRoot, Element, ElementContent } from 'hast';
import { mystToMarkdown } from './myst';

type DirectiveNode = {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  attributes?: Record<string, string | null | undefined> | null;
  children: (Paragraph & { data?: { directiveLabel?: boolean } })[];
  data?: Record<string, unknown>;
};

const ADMONITIONS = new Set(['note', 'warning', 'tip', 'important', 'caution', 'danger', 'hint', 'attention', 'error', 'seealso', 'admonition']);

const plainText = (nodes: PhrasingContent[]): string =>
  nodes.map((n) => ('value' in n ? n.value : 'children' in n ? plainText(n.children as PhrasingContent[]) : '')).join('');

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const remarkMystDirectives: Plugin<[], MdastRoot> = () => (tree) => {
  visit(tree, (node, index, parent) => {
    if (node.type !== 'containerDirective' && node.type !== 'leafDirective' && node.type !== 'textDirective') return;
    const d = node as unknown as DirectiveNode;

    // Accidental text/leaf directives (e.g. "ratio:value") go back to plain text.
    if (d.type !== 'containerDirective') {
      if (parent && index != null) {
        const colons = d.type === 'leafDirective' ? '::' : ':';
        const text = { type: 'text' as const, value: `${colons}${d.name}${plainText(d.children as unknown as PhrasingContent[])}` };
        parent.children.splice(index, 1, (d.type === 'leafDirective' ? { type: 'paragraph', children: [text] } : text) as never);
      }
      return SKIP;
    }

    const labelIndex = d.children.findIndex((c) => c.data?.directiveLabel);
    const label = labelIndex >= 0 ? plainText(d.children[labelIndex]!.children) : '';
    if (labelIndex >= 0) d.children.splice(labelIndex, 1);

    if (d.name === 'tab-set') {
      d.data = { hName: 'div', hProperties: { className: ['doc-tabs'] } };
    } else if (d.name === 'tab-item') {
      d.data = {
        hName: 'div',
        hProperties: { className: ['doc-tab'], dataLabel: label || 'Tab', dataSync: d.attributes?.sync ?? undefined },
      };
    } else if (ADMONITIONS.has(d.name)) {
      const title = label || (d.name === 'seealso' ? 'See also' : capitalize(d.name));
      d.children.unshift({
        type: 'paragraph',
        data: { hProperties: { className: ['admonition-title'] } },
        children: [{ type: 'text', value: title }],
      } as never);
      d.data = { hName: 'div', hProperties: { className: ['admonition', `admonition-${d.name}`] } };
    } else {
      d.data = { hName: 'div', hProperties: { className: [`directive-${d.name}`] } };
    }
  });
};

const hasClass = (node: Element, cls: string) => {
  const c = node.properties?.className;
  return Array.isArray(c) && c.includes(cls);
};

const rehypeTabs: Plugin<[], HastRoot> = () => (tree) => {
  let setIndex = 0;
  visit(tree, 'element', (node) => {
    if (!hasClass(node, 'doc-tabs')) return;
    const n = setIndex++;
    const panels = node.children.filter((c): c is Element => c.type === 'element' && hasClass(c, 'doc-tab'));

    const buttons: ElementContent[] = panels.map((panel, i) => {
      const selected = i === 0;
      const label = String(panel.properties.dataLabel ?? 'Tab');
      const sync = panel.properties.dataSync;
      panel.properties = {
        className: ['doc-tab'],
        role: 'tabpanel',
        id: `tab-panel-${n}-${i}`,
        ariaLabelledBy: [`tab-${n}-${i}`],
        hidden: !selected,
      };
      return {
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          role: 'tab',
          id: `tab-${n}-${i}`,
          className: ['doc-tab-button'],
          ariaControls: [`tab-panel-${n}-${i}`],
          ariaSelected: selected ? 'true' : 'false',
          tabIndex: selected ? 0 : -1,
          dataSync: sync,
        },
        children: [{ type: 'text', value: label }],
      };
    });

    node.children = [
      { type: 'element', tagName: 'div', properties: { role: 'tablist', className: ['doc-tab-list'] }, children: buttons },
      ...panels,
    ];
  });
};

export interface RenderedDoc {
  html: string;
  headings: { id: string; text: string; level: number }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

type TextLike = { type: string; value?: string; children?: TextLike[] };
const extractText = (node: TextLike): string =>
  node.type === 'text' ? node.value ?? '' : (node.children ?? []).map(extractText).join('');

export async function renderDoc(markdown: string, path: string): Promise<RenderedDoc> {
  const headings: RenderedDoc['headings'] = [];
  const usedIds = new Set<string>();

  const rehypeHeadings: Plugin<[], HastRoot> = () => (tree) => {
    visit(tree, 'element', (node) => {
      const level = /^h([1-3])$/.exec(node.tagName)?.[1];
      if (!level) return;
      const text = extractText(node);
      let id = slugify(text) || 'section';
      for (let k = 2; usedIds.has(id); k++) id = `${slugify(text)}-${k}`;
      usedIds.add(id);
      node.properties.id = id;
      if (level !== '1') headings.push({ id, text, level: Number(level) });
    });
  };

  const source = await mystToMarkdown(markdown, path);

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDirective)
    .use(remarkMystDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: false })
    .use(rehypeTabs)
    .use(rehypeHeadings)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return { html: String(result), headings };
}
