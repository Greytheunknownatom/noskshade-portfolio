import { Fragment } from 'react';
import { requireSessionForPage } from '@/lib/admin/page';
import { listEnquiries } from '@/lib/admin/data';
import { enquiryStatusAction } from '../../actions';
import StatusSelect from './StatusSelect';
import s from '../../admin.module.css';

const LABEL: Record<string, string> = { type: 'Project type', size: 'Size', extras: 'Extras', process: 'Process', team: 'Team' };

export default async function Enquiries() {
  const session = await requireSessionForPage();
  const list = await listEnquiries(session);
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Enquiries</h1><p className={s.muted}>Briefs sent from the Services page. Newest first.</p></div></div>
      {list.length === 0 && <div className={`${s.card} ${s.pad}`}><p className={s.muted}>No enquiries yet.</p></div>}
      <div className={s.stack}>
        {list.map((e) => {
          const d = e.data; const est = d.estimate;
          const phone = String(d.phone || '').replace(/[^\d+]/g, '');
          const wa = phone ? phone.replace(/^0/, '234').replace(/^\+/, '') : '';
          return (
            <div key={e.id} className={`${s.card} ${s.pad}`}>
              <div className={s.head} style={{ marginBottom: 0 }}>
                <div>
                  <b style={{ fontSize: 16 }}>{d.name}</b>{d.company && <span className={s.muted}> · {d.company}</span>}
                  <div className={s.muted}>{d.kind === 'consultation' ? 'Consultation' : 'Project'} · {new Date(e.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {est && <> · about {est.totalWeeks} weeks · {d.currency === 'USD' ? '$' : '₦'}{Math.round(est.low[d.currency] / (d.currency === 'USD' ? 1 : 1000)).toLocaleString()}{d.currency === 'USD' ? '' : 'k'}–{d.currency === 'USD' ? '$' : '₦'}{Math.round(est.high[d.currency] / (d.currency === 'USD' ? 1 : 1000)).toLocaleString()}{d.currency === 'USD' ? '' : 'k'}</>}
                  </div>
                </div>
                <div className={s.row}>
                  <a className={`${s.btn} ${s.small}`} href={`mailto:${d.email}?subject=${encodeURIComponent('Your brief for Noskshade Studio')}`}>Reply by email</a>
                  {wa && <a className={`${s.btn} ${s.ghost} ${s.small}`} href={`https://wa.me/${wa}`} target="_blank">WhatsApp</a>}
                  <form action={enquiryStatusAction}><input type="hidden" name="id" value={String(e.id)} /><StatusSelect value={e.status} /></form>
                </div>
              </div>
              <details className={s.details} style={{ marginTop: 12 }}>
                <summary>Full brief</summary>
                <dl className={s.kv}>
                  <dt>Email</dt><dd>{d.email}</dd>
                  {d.phone && <><dt>Phone</dt><dd>{d.phone}</dd></>}
                  {d.plan && <><dt>Plan picked</dt><dd>{d.plan}</dd></>}
                  {d.budget && <><dt>Budget</dt><dd>{d.budget}</dd></>}
                  {d.start && <><dt>Start</dt><dd>{d.start}</dd></>}
                  {d.selection && Object.entries(d.selection).filter(([, v]) => (Array.isArray(v) ? v.length : v)).map(([k, v]) => <Fragment key={k}><dt>{LABEL[k] ?? k}</dt><dd>{Array.isArray(v) ? v.join(', ') : String(v)}</dd></Fragment>)}
                  {d.addons?.length > 0 && <><dt>Add-ons</dt><dd>{d.addons.join(', ')}</dd></>}
                  <dt>Message</dt><dd>{d.message || '—'}</dd>
                </dl>
              </details>
            </div>
          );
        })}
      </div>
    </>
  );
}
