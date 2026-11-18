import type { Metadata } from 'next';
import WorkPage from '@/legacy/pages/Work';
import { getSite, getCases } from '@/lib/content';
import { MoreWork } from '@/components/CaseExtras';
import StoryMode from '@/components/story/StoryMode';
import { buildExhibits } from '@/components/story/exhibits';

export const metadata: Metadata = {
  title: 'Product design case studies: fintech, edtech, web and brand',
  description: 'Case studies by Philip Nosike, a product designer in Abuja, Nigeria: fintech and edtech apps, dashboards, websites, brand identity and design systems.',
  alternates: { canonical: '/work' },
};

export default async function Page() {
  const [{ links }, cases] = await Promise.all([getSite(), getCases()]);
  return <><WorkPage ov={{ links }} /><MoreWork cases={cases} /><StoryMode exhibits={buildExhibits(cases)} /></>;
}
