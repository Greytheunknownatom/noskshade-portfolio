import type { Metadata } from 'next';
import AboutPage from '@/legacy/pages/About';

export const metadata: Metadata = {
  title: 'About Philip Nosike, product designer in Abuja',
  description: 'Philip Nosike is a product designer in Abuja, Nigeria, working across fintech, edtech and consumer products, brand identity and design systems.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <AboutPage />;
}
