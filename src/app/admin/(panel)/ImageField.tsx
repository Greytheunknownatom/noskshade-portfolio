'use client';
// Shared image picker for the admin: upload to storage, or paste a URL.
import { useState, useRef } from 'react';
import { uploadImageAction } from '../actions';
import s from '../admin.module.css';

export function useUpload() {
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

export function ImageField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
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

