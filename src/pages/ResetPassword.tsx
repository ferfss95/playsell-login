import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redefinirSenha, getRedirectUrl } from "@/services/auth";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types";
import { validarPerfil } from "@/services/auth";

const resetPasswordSchema = z
  .object({
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string().min(6, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Verificar se é primeiro acesso (sem token) ou reset normal (com token)
    const accessToken = searchParams.get("access_token");
    const firstAccess = searchParams.get("first_access") === "true";
    
    setIsFirstAccess(firstAccess);
    
    // Se não for primeiro acesso e não tiver token, é link inválido
    if (!firstAccess && !accessToken) {
      toast.error("Link inválido ou expirado");
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
    
    // Se for primeiro acesso, verificar se está autenticado
    if (firstAccess && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          toast.error("Sessão expirada. Faça login novamente.");
          navigate("/");
        }
      });
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // Verificar se a nova senha é diferente da matrícula (se for primeiro acesso)
      if (isFirstAccess && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Buscar matrícula do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('enrollment_number')
            .eq('id', user.id)
            .maybeSingle();
          
          // Se a nova senha for igual à matrícula (case-insensitive), não permitir
          // Também verificar a versão preenchida da matrícula (para matrículas < 6 caracteres)
          if (profile && profile.enrollment_number) {
            // Converter para string primeiro, pois pode vir como número do banco
            const enrollmentNumber = String(profile.enrollment_number).trim();
            const enrollmentPadded = enrollmentNumber.length < 6 ? enrollmentNumber.padStart(6, '0') : enrollmentNumber;
            const novaSenhaNormalized = data.senha.trim().toLowerCase();
            
            const enrollmentMatch = novaSenhaNormalized === enrollmentNumber.toLowerCase() || 
                                   novaSenhaNormalized === enrollmentPadded.toLowerCase();
            
            if (enrollmentMatch) {
              toast.error("A nova senha não pode ser igual à sua matrícula. Escolha uma senha diferente.");
              setIsLoading(false);
              return;
            }
          }
        }
      }

      const response = await redefinirSenha(data.senha);

      if (!response.success) {
        toast.error(response.error || "Erro ao redefinir senha");
        return;
      }

      setPasswordReset(true);
      toast.success(response.message || "Senha redefinida com sucesso!");

      // Se for primeiro acesso, redirecionar para a aplicação baseada no role
      if (isFirstAccess && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = await validarPerfil(user.id);
          if (role) {
            setTimeout(() => {
              const redirectUrl = getRedirectUrl(role);
              window.location.href = redirectUrl;
            }, 2000);
            return;
          }
        }
      }

      // Se não for primeiro acesso ou não conseguir obter role, redirecionar para login
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast.error(error.message || "Erro inesperado ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-elevated animate-bounce-in">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center shadow-glow-success">
              <CheckCircle2 className="h-8 w-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Senha Redefinida!</CardTitle>
            <CardDescription className="text-base">
              Sua senha foi redefinida com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Você será redirecionado para a página de login em instantes...
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-primary hover-glow hover-lift text-white shadow-elevated"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-elevated animate-bounce-in">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isFirstAccess ? "Definir Nova Senha" : "Redefinir Senha"}
          </CardTitle>
          <CardDescription className="text-base">
            {isFirstAccess 
              ? "Este é seu primeiro acesso. Defina uma senha pessoal para continuar."
              : "Digite sua nova senha"
            }
          </CardDescription>
          {isFirstAccess && (
            <div className="mt-2 p-3 bg-info/10 border border-info/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                <div className="text-xs text-info">
                  <strong>Importante:</strong> Escolha uma senha segura que seja diferente da sua matrícula.
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register("senha")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register("confirmarSenha")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-destructive">{errors.confirmarSenha.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover-glow hover-lift text-white shadow-elevated"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-primary hover:underline transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


