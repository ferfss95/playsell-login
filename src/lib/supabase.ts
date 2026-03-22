import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function isForbiddenBrowserKey(k: string | undefined): boolean {
  return typeof k === 'string' && k.trim().startsWith('sb_secret_');
}

function getBrowserSupabaseApiKey(): string | undefined {
  const pub = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const svc = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (pub && !isForbiddenBrowserKey(pub)) return pub;
  if (anon && !isForbiddenBrowserKey(anon)) return anon;
  if (svc && !isForbiddenBrowserKey(svc)) return svc;
  return undefined;
}

const supabaseKey = getBrowserSupabaseApiKey();

if (import.meta.env.DEV) {
  console.log('🔧 Configuração Supabase (playsell-login):', {
    url: supabaseUrl ? '✅ Configurado' : '❌ Não configurado',
    key: supabaseKey ? '✅ Configurado' : '❌ Não configurado',
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Presente' : '⚠️ Ausente',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Presente' : '⚠️ Ausente',
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
    console.error('📝 Use VITE_SUPABASE_PUBLISHABLE_KEY ou VITE_SUPABASE_ANON_KEY (sb_secret_* não funciona no navegador).');
  }
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;
