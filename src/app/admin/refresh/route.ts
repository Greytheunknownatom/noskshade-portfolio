import { NextResponse, type NextRequest } from 'next/server';
import { refresh } from '@/lib/admin/auth';

// LEARN (lesson 6): pages can read cookies but can't change them, so when your 1-hour access token
// runs out, the admin layout sends you here. This route swaps the refresh token for a new access
// token, saves it, and sends you back where you were.
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/admin';
  const safe = next.startsWith('/admin') ? next : '/admin';
  const ok = await refresh();
  return NextResponse.redirect(new URL(ok ? safe : '/admin/login', req.url));
}
