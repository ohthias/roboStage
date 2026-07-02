import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import LayoutShell from "@/components/Dashboard/LayoutShell";
import { AuthProvider } from "@/app/context/AuthContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, username, avatar_url, user_role")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <AuthProvider initialUser={user} initialProfile={profile}>
        <LayoutShell profile={profile}>{children}</LayoutShell>
    </AuthProvider>
  );
}
