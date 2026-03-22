# 🔧 Instruções: Criar Função RPC para Buscar Role

## Problema

O sistema está tendo problemas para buscar o role do usuário devido a uma **recursão infinita nas políticas RLS** da tabela `user_roles`. Isso faz com que todos os usuários sejam redirecionados para `playsell-user` (role padrão 'user'), mesmo quando têm outros roles.

## Solução

Criar uma função SQL `SECURITY DEFINER` que contorna as políticas RLS e retorna o role corretamente.

## Passo a Passo

### 1. Acesse o Supabase Dashboard

1. Vá para [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 2. Execute o Script SQL

1. Abra o arquivo `create_get_user_role_function.sql` que está na raiz do projeto `playsell-login`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Ctrl+Enter`)

### 3. Verificar se a Função foi Criada

Execute esta query para verificar:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_user_role';
```

Se a função existir, você verá uma linha com os detalhes da função.

### 4. Testar a Função

Execute esta query para testar (substitua `USER_ID_AQUI` pelo ID de um usuário):

```sql
SELECT public.get_user_role('USER_ID_AQUI'::UUID);
```

Deve retornar o role do usuário: `admin`, `leader` ou `user`.

## Após Executar o Script

1. **Recarregue a página** do `playsell-login` (F5)
2. **Faça login novamente** com `ana.silva@empresa.com`
3. O sistema deve:
   - Buscar o role via função RPC (contorna políticas RLS)
   - Retornar o role correto (`leader`)
   - Redirecionar para `http://localhost:8082` (playsell-admin)

## Verificação

Após executar o script, verifique os logs no console do navegador ao fazer login. Você deve ver:

```
🔍 Buscando role para usuário ...
   Tentando primeiro via função RPC get_user_role (recomendado)...
✅ Role encontrado via RPC: leader
🔀 Redirecionando usuário com role 'leader' para: http://localhost:8082
```

## Problemas Comuns

### Erro: "function get_user_role does not exist"

**Solução**: Execute o script SQL novamente no Supabase SQL Editor.

### Erro: "permission denied for function get_user_role"

**Solução**: Verifique se a função foi criada com `SECURITY DEFINER`. Execute o script novamente.

### Ainda redireciona para playsell-user

**Solução**: 
1. Verifique se a função foi criada corretamente
2. Verifique se o usuário tem um role definido na tabela `user_roles`
3. Verifique os logs no console para ver qual erro está ocorrendo

## Script SQL Completo

O script está no arquivo `create_get_user_role_function.sql` na raiz do projeto `playsell-login`.

