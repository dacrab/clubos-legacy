import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

// Configuration for Supabase storage
const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;

const nextConfig: NextConfig = {
  
  // Configure remote image patterns for Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'xnxurkgwjgphvhtrqaiz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },

  // Webpack configuration
  webpack: (config, { dev }) => {
    // Suppress common build warnings
    config.ignoreWarnings = [
      { message: /Critical dependency|Required package/ },
      { message: /the request of a dependency is an expression/ }, 
      { message: /punycode/ },
    ];

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        minimize: true,
      };
    }

    return config;
  },
};

// Suppress Node.js runtime warnings
if (typeof process !== 'undefined') {
  process.removeAllListeners('warning');
}

// Enable bundle analyzer in analyze mode
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
