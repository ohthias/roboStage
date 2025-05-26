import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: any
) {
  const codigo_sala = context.params.codigo_sala;

  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*, teams(*)");

    const salaFiltrada = data?.find((sala) => String(sala.codigo_sala) === codigo_sala);

    if (!salaFiltrada) {
      const errorMessage = error?.message ? `Sala não encontrada: ${error.message}` : "Sala não encontrada";
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json(salaFiltrada);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
