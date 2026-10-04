import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://mnsorzmvnfkqsqbnjwgx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_1h-o1nD5KU_IgA-dIlBidw_8mgoPylK';

// Safe environment variable resolution
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
    return (window as any).__ENV__[key];
  }
  // Vite client env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    if (import.meta.env[key]) return import.meta.env[key];
  }
  return fallback;
};

export const SUPABASE_URL = getEnvVar('SUPABASE_URL', DEFAULT_SUPABASE_URL);
export const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('MY_SUPABASE') &&
  !SUPABASE_ANON_KEY.includes('MY_KEY')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlPreview?: string;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  return {
    isConfigured: isSupabaseConfigured,
    hasUrl: Boolean(SUPABASE_URL),
    hasAnonKey: Boolean(SUPABASE_ANON_KEY),
    urlPreview: SUPABASE_URL ? `${SUPABASE_URL.slice(0, 18)}...` : undefined,
  };
}
