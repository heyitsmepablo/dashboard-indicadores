'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { SectorDashboard } from '@/components/sector-dashboard'
import { IndicatorComparator } from '@/components/indicator-comparator'
import { DashboardProvider, useDashboard } from '@/lib/dashboard-context'

function DashboardContent() {
  const { comparadorAberto } = useDashboard()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {comparadorAberto ? <IndicatorComparator /> : <SectorDashboard />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
