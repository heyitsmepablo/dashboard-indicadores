"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Loader2, LockKeyhole } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "E-mail ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-[1000px] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border/50">
        {/* Lado Esquerdo - Branding */}
        <div className="w-full md:w-1/2 bg-primary p-12 text-primary-foreground flex flex-col justify-between hidden md:flex relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-900 z-0"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/10 backdrop-blur-md">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Dashify</span>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Inteligência e performance em um só lugar.
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Acompanhe os indicadores da sua rede com painéis dinâmicos e
              análises preditivas via IA.
            </p>
          </div>

          <div className="relative z-10 text-sm font-medium text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Dashify System
          </div>
        </div>

        {/* Lado Direito - Form Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-background">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Dashify</span>
          </div>

          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Bem-vindo(a)
              </h2>
              <p className="text-muted-foreground text-sm">
                Acesse sua conta para visualizar os dashboards.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.nome@instituicao.gov.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pl-10"
                  />
                  <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
