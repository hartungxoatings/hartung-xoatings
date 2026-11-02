'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';

export async function signOut() {
  let failed = false;
  try {
    const db = await supabaseServer();
    const { error } = await db.auth.signOut({ scope: 'local' });
    failed = Boolean(error);
  } catch {
    failed = true;
  }
  redirect(failed ? '/login?error=signout' : '/login');
}
