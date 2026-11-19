import 'server-only';
// LEARN (Autopilot): one adapter per platform, each using that platform's official API with YOUR token.
// Without a token the post simply becomes "ready for you to post" with a Copy button.
const env = (k: string) => process.env[k] || '';

export function canPublish(platform: string): boolean {
  if (platform === 'LinkedIn') return !!(env('LINKEDIN_TOKEN') && env('LINKEDIN_AUTHOR_URN'));
  if (platform === 'X') return !!env('X_TOKEN');
  if (platform === 'Instagram') return !!(env('IG_TOKEN') && env('IG_USER_ID'));
  return false; // TikTok needs video; Behance and Dribbble have no open posting API
}

async function ok(res: Response) {
  const t = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : {};
}

export async function publish(p: { platform: string; text: string; art_url?: string }): Promise<{ url: string }> {
  if (p.platform === 'LinkedIn') {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('LINKEDIN_TOKEN')}`, 'X-Restli-Protocol-Version': '2.0.0', 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: env('LINKEDIN_AUTHOR_URN'), lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text: p.text }, shareMediaCategory: 'NONE' } },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' } }),
    });
    const id = res.headers.get('x-restli-id');
    await ok(res);
    return { url: id ? `https://www.linkedin.com/feed/update/${id}` : '' };
  }
  if (p.platform === 'X') {
    const j = await ok(await fetch('https://api.x.com/2/tweets', { method: 'POST', headers: { Authorization: `Bearer ${env('X_TOKEN')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: p.text }) }));
    return { url: j.data?.id ? `https://x.com/i/web/status/${j.data.id}` : '' };
  }
  if (p.platform === 'Instagram') {
    if (!p.art_url) throw new Error('Instagram needs an image on the post');
    const base = `https://graph.facebook.com/v21.0/${env('IG_USER_ID')}`;
    const c = await ok(await fetch(`${base}/media`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: p.art_url, caption: p.text, access_token: env('IG_TOKEN') }) }));
    await ok(await fetch(`${base}/media_publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creation_id: c.id, access_token: env('IG_TOKEN') }) }));
    return { url: 'https://www.instagram.com/' };
  }
  throw new Error(`${p.platform} cannot be posted by API. Post it yourself.`);
}
