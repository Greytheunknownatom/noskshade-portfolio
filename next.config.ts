import type { NextConfig } from 'next';

// LEARN (lesson 2): we use the proven caching model (static pages + on-demand revalidation) because
// Netlify fully supports it today. Cache Components ('use cache') can be switched on later.
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600],
    // Images uploaded from the admin live in Supabase Storage.
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
};

export default nextConfig;
