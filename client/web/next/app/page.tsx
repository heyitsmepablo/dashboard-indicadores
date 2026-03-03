"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SectorDashboard } from "@/components/features/sector";
import { IndicatorComparator } from "@/components/features/comparator";
import { MyDashboard } from "@/components/my-dashboard";
import { PanoramaMinisterial } from "@/components/features/panorama-ministeral";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { AuthProvider } from "@/lib/auth-context";

function DashboardContent() {
  const { viewMode } = useDashboard();

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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </AuthProvider>
  );
}
