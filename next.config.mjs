/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/store',
        destination: '/danh-muc/tat-ca',
        permanent: true,
      },
      {
        source: '/store/:slug',
        destination: '/san-pham/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
