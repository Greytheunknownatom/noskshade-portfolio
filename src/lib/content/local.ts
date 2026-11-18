import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Post } from './types';

// LEARN (lesson 3): the local stand-in. It reads and writes plain JSON files in /content,
// shaped exactly like the Supabase tables, so the admin can be built and tested before the database exists.
const dir = path.join(process.cwd(), 'content');

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(dir, file), 'utf8')) as T;
}

export async function listPosts(): Promise<Post[]> {
  return readJson<Post[]>('posts.json');
}

export async function savePosts(posts: Post[]): Promise<void> {
  await fs.writeFile(path.join(dir, 'posts.json'), JSON.stringify(posts, null, 1) + '\n');
}

export async function readSettings<T>(key: string): Promise<T> {
  return readJson<T>(`${key}.json`);
}

export async function addEnquiry(e: unknown): Promise<void> {
  const file = path.join(dir, 'enquiries.json');
  const list = JSON.parse(await fs.readFile(file, 'utf8').catch(() => '[]')) as unknown[];
  list.unshift(e);
  await fs.writeFile(file, JSON.stringify(list, null, 1) + '\n');
}

export async function listCases(): Promise<import('./types').CaseStudy[]> {
  return readJson<import('./types').CaseStudy[]>('cases.json').catch(() => []);
}

export async function readSettingsOr<T>(key: string, fallback: T): Promise<T> {
  return readJson<T>(`${key}.json`).catch(() => fallback);
}
