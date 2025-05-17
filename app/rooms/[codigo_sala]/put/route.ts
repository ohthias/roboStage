import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { codigo_sala: string } }
) {
  try {
    const { codigo_sala } = params;

    const dados = await request.json();

    const { nomeEquipe, ...rounds } = dados;

    if (!codigo_sala || !nomeEquipe) {
      return NextResponse.json(
        { error: "codigo_sala e nomeEquipe são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: sala, error: erroSala } = await supabase
      .from("rooms")
      .select("id")
      .eq("codigo_sala", codigo_sala)
      .single();

    if (erroSala || !sala) {
      return NextResponse.json(
        { error: "Sala não encontrada" },
        { status: 404 }
      );
    }

    const { data: equipe, error: erroEquipe } = await supabase
      .from("teams")
      .select("id")
      .eq("sala_id", sala.id)
      .eq("nome_equipe", nomeEquipe)
      .single();

    if (erroEquipe || !equipe) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      );
    }

    const updateData: Record<string, any> = {};
    for (const key in rounds) {
      if (key.startsWith("round")) {
        updateData[key] = rounds[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo de round fornecido" },
        { status: 400 }
      );
    }

    const { error: erroUpdate } = await supabase
      .from("teams")
      .update(updateData)
      .eq("id", equipe.id);

    if (erroUpdate) {
      return NextResponse.json(
        { error: "Erro ao atualizar equipe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro geral ao atualizar equipe:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
