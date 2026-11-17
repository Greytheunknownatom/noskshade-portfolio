import 'server-only';
import { redirect } from 'next/navigation';
import { getSession, canRefresh, type Session } from './auth';

// Pages call this to get the session (the layout has already checked it; this is a second guard).
export async function requireSessionForPage(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect((await canRefresh()) ? '/admin/refresh' : '/admin/login');
  return s;
}
