import type { Metadata } from 'next';
import { getSite } from '@/lib/content';
import ContactPage from '@/legacy/pages/Contact';

export const metadata: Metadata = {
  title: 'Contact Philip Nosike, product designer',
  description: 'Get in touch with Philip Nosike for product design, brand identity, design systems or a design consultation.',
  alternates: { canonical: '/contact' },
};

export default async function Page() {
  const { links } = await getSite();
  return <ContactPage ov={{ links }} />;
}
