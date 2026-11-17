import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

// Captions and assets made for Instagram, TikTok and LinkedIn (built by the social asset pipeline).
export interface SocialEntry { slides: string[]; video: string; seconds: number; instagram: string; tiktok: string; url: string; pdf?: string; linkedin?: string }

let cache: Record<string, SocialEntry> | null = null;
export async function getSocial(slug: string): Promise<SocialEntry | undefined> {
  if (!cache) cache = JSON.parse(await fs.readFile(path.join(process.cwd(), 'public/assets/social/index.json'), 'utf8'));
  return cache![slug];
}
