import { Home, Dog, Settings, Receipt, Paperclip } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type { User } from "@/generated/prisma";

type DashboardProps = {
  children: React.ReactNode;
  user: User | null;
};

const baseLinks = [
  { title: "Vue generale", url: "/dashboard/admin", icon: Home },
  { title: "Chevaux", url: "/dashboard/horses", icon: Dog },
  { title: "Facturation", url: "/dashboard/billing", icon: Receipt },
  { title: "Lecons", url: "/dashboard/lessons", icon: Paperclip },
  { title: "Parametres", url: "/dashboard/settings", icon: Settings },
];

const ownerLinks = [...baseLinks];
const customerLinks = [...baseLinks];
const adminLinks = [...baseLinks];

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
