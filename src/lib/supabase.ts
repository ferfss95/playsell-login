import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criar cliente Supabase apenas se as variáveis estiverem configuradas
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      })
  : null;

