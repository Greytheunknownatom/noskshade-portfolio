// LEARN (lesson 3): these types describe the content once, for both the local stand-in and Supabase.
// The pages only ever see these shapes, so swapping where the data comes from never touches a page.

export type CategoryId = 'uiux' | 'brand' | 'systems' | 'code';

/** One block of an article body, stored as a small array to keep the JSON compact.
 *  ['p', text] paragraph · ['h', text] heading · ['q', text] quote · ['l', items[]] list
 *  ['c', code] code · ['img', src, alt, caption?, maxWidth?] image
 *  ['cta', text, href, label, internalRoute?, 'blue'?] call-to-action box */
export type Block =
  | ['p' | 'h' | 'q' | 'c', string]
  | ['l', string[]]
  | ['img', string, string, string?, string?]
  | ['cta', string, string, string, string?, string?];

export type PostStatus = 'draft' | 'published';

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: CategoryId;
  publishedAt: string; // YYYY-MM-DD
  readMinutes: number;
  cover: string;
  coverAlt: string;
  tags: string[];
  featured: boolean;
  status: PostStatus;
  blocks: Block[];
}
