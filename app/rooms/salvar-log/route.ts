import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { codigo, nome } = await req.json();
    const codigoStr = Array.isArray(codigo) ? codigo.join("") : String(codigo);

    const { data: rooms, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .or(
        `codigo_admin.eq.${codigoStr},codigo_visitante.eq.${codigoStr},codigo_voluntario.eq.${codigoStr}`
      );

    if (roomError) {
      return NextResponse.json(
        { error: roomError.message || "Erro ao buscar no banco de dados" },
        { status: 500 }
      );
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Código inválido ou sala não encontrada" },
        { status: 404 }
      );
    }

    const sala = rooms[0];

    let nivelAcesso = "desconhecido";
    if (codigo === sala.codigo_admin) nivelAcesso = "admin";
    else if (codigo === sala.codigo_voluntario) nivelAcesso = "voluntario";
    else if (codigo === sala.codigo_visitante) nivelAcesso = "visitante";

    const { error: logError } = await supabase.from("audit_logs").insert({
      sala_id: sala.id,
      acao: "ENTROU",
      tabela_afetada: "rooms",
      id_registro: sala.id,
      descricao: `Usuário "${nome}" entrou na sala.`,
    });

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    const response = NextResponse.json(
      { sucesso: true, nivelAcesso },
      { status: 200 }
    );
    response.cookies.set("codigo_sala", codigo, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("nivel_acesso", nivelAcesso, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
