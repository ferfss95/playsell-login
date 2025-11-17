import { supabase } from '@/lib/supabase';
import type { UserRole, LoginResponse, PasswordResetResponse } from '@/types';

/**
 * Realiza login do usuário
 * @param email - Email do usuário
 * @param senha - Senha do usuário (pode ser a matrícula no primeiro acesso)
 * @returns Resposta com sucesso, role e possíveis erros
 */
export async function login(email: string, senha: string): Promise<LoginResponse> {
  if (!supabase) {
    console.error('❌ Supabase não configurado! Verifique o console para mais detalhes.');
    return {
      success: false,
      error: 'Supabase não configurado. Crie um arquivo .env na raiz do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. Veja CONFIGURACAO.md para mais detalhes.',
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

    // Estratégia de login: tentar múltiplas variações de senha
    // 1. Senha informada (pode ser senha pessoal ou matrícula)
    // 2. Se falhar, tentar variações da matrícula (original e preenchida)
    // 3. Rastrear qual senha foi usada para autenticar (importante para detectar primeiro acesso)
    
    let data: any = null;
    let error: any = null;
    let senhaUsadaParaAutenticar: string | null = null; // Rastrear qual senha funcionou
    const senhaOriginal = senha.trim();
    const emailNormalized = email.trim().toLowerCase();
    
    // Tentar login primeiro com a senha informada (pode ser senha pessoal ou matrícula)
    console.log(`🔐 Tentando login para ${emailNormalized} com senha: "${senhaOriginal}" (${senhaOriginal.length} caracteres)`);
    
    const { data: dataLogin, error: errorLogin } = await supabase.auth.signInWithPassword({
      email: emailNormalized,
      password: senhaOriginal,
    });
    
    if (!errorLogin && dataLogin) {
      // Login bem-sucedido com a senha informada
      data = dataLogin;
      senhaUsadaParaAutenticar = senhaOriginal;
      console.log(`✓ Login bem-sucedido com senha informada: "${senhaOriginal}"`);
    } else {
      // Login falhou, tentar variações
      error = errorLogin;
      console.log(`❌ Primeira tentativa falhou:`, errorLogin?.message || 'Erro desconhecido');
      console.log(`🔄 Tentando variações da matrícula...`);
      
      // Estratégia melhorada: Tentar ambas as variações (com e sem padding)
      // Isso cobre todos os casos possíveis:
      // 1. Usuário digita "1001" mas senha no auth é "001001" (preenchida)
      // 2. Usuário digita "001001" mas senha no auth é "1001" (sem padding)
      // 3. Matrícula tem 6+ caracteres mas pode ter sido salva diferente
      
      let tentouVariacao = false;
      
      // Se a senha informada tem menos de 6 caracteres, tentar preenchida
      if (senhaOriginal.length < 6) {
        const senhaPreenchida = senhaOriginal.padStart(6, '0');
        console.log(`🔄 Tentando login com senha preenchida: "${senhaOriginal}" -> "${senhaPreenchida}"`);
        
        const { data: dataRetry, error: errorRetry } = await supabase.auth.signInWithPassword({
          email: emailNormalized,
          password: senhaPreenchida,
        });
        
        if (!errorRetry && dataRetry) {
          data = dataRetry;
          error = null;
          senhaUsadaParaAutenticar = senhaPreenchida;
          console.log(`✓ Login bem-sucedido com senha preenchida: "${senhaPreenchida}"`);
          tentouVariacao = true;
        } else {
          console.log(`❌ Tentativa com senha preenchida também falhou:`, errorRetry?.message || 'Erro desconhecido');
        }
      }
      
      // Se a senha informada tem 6 ou mais caracteres e começa com zeros, tentar sem os zeros
      // Exemplo: "001001" -> "1001"
      if (!tentouVariacao && senhaOriginal.length >= 6 && senhaOriginal.startsWith('0')) {
        // Remover zeros à esquerda até encontrar o primeiro dígito não-zero
        const senhaSemPadding = senhaOriginal.replace(/^0+/, '') || senhaOriginal;
        
        // Só tentar se a senha sem padding for diferente e tiver pelo menos 1 caractere
        if (senhaSemPadding !== senhaOriginal && senhaSemPadding.length > 0) {
          console.log(`🔄 Tentando login com senha sem padding: "${senhaOriginal}" -> "${senhaSemPadding}"`);
          
          const { data: dataRetry, error: errorRetry } = await supabase.auth.signInWithPassword({
            email: emailNormalized,
            password: senhaSemPadding,
          });
          
          if (!errorRetry && dataRetry) {
            data = dataRetry;
            error = null;
            senhaUsadaParaAutenticar = senhaSemPadding;
            console.log(`✓ Login bem-sucedido com senha sem padding: "${senhaSemPadding}"`);
            tentouVariacao = true;
          } else {
            console.log(`❌ Tentativa com senha sem padding também falhou:`, errorRetry?.message || 'Erro desconhecido');
          }
        }
      }
      
      // Se ainda não funcionou e a senha parece ser uma matrícula (só números), 
      // tentar variações mais agressivas com diferentes tamanhos de padding
      if (!tentouVariacao && error && /^\d+$/.test(senhaOriginal)) {
        console.log(`🔍 Senha parece ser uma matrícula (só números), tentando mais variações...`);
        
        // Tentar com zeros à esquerda para diferentes tamanhos (6, 7, 8, 9, 10 caracteres)
        const tamanhosParaTentar = [6, 7, 8, 9, 10];
        
        for (const tamanho of tamanhosParaTentar) {
          if (senhaOriginal.length >= tamanho) continue;
          
          const senhaVariacao = senhaOriginal.padStart(tamanho, '0');
          if (senhaVariacao === senhaOriginal) continue;
          
          console.log(`🔄 Tentando variação com ${tamanho} caracteres: "${senhaVariacao}"`);
          const { data: dataVariacao, error: errorVariacao } = await supabase.auth.signInWithPassword({
            email: emailNormalized,
            password: senhaVariacao,
          });
          
          if (!errorVariacao && dataVariacao) {
            data = dataVariacao;
            error = null;
            senhaUsadaParaAutenticar = senhaVariacao;
            console.log(`✓ Login bem-sucedido com variação: "${senhaVariacao}"`);
            tentouVariacao = true;
            break;
          }
        }
      }
      
      if (!tentouVariacao) {
        console.log(`ℹ️ Não foi possível tentar variações para esta senha`);
      }
    }

    if (error) {
      // Mensagem mais clara para credenciais inválidas
      let errorMessage = error.message || 'Erro ao fazer login';
      
      if (error.message?.toLowerCase().includes('invalid') || 
          error.message?.toLowerCase().includes('credentials') ||
          error.status === 400) {
        
        // Listar todas as tentativas feitas
        const tentativas: string[] = [`"${senhaOriginal}"`];
        
        if (senhaOriginal.length < 6) {
          tentativas.push(`"${senhaOriginal.padStart(6, '0')}"`);
        } else if (senhaOriginal.startsWith('0')) {
          const semPadding = senhaOriginal.replace(/^0+/, '');
          if (semPadding && semPadding !== senhaOriginal) {
            tentativas.push(`"${semPadding}"`);
          }
        }
        
        const tentativasStr = tentativas.length > 1 
          ? `Tentamos ${tentativas.join(' e ')}` 
          : `Tentamos ${tentativas[0]}`;
        
        errorMessage = `Credenciais inválidas. ${tentativasStr}, mas nenhuma funcionou. ` +
          `Possíveis causas: O usuário não foi cadastrado, a senha no sistema é diferente da matrícula, ou o email está incorreto. ` +
          `Solução: Acesse o playsell-gerenciador, vá em "Usuários" e clique no ícone de chave ao lado do usuário para resetar a senha para a matrícula. ` +
          `Após o reset, aguarde 3-5 segundos antes de tentar fazer login novamente.`;
      }
      
      const tentativasArray = [senhaOriginal];
      if (senhaOriginal.length < 6) {
        tentativasArray.push(senhaOriginal.padStart(6, '0'));
      } else if (senhaOriginal.startsWith('0')) {
        const semPadding = senhaOriginal.replace(/^0+/, '');
        if (semPadding && semPadding !== senhaOriginal) {
          tentativasArray.push(semPadding);
        }
      }
      
      console.error(`❌ Login falhou após todas as tentativas:`, {
        email: emailNormalized,
        tentativas: tentativasArray,
        erro: error.message
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      };
    }

    // Após autenticação bem-sucedida, buscar perfil pelo ID do usuário
    // Isso garante que as políticas RLS funcionem corretamente
    // Nota: A tabela profiles não tem campo 'email', apenas 'enrollment_number'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, enrollment_number')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil após login:', profileError);
      // Não bloquear login, apenas logar o erro
    } else if (profileData) {
      console.log(`✓ Perfil encontrado: enrollment_number = ${profileData.enrollment_number}`);
    } else {
      console.warn(`⚠️ Perfil não encontrado para usuário ${data.user.id}`);
    }

    let isFirstAccess = false;
    
    // Verificar se a senha USADA PARA AUTENTICAR é igual à matrícula (case-insensitive)
    // Se for, é primeiro acesso e precisa redefinir senha
    // IMPORTANTE: Usar senhaUsadaParaAutenticar, não senha informada, pois podem ser diferentes
    // IMPORTANTE: Converter enrollment_number para string primeiro, pois pode vir como número do banco
    if (profileData && profileData.enrollment_number && senhaUsadaParaAutenticar) {
      const enrollmentNumber = String(profileData.enrollment_number).trim();
      const enrollmentPadded = enrollmentNumber.length < 6 ? enrollmentNumber.padStart(6, '0') : enrollmentNumber;
      const senhaUsadaNormalized = senhaUsadaParaAutenticar.trim();
      
      console.log(`🔍 Comparando senha usada ("${senhaUsadaParaAutenticar}") com matrícula:`);
      console.log(`   - Matrícula original: "${enrollmentNumber}"`);
      console.log(`   - Matrícula preenchida: "${enrollmentPadded}"`);
      
      // Verificar se a senha usada é igual à matrícula original ou à matrícula preenchida (case-sensitive para números)
      const enrollmentMatch = senhaUsadaNormalized === enrollmentNumber || 
                             senhaUsadaNormalized === enrollmentPadded;
      
      if (enrollmentMatch) {
        isFirstAccess = true;
        console.log(`✓ Primeiro acesso detectado! Senha usada ("${senhaUsadaParaAutenticar}") é igual à matrícula`);
      } else {
        console.log(`✓ Login normal - senha usada ("${senhaUsadaParaAutenticar}") é diferente da matrícula`);
      }
    } else if (!profileData) {
      console.warn(`⚠️ Perfil não encontrado para usuário ${data.user.id} após login - não é possível detectar primeiro acesso`);
    } else if (!profileData.enrollment_number) {
      console.warn(`⚠️ Perfil encontrado mas sem matrícula (enrollment_number) - não é possível detectar primeiro acesso`);
    } else if (!senhaUsadaParaAutenticar) {
      console.warn(`⚠️ Não foi possível determinar qual senha foi usada para autenticar`);
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
      requiresPasswordReset: isFirstAccess, // Indica que precisa redefinir senha
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
 * @returns Role do usuário (user/leader/admin) ou null
 */
export async function validarPerfil(userId: string): Promise<UserRole | null> {
  if (!supabase) {
    // Se não houver supabase, retornar 'user' como padrão para não bloquear o login
    console.warn('⚠️ Supabase não configurado, usando role padrão "user"');
    return 'user';
  }

  try {
    // Estratégia 1: Tentar usar função RPC primeiro (contorna políticas RLS)
    // Esta função deve ser criada no Supabase usando o script create_get_user_role_function.sql
    console.log(`🔍 Buscando role para usuário ${userId}...`);
    console.log(`   Tentando primeiro via função RPC get_user_role (recomendado)...`);
    
    try {
      const { data: rpcRole, error: rpcError } = await supabase
        .rpc('get_user_role', { user_id_param: userId });
      
      if (!rpcError) {
        if (rpcRole) {
          const role = rpcRole as 'user' | 'leader' | 'admin';
          if (role === 'user' || role === 'leader' || role === 'admin') {
            console.log(`✅ Role encontrado via RPC: ${role}`);
            return role;
          }
        } else {
          // Função retornou NULL - usuário não tem role definido
          console.warn(`⚠️ Função RPC retornou NULL - usuário não tem role definido`);
          console.warn(`   Continuando com busca direta na tabela...`);
        }
      } else if (rpcError) {
        // Se a função não existir, continuar para a próxima estratégia
        if (rpcError.code === '42883' || rpcError.message?.toLowerCase().includes('function') || rpcError.message?.toLowerCase().includes('does not exist')) {
          console.warn(`⚠️ Função RPC get_user_role não encontrada.`);
          console.warn(`   Execute o script create_get_user_role_function.sql no Supabase SQL Editor.`);
          console.warn(`   Continuando com busca direta na tabela...`);
        } else {
          console.warn(`⚠️ Erro ao chamar RPC get_user_role:`, rpcError.message);
          console.warn(`   Continuando com busca direta na tabela...`);
        }
      }
    } catch (rpcError: any) {
      console.warn(`⚠️ Erro ao tentar RPC:`, rpcError.message);
      console.warn(`   Continuando com busca direta na tabela...`);
    }
    
    // Estratégia 2: Tentar buscar role diretamente da tabela user_roles
    console.log(`   Tentando busca direta na tabela user_roles...`);
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('❌ Erro ao buscar role:', roleError);
      
      // Se for erro de recursão infinita na política RLS
      if (roleError.code === '42P17' || 
          roleError.message?.toLowerCase().includes('infinite recursion') ||
          roleError.message?.toLowerCase().includes('recursion')) {
        console.error(`❌ Erro de recursão infinita na política RLS detectado.`);
        console.error(`   SOLUÇÃO NECESSÁRIA:`);
        console.error(`   1. Execute o script create_get_user_role_function.sql no Supabase SQL Editor`);
        console.error(`   2. Ou corrija as políticas RLS da tabela user_roles no Supabase`);
        console.error(`   Por enquanto, usando role padrão 'user' para permitir login.`);
        return 'user';
      }
      
      // Para outros erros, também usar 'user' como padrão para não bloquear o login
      console.warn(`⚠️ Erro ao buscar role, usando 'user' como padrão:`, roleError.message);
      return 'user';
    }

    if (!userRole) {
      // Se não tiver role, retornar 'user' por padrão
      console.warn(`⚠️ Usuário ${userId} não tem role definido na tabela user_roles, usando 'user' como padrão`);
      return 'user';
    }

    // Mapear role do banco para o tipo UserRole
    const role = userRole.role as 'user' | 'leader' | 'admin';
    
    // Validar se é um role válido
    if (role === 'user' || role === 'leader' || role === 'admin') {
      console.log(`✅ Role encontrado para usuário ${userId}: ${role}`);
      return role;
    }

    // Se não for nenhum dos roles conhecidos, usar 'user' como padrão
    console.warn(`⚠️ Role inválido para usuário ${userId}: ${role}. Usando 'user' como padrão.`);
    return 'user';
  } catch (error: any) {
    console.error('❌ Erro ao validar perfil:', error);
    // Em caso de erro inesperado, retornar 'user' como padrão para não bloquear o login
    console.warn(`⚠️ Erro inesperado ao validar perfil, usando 'user' como padrão:`, error.message);
    return 'user';
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
  // Regra de redirecionamento:
  // - admin -> playsell-gerenciador (porta 8083)
  // - leader -> playsell-admin (porta 8082)
  // - user -> playsell-user (porta 8081)
  const baseUrls: Record<UserRole, string> = {
    admin: 'http://localhost:8083',     // playsell-gerenciador (porta 8083)
    leader: 'http://localhost:8082',    // playsell-admin (porta 8082)
    user: 'http://localhost:8081',      // playsell-user (porta 8081)
  };

  const redirectUrl = baseUrls[role] || baseUrls.user;
  console.log(`🔀 Redirecionando usuário com role '${role}' para: ${redirectUrl}`);
  console.log(`   Mapeamento: ${role} -> ${redirectUrl}`);
  return redirectUrl;
}

