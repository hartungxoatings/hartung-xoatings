import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './supabase/config';

export async function supabaseServer() {
  const store = await cookies();
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        } catch {
          // Middleware persists refreshed cookies when Server Components cannot.
        }
      },
    },
  });
}
