/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Fix Vercel build error: Cannot get final name for export 'encodeXML'
    serverComponentsExternalPackages: [
      'html-to-text',
      '@react-email/components',
      '@react-email/render',
      'entities',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/cong-cu',
        destination: '/tinh-toan',
        permanent: true,
      },
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
