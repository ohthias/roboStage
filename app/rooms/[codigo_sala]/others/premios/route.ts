import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { codigo_sala: string } }
) {
  const { codigo_sala } = params;
  const body = await request.json();

  const { premios } = body;
  if (!premios || !Array.isArray(premios)) {
    return NextResponse.json(
      { error: "Premios devem ser um array." },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "Sala não encontrada." },
      { status: 404 }
    );
  }

  const { data: room_details, error: detailsError } = await supabase
    .from("rooms_details")
    .select("dados_extras")
    .eq("id_room", sala.id)
    .single();

  if (detailsError) {
    return NextResponse.json({ error: detailsError.message }, { status: 500 });
  }
  if (!room_details) {
    return NextResponse.json(
      { error: "Detalhes da sala não encontrados." },
      { status: 404 }
    );
  }
  const updatedExtras = {
    ...room_details.dados_extras,
    premios: premios.map((p: any) => ({
      nome: p.nome || "",
      descricao: p.descricao || "",
      discurso: p.discurso || "",
        equipePremiada: p.equipePremiada || "",
    })),
  };
  const { error: updateError } = await supabase
    .from("rooms_details")
    .update({ dados_extras: updatedExtras })
    .eq("id_room", sala.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({
    message: "Premios atualizados com sucesso.",
    premios: updatedExtras.premios,
  });
}
