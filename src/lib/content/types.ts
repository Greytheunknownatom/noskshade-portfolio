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

/** A case study row. Built-in case studies (custom: false) use it as overrides on top of their designed page;
 *  new ones (custom: true) are rendered from it with the standard case study template. */
export interface CaseFlowItem { img: string; t: string; b?: string }
export interface CaseSection { h: string; p: string; img?: string; cap?: string }
export interface CaseStudy {
  slug: string; title: string; kind: string; sort_order: number; status: 'draft' | 'published';
  card: { custom?: boolean; hidden?: boolean; intro?: string; desc?: string; cover?: string; flow?: CaseFlowItem[] };
  brief: { problem?: string; did?: string; result?: string; trade?: string; next?: string };
  sections: CaseSection[];
}
/** Homepage text and contact links, editable in the admin. Empty values keep the designed defaults. */
export interface SiteLinks { email?: string; whatsapp?: string; linkedin?: string; instagram?: string; tiktok?: string; behance?: string; dribbble?: string; x?: string; cv?: string }
export interface SiteHome { title?: string; intro?: string }
