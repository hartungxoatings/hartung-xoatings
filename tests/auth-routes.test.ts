import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseServer } from '../lib/supabase';
import { GET } from '../app/auth/callback/route';
import { signOut } from '../app/auth/actions';
import { redirect } from 'next/navigation';

vi.mock('../lib/supabase', () => ({ supabaseServer: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

describe('authentication routes', () => {
  const exchangeCodeForSession = vi.fn();
  const logout = vi.fn();

  beforeEach(() => {
    exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
    logout.mockReset().mockResolvedValue({ error: null });
    vi.mocked(supabaseServer).mockResolvedValue({
      auth: { exchangeCodeForSession, signOut: logout },
    } as unknown as Awaited<ReturnType<typeof supabaseServer>>);
  });

  it('accepts a valid code with a fixed same-origin destination', async () => {
    const response = await GET(new Request('https://example.com/auth/callback?code=synthetic-code&next=https://untrusted.example'));
    expect(exchangeCodeForSession).toHaveBeenCalledWith('synthetic-code');
    expect(response.headers.get('location')).toBe('https://example.com/dashboard');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
  });

  it('rejects a missing code without initializing Auth', async () => {
    const response = await GET(new Request('https://example.com/auth/callback'));
    expect(supabaseServer).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toBe('https://example.com/login?error=callback');
  });

  it('does not reflect an invalid code or raw error in the redirect', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: 'synthetic-private-error' } });
    const response = await GET(new Request('https://example.com/auth/callback?code=synthetic-expired-code'));
    expect(response.headers.get('location')).toBe('https://example.com/login?error=callback');
  });

  it('handles a callback exception with a safe sign-in error', async () => {
    exchangeCodeForSession.mockRejectedValue(new Error('synthetic-private-error'));
    const response = await GET(new Request('https://example.com/auth/callback?code=synthetic-code'));
    expect(response.headers.get('location')).toBe('https://example.com/login?error=callback');
  });

  it('signs out only the current browser session', async () => {
    await signOut();
    expect(logout).toHaveBeenCalledWith({ scope: 'local' });
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('does not report successful sign-out when Auth fails', async () => {
    logout.mockResolvedValue({ error: { message: 'synthetic-private-error' } });
    await signOut();
    expect(redirect).toHaveBeenCalledWith('/login?error=signout');
  });
});
