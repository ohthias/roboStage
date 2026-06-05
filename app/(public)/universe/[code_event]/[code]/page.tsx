import { notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import PublicView from "@/components/showLive/views/PublicView";
import VisitorView from "@/components/showLive/views/VisitorView";
import VolunteerView from "@/components/showLive/views/VolunteerView";

import AccessProvider from "@/components/showLive/permissions/AccessProvider";

interface Props {
  params: Promise<{
    code_event: string;
    code: string;
  }>;
}

export default async function ShowLivePage({
  params,
}: Props) {
  const { code_event, code } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("public_event_lookup")
    .select("*")
    .eq("code_event", code_event.toUpperCase())
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const role =
    data.access_type as
      | "public"
      | "visitor"
      | "volunteer";

  return (
    <AccessProvider role={role}>
      {role === "volunteer" && (
        <VolunteerView event={data} />
      )}

      {role === "visitor" && (
        <VisitorView event={data} />
      )}

      {role === "public" && (
        <PublicView event={data} />
      )}
    </AccessProvider>
  );
}