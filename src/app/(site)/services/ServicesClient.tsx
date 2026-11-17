'use client';
// LEARN (lesson 5): the interactive part of /services: currency toggle, plan picks, consultation
// add-ons, the live estimate and the onboarding form. All prices come in as props from the server.
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { submitEnquiry, type EnquiryResult } from './actions';
import { estimate, money, moneyRange, type Currency, type ServicesData } from '@/lib/services';
import s from './services.module.css';

type Kind = 'project' | 'consultation';
const ICONS: Record<string, string> = { spark: '✦', build: '◆', scale: '▲' };

export default function ServicesClient({ d }: { d: ServicesData }) {
  const [cur, setCur] = useState<Currency>('NGN');
  const [kind, setKind] = useState<Kind>('project');
  const [plan, setPlan] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('m');
  const [extras, setExtras] = useState<string[]>([]);
  const [team, setTeam] = useState('');
  const [process, setProcess] = useState(d.processes[0].id);
  const [showProcess, setShowProcess] = useState(d.processes[0].id);
  const [addons, setAddons] = useState<string[]>([]);
  const [state, action, pending] = useActionState<EnquiryResult | null, FormData>(submitEnquiry, null);
  const formRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const [formInView, setFormInView] = useState(false);
  const [asideInView, setAsideInView] = useState(false);
  // On phones the estimate card sits below the form, so a mini bar follows you while you pick options.
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.target === formRef.current) setFormInView(e.isIntersecting);
      if (e.target === asideRef.current) setAsideInView(e.isIntersecting);
    }));
    if (formRef.current) io.observe(formRef.current);
    if (asideRef.current) io.observe(asideRef.current);
    return () => io.disconnect();
  }, [state?.ok]);

  // Pre-select from the link that brought the visitor here (?type=webapp, ?plan=build, ?kind=consultation).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get('type'); if (t && d.estimator.projectTypes.some((x) => x.id === t)) setType(t);
    const p = q.get('plan'); if (p && d.plans.some((x) => x.id === p)) setPlan(p);
    if (q.get('kind') === 'consultation') setKind('consultation');
  }, [d]);

  // Remember the currency choice on this device (wrapped in try: storage can be blocked).
  useEffect(() => { try { const c = localStorage.getItem('nk-cur'); if (c === 'USD' || c === 'NGN') setCur(c); } catch {} }, []);
  const pickCur = (c: Currency) => { setCur(c); try { localStorage.setItem('nk-cur', c); } catch {} };

  const est = useMemo(() => estimate(d, { type, size, extras, process, team }), [d, type, size, extras, process, team]);
  const fmt = (n: number) => money(d, cur, n);
  const fmtR = (r: Record<Currency, [number, number]>) => moneyRange(d, cur, r[cur]);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const goForm = (k: Kind, p?: string) => {
    setKind(k);
    if (p) {
      setPlan(p);
      if (p === 'scale' && !extras.includes('dev')) setExtras([...extras, 'dev']);
      if (p === 'spark') setSize('s');
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const pickTeam = (id: string) => {
    setTeam(id);
    const t = d.estimator.teams.find((x) => x.id === id);
    if (t) { setProcess(t.process); setShowProcess(t.process); }
  };

  const maxWeeks = Math.max(16, est?.totalWeeks ?? 0);
  const devStart = est ? est.totalWeeks - est.devWeeks : 0;
  const suggested = d.plans.find((p) => p.id === (plan || est?.plan));
  const picked = d.consultation.addons.filter((a) => addons.includes(a.id));
  const consultLo = d.consultation.priceRange[cur][0] + picked.reduce((a, x) => a + x.priceRange[cur][0], 0);
  const consultHi = d.consultation.priceRange[cur][1] + picked.reduce((a, x) => a + x.priceRange[cur][1], 0);

  const waText = encodeURIComponent(`Hi Philip, I just sent a brief on your site: ${state?.summary ?? ''}`);
  const wa = d.contact.whatsapp.replace(/[^\d]/g, '');

  return (
    <div className={s.page}>
      <div className={s.glowA} /><div className={s.glowB} />
      <div className={s.wrap}>
        {/* Hero */}
        <div className={s.heroRow}>
          <div>
            <div className={s.eyebrow}><span className={s.dot} />Noskshade Studio</div>
            <h1 className={s.h1}>Design and build, <span className={s.grad}>from first idea to launch.</span></h1>
            <p className={s.lede}>Product design, design systems and development for founders and teams. Pick how you want to work, see a timeline and a price range in seconds, then send me your brief.</p>
          </div>
          <div className={`${s.toggle} ${s.glass}`} role="group" aria-label="Currency">
            {(Object.keys(d.currencies) as Currency[]).map((c) => (
              <button key={c} type="button" aria-pressed={cur === c} onClick={() => pickCur(c)}>{d.currencies[c].symbol} {d.currencies[c].label}</button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <section className={s.section} aria-labelledby="plans-h">
          <div className={s.secHead}>
            <div><div className={s.eyebrow}><span className={s.dot} />Plans</div><h2 id="plans-h" className={s.h2}>Three ways to work together</h2></div>
            <span className={s.note}>Typical ranges. Your estimate below narrows it to your scope.</span>
          </div>
          <div className={s.plans}>
            {d.plans.map((p) => (
              <article key={p.id} className={`${s.plan} ${s.glass} ${p.popular ? s.planPopular : ''}`}>
                {p.popular && <span className={s.badge}>Most chosen</span>}
                <div className={s.planName}><span className={s.planIcon} style={{ background: p.accent }} aria-hidden="true">{ICONS[p.id] ?? '●'}</span>{p.name}</div>
                <div className={s.planTag}>{p.tagline}</div>
                <div className={s.price}><span className={s.priceNum}>{fmtR(p.priceRange)}</span></div>
                <span className={s.weeks}>⏱ {p.weeks}</span>
                <ul className={s.list}>{p.includes.map((i) => <li key={i}>{i}</li>)}</ul>
                <div className={s.bestFor}>Best for: {p.bestFor}</div>
                <button type="button" className={`${s.btn} ${s.planCta} ${p.popular ? '' : s.btnGhost}`} onClick={() => goForm('project', p.id)}>Start with {p.name} →</button>
              </article>
            ))}
          </div>
        </section>

        {/* Consultation */}
        <section className={s.section} aria-labelledby="consult-h">
          <div className={`${s.consult} ${s.glass}`}>
            <div className={s.consultMain}>
              <div className={s.eyebrow} style={{ color: '#93c5fd' }}><span className={s.dot} />Special</div>
              <h2 id="consult-h" className={s.h2}>{d.consultation.name}</h2>
              <p className={s.sub}>{d.consultation.tagline}</p>
              <div className={s.consultPrice}><b>{fmtR(d.consultation.priceRange)}</b><span>{d.consultation.unit}</span></div>
              <ul className={s.list} style={{ marginTop: 18 }}>{d.consultation.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              <button type="button" className={s.btn} style={{ marginTop: 24, background: '#fff', color: '#111' }} onClick={() => goForm('consultation')}>Book a consultation →</button>
            </div>
            <div className={s.addons}>
              <div className={s.qLabel}>Add design augmentation</div>
              {d.consultation.addons.map((a) => (
                <button key={a.id} type="button" className={s.addon} aria-pressed={addons.includes(a.id)} onClick={() => setAddons(toggle(addons, a.id))}>
                  <span className={s.check} aria-hidden="true">{addons.includes(a.id) ? '✓' : ''}</span>
                  <span><span className={s.addonName}>{a.name}</span><span className={s.addonDesc} style={{ display: 'block' }}>{a.desc}</span><span className={s.addonPrice} style={{ display: 'block' }}>+ {fmtR(a.priceRange)} {a.unit}</span></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className={s.section} aria-labelledby="process-h">
          <div className={s.secHead}>
            <div><div className={s.eyebrow}><span className={s.dot} />How I deliver</div><h2 id="process-h" className={s.h2}>A process that fits your team</h2></div>
            <div className={s.tabs} role="group" aria-label="Delivery process">
              {d.processes.map((p) => <button key={p.id} type="button" className={s.tab} aria-pressed={showProcess === p.id} onClick={() => setShowProcess(p.id)}>{p.name}</button>)}
            </div>
          </div>
          {d.processes.filter((p) => p.id === showProcess).map((p) => (
            <div key={p.id}>
              <p className={s.fit}>{p.fit}</p>
              <ol className={s.steps} style={{ listStyle: 'none', padding: 0 }}>
                {p.steps.map((st, i) => (
                  <li key={st.name} className={`${s.step} ${s.glass}`}><div className={s.stepNum}>{i + 1}</div><div className={s.stepName}>{st.name}</div><div className={s.stepDesc}>{st.desc}</div></li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        {/* Onboarding */}
        <section className={s.section} aria-labelledby="start-h" id="start" ref={formRef} style={{ scrollMarginTop: 100 }}>
          <div className={s.secHead}>
            <div><div className={s.eyebrow}><span className={s.dot} />Start a project</div><h2 id="start-h" className={s.h2}>Tell me what you’re building</h2><p className={s.sub}>Takes about two minutes. You’ll see a timeline and price range as you go, and I reply within one working day.</p></div>
          </div>

          {state?.ok ? (
            <div className={`${s.panel} ${s.glass} ${s.done}`} role="status">
              <div className={s.doneIcon}>✓</div>
              <h3 className={s.h2} style={{ fontSize: 26 }}>Brief received. Thank you!</h3>
              <p className={s.sub} style={{ margin: '10px auto 0' }}>{state.summary ? `${state.summary}. ` : ''}I’ll read it and reply by email within one working day.</p>
              <div className={s.doneActions}>
                {d.contact.calendarUrl && <a className={s.btn} href={d.contact.calendarUrl} target="_blank" rel="noopener">Book a call now ↗</a>}
                {wa && <a className={`${s.btn} ${s.btnWa}`} href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener">Continue on WhatsApp ↗</a>}
                <a className={`${s.btn} ${s.btnGhost}`} href={`mailto:${d.contact.email}`}>Email me directly</a>
              </div>
            </div>
          ) : (
            <form action={action} className={s.onboard}>
              <div className={`${s.panel} ${s.glass}`}>
                <div className={`${s.kind} ${s.glass}`} role="group" aria-label="What do you need">
                  <button type="button" className={s.tab} aria-pressed={kind === 'project'} onClick={() => setKind('project')}>A project</button>
                  <button type="button" className={s.tab} aria-pressed={kind === 'consultation'} onClick={() => setKind('consultation')}>A consultation</button>
                </div>
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="currency" value={cur} />
                <input type="hidden" name="plan" value={plan} />

                {kind === 'project' ? (
                  <>
                    <div className={s.q}><span className={s.qLabel}>What are we making?</span>
                      <div className={s.chips}>{d.estimator.projectTypes.map((t) => (
                        <button key={t.id} type="button" className={s.chip} aria-pressed={type === t.id} onClick={() => setType(t.id)}>{t.name}<small>{t.desc}</small></button>))}</div>
                      <input type="hidden" name="type" value={type} />
                    </div>
                    <div className={s.q}><span className={s.qLabel}>How big is it?</span>
                      <div className={s.chips}>{d.estimator.sizes.map((z) => (
                        <button key={z.id} type="button" className={s.chip} aria-pressed={size === z.id} onClick={() => setSize(z.id)}>{z.name}<small>{z.desc}</small></button>))}</div>
                      <input type="hidden" name="size" value={size} />
                    </div>
                    <div className={s.q}><span className={s.qLabel}>Add to the scope</span>
                      <div className={s.chips}>{d.estimator.extras.map((x) => (
                        <button key={x.id} type="button" className={s.chip} aria-pressed={extras.includes(x.id)} onClick={() => setExtras(toggle(extras, x.id))}>{extras.includes(x.id) ? '✓ ' : '+ '}{x.name}</button>))}</div>
                      {extras.map((x) => <input key={x} type="hidden" name="extras" value={x} />)}
                    </div>
                    <div className={s.q}><span className={s.qLabel}>Your team</span>
                      <div className={s.chips}>{d.estimator.teams.map((t) => (
                        <button key={t.id} type="button" className={s.chip} aria-pressed={team === t.id} onClick={() => pickTeam(t.id)}>{t.name}</button>))}</div>
                      <input type="hidden" name="team" value={team} />
                    </div>
                    <div className={s.q}><span className={s.qLabel}>Delivery process</span>
                      <div className={s.chips}>{d.processes.map((p) => (
                        <button key={p.id} type="button" className={s.chip} aria-pressed={process === p.id} onClick={() => { setProcess(p.id); setShowProcess(p.id); }}>{p.name}<small>{p.fit}</small></button>))}</div>
                      <input type="hidden" name="process" value={process} />
                    </div>
                  </>
                ) : (
                  <div className={s.q}><span className={s.qLabel}>Add design augmentation (optional)</span>
                    <div className={s.chips}>{d.consultation.addons.map((a) => (
                      <button key={a.id} type="button" className={s.chip} aria-pressed={addons.includes(a.id)} onClick={() => setAddons(toggle(addons, a.id))}>{addons.includes(a.id) ? '✓ ' : '+ '}{a.name}<small>{fmtR(a.priceRange)} {a.unit}</small></button>))}</div>
                  </div>
                )}
                {addons.map((a) => <input key={a} type="hidden" name="addons" value={a} />)}

                <div className={s.q}><span className={s.qLabel}>About you</span>
                  <div className={s.grid2}>
                    <label className={s.field}>Your name *<input className={s.input} name="name" required autoComplete="name" /></label>
                    <label className={s.field}>Email *<input className={s.input} name="email" type="email" required autoComplete="email" /></label>
                    <label className={s.field}>Phone / WhatsApp<input className={s.input} name="phone" type="tel" autoComplete="tel" /></label>
                    <label className={s.field}>Company or project name<input className={s.input} name="company" autoComplete="organization" /></label>
                    {kind === 'project' && <>
                      <label className={s.field}>Budget<select className={s.input} name="budget" defaultValue={d.estimator.budgets[0]}>{d.estimator.budgets.map((b) => <option key={b}>{b}</option>)}</select></label>
                      <label className={s.field}>When do you want to start?<select className={s.input} name="start" defaultValue="This month"><option>As soon as possible</option><option>This month</option><option>In 1–3 months</option><option>Just exploring</option></select></label>
                    </>}
                  </div>
                </div>
                <div className={s.q}>
                  <label className={s.field}>{kind === 'project' ? 'Tell me about the project' : 'What would you like to talk about?'}
                    <textarea className={s.input} name="message" placeholder={kind === 'project' ? 'Who it’s for, the problem it solves, links to anything you already have…' : 'Your product, the question on your mind, links to designs…'} />
                  </label>
                </div>
                <label className={s.hp} aria-hidden="true">Leave this empty<input name="company_site" tabIndex={-1} autoComplete="off" /></label>
                {state?.error && <p className={s.error} role="alert">{state.error}</p>}
                <button type="submit" className={s.btn} style={{ marginTop: 24, width: '100%' }} disabled={pending || (kind === 'project' && !type)}>
                  {pending ? 'Sending…' : kind === 'project' && !type ? 'Pick what we’re making first' : 'Send my brief →'}
                </button>
              </div>

              {/* Live estimate */}
              <aside ref={asideRef} className={s.summary} aria-live="polite">
                {kind === 'project' ? (
                  <>
                    <div className={s.sumLabel}>Estimated timeline</div>
                    <div className={s.sumBig}>{est ? `${est.totalWeeks} weeks` : '—'}</div>
                    <div className={s.sumSmall}>{est ? 'From kickoff to handover.' : 'Pick what we’re making to see your estimate.'}</div>
                    <div className={s.bars}>
                      <div className={s.barRow}><span>Design</span><div className={s.track}><div className={`${s.fill} ${s.fillDesign}`} style={{ left: 0, width: `${est ? (est.designWeeks / maxWeeks) * 100 : 0}%` }} /></div><span className={s.barWeeks}>{est ? `${est.designWeeks} wk` : ''}</span></div>
                      <div className={s.barRow}><span>Development</span><div className={s.track}><div className={`${s.fill} ${s.fillDev}`} style={{ left: `${est ? (devStart / maxWeeks) * 100 : 0}%`, width: `${est ? (est.devWeeks / maxWeeks) * 100 : 0}%` }} /></div><span className={s.barWeeks}>{est ? (est.devWeeks ? `${est.devWeeks} wk` : 'not added') : ''}</span></div>
                    </div>
                    <div className={s.divider} />
                    <div className={s.sumLabel}>Estimated investment</div>
                    <div className={s.sumBig} style={{ fontSize: 28 }}>{est ? `${fmt(est.low[cur])} – ${fmt(est.high[cur])}` : '—'}</div>
                    {suggested && <div className={s.planPill}>Closest plan: {suggested.name}</div>}
                  </>
                ) : (
                  <>
                    <div className={s.sumLabel}>Your consultation</div>
                    <div className={s.sumBig} style={{ fontSize: 28 }}>{fmt(consultLo)} – {fmt(consultHi)}</div>
                    <div className={s.sumSmall}>1 hour consultation{addons.length ? ' + ' + d.consultation.addons.filter((a) => addons.includes(a.id)).map((a) => a.name).join(', ') : ''}</div>
                  </>
                )}
                <p className={s.disclaimer}>An estimate, not a quote. I confirm the final scope, timeline and price after we talk.</p>
              </aside>
            </form>
          )}
        </section>
      </div>
      {kind === 'project' && est && formInView && !asideInView && !state?.ok && (
        <div className={s.mini} aria-hidden="true">
          <span><b>{est.totalWeeks} weeks</b> · {fmt(est.low[cur])}–{fmt(est.high[cur])}</span>
          <span className={s.miniBars}><i style={{ width: `${(est.designWeeks / est.totalWeeks) * 100}%` }} /><i className={s.miniDev} style={{ width: `${(est.devWeeks / est.totalWeeks) * 100}%` }} /></span>
        </div>
      )}
    </div>
  );
}
