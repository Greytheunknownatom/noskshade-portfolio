import type { Metadata } from 'next';
import WorkPage from '@/legacy/pages/Work';

export const metadata: Metadata = {
  title: 'Product design case studies: fintech, edtech, web and brand',
  description: 'Case studies by Philip Nosike, a product designer in Abuja, Nigeria: fintech and edtech apps, dashboards, websites, brand identity and design systems.',
  alternates: { canonical: '/work' },
};

export default function Page() {
  return <WorkPage />;
}
