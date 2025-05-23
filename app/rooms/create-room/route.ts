import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import { gerarCodigoAleatorio } from "@/utils/gerarCodigoAleatorio";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cod_room = gerarCodigoAleatorio();

  const {
    codigo_sala = cod_room,
    nome,
    codigo_admin = cod_room + gerarCodigoAleatorio(),
    codigo_visitante = cod_room + gerarCodigoAleatorio(),
    codigo_voluntario = cod_room + gerarCodigoAleatorio(),
  } = body;

  if (
    !codigo_sala ||
    !nome ||
    !codigo_admin ||
    !codigo_visitante ||
    !codigo_voluntario
  ) {
    return NextResponse.json(
      { error: "Todos os campos são obrigatórios" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        codigo_sala,
        nome,
        codigo_admin,
        codigo_visitante,
        codigo_voluntario,
      },
    ])
    .select()
    .single();

  await supabase.from("acessos").insert([
    {
      codigo_sala: cod_room,
      codigo_acesso: codigo_admin,
      nivel_acesso: "admin",
    },
    {
      codigo_sala: cod_room,
      codigo_acesso: codigo_visitante,
      nivel_acesso: "visitante",
    },
    {
      codigo_sala: cod_room,
      codigo_acesso: codigo_voluntario,
      nivel_acesso: "voluntario",
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ room: data }, { status: 201 });
}
