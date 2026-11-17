import { notFound } from 'next/navigation';
import { requireSessionForPage } from '@/lib/admin/page';
import { listAllPosts } from '@/lib/admin/data';
import type { Post } from '@/lib/content/types';
import PostEditor from './PostEditor';

export default async function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireSessionForPage();
  const { slug } = await params;
  if (slug === 'new') {
    const blank: Post = { slug: '', title: '', excerpt: '', category: 'uiux', publishedAt: new Date().toISOString().slice(0, 10), readMinutes: 1,
      cover: '', coverAlt: '', tags: [], featured: false, status: 'draft', blocks: [['p', '']] };
    return <PostEditor post={blank} isNew />;
  }
  const post = (await listAllPosts(session)).find((p) => p.slug === slug);
  if (!post) notFound();
  return <PostEditor post={post} />;
}
