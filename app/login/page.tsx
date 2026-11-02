import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Staff Sign In | Hartung Xoatings',
  robots: { index: false, follow: false },
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error === 'callback'
    ? 'This sign-in link is invalid or expired. Sign in below or request a new invitation from your administrator.'
    : error === 'signout'
      ? 'We could not finish signing out. Please try again.'
      : '';

  return (
    <section className="section wrap" style={{ maxWidth: 550 }}>
      <p className="eyebrow">Authorized staff</p>
      <h1>Staff Sign In</h1>
      <LoginForm initialMessage={message} />
    </section>
  );
}
