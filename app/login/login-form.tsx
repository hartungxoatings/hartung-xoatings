'use client';

import { useState, type FormEvent } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function LoginForm({ initialMessage }: { initialMessage: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage('');

    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
      if (error) {
        setMessage('Unable to sign in. Check your email and password, then try again.');
        setPending(false);
        return;
      }
      // Full navigation waits for the browser to finish writing session cookies.
      window.location.assign('/dashboard');
    } catch {
      setMessage('Sign-in is temporarily unavailable. Please try again shortly.');
      setPending(false);
    }
  }

  return (
    <form className="card" onSubmit={submit} aria-busy={pending}>
      <label className="field">
        Email
        <input name="email" type="email" autoComplete="username" required value={email}
          onChange={event => setEmail(event.target.value)} disabled={pending} />
      </label>
      <label className="field">
        Password
        <input name="password" type="password" autoComplete="current-password" required value={password}
          onChange={event => setPassword(event.target.value)} disabled={pending} />
      </label>
      <button className="btn button" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
      <p role="status" aria-live="polite" className="muted">{message}</p>
    </form>
  );
}
