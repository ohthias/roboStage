import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { codigo } = await req.json();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("codigo_sala", codigo)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ logs: [], error: "Sala não encontrada" }, { status: 404 });
  }

  const { data: logs, error: logsError } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("sala_id", room.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(
    { logs: logs || [], error: logsError?.message || null },
    { status: logsError ? 500 : 200 }
  );
}
