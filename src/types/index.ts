export type UserRole = 'user' | 'leader' | 'admin';

export interface LoginResponse {
  success: boolean;
  role?: UserRole;
  requiresPasswordReset?: boolean; // Flag indicando se precisa redefinir senha (primeiro acesso)
  error?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}


