import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import type { PermissionSubject } from "@/lib/permissions"

type DashboardProps = {
  children: React.ReactNode
  user: PermissionSubject
}

export default function Dashboard({ children, user }: DashboardProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <main>
        <SidebarTrigger />
        <div className="p-4 sm:p-10">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
