"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashifyService } from "@/services/dashify.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

interface ChangePasswordViewProps {
  isVoluntary?: boolean;
  onBack?: () => void;
}

export function ChangePasswordView({
  isVoluntary = false,
  onBack,
}: ChangePasswordViewProps) {
  const { user, updateUserSession, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("A nova senha e a confirmação não coincidem.");
    }
    if (newPassword.length < 6) {
      return setError("A nova senha deve ter pelo menos 6 caracteres.");
    }

    setIsLoading(true);

    try {
      const data = await DashifyService.changePassword(
        currentPassword,
        newPassword,
      );
      updateUserSession(data.access_token, data.user);

      // Se for voluntário, volta para a tela anterior em vez de recarregar
      if (isVoluntary && onBack) {
        onBack();
      }
    } catch (err: any) {
      setError(
        err.message || "Erro ao atualizar a senha. Verifique sua senha atual.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isVoluntary && onBack) {
      onBack();
    } else {
      logout();
    }
  };

  return (
    <div
      className={
        isVoluntary
          ? "w-full flex items-center justify-center py-10"
          : "min-h-screen w-full flex items-center justify-center bg-muted/30 p-4"
      }
    >
      <Card
        className={`w-full max-w-md shadow-lg border-t-4 ${isVoluntary ? "border-t-muted-foreground/30" : "border-t-primary"}`}
      >
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isVoluntary ? (
              <KeyRound className="h-8 w-8 text-primary" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {isVoluntary ? "Alterar Senha" : "Atualização Obrigatória"}
            </CardTitle>
            <CardDescription className="text-sm">
              {isVoluntary
                ? `Crie uma nova senha de acesso para sua conta, ${user?.nome.split(" ")[0]}.`
                : `Olá, ${user?.nome.split(" ")[0]}. Por motivos de segurança, é necessário cadastrar uma nova senha pessoal antes de acessar o sistema.`}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">
                {isVoluntary ? "Senha Atual" : "Senha Temporária / Atual"}
              </Label>
              <Input
                id="current"
                type="password"
                placeholder={
                  isVoluntary
                    ? "Digite sua senha atual"
                    : "Insira a senha recebida"
                }
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Nova Senha</Label>
              <Input
                id="new"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirme a Nova Senha</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Digite a nova senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 font-medium text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 mt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isVoluntary ? (
                "Atualizar Senha"
              ) : (
                "Atualizar e Entrar"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isVoluntary ? (
                <>
                  <ArrowLeft className="h-4 w-4" /> Cancelar e voltar
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" /> Voltar para o Login
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
