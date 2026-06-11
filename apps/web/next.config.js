/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  basePath: '/whimsy',
  assetPrefix: '/whimsy/',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ['@whimsy/sandbox', '@whimsy/templates', '@whimsy/prompt'],
};
