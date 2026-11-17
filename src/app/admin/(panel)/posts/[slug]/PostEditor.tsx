'use client';
// LEARN (lesson 6): the post editor. The article body is a list of blocks (paragraph, heading,
// quote, list, image, code, call-to-action) kept in React state. On save, the list is sent as JSON
// in a hidden form field, and the Server Action stores it exactly as the public page reads it.
import { useActionState, useState, useRef } from 'react';
import Link from 'next/link';
import { savePostAction, deletePostAction, uploadImageAction, type ActionResult } from '../../../actions';
import { CATS } from '@/lib/blog';
import type { Block, Post } from '@/lib/content/types';
import s from '../../../admin.module.css';

type Kind = 'p' | 'h' | 'q' | 'l' | 'img' | 'c' | 'cta';
const LABELS: Record<Kind, string> = { p: 'Paragraph', h: 'Heading', q: 'Quote', l: 'List', img: 'Image', c: 'Code', cta: 'Call to action' };
const blank = (k: Kind): Block => (k === 'l' ? ['l', ['']] : k === 'img' ? ['img', '', '', ''] : k === 'cta' ? ['cta', '', '', 'Learn more →', '', ''] : [k, ''] as Block);

function useUpload() {
  const [busy, setBusy] = useState(false);
  const upload = async (file: File | undefined): Promise<string | null> => {
    if (!file) return null;
    setBusy(true);
    const fd = new FormData(); fd.append('file', file);
    const r = await uploadImageAction(fd);
    setBusy(false);
    if (r.error) { alert(r.error); return null; }
    return r.url ?? null;
  };
  return { busy, upload };
}

function ImageField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const { busy, upload } = useUpload();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={s.stack} style={{ gap: 8 }}>
      {value ? <img src={value} alt="" className={s.cover} /> : <div className={s.cover} />}
      <div className={s.row}>
        <button type="button" className={`${s.btn} ${s.ghost} ${s.small}`} onClick={() => ref.current?.click()} disabled={busy}>{busy ? 'Uploading…' : value ? 'Replace image' : `Upload ${label}`}</button>
        {value && <button type="button" className={`${s.btn} ${s.ghost} ${s.small}`} onClick={() => onChange('')}>Remove</button>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => { const u = await upload(e.target.files?.[0]); if (u) onChange(u); e.target.value = ''; }} />
      <input className={s.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL / path" />
    </div>
  );
}

export default function PostEditor({ post, isNew = false }: { post: Post; isNew?: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(savePostAction, null);
  const [blocks, setBlocks] = useState<Block[]>(post.blocks.length ? post.blocks : [['p', '']]);
  const [cover, setCover] = useState(post.cover);
  const set = (i: number, b: Block) => setBlocks(blocks.map((x, j) => (j === i ? b : x)));
  const move = (i: number, d: number) => { const n = [...blocks]; const [b] = n.splice(i, 1); n.splice(i + d, 0, b); setBlocks(n); };
  const remove = (i: number) => setBlocks(blocks.filter((_, j) => j !== i));
  const insert = (i: number, k: Kind) => { const n = [...blocks]; n.splice(i + 1, 0, blank(k)); setBlocks(n); };

  return (
    <>
      <div className={s.head}>
        <div><Link href="/admin/posts" className={s.muted} style={{ textDecoration: 'none' }}>← All posts</Link><h1 className={s.h1} style={{ marginTop: 6 }}>{isNew ? 'New post' : 'Edit post'}</h1></div>
        {!isNew && post.status === 'published' && <a href={`/blog/${post.slug}`} target="_blank" className={`${s.btn} ${s.ghost}`}>View live ↗</a>}
      </div>
      <form action={action} className={s.form}>
        <input type="hidden" name="originalSlug" value={isNew ? '' : post.slug} />
        <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
        <input type="hidden" name="cover" value={cover} />

        <div className={s.stack}>
          <input className={`${s.input} ${s.titleInput}`} name="title" defaultValue={post.title} placeholder="Post title" required aria-label="Title" />
          <label className={s.field}>Short summary (shows on cards and Google)<textarea className={s.input} name="excerpt" defaultValue={post.excerpt} rows={3} /></label>

          <div className={s.h2} style={{ marginTop: 8 }}>Article</div>
          {blocks.map((b, i) => {
            const k = b[0] as Kind;
            return (
              <div key={i} className={s.block}>
                <div className={s.blockBar}>
                  <select className={s.blockType} value={k} onChange={(e) => set(i, blank(e.target.value as Kind))} aria-label="Block type">
                    {(Object.keys(LABELS) as Kind[]).map((x) => <option key={x} value={x}>{LABELS[x]}</option>)}
                  </select>
                  <span style={{ flex: 1 }} />
                  <button type="button" className={s.iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" className={s.iconBtn} onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className={s.iconBtn} onClick={() => remove(i)} aria-label="Delete block">✕</button>
                </div>
                {(k === 'p' || k === 'q' || k === 'c') && <textarea className={s.input} value={b[1] as string} onChange={(e) => set(i, [k, e.target.value] as Block)} rows={k === 'p' ? 3 : 2} style={k === 'c' ? { fontFamily: 'monospace' } : undefined} />}
                {k === 'h' && <input className={s.input} style={{ fontWeight: 800 }} value={b[1] as string} onChange={(e) => set(i, ['h', e.target.value])} />}
                {k === 'l' && <textarea className={s.input} value={(b[1] as string[]).join('\n')} onChange={(e) => set(i, ['l', e.target.value.split('\n')])} rows={4} placeholder="One item per line" />}
                {k === 'img' && (() => { const [, src, alt, cap, maxw] = b as ['img', string, string, string?, string?]; return (
                  <div className={s.stack} style={{ gap: 10 }}>
                    <ImageField value={src} label="image" onChange={(v) => set(i, ['img', v, alt, cap, maxw])} />
                    <div className={s.grid2}>
                      <input className={s.input} value={alt} onChange={(e) => set(i, ['img', src, e.target.value, cap, maxw])} placeholder="Describe the image (for screen readers)" />
                      <input className={s.input} value={cap ?? ''} onChange={(e) => set(i, ['img', src, alt, e.target.value, maxw])} placeholder="Caption (optional)" />
                    </div>
                  </div>); })()}
                {k === 'cta' && (() => { const [, text, href, label, route, color] = b as ['cta', string, string, string, string?, string?]; return (
                  <div className={s.stack} style={{ gap: 10 }}>
                    <input className={s.input} value={text} onChange={(e) => set(i, ['cta', e.target.value, href, label, route, color])} placeholder="Message, e.g. Want the full design story?" />
                    <div className={s.grid3}>
                      <input className={s.input} value={label} onChange={(e) => set(i, ['cta', text, href, e.target.value, route, color])} placeholder="Button text" />
                      <input className={s.input} value={route ? `/${route.replace('case-', 'work/').replace('post-', 'blog/')}` : href} onChange={(e) => { const v = e.target.value; set(i, ['cta', text, v, label, v.startsWith('/') ? v.replace(/^\/work\//, 'case-').replace(/^\/blog\//, 'post-').replace(/^\//, '') : '', color]); }} placeholder="Link (/work/heatbud or https://…)" />
                      <select className={s.input} value={color === 'blue' ? 'blue' : 'orange'} onChange={(e) => set(i, ['cta', text, href, label, route, e.target.value === 'blue' ? 'blue' : ''])}><option value="orange">Orange</option><option value="blue">Blue</option></select>
                    </div>
                  </div>); })()}
                <div className={s.addRow} style={{ marginTop: 10 }}>
                  <span className={s.muted} style={{ fontSize: 12 }}>Add below:</span>
                  {(['p', 'h', 'img', 'q', 'l', 'cta'] as Kind[]).map((x) => <button key={x} type="button" className={`${s.btn} ${s.ghost} ${s.small}`} style={{ height: 28 }} onClick={() => insert(i, x)}>+ {LABELS[x]}</button>)}
                </div>
              </div>
            );
          })}
          {blocks.length === 0 && <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => setBlocks([['p', '']])}>+ Add a paragraph</button>}
        </div>

        <div className={`${s.stack} ${s.sticky}`}>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <label className={s.field}>Status
              <select className={s.input} name="status" defaultValue={post.status}><option value="draft">Draft (hidden)</option><option value="published">Published (live)</option></select>
            </label>
            {state?.message && <p className={`${s.msg} ${state.ok ? s.ok : s.err}`} role="status">{state.message}</p>}
            <button className={s.btn} disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
          </div>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <div className={s.field}>Cover image</div>
            <ImageField value={cover} label="cover" onChange={setCover} />
            <label className={s.field}>Cover description<input className={s.input} name="coverAlt" defaultValue={post.coverAlt} /></label>
          </div>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <label className={s.field}>Topic
              <select className={s.input} name="category" defaultValue={post.category}>{Object.entries(CATS).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}</select>
            </label>
            <label className={s.field}>Publish date<input className={s.input} type="date" name="publishedAt" defaultValue={post.publishedAt} /></label>
            <label className={s.field}>Tags (comma separated)<input className={s.input} name="tags" defaultValue={post.tags.join(', ')} /></label>
            <label className={s.field}>Web address<input className={s.input} name="slug" defaultValue={post.slug} placeholder="made from the title if empty" /></label>
            <label className={s.check}><input type="checkbox" name="featured" defaultChecked={post.featured} /> Feature at the top of the journal</label>
          </div>
          {!isNew && (
            <button formAction={deletePostAction} formNoValidate className={`${s.btn} ${s.danger}`} style={{ width: '100%' }}
              onClick={(e) => { if (!confirm('Delete this post for good?')) e.preventDefault(); }}>Delete post</button>
          )}
        </div>
      </form>
    </>
  );
}
