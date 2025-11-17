import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Verificar se as variáveis estão sendo carregadas (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Configuração Supabase (playsell-login):', {
    url: supabaseUrl ? '✅ Configurado' : '❌ Não configurado',
    key: supabaseKey ? '✅ Configurado' : '❌ Não configurado',
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Presente' : '⚠️ Ausente',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Presente' : '⚠️ Ausente',
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
    console.error('📝 Crie um arquivo .env na raiz do projeto playsell-login com:');
    console.error(`
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
# ou
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
    `);
  }
}

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


