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
      {
        source: '/tri-thuc',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/tri-thuc/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
      {
        source: '/he-thong-dai-ly',
        destination: '/dai-ly',
        permanent: true,
      },
      {
        source: '/mang-luoi/dai-ly',
        destination: '/dai-ly',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
