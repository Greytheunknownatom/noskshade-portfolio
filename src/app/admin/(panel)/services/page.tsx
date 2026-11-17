import { requireSessionForPage } from '@/lib/admin/page';
import { getServicesAdmin } from '@/lib/admin/data';
import ServicesEditor from './ServicesEditor';

export default async function ServicesAdmin() {
  const session = await requireSessionForPage();
  return <ServicesEditor initial={await getServicesAdmin(session)} />;
}
