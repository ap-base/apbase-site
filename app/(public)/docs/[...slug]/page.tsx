import DocPage from '../_lib/DocPage';
import { SLUG_TO_PATH, labelForSlug } from '../_lib/nav';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_PATH)
    .filter((s) => s !== 'overview')
    .map((s) => ({ slug: s.split('/') }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const joined = slug.join('/');
  return {
    title: `${labelForSlug(joined) ?? joined} — Docs`,
  };
}

export default async function DocSlugPage({ params }: Props) {
  const { slug } = await params;
  return <DocPage slug={slug.join('/')} />;
}
