import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(request: NextRequest, context: any) {
  const codigo_sala = context.params.codigo_sala;
  const body = await request.json();

  // 1. Buscar sala
  const { data: sala, error: errorSala } = await supabase
    .from("rooms")
    .select("id")
    .eq("codigo_sala", codigo_sala)
    .single();

  if (errorSala || !sala) {
    return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
  }

  // 2. Buscar operação associada à sala
  // (considerando que só existe uma operação por sala)
  const { data: operacaoExistente, error: errorOperacao } = await supabase
    .from("operacao")
    .select("*")
    .eq("id_room", sala.id)
    .single();

  if (errorOperacao && errorOperacao.code !== "PGRST116") {
    return NextResponse.json({ error: errorOperacao.message }, { status: 500 });
  }

  let operacaoId: number;

  if (operacaoExistente) {
    const { data: updatedOperacao, error: errorUpdateOperacao } = await supabase
      .from("operacao")
      .update({
        quantidade_arenas: body.quantidade_arenas,
        check_dividir_arenas: body.check_dividir_arenas,
        check_salas_avaliacao: body.check_salas_avaliacao,
        inicio: body.inicio,
        fim: body.fim,
        check_intervalos: body.check_intervalos,
        updated_at: new Date().toISOString(),
        dados_extras: body.dadosExtras,
      })
      .eq("id", operacaoExistente.id)
      .select()
      .single();

    if (errorUpdateOperacao) {
      return NextResponse.json(
        { error: errorUpdateOperacao.message },
        { status: 500 }
      );
    }

    operacaoId = updatedOperacao!.id;
  } else {
    // 3b. Inserir operação nova
    const { data: newOperacao, error: errorInsertOperacao } = await supabase
      .from("operacao")
      .insert({
        id_room: sala.id,
        quantidade_arenas: body.quantidade_arenas,
        check_dividir_arenas: body.check_dividir_arenas,
        check_salas_avaliacao: body.check_salas_avaliacao,
        inicio: body.inicio,
        fim: body.fim,
        check_intervalos: body.check_intervalos,
        dados_extras: body.dados_extras || null,
      })
      .select()
      .single();

    if (errorInsertOperacao) {
      return NextResponse.json(
        { error: errorInsertOperacao.message },
        { status: 500 }
      );
    }

    operacaoId = newOperacao.id;
  }

  // 4. Atualizar ou inserir dados em arenas
  // (buscar registro existente para a operação)
  const { data: arenasExistentes, error: errorArenas } = await supabase
    .from("arenas")
    .select("*")
    .eq("id_operacao", operacaoId)
    .single();

  if (errorArenas && errorArenas.code !== "PGRST116") {
    return NextResponse.json({ error: errorArenas.message }, { status: 500 });
  }

  if (arenasExistentes) {
    // Atualizar arenas
    const { error: errorUpdateArenas } = await supabase
      .from("arenas")
      .update({
        arenas_treino: body.arenas_treino,
        arenas_oficiais: body.arenas_oficiais,
      })
      .eq("id", arenasExistentes.id);

    if (errorUpdateArenas) {
      return NextResponse.json(
        { error: errorUpdateArenas.message },
        { status: 500 }
      );
    }
  } else {
    // Inserir arenas
    const { error: errorInsertArenas } = await supabase.from("arenas").insert({
      id_operacao: operacaoId,
      arenas_treino: body.arenas_treino,
      arenas_oficiais: body.arenas_oficiais,
    });

    if (errorInsertArenas) {
      return NextResponse.json(
        { error: errorInsertArenas.message },
        { status: 500 }
      );
    }
  }

  // 5. Atualizar ou inserir dados em intervalos
  const { data: intervalosExistentes, error: errorIntervalos } = await supabase
    .from("intervalos")
    .select("*")
    .eq("id_operacao", operacaoId)
    .single();

  if (errorIntervalos && errorIntervalos.code !== "PGRST116") {
    return NextResponse.json(
      { error: errorIntervalos.message },
      { status: 500 }
    );
  }

  if (intervalosExistentes) {
    // Atualizar intervalos
    const { error: errorUpdateIntervalos } = await supabase
      .from("intervalos")
      .update({
        tempo_intervalo: body.tempo_intervalo,
        quantidade_intervalos: body.quantidade_intervalos,
      })
      .eq("id", intervalosExistentes.id);

    if (errorUpdateIntervalos) {
      return NextResponse.json(
        { error: errorUpdateIntervalos.message },
        { status: 500 }
      );
    }
  } else {
    // Inserir intervalos
    const { error: errorInsertIntervalos } = await supabase
      .from("intervalos")
      .insert({
        id_operacao: operacaoId,
        tempo_intervalo: body.tempo_intervalo,
        quantidade_intervalos: body.quantidade_intervalos,
      });

    if (errorInsertIntervalos) {
      return NextResponse.json(
        { error: errorInsertIntervalos.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: "Dados da operação, arenas e intervalos atualizados com sucesso",
  });
}
