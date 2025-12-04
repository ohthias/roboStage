"use client";

import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    if (!confirm("Tem certeza que deseja sair?")) return;

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn(
        "SignOut falhou (possível sessão expirada). Continuando.",
        err
      );
    }

    // Agora sim limpar cookies e storage
    try {
      document.cookie = "sb-access-token=; path=/; max-age=0";
      document.cookie = "sb-refresh-token=; path=/; max-age=0";
      localStorage.removeItem("roboStage-last-section");
      localStorage.removeItem("theme");
      localStorage.removeItem("userProfile");
    } catch {}

    router.refresh();
    router.replace("/auth/login");
  };

  return logout;
}
