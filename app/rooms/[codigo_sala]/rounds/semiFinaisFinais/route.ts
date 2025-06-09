import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;
  const body = await request.json();

  const { team_id, ...novosDados } = body;

  if (!team_id) {
    return NextResponse.json({ error: "team_id é obrigatório no body da requisição." }, { status: 400 });
  }

  const { data: sala, error: salaError } = await supabase
    .from("rooms")
    .select("id")
    .eq("codigo_sala", codigo_sala)
    .single();

  if (salaError) {
    return NextResponse.json({ error: salaError.message }, { status: 500 });
  }

  if (!sala) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("dados_extras")
    .eq("id", team_id)
    .eq("sala_id", sala.id)
    .single();

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  if (!team) {
    return NextResponse.json({ error: "Equipe não encontrada para esta sala." }, { status: 404 });
  }

  const updatedExtras = {
    ...team.dados_extras,
    ...novosDados,
  };

  const { error: updateError } = await supabase
    .from("teams")
    .update({ dados_extras: updatedExtras })
    .eq("id", team_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "dados_extras atualizado com sucesso para a equipe.",
    dados_extras: updatedExtras,
  });
}
