import HomePage from '@/legacy/pages/Home';
import { getSite } from '@/lib/content';

// The homepage uses the site-wide title and description from the root layout.
// Hero text and contact links can be changed in the admin (Homepage & links).
export default async function Home() {
  const { links, home } = await getSite();
  return <HomePage ov={{ card: home, links }} />;
}
