import { Home, Dog, Settings } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { User } from "@/generated/prisma";

type DashboardProps = {
  children: React.ReactNode;
  user: User | null;
};

const ownerLinks = [
  { title: "Overview", url: "/dashboard", icon: Home },
  { title: "Horses", url: "/dashboard/horses", icon: Dog },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const customerLinks = [
  { title: "Overview", url: "/dashboard", icon: Home },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export default function Dashboard({ children, user }: DashboardProps) {
  const isOwner = user?.role === "OWNER";
  const links = isOwner ? ownerLinks : customerLinks;

  return (
    <SidebarProvider>
      <DashboardSidebar links={links} />
      <main>
        <SidebarTrigger />
        <div className="p-4 sm:p-10">{children}</div>
      </main>
    </SidebarProvider>
  );
}
