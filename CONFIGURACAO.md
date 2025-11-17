# 🔧 Configuração do Supabase - PlaySell Login

## ⚠️ Problema: "Supabase não configurado"

Se você está vendo a mensagem **"Supabase não configurado. Verifique as variáveis de ambiente."**, significa que o arquivo `.env` não está criado ou não contém as variáveis necessárias.

## ✅ Solução: Criar arquivo `.env`

### Passo 1: Criar arquivo `.env`

Crie um arquivo chamado `.env` na raiz do projeto `playsell-login` com o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://xjqvqyywvrshjxunyuaj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcXZxeXl3dnJzaGp4dW55dWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjc0NjEsImV4cCI6MjA3ODg0MzQ2MX0.uaE5Ph91i9uRwJT97pjBUj3kP9p1D0f_8SVj756fZ9Q
```

### Passo 2: Reiniciar o servidor

⚠️ **IMPORTANTE**: Após criar/editar o arquivo `.env`, você **DEVE reiniciar o servidor**:

1. Pare o servidor atual (pressione `Ctrl+C` no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

### Passo 3: Verificar

Após reiniciar, verifique o console do navegador. Você deve ver:

```
🔧 Configuração Supabase (playsell-login): {
  url: "✅ Configurado",
  key: "✅ Configurado",
  ...
}
```

Se ainda aparecer erro, verifique:

1. ✅ O arquivo `.env` está na raiz do projeto `playsell-login`?
2. ✅ O arquivo contém exatamente as variáveis acima?
3. ✅ Você reiniciou o servidor após criar o arquivo?
4. ✅ Não há espaços extras ou aspas nas variáveis?

## 📝 Variáveis Disponíveis

As seguintes variáveis de ambiente são suportadas:

- `VITE_SUPABASE_URL` - **OBRIGATÓRIO** - URL do projeto Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Chave pública/anônima (tem preferência)
- `VITE_SUPABASE_ANON_KEY` - Chave anônima (usada se PUBLISHABLE_KEY não estiver presente)

## 🔍 Verificar Configuração Atual

Se quiser verificar quais variáveis estão configuradas (apenas em desenvolvimento), abra o console do navegador (F12) e procure por:

```
🔧 Configuração Supabase (playsell-login)
```

## ❓ Ainda com problemas?

1. Certifique-se de que o arquivo `.env` está na raiz do projeto `playsell-login`
2. Certifique-se de que não há espaços antes ou depois do `=`
3. Certifique-se de que reiniciou o servidor após criar/editar o arquivo
4. Verifique o console do navegador para mensagens de erro adicionais

