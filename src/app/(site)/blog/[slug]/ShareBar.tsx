'use client';
// LEARN (lesson 4): only the share buttons need the browser (clipboard, opening apps), so only they ship JavaScript.
// TODO(next step): port the Instagram / TikTok / LinkedIn share panel from the old site.
import React, { useState } from 'react';

export default function ShareBar({ url, title, liText }: { url: string; title: string; liText: string }) {
  const [copied, setCopied] = useState(false);
  const v = {
    hasSocial: false,
    openIg: () => {}, openTt: () => {},
    openLi: () => window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(liText || `${title}\n\n${url}`)}`, '_blank', 'noopener'),
    postShareX: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    copyPostLink: () => {
      const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
      navigator.clipboard?.writeText(url).then(done, done);
    },
    copyLabel: copied ? '✓ Link copied' : 'Copy link',
    copyBg: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.75)',
    copyBc: copied ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.08)',
    copyC: copied ? '#15803d' : '#111111',
  };
  return (
      <div data-blogshare="1" style={{ marginTop: '28px', padding: '18px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#111111' }}>Share this post</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button data-blogbtn="1" type="button" onClick={v.openLi} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', height: '38px', padding: '0 16px', borderRadius: '50px', background: '#0a66c2', border: 'none', fontSize: '12px', fontWeight: 800, color: '#ffffff' }}><svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffffff" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z"></path></svg>LinkedIn</button>
          <a href={v.postShareX} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', height: '38px', padding: '0 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 700, color: '#111111', textDecoration: 'none' }}>X</a>
          {v.hasSocial && (<><button data-blogbtn="1" type="button" onClick={v.openIg} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', height: '38px', padding: '0 16px', borderRadius: '50px', background: 'linear-gradient(135deg,#f58529,#dd2a7b 50%,#8134af)', border: 'none', fontSize: '12px', fontWeight: 800, color: '#ffffff' }}><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#fff" strokeWidth="2"></rect><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="2"></circle><circle cx="17.3" cy="6.7" r="1.3" fill="#fff"></circle></svg>Instagram</button>
          <button data-blogbtn="1" type="button" onClick={v.openTt} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', height: '38px', padding: '0 16px', borderRadius: '50px', background: '#111111', border: 'none', fontSize: '12px', fontWeight: 800, color: '#ffffff' }}><svg width="13" height="14" viewBox="0 0 24 26" aria-hidden="true"><path d="M17 1c.4 3.1 2.2 5 5 5.3v4c-1.9.1-3.6-.5-5-1.5v8.4c0 4.3-3.4 7.8-7.6 7.8S1.8 21.5 1.8 17.2c0-4.6 4-8.1 8.6-7.6v4.2c-.4-.1-.8-.2-1.2-.2-1.9 0-3.4 1.6-3.4 3.6s1.5 3.6 3.4 3.6c2 0 3.6-1.6 3.6-3.7V1h4.2Z" fill="#25F4EE" transform="translate(-0.6,-0.4)"></path><path d="M17 1c.4 3.1 2.2 5 5 5.3v4c-1.9.1-3.6-.5-5-1.5v8.4c0 4.3-3.4 7.8-7.6 7.8S1.8 21.5 1.8 17.2c0-4.6 4-8.1 8.6-7.6v4.2c-.4-.1-.8-.2-1.2-.2-1.9 0-3.4 1.6-3.4 3.6s1.5 3.6 3.4 3.6c2 0 3.6-1.6 3.6-3.7V1h4.2Z" fill="#FE2C55" transform="translate(0.6,0.4)"></path><path d="M17 1c.4 3.1 2.2 5 5 5.3v4c-1.9.1-3.6-.5-5-1.5v8.4c0 4.3-3.4 7.8-7.6 7.8S1.8 21.5 1.8 17.2c0-4.6 4-8.1 8.6-7.6v4.2c-.4-.1-.8-.2-1.2-.2-1.9 0-3.4 1.6-3.4 3.6s1.5 3.6 3.4 3.6c2 0 3.6-1.6 3.6-3.7V1h4.2Z" fill="#ffffff"></path></svg>TikTok</button></>)}
          <button data-blogbtn="1" type="button" onClick={v.copyPostLink} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px', borderRadius: '50px', background: v.copyBg, border: `1.5px solid ${v.copyBc}`, fontSize: '12px', fontWeight: 700, color: v.copyC, transition: 'all 0.2s ease' }}>{v.copyLabel}</button>
        </div>
      </div>

  );
}
