import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, context: any) {
  try {
    const codigo_sala = context.params.codigo_sala;
    const dados = await request.json();

    console.log("Dados recebidos no PUT:", dados);

    const { nome_equipe, ...roundData } = dados;

    if (!codigo_sala || !nome_equipe) {
      return NextResponse.json(
        { error: "codigo_sala e nome_equipe são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: sala, error: erroSala } = await supabase
      .from("rooms")
      .select("id")
      .eq("codigo_sala", codigo_sala)
      .single();

    if (erroSala || !sala) {
      console.log("Erro na busca da sala:", erroSala);
      return NextResponse.json(
        { error: "Sala não encontrada" },
        { status: 404 }
      );
    }

    const { data: equipe, error: erroEquipe } = await supabase
      .from("teams")
      .select("id")
      .eq("sala_id", sala.id)
      .eq("nome_equipe", nome_equipe)
      .single();

    if (erroEquipe || !equipe) {
      console.log("Erro na busca da equipe:", erroEquipe);
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      );
    }

    console.log("Dados para atualizar:", roundData);

    const { error: erroUpdate } = await supabase
      .from("teams")
      .update(roundData)
      .eq("id", equipe.id);

    if (erroUpdate) {
      console.log("Erro ao atualizar:", erroUpdate);
      return NextResponse.json(
        { error: "Erro ao atualizar pontuação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (error) {
    console.error("Erro geral no PUT:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
