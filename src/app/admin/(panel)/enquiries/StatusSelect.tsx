'use client';
import s from '../../admin.module.css';

// Changing the status submits the surrounding form straight away.
export default function StatusSelect({ value }: { value: string }) {
  return (
    <select name="status" defaultValue={value} className={s.status} aria-label="Status" onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      <option value="new">New</option><option value="contacted">Contacted</option><option value="won">Won</option><option value="lost">Lost</option>
    </select>
  );
}
