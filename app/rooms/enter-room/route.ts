import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { codigo } = await req.json();

  const { data: salas, error } = await supabase
    .from("rooms")
    .select("*")
    .or(`codigo_admin.eq.${codigo},codigo_visitante.eq.${codigo},codigo_voluntario.eq.${codigo}`);

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar no banco de dados" }, { status: 500 });
  }

  if (!salas || salas.length === 0) {
    return NextResponse.json({ error: "Código inválido ou sala não encontrada" }, { status: 404 });
  }

  const sala = salas[0];
  let nivelAcesso = "";

  if (codigo === sala.codigo_admin) nivelAcesso = "admin";
  else if (codigo === sala.codigo_voluntario) nivelAcesso = "voluntario";
  else if (codigo === sala.codigo_visitante) nivelAcesso = "visitante";
  else nivelAcesso = "desconhecido"; // fallback

  const response = NextResponse.json({nivelAcesso, codigo_sala: sala.codigo_sala}, { status: 200 });
  response.cookies.set('codigo_sala', sala.codigo_sala)
  response.cookies.set('nivel_acesso', nivelAcesso)
  return response
}
