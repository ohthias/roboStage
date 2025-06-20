import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: any) {
  const codigo_sala = context.params.codigo_sala;

  const { data: sala, error: errorSala } = await supabase
    .from("rooms")
    .select("id")
    .eq("codigo_sala", codigo_sala)
    .single();

  if (errorSala || !sala) {
    return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
  }

  const { data: operacao, error: errorOperacao } = await supabase
    .from("operacao")
    .select("*")
    .eq("id_room", sala.id)
    .single();

  if (errorOperacao || !operacao) {
    return NextResponse.json(
      { error: "Operação não encontrada" },
      { status: 404 }
    );
  }

  const { data: arenas, error: errorArenas } = await supabase
    .from("arenas")
    .select("*")
    .eq("id_operacao", operacao.id)
    .single();

  if (errorArenas) {
    return NextResponse.json(
      { error: "Erro ao buscar arenas" },
      { status: 500 }
    );
  }

  const { data: intervalos, error: errorIntervalos } = await supabase
    .from("intervalos")
    .select("*")
    .eq("id_operacao", operacao.id)
    .single();

  if (errorIntervalos) {
    return NextResponse.json(
      { error: "Erro ao buscar intervalos" },
      { status: 500 }
    );
  }

  const salasAvaliacao = operacao.dados_extras?.salas_avaliacao ?? 0;

  return NextResponse.json({
    operacao,
    arenas,
    intervalos,
    salasAvaliacao,
  });
}
