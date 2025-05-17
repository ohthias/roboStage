import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { codigo_sala: string } }
) {
  const { codigo_sala } = params;

  console.log("Recebido:", codigo_sala);

  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*, teams(*)");

    console.log("Todas as salas:", data);

    const salaFiltrada = data?.find((sala) => String(sala.codigo_sala) === codigo_sala);

    if (!salaFiltrada) {
      return NextResponse.json({ error: "Sala não encontrada" + error }, { status: 404 });
    }

    return NextResponse.json(salaFiltrada);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
