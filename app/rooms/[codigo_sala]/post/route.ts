import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;
  const { teams } = await req.json();

  try {
    const { data: sala, error: erroSala } = await supabase
      .from("rooms")
      .select("id")
      .eq("codigo_sala", codigo_sala)
      .single();

    if (erroSala || !sala) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
    }

    const equipesData = teams.map((e: { nome_equipe: any; round1: any; round2: any; round3: any; }) => ({
      nome_equipe: e.nome_equipe,
      round1: e.round1 ?? null,
      round2: e.round2 ?? null,
      round3: e.round3 ?? null,
      sala_id: sala.id,
    }));

    await supabase.from("teams").delete().eq("sala_id", sala.id);

    const { error: erroInsercao } = await supabase
      .from("teams")
      .insert(equipesData);

    if (erroInsercao) {
      console.error("Erro ao inserir equipes:", erroInsercao);
      return NextResponse.json({ error: "Erro ao inserir equipes" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro interno ao salvar equipes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
