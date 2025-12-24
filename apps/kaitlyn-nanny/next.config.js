/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove standalone output - causes issues with Render static file serving
  // output: "standalone",
  webpack: (config, { dev }) => {
    // On Windows, webpack persistent caching can occasionally corrupt `.next` output
    // causing missing chunk/module errors (e.g. "Cannot find module './407.js'").
    // Disabling it for dev keeps local iteration stable.
    if (dev) config.cache = false;
    return config;
  }
};

module.exports = nextConfig;


