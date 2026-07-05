/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const repo = 'RadioEgzamin';
const basePath = isDev ? '' : `/${repo}`;

const nextConfig = {
  reactStrictMode: true,
  ...(isDev ? {} : { output: 'export' }),
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  turbopack: {},
};

module.exports = nextConfig;
