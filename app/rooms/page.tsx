import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  let { data: rooms, error } = await supabase.from("rooms").select("*")

  return <pre>{JSON.stringify(rooms, null, 2)}</pre>;
}
