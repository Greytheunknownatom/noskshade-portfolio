import { notFound } from 'next/navigation';
import meta from '@/legacy/cases-meta.json';
import { requireSessionForPage } from '@/lib/admin/page';
import { listCasesAdmin } from '@/lib/admin/data';
import type { CaseStudy } from '@/lib/content/types';
import CaseEditor from './CaseEditor';

type Meta = { title: string; kind: string; cover: string; desc: string };
const M = meta as Record<string, Meta>;

export default async function EditCase({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireSessionForPage();
  const { slug } = await params;
  const blank = (o: Partial<CaseStudy>): CaseStudy => ({ slug: '', title: '', kind: '', sort_order: 100, status: 'draft', card: {}, brief: {}, sections: [], ...o });
  if (slug === 'new') return <CaseEditor c={blank({ card: { custom: true, flow: [] }, sections: [{ h: 'The challenge', p: '' }] })} isNew />;
  const row = (await listCasesAdmin(session)).find((r) => r.slug === slug);
  const m = M[slug];
  if (!row && !m) notFound();
  // A designed case study with no edits yet starts empty: blank fields keep the designed text.
  return <CaseEditor c={row ?? blank({ slug, status: 'published', kind: m.kind })} designed={m ? { title: m.title, kind: m.kind, cover: m.cover, desc: m.desc } : undefined} />;
}
