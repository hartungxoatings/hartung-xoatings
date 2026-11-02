import 'server-only';

import { supabaseServer } from './supabase';

export async function getStaffAccess() {
  try {
    const db = await supabaseServer();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { status: 'unauthenticated' as const };

    const { data: staff, error: staffError } = await db
      .from('staff_members').select('role').eq('user_id', user.id).maybeSingle();

    if (staffError) return { status: 'unavailable' as const };
    if (!staff) return { status: 'pending' as const };

    // Only a protected staff_members row grants access. User metadata is not trusted.
    return { status: 'authorized' as const, user, role: staff.role as string, db };
  } catch {
    // Never include credentials or database error details in the UI or logs.
    return { status: 'unavailable' as const };
  }
}
