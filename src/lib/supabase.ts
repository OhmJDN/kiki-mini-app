import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL_FALLBACK = 'https://rfazxqrbxegubipqunta.supabase.co';
const SUPABASE_KEY_FALLBACK = 'sb_publishable_tCovXEBLFfbXl0AZXCIOiA_4zkwGf1-';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && !rawUrl.includes('your_supabase_url') && !rawUrl.includes('placeholder'))
  ? rawUrl
  : SUPABASE_URL_FALLBACK;

const supabaseAnonKey = (rawKey && !rawKey.includes('placeholder-anon-key'))
  ? rawKey
  : SUPABASE_KEY_FALLBACK;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


