/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Chave secreta do projeto (ex.: sb_secret_…); equivalente operacional à service role nos fluxos novos */
  readonly VITE_SUPABASE_SECRET_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


