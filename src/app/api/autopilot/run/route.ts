import { NextResponse } from 'next/server';
import { runAll } from '@/lib/autopilot/engine';
import { timingSafeEqual } from 'crypto';

// LEARN (Autopilot): the scheduled job calls this. It is protected by a secret (CRON_SECRET) that only
// you and GitHub know, and it runs with the server-only service key. Nothing public can reach it.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorised(req: Request) {
  const secret = process.env.CRON_SECRET || '';
  const given = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!secret || secret.length < 16 || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  try { return NextResponse.json({ ok: true, ...(await runAll({ service: true })) }); }
  catch (e: any) { return NextResponse.json({ ok: false, error: String(e.message || e) }, { status: 500 }); }
}
