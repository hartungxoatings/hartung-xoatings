import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

export function supabasePublic() {
  const { url, key } = getSupabaseConfig();

  // Public portfolio reads always use the anonymous role, even for signed-in staff.
  // No visitor cookies or private CRM session are attached to this client.
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
