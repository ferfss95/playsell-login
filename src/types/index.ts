export type UserRole = 'user' | 'admin' | 'gerenciador';

export interface LoginResponse {
  success: boolean;
  role?: UserRole;
  error?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

