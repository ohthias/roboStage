import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import LayoutShell from "@/components/Dashboard/LayoutShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * sem auth
   */
  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, username, avatar_url")
    .eq("id", user.id)
    .single();

  /*
   * onboarding obrigatório
   */
  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <LayoutShell profile={profile}>
      {children}
    </LayoutShell>
  );
}