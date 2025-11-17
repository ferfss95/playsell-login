-- Função SQL para buscar o role do usuário sem depender das políticas RLS
-- Execute este script no Supabase SQL Editor para criar a função

-- Criar função que retorna o role do usuário usando SECURITY DEFINER
-- Isso contorna as políticas RLS que estão causando recursão infinita
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = user_id_param
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'leader' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Retorna o role do usuário sem depender das políticas RLS. Usa SECURITY DEFINER para contornar problemas de recursão infinita.';

