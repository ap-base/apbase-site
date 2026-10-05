/** @type {import('next').NextConfig} */

// Static export for GitHub Pages: no server, so no headers(), rewrites() or middleware.
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
