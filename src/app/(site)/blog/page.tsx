import type { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/content';
import { toCard, fmtMonth } from '@/lib/blog';
import BlogIndex from './BlogIndex';

export const metadata: Metadata = {
  title: { absolute: 'Design journal: product design, brand and design systems | Philip Nosike' },
  description: 'Notes from a product designer in Abuja, Nigeria on UI/UX, fintech and edtech products, brand identity, design systems and building what I design.',
  alternates: { canonical: '/blog' },
};

// LEARN (lesson 4): a server component. It runs on the server, reads the posts (from the cache),
// and sends finished HTML. No database code or keys ever reach the visitor's phone.
export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogIndex posts={posts.map(toCard)} latest={posts[0] ? fmtMonth(posts[0].publishedAt) : ''} />;
}
