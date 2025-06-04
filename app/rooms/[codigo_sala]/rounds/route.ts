import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;
  const body = await request.json();

  try {
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("codigo_sala", codigo_sala)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
    }

    const { data: existingDetail, error: detailError } = await supabase
      .from("rooms_details")
      .select("*")
      .eq("id_room", room.id)
      .single();

    if (detailError && detailError.code !== "PGRST116") {
      throw detailError;
    }

    const payload = {
      id_room: room.id,
      check_eventos_round: body.check_eventos_rounds ?? false,
      check_desafios_round: body.check_desafio_rounds ?? false,
    };

    let response;
    if (!existingDetail) {
      response = await supabase.from("rooms_details").insert(payload);
    } else {
      response = await supabase
        .from("rooms_details")
        .update(payload)
        .eq("id_room", room.id);
    }

    if (response.error) {
      throw response.error;
    }

    return NextResponse.json({ message: "Sistema de rounds atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar sistema de rounds:", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o sistema de rounds. Tente novamente." },
      { status: 500 }
    );
  }
}