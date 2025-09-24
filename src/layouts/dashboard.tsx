import { Home, Dog, Settings } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { User } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/session";

type DashboardProps = {
  children: React.ReactNode;
  user: User | null;
};

const ownerLinks = [
  { title: "Overview", url: "/dashboard/admin", icon: Home },
  { title: "Horses", url: "/dashboard/horses", icon: Dog },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const customerLinks = [
  { title: "Overview", url: "/dashboard/admin", icon: Home },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminLinks =  [
  { title: "Overview", url: "/dashboard/admin", icon: Home },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export default function Dashboard({ children, user }: DashboardProps) {
  const isOwner = user?.role === "OWNER";
  const links = (() => {
    if (user?.role === "ADMIN") return adminLinks;
    if (isOwner) return ownerLinks;
    return customerLinks;
  })();
  return (
    <SidebarProvider>
      <DashboardSidebar links={links} />
      <main className="flex-1 w-full">
        <SidebarTrigger />
        <div className="p-4 sm:p-10 w-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
