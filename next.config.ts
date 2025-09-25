import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

// Configuration for Supabase storage (guard empty URL)
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Configure remote image patterns for Supabase storage
  images: {
    remotePatterns: [
      // Conditionally include Supabase hostname if configured
      ...(supabaseHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHostname,
              port: '',
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: 'xnxurkgwjgphvhtrqaiz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow placeholder images used in UI fallbacks/demo content
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Webpack configuration
  webpack: (config, { dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        minimize: true,
      };
    }

    config.externals.push({
      '@node-rs/argon2': '@node-rs/argon2',
      '@node-rs/bcrypt': '@node-rs/bcrypt',
    });
    return config;
  },
};

// Enable bundle analyzer in analyze mode
export default withBundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
})(nextConfig);
