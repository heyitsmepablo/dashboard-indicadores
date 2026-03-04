"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SectorDashboard } from "@/components/features/sector";
import { IndicatorComparator } from "@/components/features/comparator";
import { MyDashboard } from "@/components/my-dashboard";
import { PanoramaMinisterial } from "@/components/features/panorama-ministeral";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginView } from "@/components/auth/login-view";
import { ChangePasswordView } from "@/components/auth/change-passowrd-view";
import { Loader2 } from "lucide-react";

function DashboardContent() {
  const { viewMode, setViewMode } = useDashboard();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {viewMode === "comparador" && <IndicatorComparator />}
          {viewMode === "meu-painel" && <MyDashboard />}
          {viewMode === "setor" && <SectorDashboard />}
          {viewMode === "ministerial-sih" && <PanoramaMinisterial tipo="sih" />}
          {viewMode === "ministerial-sia" && <PanoramaMinisterial tipo="sia" />}
          {viewMode === "alterar-senha" && (
            <ChangePasswordView
              isVoluntary
              onBack={() => setViewMode("setor")}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Wrapper para gerenciar as rotas de acesso fechado
function AuthGate() {
  const { isAuthenticated, user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Carregando ambiente...
        </p>
      </div>
    );
  }

  // 1. Redireciona sempre pro login se não autenticado
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // 2. Se autenticado, mas tem a flag de mudança de senha pendente do Banco de Dados
  if (user?.must_change_password) {
    return <ChangePasswordView />; // Renderiza a versão "Forçada" sem opções de voltar ao painel
  }

  // 3. Usuário validado e com senha em dia
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
