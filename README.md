# PlaySell Login

Aplicação de autenticação centralizada para o ecossistema PlaySell.

## Estrutura

```
playsell-login/
├── src/
│   ├── components/
│   │   └── ui/          # Componentes UI reutilizáveis
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços (autenticação)
│   ├── types/           # Definições de tipos TypeScript
│   ├── utils/           # Funções utilitárias
│   ├── lib/             # Bibliotecas e configurações
│   └── styles/          # Estilos globais
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## Funcionalidades

- **Login**: Autenticação com email e senha
- **Esqueci minha senha**: Solicitação de redefinição de senha
- **Redefinição de senha**: Interface para definir nova senha
- **Redirecionamento automático**: Baseado no role do usuário (user/admin/gerenciador)

## Instalação

```bash
npm install
```

## Configuração

⚠️ **IMPORTANTE**: Configure as variáveis de ambiente antes de executar a aplicação!

### Passo 1: Criar arquivo `.env`

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Ou crie manualmente um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
# ou
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Passo 2: Obter credenciais do Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY` ou `VITE_SUPABASE_ANON_KEY`

### Passo 3: Reiniciar o servidor

Após criar/editar o arquivo `.env`, **reinicie o servidor**:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente:
npm run dev
```

⚠️ **Nota**: O servidor precisa ser reiniciado para carregar as variáveis de ambiente!

## Execução

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8082`

## Redirecionamento

Após o login bem-sucedido, o usuário é redirecionado automaticamente para:

- **user** → `http://localhost:8080` (playsell-user)
- **admin** → `http://localhost:8081` (playsell-admin)
- **gerenciador** → `http://localhost:8083` (playsell-gerenciador)

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form
- Zod (validação)
- Supabase (autenticação)
- Sonner (toast notifications)
- Lucide React (ícones)


