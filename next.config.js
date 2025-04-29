/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc. modules on the client-side
      config.resolve.fallback = {
        fs: false,
        dns: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  }
}

module.exports = nextConfig