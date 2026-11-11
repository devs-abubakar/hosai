import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components cannot write cookies; proxy refreshes the session.
        }
      },
    },
  });
}

export async function getAuthenticatedProfile() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('id, role, full_name, username').eq('id', user.id).single();
  if (profileError || !profile) return null;
  return { supabase, user, profile };
}
