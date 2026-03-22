import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { solicitarRedefinicao } from "@/services/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await solicitarRedefinicao(data.email);

      if (!response.success) {
        toast.error(response.error || "Erro ao solicitar redefinição de senha");
        return;
      }

      setEmailSent(true);
      toast.success(response.message || "Email enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição:", error);
      toast.error(error.message || "Erro inesperado ao solicitar redefinição");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-elevated animate-bounce-in">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center shadow-glow-success">
              <CheckCircle2 className="h-8 w-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
            <CardDescription className="text-base">
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Enviamos um email para <strong>{getValues("email")}</strong> com instruções para redefinir sua senha.
              </p>
              <p className="text-sm text-muted-foreground">
                Se você não receber o email em alguns minutos, verifique sua pasta de spam.
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-primary hover-glow hover-lift text-white shadow-elevated"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
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
            <span className="text-2xl font-bold text-primary-foreground">PS</span>
          </div>
          <CardTitle className="text-2xl font-bold">Esqueci minha senha</CardTitle>
          <CardDescription className="text-base">
            Digite seu email para receber instruções de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
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
                  Enviando...
                </>
              ) : (
                "Enviar instruções"
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


