'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured = Boolean(url.startsWith('https://') && key && !url.includes('your-project'));

let client: SupabaseClient | null = null;
export const supabase = isSupabaseConfigured
  ? (() => {
      client ??= createBrowserClient(url, key);
      return client;
    })()
  : null;
