export function getSupabaseConfig() {
  // Keep direct property access so Next.js can inline browser configuration.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase configuration is unavailable.');
  }

  return { url, key };
}
