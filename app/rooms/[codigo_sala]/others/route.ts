import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;
  const body = await request.json();

  try {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('codigo_sala', codigo_sala)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 });
    }

    const { data: existingDetail, error: detailError } = await supabase
      .from('rooms_details')
      .select('*')
      .eq('id_room', room.id)
      .single();

    if (detailError && detailError.code !== 'PGRST116') {
      throw detailError;
    }

    const payload = {
      id_room: room.id,
      check_gerar_cronograma: body.check_gerar_cronograma ?? false,
      check_deliberacao_resultados: body.check_deliberacao_resultados ?? false,
      check_discursos_premiacao: body.check_discursos_premiacao ?? false,
      check_gerar_ppt_premiacao: body.check_gerar_ppt ?? false,
      dados_extras: body.dados_extras ?? '',
    };

    let response;
    if (!existingDetail) {
      response = await supabase.from('rooms_details').insert(payload);
    } else {
      response = await supabase
        .from('rooms_details')
        .update(payload)
        .eq('id_room', room.id);
    }

    if (response.error) {
      throw response.error;
    }

    return NextResponse.json({ message: 'Sistema de rounds atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar sistema de rounds:', error);
    return NextResponse.json(
      { error: 'Não foi possível atualizar o sistema de rounds. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;

  try {
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('codigo_sala', codigo_sala)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 });
    }

    const { data: details, error: detailsError } = await supabase
      .from('rooms_details')
      .select('*')
      .eq('id_room', room.id)
      .single();

    if (detailsError && detailsError.code !== 'PGRST116') {
      throw detailsError;
    }

    return NextResponse.json(details || {});
  } catch (error) {
    console.error('Erro ao buscar detalhes da sala:', error);
    return NextResponse.json(
      { error: 'Não foi possível buscar os detalhes da sala. Tente novamente.' },
      { status: 500 }
    );
  }
}