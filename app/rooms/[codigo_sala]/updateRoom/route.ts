import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, context: any) {
  try {
    const codigoSala = context.params.codigo_sala;
    const { nome } = await request.json();

    const { data, error } = await supabase
      .from("rooms")
      .update({ nome })
      .eq("codigo_sala", codigoSala)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar a sala:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar a sala" },
      { status: 500 }
    );
  }
}
