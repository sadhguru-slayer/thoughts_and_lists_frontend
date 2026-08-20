/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/journal',
        destination: '/journals',
        permanent: true,
      },
      {
        source: '/journal/:path*',
        destination: '/journals/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
