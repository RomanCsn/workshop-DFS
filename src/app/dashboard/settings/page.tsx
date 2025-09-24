import Dashboard from "@/layouts/dashboard";
import { SettingsContent } from "@/components/settings/settings-content";
import { getCurrentSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  return (
    <Dashboard>
      <SettingsContent session={session} />
    </Dashboard>
  );
}
