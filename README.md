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

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
# ou
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

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

