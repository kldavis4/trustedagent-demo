// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/.well-known/trusted-agent/jwks',
        destination: '/api/.well-known/trusted-agent/jwks',
      }
    ];
  },
};

module.exports = nextConfig;