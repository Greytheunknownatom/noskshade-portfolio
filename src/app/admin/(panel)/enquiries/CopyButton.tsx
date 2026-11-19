'use client';
import { useState } from 'react';
import Icon from '../Icon';
import s from '../../admin.module.css';

// For replying from any email app: copies the address.
export default function CopyButton({ text, label = 'Copy email' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className={`${s.btn} ${s.ghost} ${s.small}`} onClick={() => navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); }).catch(() => {})}>
      <Icon name="copy" size={15} />{done ? 'Copied' : label}
    </button>
  );
}
