import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '10001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lightsalmon-ibis-912038.hostingersite.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
