'use client';
import { useActionState } from 'react';
import { loginAction, type ActionResult } from '../actions';
import s from '../admin.module.css';

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  return (
    <form action={action} className={s.stack}>
      <label className={s.field}>Email<input className={s.input} name="email" type="email" autoComplete="username" required defaultValue="thenoskshade@gmail.com" /></label>
      <label className={s.field}>Password<input className={s.input} name="password" type="password" autoComplete="current-password" required /></label>
      {state?.message && <p className={`${s.msg} ${s.err}`} role="alert">{state.message}</p>}
      <button className={s.btn} disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
