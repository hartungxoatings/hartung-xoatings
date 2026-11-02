import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { updateSession } from '../lib/supabase/middleware';

vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn() }));

describe('session refresh', () => {
  let cookieAdapter: CookieMethodsServer;
  const getUser = vi.fn();

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');
    getUser.mockReset().mockResolvedValue({ data: { user: null }, error: null });
    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      cookieAdapter = options.cookies as CookieMethodsServer;
      return { auth: { getUser } } as unknown as ReturnType<typeof createServerClient>;
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it('passes refreshed cookies to both server rendering and the browser', async () => {
    const request = new NextRequest('https://example.com/dashboard', {
      headers: { cookie: 'session=old-synthetic-value' },
    });
    getUser.mockImplementation(async () => {
      expect(await cookieAdapter.getAll!()).toContainEqual({ name: 'session', value: 'old-synthetic-value' });
      await cookieAdapter.setAll!([
        { name: 'session', value: 'new-synthetic-value', options: { path: '/', sameSite: 'lax' } },
      ], { 'Cache-Control': 'private, no-store' });
      return { data: { user: { id: 'synthetic-user' } }, error: null };
    });

    const response = await updateSession(request);
    expect(getUser).toHaveBeenCalledOnce();
    expect(request.cookies.get('session')?.value).toBe('new-synthetic-value');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('session=new-synthetic-value');
    expect(response.cookies.get('session')?.value).toBe('new-synthetic-value');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('preserves all cookies across multiple cookie updates', async () => {
    getUser.mockImplementation(async () => {
      await cookieAdapter.setAll!([{ name: 'first', value: 'one', options: {} }], {});
      await cookieAdapter.setAll!([{ name: 'second', value: 'two', options: {} }], {});
      return { data: { user: null }, error: null };
    });
    const response = await updateSession(new NextRequest('https://example.com/login'));
    expect(response.cookies.get('first')?.value).toBe('one');
    expect(response.cookies.get('second')?.value).toBe('two');
  });

  it('does not cache unauthenticated responses', async () => {
    const response = await updateSession(new NextRequest('https://example.com/login'));
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Pragma')).toBe('no-cache');
    expect(response.headers.get('Expires')).toBe('0');
  });

  it('allows safe page error handling when configuration is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    const response = await updateSession(new NextRequest('https://example.com/dashboard'));
    expect(createServerClient).not.toHaveBeenCalled();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('does not expose an authentication exception', async () => {
    getUser.mockRejectedValue(new Error('synthetic-private-error'));
    const response = await updateSession(new NextRequest('https://example.com/dashboard'));
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.text()).not.toContain('synthetic-private-error');
  });
});
