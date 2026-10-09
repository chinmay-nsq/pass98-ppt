import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The floating Next.js dev badge would sit on top of the deck controls.
  devIndicators: false,
  // three.js ships ESM that Next should transpile for the client bundle.
  transpilePackages: ['three'],
};

export default nextConfig;
