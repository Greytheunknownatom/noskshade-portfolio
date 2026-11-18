import { requireSessionForPage } from '@/lib/admin/page';
import { getSiteAdmin } from '@/lib/admin/data';
import SiteForm from './SiteForm';

export default async function HomeLinks() {
  const session = await requireSessionForPage();
  return <SiteForm {...await getSiteAdmin(session)} />;
}
