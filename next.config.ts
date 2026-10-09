import type { NextConfig } from 'next';

// Set by the GitHub Pages workflow to "/<repo-name>"; empty for local dev and root-domain hosting.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The deck is fully client-side, so it builds to plain static files in ./out for GitHub Pages.
  output: 'export',
  basePath,
  // <img> is used directly (no next/image), but the export target requires the optimizer off anyway.
  images: { unoptimized: true },
  // The floating Next.js dev badge would sit on top of the deck controls.
  devIndicators: false,
  // three.js ships ESM that Next should transpile for the client bundle.
  transpilePackages: ['three'],
};

export default nextConfig;
