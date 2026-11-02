import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseServer } from '../lib/supabase';
import { getStaffAccess } from '../lib/auth';

vi.mock('server-only', () => ({}));
vi.mock('../lib/supabase', () => ({ supabaseServer: vi.fn() }));

describe('private workspace access', () => {
  const getUser = vi.fn();
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({ data: { user: null }, error: null });
    maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
    vi.mocked(supabaseServer).mockResolvedValue({ auth: { getUser }, from } as unknown as Awaited<ReturnType<typeof supabaseServer>>);
  });

  it('denies an unsigned visitor before querying private tables', async () => {
    expect(await getStaffAccess()).toEqual({ status: 'unauthenticated' });
    expect(from).not.toHaveBeenCalled();
  });

  it('rejects a failed Auth verification even if a user object is present', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user' } }, error: { message: 'invalid session' } });
    expect(await getStaffAccess()).toEqual({ status: 'unauthenticated' });
    expect(from).not.toHaveBeenCalled();
  });

  it('does not grant access from user-editable owner metadata', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user', user_metadata: { role: 'owner' } } }, error: null });
    expect(await getStaffAccess()).toEqual({ status: 'pending' });
    expect(from).toHaveBeenCalledWith('staff_members');
    expect(eq).toHaveBeenCalledWith('user_id', 'synthetic-user');
  });

  it('grants access only after a successful staff membership lookup', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user' } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: 'editor' }, error: null });
    expect(await getStaffAccess()).toMatchObject({ status: 'authorized', role: 'editor', user: { id: 'synthetic-user' } });
  });

  it('fails closed when staff lookup returns an error', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user' } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: 'owner' }, error: { message: 'synthetic-private-error' } });
    expect(await getStaffAccess()).toEqual({ status: 'unavailable' });
  });

  it('fails closed without exposing a configuration or network exception', async () => {
    vi.mocked(supabaseServer).mockRejectedValue(new Error('synthetic-private-error'));
    expect(await getStaffAccess()).toEqual({ status: 'unavailable' });
  });
});
