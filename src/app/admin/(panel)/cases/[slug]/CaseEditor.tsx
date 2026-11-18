'use client';
// LEARN (lesson 8): one editor for both kinds of case study.
// Designed case studies keep their layout: blank fields show the designed text, filled fields replace it.
// New case studies use every field and are shown with the standard case study template.
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { saveCaseAction, deleteCaseAction, type ActionResult } from '../../../actions';
import type { CaseStudy, CaseFlowItem, CaseSection } from '@/lib/content/types';
import { ImageField, useUpload } from '../../ImageField';
import Icon from '../../Icon';
import s from '../../../admin.module.css';

const BRIEF: [keyof CaseStudy['brief'], string, string][] = [
  ['problem', 'The problem', 'What was wrong, and for whom?'], ['did', 'What I did', 'Your role and the main things you designed or built.'],
  ['result', 'The result', 'What changed. Numbers if you have them.'], ['trade', 'The trade-off', 'A hard choice you made, and why.'], ['next', 'What’s next', 'Where the project goes from here.'],
];

function move<T>(list: T[], i: number, d: number) { const j = i + d; if (j < 0 || j >= list.length) return list; const c = [...list]; [c[i], c[j]] = [c[j], c[i]]; return c; }

function FlowRow({ f, i, n, set, del, mv }: { f: CaseFlowItem; i: number; n: number; set: (f: CaseFlowItem) => void; del: () => void; mv: (d: number) => void }) {
  const { busy, upload } = useUpload();
  return (
    <div className={s.flowItem}>
      <label style={{ cursor: 'pointer' }} title="Choose an image">
        {f.img ? <img src={f.img} alt="" /> : <span className={s.noimg} style={{ display: 'grid', placeItems: 'center', color: '#64748b' }}>{busy ? 'Uploading…' : <Icon name="image" size={28} />}</span>}
        <input type="file" accept="image/*" hidden onChange={async (e) => { const u = await upload(e.target.files?.[0]); if (u) set({ ...f, img: u }); e.target.value = ''; }} />
      </label>
      <div className={s.stack} style={{ gap: 8 }}>
        <input className={s.input} value={f.t} onChange={(e) => set({ ...f, t: e.target.value })} placeholder={`Screen ${i + 1} name, e.g. “Sign up”`} />
        <textarea className={s.input} style={{ minHeight: 64 }} value={f.b ?? ''} onChange={(e) => set({ ...f, b: e.target.value })} placeholder="One or two lines about what this screen does (optional)" />
        <input className={s.input} value={f.img} onChange={(e) => set({ ...f, img: e.target.value })} placeholder="…or paste an image URL" />
      </div>
      <div className={s.tools}>
        <button type="button" className={s.iconBtn} onClick={() => mv(-1)} disabled={i === 0} aria-label="Move up"><Icon name="up" size={14} /></button>
        <button type="button" className={s.iconBtn} onClick={() => mv(1)} disabled={i === n - 1} aria-label="Move down"><Icon name="down" size={14} /></button>
        <button type="button" className={s.iconBtn} onClick={del} aria-label="Remove screen"><Icon name="trash" size={14} /></button>
      </div>
    </div>
  );
}

export default function CaseEditor({ c, isNew = false, designed }: { c: CaseStudy; isNew?: boolean; designed?: { title: string; kind: string; cover: string; desc: string } }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveCaseAction, null);
  const [v, setV] = useState<CaseStudy>({ ...c, card: { ...c.card, flow: c.card.flow ?? [] }, brief: { ...c.brief }, sections: c.sections ?? [] });
  const custom = !!v.card.custom;
  const card = (k: keyof CaseStudy['card'], val: unknown) => setV({ ...v, card: { ...v.card, [k]: val } });
  const flow = v.card.flow ?? [];
  const setFlow = (f: CaseFlowItem[]) => card('flow', f);
  const setSec = (list: CaseSection[]) => setV({ ...v, sections: list });

  return (
    <>
      <div className={s.head}>
        <div><Link href="/admin/cases" className={s.muted} style={{ textDecoration: 'none' }}>← Case studies</Link>
          <h1 className={s.h1} style={{ marginTop: 6 }}>{isNew ? 'New case study' : v.title || designed?.title}</h1>
          <p className={s.muted}>{custom ? 'Shown with the standard case study template.' : 'This page keeps its designed layout. Leave a field empty to keep the designed text.'}</p></div>
        {!isNew && <a href={`/work/${v.slug}`} target="_blank" className={`${s.btn} ${s.ghost}`}><Icon name="external" size={15} />View live</a>}
      </div>
      <form action={action} className={s.form}>
        <input type="hidden" name="case" value={JSON.stringify(v)} />
        <input type="hidden" name="originalSlug" value={isNew ? '' : c.slug} />
        <input type="hidden" name="slug" value={c.slug} />
        <div className={s.stack}>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <label className={s.field}>Title<input className={`${s.input} ${s.titleInput}`} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder={designed?.title ?? 'e.g. PayFlow: making bill payments feel safe'} /></label>
            <label className={s.field}>Intro (the first paragraph under the title)<textarea className={s.input} value={v.card.intro ?? ''} onChange={(e) => card('intro', e.target.value)} placeholder={designed ? 'Leave empty to keep the designed intro' : 'One or two sentences: what it is and who it’s for.'} /></label>
            {custom && <label className={s.field}>Type of project<input className={s.input} value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value })} placeholder="e.g. Fintech · Mobile app" /></label>}
          </div>

          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <h2 className={s.h2} style={{ margin: 0 }}>At a glance</h2>
            {BRIEF.map(([k, label, hint]) => (
              <label key={k} className={s.field}>{label}<textarea className={s.input} style={{ minHeight: 70 }} value={v.brief[k] ?? ''} onChange={(e) => setV({ ...v, brief: { ...v.brief, [k]: e.target.value } })} placeholder={designed ? 'Leave empty to keep the designed text' : hint} /></label>
            ))}
          </div>

          {custom && (
            <div className={`${s.card} ${s.pad} ${s.stack}`}>
              <h2 className={s.h2} style={{ margin: 0 }}>The story</h2>
              <p className={s.muted} style={{ margin: 0 }}>Sections in order. Each has a heading, text and an optional image. Leave a blank line between paragraphs.</p>
              {v.sections.map((sec, i) => (
                <div key={i} className={s.block}>
                  <div className={s.blockBar}><b style={{ fontSize: 12.5 }}>Section {i + 1}</b><span style={{ flex: 1 }} />
                    <button type="button" className={s.iconBtn} onClick={() => setSec(move(v.sections, i, -1))} aria-label="Move up"><Icon name="up" size={14} /></button>
                    <button type="button" className={s.iconBtn} onClick={() => setSec(move(v.sections, i, 1))} aria-label="Move down"><Icon name="down" size={14} /></button>
                    <button type="button" className={s.iconBtn} onClick={() => setSec(v.sections.filter((_, j) => j !== i))} aria-label="Remove section"><Icon name="trash" size={14} /></button></div>
                  <div className={s.stack} style={{ gap: 10 }}>
                    <input className={s.input} value={sec.h} onChange={(e) => setSec(v.sections.map((x, j) => (j === i ? { ...x, h: e.target.value } : x)))} placeholder="Heading, e.g. What we learned from users" />
                    <textarea className={s.input} style={{ minHeight: 120 }} value={sec.p} onChange={(e) => setSec(v.sections.map((x, j) => (j === i ? { ...x, p: e.target.value } : x)))} placeholder="Tell this part of the story." />
                    <ImageField label="image" value={sec.img ?? ''} onChange={(u) => setSec(v.sections.map((x, j) => (j === i ? { ...x, img: u } : x)))} />
                    {sec.img && <input className={s.input} value={sec.cap ?? ''} onChange={(e) => setSec(v.sections.map((x, j) => (j === i ? { ...x, cap: e.target.value } : x)))} placeholder="Image caption (optional)" />}
                  </div>
                </div>
              ))}
              <div><button type="button" className={`${s.btn} ${s.ghost} ${s.small}`} onClick={() => setSec([...v.sections, { h: '', p: '' }])}><Icon name="plus" size={14} />Add section</button></div>
            </div>
          )}

          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <h2 className={s.h2} style={{ margin: 0 }}>Design flow</h2>
            <p className={s.muted} style={{ margin: 0 }}>Screens in the order a user meets them. They appear as a step-by-step gallery on the case study{custom ? '' : ', under the designed page'}. Tap an image box to upload.</p>
            {flow.map((f, i) => <FlowRow key={i} f={f} i={i} n={flow.length} set={(nf) => setFlow(flow.map((x, j) => (j === i ? nf : x)))} del={() => setFlow(flow.filter((_, j) => j !== i))} mv={(d) => setFlow(move(flow, i, d))} />)}
            <div><button type="button" className={`${s.btn} ${s.ghost} ${s.small}`} onClick={() => setFlow([...flow, { img: '', t: '' }])}><Icon name="plus" size={14} />Add screen</button></div>
          </div>
        </div>

        <aside className={`${s.stack} ${s.sticky}`}>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            {custom && <label className={s.field}>Status<select className={s.input} value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as CaseStudy['status'] })}><option value="draft">Draft (hidden)</option><option value="published">Published (live)</option></select></label>}
            <button className={s.btn} disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
            {state?.message && <p className={`${s.msg} ${state.ok ? s.ok : s.err}`} role="status">{state.message}</p>}
          </div>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <b style={{ fontSize: 13 }}>Cover image</b>
            <p className={s.muted} style={{ margin: 0, fontSize: 12.5 }}>{custom ? 'Shown at the top of the page and on the Work page.' : 'Used when the case study is shared on LinkedIn, WhatsApp and other apps.'}</p>
            <ImageField label="cover" value={v.card.cover ?? ''} onChange={(u) => card('cover', u)} />
            {!v.card.cover && designed?.cover && <p className={s.muted} style={{ margin: 0, fontSize: 12 }}>Currently using the designed cover.</p>}
            <label className={s.field}>Search & sharing description<textarea className={s.input} style={{ minHeight: 80 }} value={v.card.desc ?? ''} onChange={(e) => card('desc', e.target.value)} placeholder={designed?.desc ?? 'One sentence shown on Google and in link previews.'} /></label>
            {custom && <label className={s.field}>Web address<input className={s.input} value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="made from the title" /><span className={s.muted} style={{ fontSize: 12, fontWeight: 500 }}>thenoskshade.netlify.app/work/{v.slug || '…'}</span></label>}
            {custom && <label className={s.check}><input type="checkbox" checked={!!v.card.hidden} onChange={(e) => card('hidden', e.target.checked)} />Hide from the Work page (link still works)</label>}
          </div>
          {!isNew && (
            <div className={`${s.card} ${s.pad}`}>
              <button type="submit" formAction={deleteCaseAction} className={`${s.btn} ${s.danger} ${s.small}`}
                onClick={(e) => { if (!confirm(custom ? 'Delete this case study? This can’t be undone.' : 'Undo all your edits and go back to the designed version?')) e.preventDefault(); }}>
                <Icon name="trash" size={14} />{custom ? 'Delete case study' : 'Reset to designed version'}</button>
            </div>
          )}
        </aside>
      </form>
    </>
  );
}
