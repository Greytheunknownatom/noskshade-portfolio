'use client';
// LEARN (lesson 6): one big object in state (the whole services settings), edited by small inputs.
// `upd` copies the object, changes one value by its path, and stores the copy. On save, the whole
// object goes to the server as JSON, exactly the shape the Services page reads.
import { useActionState, useState } from 'react';
import { saveServicesAction, type ActionResult } from '../../actions';
import type { ServicesData, Currency } from '@/lib/services';
import s from '../../admin.module.css';

type Path = (string | number)[];

export default function ServicesEditor({ initial }: { initial: ServicesData }) {
  const [d, setD] = useState<ServicesData>(initial);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveServicesAction, null);
  const upd = (path: Path, value: unknown) => setD((prev) => {
    const next = structuredClone(prev) as any;
    let o = next; path.slice(0, -1).forEach((k) => (o = o[k]));
    o[path[path.length - 1]] = value;
    return next;
  });
  const num = (v: string) => Math.max(0, Math.round(Number(v.replace(/[^\d.]/g, '')) || 0));

  // A plain function (not a component) so inputs keep focus while you type.
  const range = (path: Path, label: string) => {
    let r: any = d; path.forEach((k) => (r = r[k]));
    return (
      <div className={s.field}>{label}
        <div className={s.grid2}>
          {(['NGN', 'USD'] as Currency[]).map((c) => (
            <div key={c} className={s.row} style={{ flexWrap: 'nowrap', gap: 6 }}>
              <input className={s.input} inputMode="numeric" value={r[c][0]} onChange={(e) => upd([...path, c, 0], num(e.target.value))} aria-label={`${label} ${c} from`} />
              <span className={s.muted}>–</span>
              <input className={s.input} inputMode="numeric" value={r[c][1]} onChange={(e) => upd([...path, c, 1], num(e.target.value))} aria-label={`${label} ${c} to`} />
              <span className={s.muted} style={{ minWidth: 30 }}>{c === 'NGN' ? '₦' : '$'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form action={action}>
      <input type="hidden" name="services" value={JSON.stringify(d)} />
      <div className={s.head}>
        <div><h1 className={s.h1}>Services & prices</h1><p className={s.muted}>Everything on the Services page. Prices are whole numbers: 350000 means ₦350k.</p></div>
        <div className={s.row}>{state?.message && <span className={`${s.msg} ${state.ok ? s.ok : s.err}`}>{state.message}</span>}<button className={s.btn} disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button></div>
      </div>

      <div className={s.section}><h2 className={s.h2}>Plans</h2>
        <div className={s.stack}>
          {d.plans.map((p, i) => (
            <div key={p.id} className={`${s.card} ${s.pad} ${s.stack}`}>
              <div className={s.grid3}>
                <label className={s.field}>Name<input className={s.input} value={p.name} onChange={(e) => upd(['plans', i, 'name'], e.target.value)} /></label>
                <label className={s.field}>Tagline<input className={s.input} value={p.tagline} onChange={(e) => upd(['plans', i, 'tagline'], e.target.value)} /></label>
                <label className={s.field}>Timeline<input className={s.input} value={p.weeks} onChange={(e) => upd(['plans', i, 'weeks'], e.target.value)} /></label>
              </div>
              {range(['plans', i, 'priceRange'], 'Price range')}
              <label className={s.field}>What’s included (one per line)<textarea className={s.input} rows={5} value={p.includes.join('\n')} onChange={(e) => upd(['plans', i, 'includes'], e.target.value.split('\n'))} /></label>
              <div className={s.grid2}>
                <label className={s.field}>Best for<input className={s.input} value={p.bestFor} onChange={(e) => upd(['plans', i, 'bestFor'], e.target.value)} /></label>
                <label className={s.check} style={{ alignSelf: 'end', height: 44 }}><input type="checkbox" checked={!!p.popular} onChange={(e) => d.plans.forEach((_, j) => upd(['plans', j, 'popular'], j === i ? e.target.checked : false))} /> Show “Most chosen” badge</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.section}><h2 className={s.h2}>Design consultation</h2>
        <div className={`${s.card} ${s.pad} ${s.stack}`}>
          <div className={s.grid2}>
            <label className={s.field}>Name<input className={s.input} value={d.consultation.name} onChange={(e) => upd(['consultation', 'name'], e.target.value)} /></label>
            <label className={s.field}>Unit<input className={s.input} value={d.consultation.unit} onChange={(e) => upd(['consultation', 'unit'], e.target.value)} /></label>
          </div>
          {range(['consultation', 'priceRange'], 'Price range')}
          {d.consultation.addons.map((a, i) => (
            <div key={a.id} className={s.block}>
              <div className={s.grid2}>
                <label className={s.field}>Add-on<input className={s.input} value={a.name} onChange={(e) => upd(['consultation', 'addons', i, 'name'], e.target.value)} /></label>
                <label className={s.field}>Unit<input className={s.input} value={a.unit} onChange={(e) => upd(['consultation', 'addons', i, 'unit'], e.target.value)} /></label>
              </div>
              <label className={s.field} style={{ marginTop: 10 }}>Description<input className={s.input} value={a.desc} onChange={(e) => upd(['consultation', 'addons', i, 'desc'], e.target.value)} /></label>
              <div style={{ marginTop: 10 }}>{range(['consultation', 'addons', i, 'priceRange'], 'Price range')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.section}><h2 className={s.h2}>Estimator base prices</h2>
        <p className={s.muted} style={{ marginTop: -6 }}>The live estimate starts from these, then scales by size (Small ×1, Medium ×1.8, Large ×3) and adds extras.</p>
        <div className={`${s.card}`} style={{ overflowX: 'auto' }}>
          <table className={s.table}>
            <thead><tr><th>Item</th><th>₦ Naira</th><th>$ USD</th><th>Design weeks</th><th>Dev weeks</th></tr></thead>
            <tbody>
              {(['projectTypes', 'extras'] as const).flatMap((group) => d.estimator[group].map((x, i) => (
                <tr key={group + x.id}>
                  <td><b>{x.name}</b><div className={s.muted} style={{ fontSize: 12 }}>{group === 'extras' ? 'Extra' : 'Project type'}</div></td>
                  {(['NGN', 'USD'] as Currency[]).map((c) => <td key={c}><input className={s.input} style={{ width: 120 }} inputMode="numeric" value={x.price[c]} disabled={'devOnly' in x && !!x.devOnly} onChange={(e) => upd(['estimator', group, i, 'price', c], num(e.target.value))} /></td>)}
                  <td><input className={s.input} style={{ width: 80 }} inputMode="numeric" value={x.designWeeks} onChange={(e) => upd(['estimator', group, i, 'designWeeks'], num(e.target.value))} /></td>
                  <td><input className={s.input} style={{ width: 80 }} inputMode="numeric" value={x.devWeeks} onChange={(e) => upd(['estimator', group, i, 'devWeeks'], num(e.target.value))} /></td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <div className={`${s.card} ${s.pad} ${s.grid2}`} style={{ marginTop: 12 }}>
          <label className={s.field}>Development cost (× design price)<input className={s.input} inputMode="decimal" value={d.estimator.devRate} onChange={(e) => upd(['estimator', 'devRate'], Number(e.target.value) || 0)} /></label>
          <label className={s.field}>Range width (0.25 = ±12.5%)<input className={s.input} inputMode="decimal" value={d.estimator.rangeSpread} onChange={(e) => upd(['estimator', 'rangeSpread'], Number(e.target.value) || 0)} /></label>
        </div>
      </div>

      <div className={s.section}><h2 className={s.h2}>Contact buttons</h2>
        <div className={`${s.card} ${s.pad} ${s.grid3}`}>
          <label className={s.field}>Email<input className={s.input} value={d.contact.email} onChange={(e) => upd(['contact', 'email'], e.target.value)} /></label>
          <label className={s.field}>WhatsApp (+234…)<input className={s.input} value={d.contact.whatsapp} onChange={(e) => upd(['contact', 'whatsapp'], e.target.value)} /></label>
          <label className={s.field}>Calendar link (optional)<input className={s.input} value={d.contact.calendarUrl} onChange={(e) => upd(['contact', 'calendarUrl'], e.target.value)} placeholder="https://cal.com/…" /></label>
        </div>
      </div>
    </form>
  );
}
