import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', codigo_sala)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const { data: current, error: fetchError } = await supabase
    .from("teams")
    .select("dados_extras")
    .eq("id", data.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Mescla os dados existentes com os novos
  const updatedExtras = {
    ...current.dados_extras,
    ...body,
  };

  // Atualiza no banco
  const { error: updateError } = await supabase
    .from("teams")
    .update({ dados_extras: updatedExtras })
    .eq("id", data.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "dados_extras atualizado com sucesso", dados_extras: updatedExtras });
}