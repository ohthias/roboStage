import { useRouter } from "next/router";
import { supabase } from "./supabase/client";

export async function logout() {
  const router = useRouter();

  await supabase.auth.signOut();
  router.push("/join");
}
