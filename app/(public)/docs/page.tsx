import DocPage from './_lib/DocPage';

export const metadata = {
  title: 'Documentation',
  description: 'Documentation for the APbase Python package for geospatial processing.',
};

export default function DocsIndexPage() {
  return <DocPage slug="overview" />;
}
