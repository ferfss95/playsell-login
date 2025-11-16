import { supabase } from '@/lib/supabase';
import type { UserRole, LoginResponse, PasswordResetResponse } from '@/types';

/**
 * Realiza login do usuário
 * @param email - Email do usuário
 * @param senha - Senha do usuário
 * @returns Resposta com sucesso, role e possíveis erros
 */
export async function login(email: string, senha: string): Promise<LoginResponse> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase não configurado. Verifique as variáveis de ambiente.',
    };
  }

  try {
    // Validar email
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Email inválido',
      };
    }

    // Validar senha
    if (!senha || senha.length < 6) {
      return {
        success: false,
        error: 'Senha deve ter no mínimo 6 caracteres',
      };
    }

    // Fazer login no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Erro ao fazer login',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      };
    }

    // Validar perfil e obter role
    const role = await validarPerfil(data.user.id);

    if (!role) {
      return {
        success: false,
        error: 'Perfil não encontrado ou sem permissão',
      };
    }

    return {
      success: true,
      role,
    };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado ao fazer login',
    };
  }
}

/**
 * Solicita redefinição de senha
 * @param email - Email do usuário
 * @returns Resposta com sucesso e mensagem
 */
export async function solicitarRedefinicao(email: string): Promise<PasswordResetResponse> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase não configurado. Verifique as variáveis de ambiente.',
    };
  }

  try {
    // Validar email
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Email inválido',
      };
    }

    // Solicitar redefinição de senha
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Erro ao solicitar redefinição de senha',
      };
    }

    return {
      success: true,
      message: 'Email de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada.',
    };
  } catch (error: any) {
    console.error('Erro ao solicitar redefinição:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado ao solicitar redefinição',
    };
  }
}

/**
 * Valida o perfil do usuário e retorna o role
 * @param userId - ID do usuário
 * @returns Role do usuário (user/admin/gerenciador) ou null
 */
export async function validarPerfil(userId: string): Promise<UserRole | null> {
  if (!supabase) {
    return null;
  }

  try {
    // Buscar role do usuário na tabela user_roles
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('Erro ao buscar role:', roleError);
      return null;
    }

    if (!userRole) {
      // Se não tiver role, retornar 'user' por padrão
      return 'user';
    }

    // Mapear role do banco para o tipo UserRole
    const role = userRole.role;
    
    // Se o role for 'leader', mapear para 'admin' (já que leader usa playsell-admin)
    if (role === 'leader') {
      return 'admin';
    }

    // Se o role for 'admin', retornar 'admin'
    if (role === 'admin') {
      return 'admin';
    }

    // Se o role for 'user', retornar 'user'
    // Nota: Para identificar gerenciador, seria necessário uma lógica adicional
    // Por exemplo, verificar se o usuário tem permissões específicas ou um campo adicional
    // Por enquanto, assumimos que gerenciador também usa role 'admin' ou 'user'
    // Se necessário, pode-se adicionar uma verificação adicional aqui
    if (role === 'user') {
      return 'user';
    }

    // Se não for nenhum dos roles conhecidos, retornar null
    return null;
  } catch (error) {
    console.error('Erro ao validar perfil:', error);
    return null;
  }
}

/**
 * Redefine a senha do usuário
 * @param newPassword - Nova senha
 * @returns Resposta com sucesso e mensagem
 */
export async function redefinirSenha(newPassword: string): Promise<PasswordResetResponse> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase não configurado. Verifique as variáveis de ambiente.',
    };
  }

  try {
    // Validar senha
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'Senha deve ter no mínimo 6 caracteres',
      };
    }

    // Atualizar senha
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Erro ao redefinir senha',
      };
    }

    return {
      success: true,
      message: 'Senha redefinida com sucesso!',
    };
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado ao redefinir senha',
    };
  }
}

/**
 * Obtém a URL de redirecionamento baseado no role
 * @param role - Role do usuário
 * @returns URL de redirecionamento
 */
export function getRedirectUrl(role: UserRole): string {
  // URLs de redirecionamento baseadas nas portas configuradas em cada projeto
  const baseUrls: Record<UserRole, string> = {
    user: 'http://localhost:8080', // playsell-user (porta 8080)
    admin: 'http://localhost:8081', // playsell-admin (porta 8081)
    gerenciador: 'http://localhost:8083', // playsell-gerenciador (porta 8083)
  };

  return baseUrls[role] || baseUrls.user;
}

