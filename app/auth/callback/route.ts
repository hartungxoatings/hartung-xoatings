import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  let destination = '/login?error=callback';

  if (code) {
    try {
      const db = await supabaseServer();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) destination = '/dashboard';
    } catch {
      // The URL can contain a one-time credential. Do not log it or raw errors.
    }
  }

  const response = NextResponse.redirect(new URL(destination, url.origin));
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
